"use client"

import { useState } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-jsx';
import 'prismjs/themes/prism.css';
import type { Language } from "@prisma/client";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import dedent from "dedent";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";

type CodeLanguage = 'CPP' | 'PYTHON';

const code_templates = {
  CPP: dedent`
    #include <iostream>
    using namespace std;
    int main() {
        int t;
        cin >> t;
        while (t--) {
            // Your code here
        }
        return 0;
    }
  `,
  PYTHON: dedent`
    def solve():
        # Your code here
        pass
    if __name__ == "__main__":
        t = int(input())
        for _ in range(t):
            solve()
  `
} as const;

const highlighting = {
  CPP: languages.cpp!,
  PYTHON: languages.python!
} as const;

export default function CodeEditor({slug}: {slug: string}) {
  const [code, setCode] = useState(code_templates.CPP);
  const [currentLanguage, setCurrentLanguage] = useState<CodeLanguage>('CPP');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(null);

  const lineNumbers = code.split('\n').map((_, idx) => idx + 1);
  
  const makeSubmission = api.judge.submit.useMutation();

  api.judge.onSubmissionUpdate.useSubscription(
    { submissionId: currentSubmissionId!, lastEventId: null },
    {
      enabled: !!currentSubmissionId,
      onData: (data) => {
        const { testCaseIndex, totalTestCases, result } = data;
        setProgress(((testCaseIndex + 1) / totalTestCases) * 100);

        if (testCaseIndex === totalTestCases - 1) {
          setIsLoading(false);
          setCurrentSubmissionId(null);
          
          if (result.status.id === 3) {
            toast.success("All test cases passed!");
          } else {
            toast.error(`Failed: ${result.status.description}`);
          }
        }
      },
      onError: (error) => {
        console.error('Subscription error:', error);
        toast.error("Error receiving updates");
        setIsLoading(false);
        setCurrentSubmissionId(null);
      }
    }
  );

  const handleSubmit = async () => {
    setIsLoading(true);
    setProgress(0);
    
    try {
      const result = await makeSubmission.mutateAsync({
        language: currentLanguage as Language,
        code,
        problemSlug: slug
      });
      setCurrentSubmissionId(result.submissionId);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("Error submitting code");
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex space-x-4">
          <Select
            value={currentLanguage}
            onValueChange={(value: CodeLanguage) => {
              setCurrentLanguage(value);
              setCode(code_templates[value]);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CPP">C++</SelectItem>
              <SelectItem value="PYTHON">Python</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSubmit} disabled={isLoading}>Submit</Button>
        </div>
        
        {isLoading && <Progress value={progress} className="w-full" />}

        <Card className="relative">
          <div className="flex">
            <div
              className="py-2.5 pr-4 text-right text-gray-500 select-none bg-gray-50"
              style={{
                fontFamily: 'monospace',
                minHeight: '200px',
                width: '3rem'
              }}
            >
              {lineNumbers.map(num => (
                <div key={num} className="leading-6 text-sm">{num}</div>
              ))}
            </div>

            <Editor
              value={code}
              onValueChange={setCode}
              highlight={(code: string) => highlight(code, highlighting[currentLanguage], currentLanguage.toLowerCase())}
              padding={10}
              className="w-full focus:outline-none leading-6"
              style={{
                fontFamily: 'monospace',
                minHeight: '200px',
                fontSize: '0.875rem'
              }}
            />
          </div>
        </Card>
      </div>
    </>
  );
}
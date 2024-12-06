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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

import dedent from "dedent";

type CodeLanguage = 'cpp' | 'python';

const code_templates = {
  python: dedent`
    def solve():
        // Your code here
        pass
    if __name__ == "__main__":
        t = int(input())
        for _ in range(t):
            solve()
  `,
  cpp: dedent`
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
  `
} as const;

const highlighting = {
  cpp: languages.cpp!,
  python: languages.python!
} as const;

export default function CodeEditor() {
  const [code, setCode] = useState(code_templates.cpp);

  const [currentLanguage, setCurrentLanguage] = useState('cpp' as CodeLanguage);
  const lineNumbers = code.split('\n').map((_, idx) => idx + 1);

  return (
    <>
      <div className="flex space-x-4">
        <Select
          value={currentLanguage}
          onValueChange={(value: CodeLanguage) => {
            setCurrentLanguage(value);
            setCode(code_templates[value]);
            console.log(`Selected language: ${value}`);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cpp">C++</SelectItem>
            <SelectItem value="python">Python</SelectItem>
          </SelectContent>
        </Select>
        <Button>Run tests</Button>
        <Button>Submit</Button>
      </div>
      <Card className="relative mt-4">
        <div className="flex">
          {/* Números de línea */}
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

          {/* Editor */}
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={(code: string) => highlight(code, highlighting[currentLanguage], currentLanguage)}
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
    </>
  );
}
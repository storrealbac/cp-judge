"use client"

import { Copy, Eye } from 'lucide-react'
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"

import type { TestCase } from '@prisma/client'

interface TestCaseDialogProps {
  testCase: TestCase
}

export default function TestCaseDialog({ testCase }: TestCaseDialogProps) {
  const getContentWidth = () => {
    const maxLength = Math.max(
      testCase.input.length,
      testCase.expectedOutput.length
    );

    if (maxLength > 500) return 'max-w-7xl';
    if (maxLength > 300) return 'max-w-5xl';
    if (maxLength > 100) return 'max-w-4xl';
    return 'max-w-2xl';
  };

  const truncateText = (text: string, maxLength = 100) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const handleCopyInput = () => handleCopyText(testCase.input.trim());
  const handleCopyOutput = () => handleCopyText(testCase.expectedOutput.trim());

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className={getContentWidth()}>
        <DialogHeader>
          <DialogTitle>Test Case details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Input:</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyInput}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[40vh]">
              {truncateText(testCase.input)}
            </pre>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Expected Output:</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyOutput}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[40vh]">
              {truncateText(testCase.expectedOutput)}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
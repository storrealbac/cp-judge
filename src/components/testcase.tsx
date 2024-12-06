"use client"

import { CopyIcon } from 'lucide-react'
import {
  Card,
  CardContent,
  CardTitle,
} from "~/components/ui/card"

import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"

interface TextAreaWithCopyProps {
  input: string
  output: string
  className?: string
}

export default function Testcase({ input, output, className }: TextAreaWithCopyProps) {

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const handleCopyInput = () => handleCopyText(input.trim())
  const handleCopyOutput = () => handleCopyText(output.trim())

  return (
    <Card className={`${className} grid grid-cols-2`}>
      <div className="relative">
        <div className="flex flex-row items-center justify-between px-6 py-3">
          <CardTitle className="text-md font-medium p-0 font-bold">Input</CardTitle>
          <Button onClick={handleCopyInput} variant="ghost" className="p-4 hover:bg-muted">
            <CopyIcon/> <span className="sr-only">Copy</span>
          </Button>
        </div>
        <CardContent>
          <pre className="min-h-[100px] w-full overflow-auto whitespace-pre rounded-md bg-muted p-4 font-mono text-sm p-2">{input}</pre>
        </CardContent>
        <Separator orientation="vertical" className="absolute right-0 top-0 h-full" />
      </div>
      <div>
        <div className="flex flex-row items-center justify-between px-6 py-3">
          <CardTitle className="text-md font-medium p-0 font-bold">Output</CardTitle>
          <Button onClick={handleCopyOutput} variant="ghost" className="p-4 hover:bg-muted">
            <CopyIcon/> <span className="sr-only">Copy</span>
          </Button>
        </div>
        <CardContent>
          <pre className="min-h-[100px] w-full overflow-auto whitespace-pre rounded-md bg-muted p-4 font-mono text-sm p-2">{output}</pre>
        </CardContent>
      </div>
    </Card>
  )
}
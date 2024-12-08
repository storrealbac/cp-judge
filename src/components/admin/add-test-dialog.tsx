"use client"

import { useState } from "react"
import { Plus, X } from 'lucide-react'
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"

import type { TestCase } from "~/types/problem"

interface AddTestCaseDialogProps {
  onAdd: (testCase: TestCase) => void
}

export default function AddTestCaseDialog({ onAdd }: AddTestCaseDialogProps) {
  const [input, setInput] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [open, setOpen] = useState(false);

  const handleFileUpload = (type: 'input' | 'expectedOutput') => async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (type === 'input') {
          setInput(content);
        } else {
          setExpectedOutput(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = () => {
    if (!input || !expectedOutput) {
      toast.error("Both input and output files are required");
      return;
    }

    onAdd({
      id: (new Date()).getMilliseconds().toString(),
      input,
      expectedOutput,
    });

    setInput("");
    setExpectedOutput("");
    setOpen(false);
    toast.success("Test case added successfully");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Add Test Case
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Test Case</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Input File:</h4>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                onChange={handleFileUpload('input')}
                accept=".txt"
                className="flex-1"
              />
              {input && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setInput("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Expected Output File:</h4>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                onChange={handleFileUpload('expectedOutput')}
                accept=".txt"
                className="flex-1"
              />
              {expectedOutput && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setExpectedOutput("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setInput("");
                setExpectedOutput("");
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add Test Case
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
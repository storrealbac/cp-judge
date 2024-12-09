"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { X, Plus } from 'lucide-react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Slider } from "~/components/ui/slider"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import TestCaseDialog from "~/components/admin/test-case-dialog"
import AddTestCaseDialog from "~/components/admin/add-test-dialog"
import { api } from "~/trpc/react"

import type { Problem, Tag, TestCase, TagOnProblem } from "@prisma/client"

interface ProblemWithRelations extends Problem {
  tags: (TagOnProblem & { tag: Tag })[];
  testCases: TestCase[];
  author: {
    username: string | null;
    name: string | null;
  };
}

const problemSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  slug: z.string().min(1, "Slug is required").max(100, "Slug must be 100 characters or less"),
  statement: z.string().min(1, "Problem statement is required"),
  inputDescription: z.string().min(1, "Input description is required"),
  outputDescription: z.string().min(1, "Output description is required"),
  difficulty: z.number().min(1).max(100),
})

type ProblemFormValues = z.infer<typeof problemSchema>

interface UpdateProblemInput extends ProblemFormValues {
  id: string;
  tags: string[];
  testCases: TestCase[];
}

export default function EditProblemContent({ problem }: { problem: ProblemWithRelations }) {
  const router = useRouter()
  const utils = api.useUtils()
  const [tags, setTags] = useState<string[]>(problem.tags.map(t => t.tag.name))
  const [newTag, setNewTag] = useState("")
  const [testCases, setTestCases] = useState<TestCase[]>(problem.testCases)

  const form = useForm<ProblemFormValues>({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: problem.title,
      slug: problem.slug,
      statement: problem.statement,
      inputDescription: problem.inputDescription,
      outputDescription: problem.outputDescription,
      difficulty: problem.difficulty,
    },
  })

  const updateProblem = api.problem.update.useMutation<UpdateProblemInput>({
    onSuccess: () => {
      toast.success("Problem updated successfully")
      void utils.problem.getBySlug.invalidate({ slug: problem.slug })
      router.push("/admin/problems")
    },
    onError: (error) => {
      toast.error("Failed to update problem", {
        description: error.message || "Please try again later."
      })
    },
  })

  const onSubmit = (data: ProblemFormValues) => {
    updateProblem.mutate({
      id: problem.id,
      ...data,
      tags,
      testCases,
    })
  }

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const removeTestCase = (id: string) => {
    setTestCases(testCases.filter(tc => tc.id !== id))
  }

  const handleAddTestCase = (newTestCase: Omit<TestCase, 'createdAt' | 'problemId'>) => {
    const testCase: TestCase = {
      ...newTestCase,
      createdAt: new Date(),
      problemId: problem.id
    }
    setTestCases([...testCases, testCase])
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Edit Problem: {problem.title}</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="statement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Problem Statement</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inputDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Input Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="outputDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Output Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty (1-10)</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormDescription>Current difficulty: {field.value}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">
                Update problem
              </Button>
            </form>
          </Form>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Input
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button
                  onClick={addTag}
                  size="sm"
                  disabled={!newTag || tags.includes(newTag)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-auto p-0"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Test Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <AddTestCaseDialog
                  onAdd={handleAddTestCase}
                />
              </div>
              <div className="space-y-2">
                {testCases.map((testCase) => (
                  <div
                    key={testCase.id}
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <span className="text-sm font-medium">
                      Test Case {testCases.indexOf(testCase) + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <TestCaseDialog testCase={testCase} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTestCase(testCase.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
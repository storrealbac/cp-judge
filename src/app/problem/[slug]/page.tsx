"use client";

import { use } from "react"
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import Testcase from "~/components/problem/test-case";
import Latex from "react-latex-next";
import CodeEditor from "~/components/problem/code-editor";
import { Button } from "~/components/ui/button";
import Loader from "~/components/loader";

export default function ProblemPage({ params }: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params);

  // Use enabled to prevent the query from running before we have the slug
  const { data: problem, isLoading, error, refetch } = api.problem.getBySlug.useQuery(
    { slug },
    {
      retry: 1,
      enabled: !!slug,
    }
  );

  if (isLoading) {
    return <Loader />;
  }

  // Handle error state
  if (error || !problem) {
    return (
      <div className="container mx-auto p-4 lg:p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
            <h2 className="text-xl font-semibold text-red-600">
              {error?.message ?? "Failed to load problem"}
            </h2>
            <Button onClick={() => void refetch()} variant="secondary">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                <Latex>{problem.title}</Latex>
              </CardTitle>
              <CardDescription className="text-center flex flex-col items-center gap-2">
                <span>Difficulty: {problem.difficulty}/10</span>
                <div className="flex gap-2">
                  {problem.tags.map(({ tag }) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardDescription>
            </CardHeader>

            <CardContent>
              {problem.statement.split("\n").map((line, index) => (
                <p key={index} className="my-3">
                  <Latex>{line}</Latex>
                </p>
              ))}
            </CardContent>

            <CardContent>
              <h1 className="font-bold">Input</h1>
              {problem.inputDescription.split("\n").map((line, index) => (
                <p key={index} className="my-3">
                  <Latex>{line}</Latex>
                </p>
              ))}
            </CardContent>

            <CardContent>
              <h1 className="font-bold">Output</h1>
              {problem.outputDescription.split("\n").map((line, index) => (
                <p key={index} className="my-3">
                  <Latex>{line}</Latex>
                </p>
              ))}
            </CardContent>
          </Card>

          {problem.testCases[0] && (
            <Testcase
              input={problem.testCases[0].input}
              expectedOutput={problem.testCases[0].expectedOutput}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Submit Solution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                <CodeEditor />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  No submissions yet
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
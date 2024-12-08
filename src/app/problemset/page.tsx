"use client";

import Link from "next/link";
import { api } from "~/trpc/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import Loader from "~/components/loader";

const problem_slugs = ["line-breaks", "metal-slug"];

export default function ProblemSetPage() {
  const { data: problems, isLoading, error, refetch } = api.problem.getBySlugs.useQuery(
    { slugs: problem_slugs },
    {
      retry: false,
    }
  );

  if (isLoading) {
    return (
        <Loader />
    );
  }

  console.log(problems);

  if (error || !problems) {
    return (
      <div className="container m-auto py-10">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
            <h2 className="text-xl font-semibold text-red-600">
              {error!.message ?? "Failed to load problems"}
            </h2>
            <Button
              onClick={() => void refetch()}
              variant="secondary"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container m-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Problem set</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="text-right">Solved</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {problems.map((problem) => (
            <TableRow key={problem.id}>
              <TableCell className="font-medium text-nowrap">{problem.slug}</TableCell>
              <TableCell>
                <Link href={`/problem/${problem.slug}`} className="text-blue-500 hover:underline">
                  {problem.name}
                </Link>
              </TableCell>
              <TableCell>
                {problem.tags?.map(({ tag }) => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                )) }
              </TableCell>
              <TableCell className="text-right">{problem.solved}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}


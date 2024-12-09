"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import ProblemsPagination from "~/components/admin/problem-pagination";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { useState, useEffect } from "react";
import { useDebounce } from "~/hooks/use-debounce";
import Loader from "~/components/loader";

function getDifficultyColor(difficulty: number): "default" | "destructive" | "outline" | "secondary" {
  if (difficulty <= 300) return "secondary";
  if (difficulty <= 600) return "default";
  return "destructive";
}

type SortByType = "createdAt" | "title" | "difficulty"
type SortOrderType = "asc" | "desc"

export default function AdminProblems() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = searchParams.get("page") ?? "1";
  const perPage = searchParams.get("perPage") ?? "10";
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = searchParams.get("sortOrder") ?? "desc";
  const initialSearch = searchParams.get("search") ?? "";

  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  const { data, isLoading, error } = api.problem.adminList.useQuery(
    {
      page: Number(page),
      perPage: Number(perPage),
      search: debouncedSearch,
      sortBy: sortBy as SortByType,
      sortOrder: sortOrder as SortOrderType,
    }
  );

  const handleFilterChange = (
    key: string,
    value: string,
    shouldResetPage = true
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    if (shouldResetPage) params.set("page", "1");
    router.push(`/admin/problems?${params.toString()}`);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Problems</h1>
        <Button asChild>
          <Link href="/admin/problems/new">Add New Problem</Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search problems..."
          className="max-w-sm"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            handleFilterChange("search", e.target.value);
          }}
        />
        <Select
          value={sortBy}
          onValueChange={(value) => handleFilterChange("sortBy", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="difficulty">Difficulty</SelectItem>
            <SelectItem value="createdAt">Created At</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortOrder}
          onValueChange={(value) => handleFilterChange("sortOrder", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Title</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Submissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.problems.map((problem) => (
              <TableRow key={problem.id}>
                <TableCell className="font-medium">
                  <div>{problem.title}</div>
                  <div className="text-sm text-muted-foreground">
                    ID: {problem.id}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getDifficultyColor(problem.difficulty)}>
                    {problem.difficulty}
                  </Badge>
                </TableCell>
                <TableCell>{problem.author}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {problem.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">{problem.submissions}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/problems/edit/${problem.slug}`}>Edit</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data?.pagination && (
        <ProblemsPagination totalProblems={data.pagination.total} />
      )}
    </div>
  );
}
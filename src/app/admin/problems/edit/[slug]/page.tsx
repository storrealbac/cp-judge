"use client"

import { use } from "react"
import EditProblemContent from "~/components/admin/edit-problem";
import { api } from "~/trpc/react"
import Loader from "~/components/loader";

export default function ProfilePage({ params }: {
  params: Promise<{ slug: string }>
}) {

  const { slug } = use(params);

  const { data: problem, isLoading, error } = api.problem.getBySlug.useQuery(
    { slug },
    {
      enabled: !!slug,
      refetchOnWindowFocus: false,
      retry: 1, // Limit retry attempts
    }
  )

  if (isLoading) {
    return <Loader/>
  }

  if (error) {
    return <div>Error loading problem: {error.message}</div>
  }

  if (!problem) {
    return <div>Problem not found</div>
  }

  return <EditProblemContent problem={problem} />
}
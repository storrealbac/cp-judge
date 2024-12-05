import Link from "next/link"
import { Button } from "~/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 space-y-8">
      <h1 className="text-4xl font-bold text-center">Welcome to cp-judge</h1>
      <p className="text-xl text-center max-w-2xl">
        Enhance your competitive programming skills with our curated problem set and judging system.
      </p>
      <div className="flex space-x-4">
        <Button asChild>
          <Link href="/problemset">Explore Problems</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </div>
  )
}


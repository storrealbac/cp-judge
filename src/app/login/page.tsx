'use client'

import { signIn } from "next-auth/react"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Github } from 'lucide-react'

export default function LoginPage() {
  const handleGitHubLogin = async () => {
    try {
      await signIn('github', { callbackUrl: '/' })
    } catch (error) {
      console.error('GitHub login failed:', error)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login to cp-judge</CardTitle>
          <CardDescription>
            Login with your GitHub account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGitHubLogin} className="w-full" variant="outline">
            <Github className="mr-2 h-4 w-4" />
            Login with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


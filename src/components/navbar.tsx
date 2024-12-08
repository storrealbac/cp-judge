"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Code2 } from 'lucide-react'

import { api } from "~/trpc/react";
import { useSession, signOut } from "next-auth/react"

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession();

  const { data: isAdmin } = api.profile.isAdmin.useQuery({
    userId: session?.user.id ?? "*" // * is a fallback value, that means the user is not logged in
  });

  return (
    <header className="sticky top-0 h-14 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-5 flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Code2 className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">cp-judge</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium text-center">
            <Link
              href="/"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/" ? "text-foreground" : "text-foreground/60"
              )}
            >
              HOME
            </Link>
            <Link
              href="/problemset"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname?.startsWith("/problemset")
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              PROBLEM SET
            </Link>
            {session ? (
              <Link
                href={`/profile/${session.user.username}`}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname?.startsWith("/profile")
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                PROFILE
              </Link>
            ) : <></>}

            {isAdmin ? (
              <Link
                href={`/admin`}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname?.startsWith("/admin")
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                ADMIN
              </Link>
            ) : <></>}

          </nav>
        </div>

        {/* Navbar login thing */}
        <div className="flex flex-1 items-center justify-end">
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-foreground">
                {session.user.username}
              </span>
              <Button
                variant="outline"
                onClick={() => signOut()}
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}


import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"

import { Navbar } from "~/components/navbar"
import { SessionProvider } from "next-auth/react"

import { TRPCReactProvider } from "~/trpc/react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "cp-judge",
  description: "Competitive Programming Judge System",
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <html lang="en">
      <body className={inter.className}>
      <TRPCReactProvider>
        <div className="relative flex min-h-screen flex-col">
          <SessionProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
          </SessionProvider>
        </div>
        </TRPCReactProvider>
      </body>
    </html>
  )
}


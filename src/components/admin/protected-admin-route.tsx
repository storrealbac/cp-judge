"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { api } from "~/trpc/react"

import Loader from "~/components/loader";

export default function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession()

    console.log(session)

    const { data: isAdmin, status} = api.profile.isAdmin.useQuery({
        userId: session?.user?.id ?? "*"
    });

    if (status === "pending") {
        return <Loader/>
    }
    if (!session)
        redirect("/login");

    if (!isAdmin)
        redirect("/");

    return <>{children}</>
}
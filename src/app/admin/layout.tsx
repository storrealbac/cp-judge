import { redirect } from "next/navigation"


import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar"
//import { AppSidebar } from "~/components/app-sidebar"
import AdminSidebar from "~/components/admin/sidebar"
import ProtectedAdminRoute from "~/components/admin/protected-admin-route"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <ProtectedAdminRoute>
      <SidebarProvider>
        <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
          <AdminSidebar />
          <main className="p-6">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </ProtectedAdminRoute>
  )
}



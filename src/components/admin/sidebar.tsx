import { Calendar, Home, Search, Settings, Brain } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: Home,
  },
  {
    title: "Problems",
    url: "/admin/problems",
    icon: Brain,
  },
  {
    title: "User",
    url: "/admin/users",
    icon: Search,
  },

]

export default function AdminSidebar() {
  return (
    <Sidebar className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administrator</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

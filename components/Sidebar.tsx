"use client";

import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/services/fetcher";
import { Cpu, LayoutGrid, X } from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent as SidebarContent_,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const SidebarComponent = () => {
  const { data: categories, error } = useSWR("/api/products/categories", fetcher);
  const { isMobile, setOpen, setOpenMobile } = useSidebar();

  const closeSidebar = () => {
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
  };

  if (error) return null;
  if (!categories) return null;

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <Link href="/" className="flex items-center gap-2" onClick={closeSidebar}>
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
              <Cpu className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Compulink</span>
          </Link>
          <button
            onClick={closeSidebar}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </SidebarHeader>
      <SidebarContent_>
        <SidebarGroup>
          <SidebarGroupLabel>
            <LayoutGrid className="w-4 h-4 text-primary mr-2" />
            Categories
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={closeSidebar}>
                  <Link href="/search">All Products</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {categories.map((category: string) => (
                <SidebarMenuItem key={category}>
                  <SidebarMenuButton asChild onClick={closeSidebar}>
                    <Link href={`/search?category=${encodeURIComponent(category)}`}>
                      {category}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent_>
    </Sidebar>
  );
};

export default SidebarComponent;

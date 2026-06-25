"use client";

import Link from "next/link";
import {
  LogOut,
  Cpu,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Image,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent as SidebarContent_,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdminSidebarProps {
  activeItem: string;
  userName: string;
  userEmail: string;
  initials: string;
}

const menuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, key: "dashboard" },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart, key: "orders" },
  { name: "Products", href: "/admin/products", icon: Package, key: "products" },
  { name: "Banners", href: "/admin/banners", icon: Image, key: "banners" },
  { name: "Users", href: "/admin/users", icon: Users, key: "users" },
];

export default function AdminSidebar({
  activeItem,
  userName,
  userEmail,
  initials,
}: AdminSidebarProps) {
  const [showDialog, setShowDialog] = useState(false);
  const { signOut } = useClerk();

  const signoutHandler = async () => {
    setShowDialog(false);
    await signOut({ redirectUrl: "/" });
  };

  return (
    <>
      <Sidebar collapsible="offcanvas" side="left">
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-3 p-2">
            <div className="p-1.5 bg-gradient-to-br from-primary to-secondary rounded-lg">
              <Cpu className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-sidebar-foreground">
                Admin Panel
              </h2>
              <p className="text-[10px] text-sidebar-foreground/60">
                Compulink IT
              </p>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent_>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.key === activeItem;
                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton asChild isActive={isActive} className={isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground font-semibold data-active:bg-primary data-active:text-primary-foreground" : ""}>
                        <Link href={item.href} className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent_>

        <SidebarSeparator />

        <SidebarFooter>
          <div className="flex items-center gap-3 p-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {userName}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {userEmail}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full mt-2 text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => setShowDialog(true)}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </SidebarFooter>
      </Sidebar>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogTitle>Sign Out</DialogTitle>
          <DialogDescription>
            Are you sure you want to sign out?
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={signoutHandler}>
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

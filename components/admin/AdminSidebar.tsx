"use client";

import Image from "next/image";
import Link from "next/link";
import {
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Image as ImageIcon,
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
  DialogHeader,
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
  { name: "Banners", href: "/admin/banners", icon: ImageIcon, key: "banners" },
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
            <Image
              src="/comp.webp"
              alt="Compulink"
              width={160}
              height={45}
              className="h-9 w-auto"
              priority
            />
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
            className="w-full mt-2 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground transition-colors"
            onClick={() => setShowDialog(true)}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </SidebarFooter>
      </Sidebar>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              Sign Out
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of your account? You will need to sign in again to access the admin panel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={signoutHandler}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

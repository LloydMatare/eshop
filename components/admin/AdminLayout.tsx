import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  Shield,
  Cpu,
} from "lucide-react";
import Link from "next/link";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = async ({
  activeItem = "dashboard",
  children,
}: {
  activeItem: string;
  children: React.ReactNode;
}) => {
  const { userId } = await auth();
  const clerk = await clerkClient();
  const user = userId ? await clerk.users.getUser(userId) : null;

  if (!user || !user.publicMetadata?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-card rounded-2xl p-8 border border-border max-w-md text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Unauthorized
          </h1>
          <p className="text-muted-foreground mb-6">
            Admin permission required to access this area
          </p>
          <Link href="/" className="btn btn-primary rounded-full">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Admin";
  const userEmail = user.emailAddresses?.[0]?.emailAddress || "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-svh w-full bg-background">
        <AdminSidebar
          activeItem={activeItem}
          userName={userName}
          userEmail={userEmail}
          initials={initials}
        />
        <div className="flex flex-1 flex-col">
          {/* Mobile header with sidebar trigger */}
          <div className="lg:hidden fixed top-0 left-0 right-0 bg-background border-b border-border z-50 h-16">
            <div className="flex items-center justify-between p-4 h-full">
              <div className="flex items-center gap-2">
                <Cpu className="w-6 h-6 text-primary" />
                <span className="font-bold text-foreground">Admin Panel</span>
              </div>
              <SidebarTrigger className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all" />
            </div>
          </div>

          <main className="flex-1 lg:pt-0 pt-16 overflow-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;

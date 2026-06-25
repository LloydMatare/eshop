"use client";

import PaynowReactWrapper from "paynow-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarContent from "@/components/Sidebar";
import Header from "@/components/header/Header";
import Footer from "@/components/Footer";

export default function FrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const paynow_config = {
    integration_id: `${process.env.NEXT_PUBLIC_PAYNOW_API_ID}`,
    integration_key: `${process.env.NEXT_PUBLIC_PAYNOW_API_KEY}`,
    result_url: "http://localhost:3000/",
    return_url: "http://localhost:3000/",
  };

  return (
    <main className="flex-grow">
      <PaynowReactWrapper {...paynow_config}>
        <SidebarProvider defaultOpen={false}>
          <div className="flex min-h-svh w-full">
            <SidebarContent />
            <div className="flex flex-1 flex-col">
              <Header />
              {children}
              <Footer />
            </div>
          </div>
        </SidebarProvider>
      </PaynowReactWrapper>
    </main>
  );
}

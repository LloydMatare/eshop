"use client";

import PaynowReactWrapper from "paynow-react";
import DrawerButton from "@/components/DrawerButton";
import Sidebar from "@/components/Sidebar";
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
        <div className="drawer">
          <DrawerButton />
          <div className="drawer-content">
            <div className="min-h-screen flex flex-col">
              <Header />
              {children}
              <Footer />
            </div>
          </div>
          <div className="drawer-side">
            <label
              htmlFor="my-drawer"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <Sidebar />
          </div>
        </div>
      </PaynowReactWrapper>
    </main>
  );
}

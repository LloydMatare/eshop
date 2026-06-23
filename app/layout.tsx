import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Compulink | Enterprise IT Solutions & Technology Services",
  description:
    "Your trusted partner for enterprise IT solutions. Shop laptops, servers, networking equipment, and software licenses from top brands like Dell, HP, Cisco, and Microsoft.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="bg-background text-foreground">
        <ClerkProvider appearance={{ theme: shadcn }}>
          <Providers>
            <main>{children}</main>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}

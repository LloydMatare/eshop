"use client";

import { ReactNode } from "react";
import ThemeProvider from "./ThemeProvider";
import { Toaster } from "sonner";
import { SWRConfig } from "swr";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SWRConfig
        value={{
          fetcher: async (resource: string) => {
            const res = await fetch(resource);
            if (!res.ok) {
              throw new Error("An error occurred while fetching the data.");
            }
            return res.json();
          },
        }}
      >
        <Toaster richColors position="top-right" />
        {children}
      </SWRConfig>
    </ThemeProvider>
  );
}

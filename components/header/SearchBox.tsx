"use client";
import { Suspense, useState } from "react";
import { fetcher } from "@/lib/services/fetcher";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { Search, X } from "lucide-react";

function SearchBoxInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "All";
  const [searchFocused, setSearchFocused] = useState(false);

  const { data: categories } = useSWR("/api/products/categories", fetcher);

  return (
    <form action="/search" method="GET">
      <div className={`flex items-center transition-all duration-300 ${searchFocused ? "w-full" : "w-full"}`}>
        <div className="relative w-full group">
          <div className="flex items-center bg-accent/50 border border-border rounded-xl overflow-hidden transition-all duration-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 focus-within:shadow-lg focus-within:shadow-primary/5">
            <select
              name="category"
              defaultValue={category}
              className="hidden md:block h-10 pl-4 pr-3 text-sm bg-transparent border-r border-border text-muted-foreground cursor-pointer hover:text-foreground transition-colors outline-none appearance-none"
            >
              <option value="all">All</option>
              {categories?.map((c: string) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input
              className="flex-1 h-10 px-4 text-sm bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
              placeholder="Search products..."
              defaultValue={q}
              name="q"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <button
              type="submit"
              className="h-10 px-4 flex items-center justify-center text-primary hover:text-primary/80 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export const SearchBox = () => (
  <Suspense><SearchBoxInner /></Suspense>
);

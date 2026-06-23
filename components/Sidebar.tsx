"use client";

import useLayoutService from "@/lib/hooks/useLayout";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/services/fetcher";
import { Cpu, LayoutGrid, X } from "lucide-react";

const Sidebar = () => {
  const { toggleDrawer } = useLayoutService();
  const { data: categories, error } = useSWR("/api/products/categories", fetcher);

  if (error) return <div className="p-4 text-error">Error: {error.message}</div>;
  if (!categories) return <div className="p-4 text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-full bg-background border-r border-border">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2" onClick={toggleDrawer}>
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
            <Cpu className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">Compulink</span>
        </Link>
        <label
          htmlFor="my-drawer"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </label>
      </div>

      {/* Categories */}
      <div className="p-3">
        <div className="flex items-center gap-2 px-3 py-2 mb-1">
          <LayoutGrid className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Categories</span>
        </div>
        <div className="space-y-0.5">
          <Link
            href="/search"
            onClick={toggleDrawer}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all"
          >
            All Products
          </Link>
          {categories.map((category: string) => (
            <Link
              key={category}
              href={`/search?category=${encodeURIComponent(category)}`}
              onClick={toggleDrawer}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

import Link from "next/link";
import { Cpu, Menu as MenuIcon, Phone, Truck } from "lucide-react";
import { SearchBox } from "./SearchBox";
import Menu from "./Menu";

const categories = [
  "All",
  "Laptops & Computers",
  "Servers & Storage",
  "Networking",
  "Software",
  "Accessories",
];

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Announcement Bar */}
      <div className="hidden md:flex h-9 items-center justify-between bg-primary/5 border-b border-border px-4 lg:px-8 text-xs text-muted-foreground">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-primary" />
            Free shipping on orders over $500
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-primary" />
            24/7 Enterprise Support
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span>1 Year Warranty on All Products</span>
        </div>
      </div>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex h-8 items-center justify-center bg-primary/5 border-b border-border text-xs text-muted-foreground">
        <Truck className="w-3 h-3 mr-1.5 text-primary" />
        Free shipping on orders over $500
      </div>

      {/* Main Navigation */}
      <nav className="bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3">
              <label
                htmlFor="my-drawer"
                className="flex lg:hidden w-9 h-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all cursor-pointer"
              >
                <MenuIcon className="w-5 h-5" />
              </label>

              <Link href="/" className="flex items-center gap-2.5 shrink-0">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Cpu className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-lg font-bold tracking-tight text-foreground">
                    Compulink
                  </span>
                  <span className="hidden sm:inline text-[10px] font-medium text-muted-foreground ml-2 uppercase tracking-wider">
                    IT Solutions
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Search (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-auto">
              <SearchBox />
            </div>

            {/* Right: Icons + User */}
            <div className="flex items-center gap-1">
              {/* Mobile Search Toggle - just links to /search */}
              <Link
                href="/search"
                className="flex md:hidden w-9 h-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>
              <Menu />
            </div>
          </div>
        </div>
      </nav>

      {/* Category Strip (Desktop) */}
      <div className="hidden lg:block bg-background/70 backdrop-blur-xl border-b border-border">
        <div className="px-8">
          <div className="flex items-center h-11 gap-1 overflow-x-auto scrollbar-none">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={cat === "All" ? "/search" : `/search?category=${encodeURIComponent(cat)}`}
                className="whitespace-nowrap px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-lg transition-all"
              >
                {cat === "All" ? "All Products" : cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

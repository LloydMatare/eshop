"use client";
import useCartService from "@/lib/hooks/useCartStore";
import useLayoutService from "@/lib/hooks/useLayout";
import { useUser, useAuth, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ShoppingCart, User, LogOut, LayoutDashboard, Package, History, Sun, Moon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Menu = () => {
  const { items, init } = useCartService();
  const [mounted, setMounted] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { signOut } = useClerk();

  useEffect(() => {
    setMounted(true);
  }, []);

  const signoutHandler = () => {
    signOut({ redirectUrl: "/signin" });
    init();
    setShowDialog(false);
  };

  const { user } = useUser();
  const { sessionClaims } = useAuth();
  const isAdmin = sessionClaims?.metadata?.isAdmin == true || user?.publicMetadata?.isAdmin == true;
  const { theme, toggleTheme } = useLayoutService();
  const userButtonRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);


  useEffect(() => {
    if (showUserMenu && userButtonRef.current) {
      const rect = userButtonRef.current.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    } else if (!showUserMenu) {
      setMenuPosition(null);
    }
  }, [showUserMenu]);

  const cartCount = mounted ? items.reduce((a, c) => a + c.qty, 0) : 0;

  return (
    <div className="flex items-center gap-1.5">
      {/* Theme Toggle */}
      {mounted && (
        <button
          onClick={toggleTheme}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-[18px] h-[18px]" />
          ) : (
            <Moon className="w-[18px] h-[18px]" />
          )}
        </button>
      )}

      {/* Cart */}
      <Link
        href="/cart"
        className="relative w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all"
      >
        <ShoppingCart className="w-[18px] h-[18px]" />
        {mounted && cartCount > 0 && (
          <span className="absolute -top-1 -right-1 w-[18px] h-[18px] flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full shadow-lg shadow-primary/30">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </Link>

      {/* User */}
      {user ? (
        <div className="relative" ref={userButtonRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
              {user.fullName?.charAt(0)?.toUpperCase() || user.emailAddresses?.[0]?.emailAddress?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </button>

          {showUserMenu &&
            menuPosition &&
            createPortal(
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div
                  className="fixed z-[100] w-56 bg-popover border border-border rounded-xl shadow-2xl shadow-black/5 overflow-hidden animate-in fade-in duration-200"
                  style={{ top: menuPosition.top, right: menuPosition.right }}
                >
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.fullName || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {user.primaryEmailAddress?.emailAddress || ""}
                    </p>
                  </div>
                  <div className="p-1.5">
                    {!isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                    )}
                    <Link
                      href="/order-history"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                    >
                      <History className="w-4 h-4" />
                      Order History
                    </Link>
                    <Link
                      href="/order-tracking"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      Track Orders
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <hr className="my-1.5 border-border" />
                    <button
                      onClick={() => { setShowUserMenu(false); setShowDialog(true); }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>,
              document.body
            )}
        </div>
      ) : (
        <Link
          href="/signin"
          className="h-9 px-4 flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <User className="w-[16px] h-[16px]" />
          <span className="hidden sm:inline">Sign In</span>
        </Link>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogTitle>Sign Out</DialogTitle>
          <DialogDescription>
            Are you sure you want to sign out?
          </DialogDescription>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={signoutHandler}>
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Menu;

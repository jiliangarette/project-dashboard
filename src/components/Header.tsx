"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { clsx } from "clsx";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-card-border bg-card-bg/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg flex-shrink-0">
          <LayoutDashboard className="w-5 h-5 text-accent" />
          <span className="hidden xs:inline">Project Dashboard</span>
          <span className="xs:hidden">Dashboard</span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-auto hidden sm:flex items-center gap-1 text-sm">
          <Link
            href="/"
            className={clsx(
              "px-3 py-2 rounded-lg transition-colors min-h-[44px] flex items-center",
              isHome ? "text-foreground bg-foreground/5" : "text-muted-fg hover:text-foreground"
            )}
          >
            Projects
          </Link>
          <Link
            href="/settings"
            className="px-3 py-2 rounded-lg transition-colors hover:text-foreground text-muted-fg min-h-[44px] flex items-center"
          >
            Settings
          </Link>
          {session?.user && (
            <div className="flex items-center gap-3 border-l border-card-border pl-3 ml-2">
              <div className="flex items-center gap-2">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-7 h-7 rounded-full"
                  />
                )}
                <span className="text-sm text-foreground hidden md:block">
                  {session.user.name}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-2 rounded-lg text-muted-fg hover:text-foreground hover:bg-foreground/5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="ml-auto sm:hidden p-2 rounded-lg text-muted-fg hover:text-foreground hover:bg-foreground/5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-card-border bg-card-bg px-4 pb-4 pt-2 space-y-1">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className={clsx(
              "block px-3 py-3 rounded-lg transition-colors min-h-[44px]",
              isHome ? "text-foreground bg-foreground/5" : "text-muted-fg hover:text-foreground"
            )}
          >
            Projects
          </Link>
          <Link
            href="/settings"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-3 rounded-lg transition-colors hover:text-foreground text-muted-fg min-h-[44px]"
          >
            Settings
          </Link>
          {session?.user && (
            <div className="border-t border-card-border pt-2 mt-2">
              <div className="flex items-center justify-between px-3 py-3">
                <div className="flex items-center gap-2">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-7 h-7 rounded-full"
                    />
                  )}
                  <span className="text-sm text-foreground">{session.user.name}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="px-3 py-2 rounded-lg text-muted-fg hover:text-foreground hover:bg-foreground/5 transition-colors min-h-[44px] flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, LogOut } from "lucide-react";
import { clsx } from "clsx";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { data: session } = useSession();

  return (
    <header className="border-b border-card-border bg-card-bg/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <LayoutDashboard className="w-5 h-5 text-accent" />
          Project Dashboard
        </Link>
        <nav className="ml-auto flex items-center gap-4 text-sm">
          <Link
            href="/"
            className={clsx(
              "transition-colors hover:text-foreground",
              isHome ? "text-foreground" : "text-muted-fg"
            )}
          >
            Projects
          </Link>
          {session?.user && (
            <div className="flex items-center gap-3 border-l border-card-border pl-4">
              <div className="flex items-center gap-2">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-7 h-7 rounded-full"
                  />
                )}
                <span className="text-sm text-foreground hidden sm:block">
                  {session.user.name}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-muted-fg hover:text-foreground transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

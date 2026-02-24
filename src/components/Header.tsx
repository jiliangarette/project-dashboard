"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import { clsx } from "clsx";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="border-b border-card-border bg-card-bg/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <LayoutDashboard className="w-5 h-5 text-accent" />
          Jilian Dashboard
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
        </nav>
      </div>
    </header>
  );
}

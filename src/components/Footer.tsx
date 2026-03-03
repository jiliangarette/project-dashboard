"use client";

import { Keyboard, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-card-border mt-12 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-fg">
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/jiliangarette/project-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            Source
          </a>
          <span>Built with Next.js + Tailwind</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted">
          <Keyboard className="w-3.5 h-3.5" />
          <span>Press <kbd className="px-1 py-0.5 text-[10px] rounded border border-card-border bg-input-bg font-mono">?</kbd> for shortcuts</span>
        </div>
      </div>
    </footer>
  );
}

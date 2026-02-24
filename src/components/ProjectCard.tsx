"use client";

import Link from "next/link";
import { FolderOpen, FileText, Clock } from "lucide-react";
import { clsx } from "clsx";
import type { ProjectSummary } from "@/lib/types";

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Link href={`/project/${project.name}`}>
      <div className="bg-card-bg border border-card-border rounded-xl p-5 hover:bg-card-hover hover:border-accent/30 transition-all group cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-accent group-hover:text-accent-hover transition-colors" />
            <h3 className="font-semibold text-foreground">{project.name}</h3>
          </div>
          {project.hasClaude && (
            <span title="Has CLAUDE.md"><FileText className="w-4 h-4 text-muted-fg" /></span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-fg">
          <span
            className={clsx(
              "font-medium",
              project.pendingCount > 0 ? "text-warning" : "text-success"
            )}
          >
            {project.pendingCount} pending
          </span>
          <span>{project.totalCount} total</span>
        </div>
        {project.hasTasks && (
          <div className="flex items-center gap-1 mt-3 text-xs text-muted">
            <Clock className="w-3 h-3" />
            {timeAgo(project.lastUpdated)}
          </div>
        )}
      </div>
    </Link>
  );
}

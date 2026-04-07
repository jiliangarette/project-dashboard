"use client";

import { memo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Pin, Pencil, Check, X } from "lucide-react";
import { clsx } from "clsx";
import type { GitHubRepo } from "@/lib/github";

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} months ago`;
}

interface ProjectCardProps {
  repo: GitHubRepo;
  isPinned: boolean;
  onTogglePin?: (repoId: number) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (repoId: number) => void;
  alias?: string | null;
  onAliasChange?: (repoId: number, alias: string) => void;
}

export const ProjectCard = memo(function ProjectCard({
  repo,
  isPinned,
  onTogglePin,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
  alias,
  onAliasChange
}: ProjectCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(alias || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleSaveAlias = () => {
    onAliasChange?.(repo.id, editValue.trim());
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditValue(alias || "");
    setIsEditing(false);
  };

  const displayName = alias || repo.name;

  return (
    <div className={clsx(
      "relative bg-card-bg border border-card-border rounded-xl p-4 sm:p-5 hover:bg-card-hover hover:border-accent/30 hover:shadow-[0_0_16px_rgba(59,130,246,0.08)] transition-all group card-fade-in",
      isSelected && "border-accent bg-accent/5"
    )}>
      {/* Selection checkbox (only in selection mode) */}
      {isSelectionMode && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect?.(repo.id);
            }}
            className="w-5 h-5 rounded border-card-border bg-input-bg text-accent focus:ring-2 focus:ring-accent focus:ring-offset-0 cursor-pointer"
            aria-label={`Select ${repo.name}`}
          />
        </div>
      )}

      {/* Pin button (hidden in selection mode) */}
      {!isSelectionMode && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onTogglePin?.(repo.id);
          }}
          className={clsx(
            "absolute top-2 right-2 p-2.5 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center",
            isPinned
              ? "text-accent bg-accent/10"
              : "text-muted-fg hover:text-accent hover:bg-accent/5"
          )}
          title={isPinned ? "Unpin" : "Pin to top"}
          aria-label={isPinned ? `Unpin ${repo.name}` : `Pin ${repo.name} to top`}
        >
          <Pin className={clsx("w-4 h-4", isPinned && "fill-accent")} />
        </button>
      )}

      <Link href={`/project/${repo.owner.login}/${repo.name}`} prefetch={false}>
        <div>
          {/* Repo name */}
          {isEditing ? (
            <div
              className="flex items-center gap-1.5 mb-2 pr-8"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveAlias();
                  if (e.key === "Escape") handleCancelEdit();
                }}
                className="flex-1 px-2 py-1 rounded border border-accent/50 bg-input-bg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder={repo.name}
              />
              <button onClick={handleSaveAlias} className="p-1 text-green-400 hover:text-green-300">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleCancelEdit} className="p-1 text-red-400 hover:text-red-300">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mb-1 pr-8 group/name">
              <h3 className="font-semibold text-foreground">{displayName}</h3>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditValue(alias || "");
                  setIsEditing(true);
                }}
                className="p-1 text-muted-fg opacity-0 group-hover/name:opacity-100 hover:text-accent transition-all"
                title="Rename project"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          )}
          {alias && (
            <p className="text-xs text-muted-fg mb-1">{repo.name}</p>
          )}

          {/* Description */}
          <p className="text-sm text-muted-fg mb-4 line-clamp-2 min-h-[2.5rem]">
            {repo.description || "No description"}
          </p>

          {/* Last updated */}
          <div className="text-xs text-muted">Updated {timeAgo(repo.updated_at)}</div>
        </div>
      </Link>
    </div>
  );
});

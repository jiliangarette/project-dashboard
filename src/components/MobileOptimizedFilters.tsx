"use client";

import { useState } from "react";
import { ChevronDown, Filter, X } from "lucide-react";
import { clsx } from "clsx";

interface MobileOptimizedFiltersProps {
  languageFilter: string;
  setLanguageFilter: (lang: string) => void;
  sortBy: string;
  setSortBy: (sort: any) => void;
  activityFilter: string;
  setActivityFilter: (filter: any) => void;
  languages: string[];
}

export function MobileOptimizedFilters({
  languageFilter,
  setLanguageFilter,
  sortBy,
  setSortBy,
  activityFilter,
  setActivityFilter,
  languages,
}: MobileOptimizedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFiltersCount =
    (languageFilter ? 1 : 0) +
    (sortBy !== "updated" ? 1 : 0) +
    (activityFilter !== "30d" ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <>
      {/* Mobile: Collapsible filter panel */}
      <div className="md:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={clsx(
            "w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg border transition-colors min-h-[44px]",
            hasActiveFilters
              ? "bg-accent/10 border-accent/30 text-accent"
              : "bg-card-bg border-card-border text-foreground hover:bg-card-hover"
          )}
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="font-medium text-sm">
              Filters
              {hasActiveFilters && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white text-xs font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </span>
          </div>
          <ChevronDown
            className={clsx(
              "w-4 h-4 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </button>

        {isExpanded && (
          <div className="mt-3 p-4 bg-card-bg border border-card-border rounded-lg space-y-4">
            {/* Language Filter */}
            <div>
              <label className="block text-xs font-medium text-muted-fg mb-2">
                Language
              </label>
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="w-full px-4 py-3 text-base rounded-lg border border-card-border bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
              >
                <option value="">All Languages</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-medium text-muted-fg mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 text-base rounded-lg border border-card-border bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
              >
                <option value="updated">Recently Updated</option>
                <option value="stars">Most Stars</option>
                <option value="name">Name (A-Z)</option>
                <option value="issues">Most Issues</option>
              </select>
            </div>

            {/* Activity Filter */}
            <div>
              <label className="block text-xs font-medium text-muted-fg mb-2">
                Activity
              </label>
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="w-full px-4 py-3 text-base rounded-lg border border-card-border bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setLanguageFilter("");
                  setSortBy("updated");
                  setActivityFilter("30d");
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors min-h-[44px]"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Desktop: Inline filters (existing layout) */}
      <div className="hidden md:flex md:flex-wrap md:items-center md:gap-3">
        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-card-border bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">All Languages</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-card-border bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="updated">Recently Updated</option>
          <option value="stars">Most Stars</option>
          <option value="name">Name (A-Z)</option>
          <option value="issues">Most Issues</option>
        </select>

        <select
          value={activityFilter}
          onChange={(e) => setActivityFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-card-border bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="all">All Time</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setLanguageFilter("");
              setSortBy("updated");
              setActivityFilter("30d");
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>
    </>
  );
}

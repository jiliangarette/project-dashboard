"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { GitHubRepo, GitHubRateLimit } from "@/lib/github";
import { ProjectCard } from "@/components/ProjectCard";
import { Search, Filter, Star } from "lucide-react";
import { clsx } from "clsx";

export default function DashboardPage() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<GitHubRateLimit | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"updated" | "stars" | "name" | "issues">("updated");
  const [pinnedRepos, setPinnedRepos] = useState<Set<number>>(new Set());
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // / or Cmd+K to focus search
      if (e.key === "/" || (e.metaKey && e.key === "k")) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Escape to clear search
      if (e.key === "Escape") {
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load pinned repos from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("pinnedRepos");
    if (stored) {
      try {
        const ids = JSON.parse(stored);
        setPinnedRepos(new Set(ids));
      } catch (e) {
        console.error("Failed to parse pinned repos:", e);
      }
    }
  }, []);

  // Save pinned repos to localStorage
  useEffect(() => {
    localStorage.setItem("pinnedRepos", JSON.stringify(Array.from(pinnedRepos)));
  }, [pinnedRepos]);

  // Fetch repos
  useEffect(() => {
    async function loadRepos() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/repos");

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch repos");
        }

        const data = await response.json();
        setRepos(data.repos);
        setRateLimit(data.rateLimit);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    loadRepos();
  }, []);

  // Get unique languages
  const languages = useMemo(() => {
    const langs = new Set<string>();
    repos.forEach((repo) => {
      if (repo.language) langs.add(repo.language);
    });
    return Array.from(langs).sort();
  }, [repos]);

  // Filter and sort repos
  const filteredRepos = useMemo(() => {
    let filtered = repos;

    // Search
    if (searchQuery) {
      filtered = filtered.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Language filter
    if (languageFilter) {
      filtered = filtered.filter((repo) => repo.language === languageFilter);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "updated":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case "stars":
          return b.stargazers_count - a.stargazers_count;
        case "name":
          return a.name.localeCompare(b.name);
        case "issues":
          return b.open_issues_count - a.open_issues_count;
        default:
          return 0;
      }
    });

    return filtered;
  }, [repos, searchQuery, languageFilter, sortBy]);

  // Separate pinned and unpinned
  const pinnedReposList = filteredRepos.filter((repo) => pinnedRepos.has(repo.id));
  const unpinnedReposList = filteredRepos.filter((repo) => !pinnedRepos.has(repo.id));

  // Stats
  const totalRepos = repos.length;
  const activeRepos = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return repos.filter((repo) => new Date(repo.updated_at) > thirtyDaysAgo).length;
  }, [repos]);
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalIssues = repos.reduce((sum, repo) => sum + repo.open_issues_count, 0);

  const togglePin = (repoId: number) => {
    setPinnedRepos((prev) => {
      const next = new Set(prev);
      if (next.has(repoId)) {
        next.delete(repoId);
      } else {
        next.add(repoId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border border-card-border bg-card-bg p-4 animate-pulse">
              <div className="h-4 bg-muted/20 rounded w-24 mb-2" />
              <div className="h-8 bg-muted/20 rounded w-16" />
            </div>
          ))}
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-lg border border-card-border bg-card-bg p-4 animate-pulse">
              <div className="h-5 bg-muted/20 rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted/20 rounded w-full mb-4" />
              <div className="flex gap-2">
                <div className="h-4 bg-muted/20 rounded w-16" />
                <div className="h-4 bg-muted/20 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-card-border bg-card-bg p-4">
          <div className="text-sm text-muted-fg mb-1">Total Repositories</div>
          <div className="text-3xl font-bold text-foreground">{totalRepos}</div>
        </div>
        <div className="rounded-lg border border-card-border bg-card-bg p-4">
          <div className="text-sm text-muted-fg mb-1">Active (30 days)</div>
          <div className="text-3xl font-bold text-accent">{activeRepos}</div>
        </div>
        <div className="rounded-lg border border-card-border bg-card-bg p-4">
          <div className="text-sm text-muted-fg mb-1">Total Stars</div>
          <div className="text-3xl font-bold text-foreground">{totalStars}</div>
        </div>
        <div className="rounded-lg border border-card-border bg-card-bg p-4">
          <div className="text-sm text-muted-fg mb-1">Open Issues</div>
          <div className="text-3xl font-bold text-foreground">{totalIssues}</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-card-border bg-card-bg text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-card-border bg-card-bg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
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
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 rounded-lg border border-card-border bg-card-bg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="updated">Recently Updated</option>
            <option value="stars">Most Stars</option>
            <option value="name">Name A-Z</option>
            <option value="issues">Most Issues</option>
          </select>
        </div>
      </div>

      {/* Rate Limit */}
      {rateLimit && (
        <div className="text-xs text-muted-fg text-right">
          GitHub API: {rateLimit.remaining}/{rateLimit.limit} calls remaining
        </div>
      )}

      {/* Pinned Repos */}
      {pinnedReposList.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-accent fill-accent" />
            <h2 className="text-lg font-semibold text-foreground">Pinned Projects</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedReposList.map((repo) => (
              <ProjectCard key={repo.id} repo={repo} isPinned={true} onTogglePin={togglePin} />
            ))}
          </div>
        </div>
      )}

      {/* All Repos */}
      <div>
        {pinnedReposList.length > 0 && (
          <h2 className="text-lg font-semibold text-foreground mb-4">All Projects</h2>
        )}
        {unpinnedReposList.length === 0 ? (
          <div className="rounded-lg border border-card-border bg-card-bg p-12 text-center">
            <p className="text-muted-fg">No repositories found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpinnedReposList.map((repo) => (
              <ProjectCard key={repo.id} repo={repo} isPinned={false} onTogglePin={togglePin} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

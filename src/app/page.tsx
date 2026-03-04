"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { GitHubRepo, GitHubRateLimit } from "@/lib/github";
import { ProjectCard } from "@/components/ProjectCard";
import { Search, Star, WifiOff, Clock, CheckSquare, Pin, X, Download } from "lucide-react";
import { clsx } from "clsx";
import { LanguageChart } from "@/components/LanguageChart";
import { toast } from "@/components/Toast";
import { exportReposAsCSV, exportReposAsJSON } from "@/lib/export";
import { MobileOptimizedFilters } from "@/components/MobileOptimizedFilters";

export default function DashboardPage() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitReset, setRateLimitReset] = useState<number | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [rateLimit, setRateLimit] = useState<GitHubRateLimit | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"updated" | "stars" | "name" | "issues">("updated");
  const [activityFilter, setActivityFilter] = useState<"7d" | "30d" | "all">("30d");
  const [pinnedRepos, setPinnedRepos] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Offline detection
  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      toast("warning", "You're offline. Some features may not work.");
    };
    const handleOnline = () => {
      setIsOffline(false);
      toast("success", "Back online!");
    };

    setIsOffline(!navigator.onLine);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" || (e.metaKey && e.key === "k")) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
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
        setIsRateLimited(false);
        const response = await fetch("/api/repos");

        if (!response.ok) {
          const data = await response.json();

          // Detect rate limiting
          if (response.status === 403 && data.error?.includes("rate limit")) {
            setIsRateLimited(true);
            const resetHeader = response.headers.get("X-RateLimit-Reset");
            if (resetHeader) setRateLimitReset(parseInt(resetHeader) * 1000);
            throw new Error("GitHub API rate limit exceeded");
          }

          throw new Error(data.error || "Failed to fetch repos");
        }

        const data = await response.json();
        setRepos(data.repos);
        setRateLimit(data.rateLimit);

        // Warn if rate limit is low
        if (data.rateLimit && data.rateLimit.remaining < 10) {
          toast("warning", `GitHub API: only ${data.rateLimit.remaining} calls remaining`);
        }
      } catch (err) {
        if (!navigator.onLine) {
          setIsOffline(true);
          setError("You appear to be offline. Check your connection and try again.");
        } else {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
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

    // Activity filter
    if (activityFilter !== "all") {
      const days = activityFilter === "7d" ? 7 : 30;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      filtered = filtered.filter((repo) => new Date(repo.updated_at) > cutoff);
    }

    if (searchQuery) {
      filtered = filtered.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (languageFilter) {
      filtered = filtered.filter((repo) => repo.language === languageFilter);
    }

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
  }, [repos, searchQuery, languageFilter, sortBy, activityFilter]);

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
        toast("info", "Repository unpinned");
      } else {
        next.add(repoId);
        toast("success", "Repository pinned");
      }
      return next;
    });
  };

  const toggleSelection = (repoId: number) => {
    setSelectedRepos((prev) => {
      const next = new Set(prev);
      if (next.has(repoId)) {
        next.delete(repoId);
      } else {
        next.add(repoId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedRepos(new Set(filteredRepos.map(r => r.id)));
  };

  const clearSelection = () => {
    setSelectedRepos(new Set());
    setIsSelectionMode(false);
  };

  const bulkPin = () => {
    setPinnedRepos((prev) => {
      const next = new Set(prev);
      selectedRepos.forEach((id) => next.add(id));
      return next;
    });
    toast("success", `${selectedRepos.size} repositories pinned`);
    clearSelection();
  };

  const bulkUnpin = () => {
    setPinnedRepos((prev) => {
      const next = new Set(prev);
      selectedRepos.forEach((id) => next.delete(id));
      return next;
    });
    toast("info", `${selectedRepos.size} repositories unpinned`);
    clearSelection();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border border-card-border bg-card-bg p-4 animate-pulse">
              <div className="h-4 bg-muted/20 rounded w-24 mb-2" />
              <div className="h-8 bg-muted/20 rounded w-16" />
            </div>
          ))}
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
      <div className="space-y-4">
        {/* Offline banner */}
        {isOffline && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-warning/30 bg-warning/10">
            <WifiOff className="w-5 h-5 text-warning flex-shrink-0" />
            <p className="text-warning text-sm">You appear to be offline. Check your internet connection.</p>
          </div>
        )}

        {/* Rate limit banner */}
        {isRateLimited && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-warning/30 bg-warning/10">
            <Clock className="w-5 h-5 text-warning flex-shrink-0" />
            <div>
              <p className="text-warning font-medium">GitHub API rate limit exceeded</p>
              <p className="text-warning/80 text-sm">
                {rateLimitReset
                  ? `Resets at ${new Date(rateLimitReset).toLocaleTimeString()}`
                  : "Please wait a few minutes and try again"}
              </p>
            </div>
          </div>
        )}

        {/* General error */}
        {!isOffline && !isRateLimited && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors min-h-[44px]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Offline banner */}
      {isOffline && (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-warning/30 bg-warning/10">
          <WifiOff className="w-5 h-5 text-warning flex-shrink-0" />
          <p className="text-warning text-sm">You&apos;re offline. Data may be stale.</p>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-lg border border-card-border bg-card-bg p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-fg mb-1">Total Repos</div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground">{totalRepos}</div>
        </div>
        <div className="rounded-lg border border-card-border bg-card-bg p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-fg mb-1">Active (30d)</div>
          <div className="text-2xl sm:text-3xl font-bold text-accent">{activeRepos}</div>
        </div>
        <div className="rounded-lg border border-card-border bg-card-bg p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-fg mb-1">Total Stars</div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground">{totalStars}</div>
        </div>
        <div className="rounded-lg border border-card-border bg-card-bg p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-fg mb-1">Open Issues</div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground">{totalIssues}</div>
        </div>
      </div>

      {/* Language Distribution */}
      <LanguageChart repos={repos} />

      {/* Filters and Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search repositories... (press /)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-card-border bg-card-bg text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
            aria-label="Search repositories"
          />
        </div>

        {/* Filters: Mobile-optimized collapsible on small screens, inline on desktop */}
        <MobileOptimizedFilters
          languageFilter={languageFilter}
          setLanguageFilter={setLanguageFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          activityFilter={activityFilter}
          setActivityFilter={setActivityFilter}
          languages={languages}
        />

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">

          <button
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              setSelectedRepos(new Set());
            }}
            className={clsx(
              "px-3 sm:px-4 py-2.5 rounded-lg transition-colors min-h-[44px] text-sm flex items-center gap-2",
              isSelectionMode
                ? "bg-accent text-white"
                : "border border-card-border bg-card-bg text-foreground hover:bg-foreground/5"
            )}
            title="Select multiple repositories"
          >
            <CheckSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Select</span>
          </button>

          <div className="relative group">
            <button
              className="px-3 sm:px-4 py-2.5 rounded-lg border border-card-border bg-card-bg text-foreground hover:bg-foreground/5 transition-colors min-h-[44px] text-sm flex items-center gap-2"
              title="Export repositories"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-36 bg-card-bg border border-card-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => {
                  exportReposAsCSV(filteredRepos);
                  toast("success", "Exported as CSV");
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-foreground/5 transition-colors rounded-t-lg"
              >
                Export as CSV
              </button>
              <button
                onClick={() => {
                  exportReposAsJSON(filteredRepos);
                  toast("success", "Exported as JSON");
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-foreground/5 transition-colors rounded-b-lg"
              >
                Export as JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {isSelectionMode && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-foreground">
              {selectedRepos.size} {selectedRepos.size === 1 ? 'repository' : 'repositories'} selected
            </span>
            <button
              onClick={selectAll}
              className="text-xs text-accent hover:underline"
            >
              Select all ({filteredRepos.length})
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={bulkPin}
              disabled={selectedRepos.size === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] text-sm"
            >
              <Pin className="w-4 h-4" />
              Pin
            </button>
            <button
              onClick={bulkUnpin}
              disabled={selectedRepos.size === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-card-border bg-card-bg hover:bg-foreground/5 text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] text-sm"
            >
              <Pin className="w-4 h-4" />
              Unpin
            </button>
            <button
              onClick={clearSelection}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-card-border bg-card-bg hover:bg-foreground/5 text-foreground transition-colors min-h-[40px] text-sm"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Cancel</span>
            </button>
          </div>
        </div>
      )}

      {/* Rate Limit */}
      {rateLimit && (
        <div className={clsx(
          "text-xs text-right",
          rateLimit.remaining < 10 ? "text-warning" : "text-muted-fg"
        )}>
          GitHub API: {rateLimit.remaining}/{rateLimit.limit} calls remaining
        </div>
      )}

      {/* Pinned Repos */}
      {pinnedReposList.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Star className="w-4 h-4 text-accent fill-accent" />
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Pinned Projects</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {pinnedReposList.map((repo) => (
              <ProjectCard 
                key={repo.id} 
                repo={repo} 
                isPinned={true} 
                onTogglePin={togglePin}
                isSelectionMode={isSelectionMode}
                isSelected={selectedRepos.has(repo.id)}
                onToggleSelect={toggleSelection}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Repos */}
      <div>
        {pinnedReposList.length > 0 && (
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">All Projects</h2>
        )}
        {unpinnedReposList.length === 0 ? (
          <div className="rounded-lg border border-card-border bg-card-bg p-8 sm:p-12 text-center">
            <p className="text-muted-fg">No repositories found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {unpinnedReposList.map((repo) => (
              <ProjectCard 
                key={repo.id} 
                repo={repo} 
                isPinned={false} 
                onTogglePin={togglePin}
                isSelectionMode={isSelectionMode}
                isSelected={selectedRepos.has(repo.id)}
                onToggleSelect={toggleSelection}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

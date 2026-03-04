"use client";

import { useState, useEffect, useMemo } from "react";
import { RefreshCw, Sparkles, Calendar, AlertCircle, ChevronDown, GitCommit, Users } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "@/components/Toast";
import {
  groupCommitsByDay,
  getCachedChangelog,
  setCachedChangelog,
  type DayCommits,
  type GeneratedChangelog,
} from "@/lib/changelog";

type ViewMode = "daily" | "weekly" | "monthly";

interface ChangelogTabProps {
  owner: string;
  repo: string;
}

function getProviderSettings() {
  let provider = "openai";
  let model = "gpt-4.1-nano";

  try {
    const stored = localStorage.getItem("changelog-settings");
    if (stored) {
      const settings = JSON.parse(stored);
      provider = settings.aiProvider || "openai";
      if (provider === "openrouter") {
        model = settings.openrouterModel || "liquid/lfm-2.5-1.2b-instruct:free";
      } else if (provider === "openai") {
        model = settings.openaiModel || "gpt-4.1-nano";
      } else if (provider === "anthropic") {
        model = settings.anthropicModel || "claude-sonnet-4-5";
      }
    }
  } catch {}

  return { provider, model };
}

/** Filter day groups by author — returns new DayCommits[] with only that author's commits */
function filterByAuthor(days: DayCommits[], author: string): DayCommits[] {
  if (!author) return days;
  return days
    .map((day) => ({
      ...day,
      commits: day.commits.filter((c) => c.author === author),
    }))
    .filter((day) => day.commits.length > 0);
}

// ── Day Dropdown (for daily view) ──────────────────────────────

function DayDropdown({
  day,
  changelog,
  isGenerating,
  hasFailed,
  onGenerate,
  defaultOpen,
}: {
  day: DayCommits;
  changelog?: GeneratedChangelog;
  isGenerating: boolean;
  hasFailed: boolean;
  onGenerate: () => void;
  defaultOpen?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultOpen ?? false);
  const date = new Date(day.date + "T00:00:00");
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-card-bg border border-card-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 sm:px-6 hover:bg-foreground/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
          <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">{dateStr}</h3>
          <span className="text-xs text-muted-fg flex-shrink-0">
            {day.commits.length} {day.commits.length === 1 ? "commit" : "commits"}
          </span>
          {changelog && <span className="text-xs text-green-400 flex-shrink-0 hidden sm:inline">Generated</span>}
          {hasFailed && <span className="text-xs text-red-400 flex-shrink-0">Failed</span>}
          {isGenerating && <span className="text-xs text-accent flex-shrink-0 animate-pulse">Generating...</span>}
        </div>
        <ChevronDown className={clsx("w-4 h-4 text-muted-fg transition-transform flex-shrink-0", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="border-t border-card-border">
          <SummarySection changelog={changelog} isGenerating={isGenerating} hasFailed={hasFailed} onGenerate={onGenerate} />
          <CommitsList commits={day.commits} />
        </div>
      )}
    </div>
  );
}

// ── Combined Period View (weekly / monthly) ────────────────────

function CombinedPeriodView({
  label,
  days,
  allCommits,
  changelog,
  isGenerating,
  hasFailed,
  onGenerate,
}: {
  label: string;
  days: DayCommits[];
  allCommits: DayCommits["commits"];
  changelog?: GeneratedChangelog;
  isGenerating: boolean;
  hasFailed: boolean;
  onGenerate: () => void;
}) {
  const [showCommits, setShowCommits] = useState(false);

  if (allCommits.length === 0) {
    return (
      <div className="bg-card-bg border border-card-border rounded-lg p-8 text-center">
        <p className="text-muted-fg text-sm">No commits in this period.</p>
      </div>
    );
  }

  return (
    <div className="bg-card-bg border border-card-border rounded-lg overflow-hidden">
      <div className="p-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-3 mb-1">
          <Calendar className="w-5 h-5 text-accent flex-shrink-0" />
          <h3 className="text-base sm:text-lg font-semibold text-foreground">{label}</h3>
        </div>
        <p className="text-xs text-muted-fg ml-8">
          {allCommits.length} commits across {days.length} {days.length === 1 ? "day" : "days"}
        </p>
      </div>

      <div className="border-t border-card-border">
        <SummarySection changelog={changelog} isGenerating={isGenerating} hasFailed={hasFailed} onGenerate={onGenerate} />
      </div>

      <div className="border-t border-card-border/50 bg-foreground/[0.015]">
        <button
          onClick={() => setShowCommits(!showCommits)}
          className="w-full flex items-center justify-between px-4 sm:px-6 py-3 hover:bg-foreground/[0.02] transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <GitCommit className="w-3.5 h-3.5 text-muted-fg" />
            <span className="text-xs font-medium text-muted-fg uppercase tracking-wide">
              All Commits ({allCommits.length})
            </span>
          </div>
          <ChevronDown className={clsx("w-3.5 h-3.5 text-muted-fg transition-transform", showCommits && "rotate-180")} />
        </button>

        {showCommits && (
          <div className="px-4 sm:px-6 pb-4 max-h-96 overflow-y-auto">
            {days.map((day) => {
              const d = new Date(day.date + "T00:00:00");
              const dayLabel = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
              return (
                <div key={day.date} className="mb-3 last:mb-0">
                  <p className="text-[11px] font-medium text-muted-fg uppercase tracking-wide mb-1.5">{dayLabel}</p>
                  <ul className="space-y-1">
                    {day.commits.map((commit) => (
                      <li key={commit.sha} className="flex items-start gap-2 text-xs text-muted-fg group">
                        <code className="text-[10px] text-accent/60 font-mono mt-0.5 flex-shrink-0 group-hover:text-accent transition-colors">
                          {commit.sha.slice(0, 7)}
                        </code>
                        <span className="break-words leading-relaxed">{commit.message.split("\n")[0]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared components ──────────────────────────────────────────

function SummarySection({
  changelog,
  isGenerating,
  hasFailed,
  onGenerate,
}: {
  changelog?: GeneratedChangelog;
  isGenerating: boolean;
  hasFailed: boolean;
  onGenerate: () => void;
}) {
  return (
    <div className="p-4 sm:px-6 sm:py-5">
      {isGenerating ? (
        <div className="flex items-center gap-3 text-muted-fg">
          <Sparkles className="w-4 h-4 animate-pulse text-accent" />
          <span className="text-sm">Generating summary...</span>
        </div>
      ) : changelog ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-medium text-accent uppercase tracking-wide">AI Summary</span>
            </div>
            <button
              onClick={onGenerate}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-fg hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Redo
            </button>
          </div>
          <p className="text-foreground/90 italic mb-3 text-sm leading-relaxed break-words">{changelog.summary}</p>
          {changelog.bullets.length > 0 && (
            <ul className="space-y-2">
              {changelog.bullets.map((bullet, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-fg leading-relaxed">
                  <span className="text-accent mt-0.5 flex-shrink-0">--</span>
                  <span className="break-words">{bullet}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : hasFailed ? (
        <div className="flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-400">Generation failed</span>
          <button
            onClick={onGenerate}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors text-xs"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      ) : (
        <button
          onClick={onGenerate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-colors text-sm"
        >
          <Sparkles className="w-4 h-4" />
          Generate Summary
        </button>
      )}
    </div>
  );
}

function CommitsList({ commits }: { commits: DayCommits["commits"] }) {
  return (
    <div className="border-t border-card-border/50 bg-foreground/[0.015] px-4 sm:px-6 py-3">
      <div className="flex items-center gap-2 mb-2">
        <GitCommit className="w-3.5 h-3.5 text-muted-fg" />
        <span className="text-xs font-medium text-muted-fg uppercase tracking-wide">Commits</span>
      </div>
      <ul className="space-y-1.5 max-h-64 overflow-y-auto">
        {commits.map((commit) => (
          <li key={commit.sha} className="flex items-start gap-2 text-xs text-muted-fg group">
            <code className="text-[10px] text-accent/60 font-mono mt-0.5 flex-shrink-0 group-hover:text-accent transition-colors">
              {commit.sha.slice(0, 7)}
            </code>
            <span className="break-words leading-relaxed">{commit.message.split("\n")[0]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────

export function ChangelogTab({ owner, repo }: ChangelogTabProps) {
  const [allDayGroups, setAllDayGroups] = useState<DayCommits[]>([]);
  const [changelogs, setChangelogs] = useState<Map<string, GeneratedChangelog>>(new Map());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [failedKeys, setFailedKeys] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [authorFilter, setAuthorFilter] = useState<string>("");

  // Extract unique authors sorted by commit count (most active first)
  const authors = useMemo(() => {
    const counts = new Map<string, number>();
    allDayGroups.forEach((day) =>
      day.commits.forEach((c) => counts.set(c.author, (counts.get(c.author) || 0) + 1))
    );
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [allDayGroups]);

  // Filtered day groups based on author
  const dayGroups = useMemo(() => filterByAuthor(allDayGroups, authorFilter), [allDayGroups, authorFilter]);

  // Author suffix for cache keys
  const authorSuffix = authorFilter ? `:author:${authorFilter}` : "";

  // Combined periods
  const last7Days = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    return dayGroups.filter((d) => d.date >= cutoffStr);
  }, [dayGroups]);

  const last30Days = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    return dayGroups.filter((d) => d.date >= cutoffStr);
  }, [dayGroups]);

  const allCommits7 = useMemo(() => last7Days.flatMap((d) => d.commits), [last7Days]);
  const allCommits30 = useMemo(() => last30Days.flatMap((d) => d.commits), [last30Days]);

  const weekCacheKey = `week:last7${authorSuffix}`;
  const monthCacheKey = `month:last30${authorSuffix}`;

  useEffect(() => {
    async function loadCommits() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/repo/${owner}/${repo}/commits`);
        if (!response.ok) {
          const data = await response.json();
          if (response.status === 403) throw new Error("GitHub API rate limit exceeded. Try again later.");
          throw new Error(data.error || "Failed to fetch commits");
        }

        const data = await response.json();
        const grouped = groupCommitsByDay(data.commits);
        setAllDayGroups(grouped);

        // Load all cached changelogs
        const cached = new Map<string, GeneratedChangelog>();
        grouped.forEach((day) => {
          const c = getCachedChangelog(owner, repo, day.date);
          if (c) cached.set(day.date, c);
        });
        // Try loading combined caches for common keys
        for (const key of ["week:last7", "month:last30"]) {
          const c = getCachedChangelog(owner, repo, key);
          if (c) cached.set(key, c);
        }
        setChangelogs(cached);
      } catch (err) {
        setError(!navigator.onLine ? "You appear to be offline." : err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    loadCommits();
  }, [owner, repo]);

  // Load author-specific caches when author changes
  useEffect(() => {
    if (!authorFilter) return;
    const cached = new Map(changelogs);
    // Load day-level caches for filtered days
    const filtered = filterByAuthor(allDayGroups, authorFilter);
    filtered.forEach((day) => {
      const key = `${day.date}${authorSuffix}`;
      if (!cached.has(key)) {
        const c = getCachedChangelog(owner, repo, key);
        if (c) cached.set(key, c);
      }
    });
    // Combined caches
    for (const key of [`week:last7${authorSuffix}`, `month:last30${authorSuffix}`]) {
      if (!cached.has(key)) {
        const c = getCachedChangelog(owner, repo, key);
        if (c) cached.set(key, c);
      }
    }
    setChangelogs(cached);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorFilter, owner, repo]);

  const callGenerate = async (cacheKey: string, commits: DayCommits["commits"], dateLabel: string) => {
    if (commits.length === 0) return;

    setGenerating((prev) => new Set(prev).add(cacheKey));
    setFailedKeys((prev) => { const n = new Set(prev); n.delete(cacheKey); return n; });

    try {
      const { provider, model } = getProviderSettings();

      const response = await fetch("/api/changelog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateLabel,
          commits: commits.map((c) => ({ message: c.message, author: c.author })),
          provider,
          model,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(data.error || "Failed to generate");
      }

      const generated: GeneratedChangelog = await response.json();
      setCachedChangelog(owner, repo, cacheKey, generated);
      setChangelogs((prev) => { const n = new Map(prev); n.set(cacheKey, generated); return n; });
    } catch (err) {
      console.error(`Failed to generate changelog (${cacheKey}):`, err);
      setFailedKeys((prev) => new Set(prev).add(cacheKey));
      toast("error", `Failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setGenerating((prev) => { const n = new Set(prev); n.delete(cacheKey); return n; });
    }
  };

  const dayCacheKey = (date: string) => `${date}${authorSuffix}`;

  const generateAll = async () => {
    const uncached = dayGroups.filter((day) => !changelogs.has(dayCacheKey(day.date)));
    for (const day of uncached) {
      await callGenerate(dayCacheKey(day.date), day.commits, day.date);
    }
    const successCount = uncached.filter((d) => !failedKeys.has(dayCacheKey(d.date))).length;
    if (successCount > 0) toast("success", `Generated ${successCount} changelogs`);
  };

  // ── Render ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-card-bg border border-card-border rounded-lg p-4">
            <div className="h-5 bg-muted/20 rounded w-48" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Failed to load commits</p>
            <p className="text-red-400/80 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (allDayGroups.length === 0) {
    return (
      <div className="bg-card-bg border border-card-border rounded-lg p-8 sm:p-12 text-center">
        <p className="text-muted-fg">No commits found.</p>
      </div>
    );
  }

  const uncachedCount = dayGroups.filter((day) => !changelogs.has(dayCacheKey(day.date))).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* View mode toggle */}
          <div className="flex items-center bg-card-bg border border-card-border rounded-lg p-1">
            {(["daily", "weekly", "monthly"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={clsx(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize",
                  viewMode === mode ? "bg-accent text-white" : "text-muted-fg hover:text-foreground"
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Author filter */}
            {authors.length > 1 && (
              <div className="relative flex items-center">
                <Users className="absolute left-3 w-4 h-4 text-muted-fg pointer-events-none" />
                <select
                  value={authorFilter}
                  onChange={(e) => setAuthorFilter(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-lg border border-card-border bg-card-bg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent min-h-[40px] appearance-none"
                  aria-label="Filter by contributor"
                >
                  <option value="">All contributors ({authors.length})</option>
                  {authors.map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.name} ({a.count})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Generate all (daily only) */}
            {viewMode === "daily" && uncachedCount > 0 && (
              <button
                onClick={generateAll}
                disabled={generating.size > 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[40px] text-sm flex-shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                Generate All ({uncachedCount})
              </button>
            )}
          </div>
        </div>

        {/* Active author pill */}
        {authorFilter && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-fg">Showing commits by:</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-sm font-medium">
              {authorFilter}
              <button
                onClick={() => setAuthorFilter("")}
                className="ml-1 hover:text-white transition-colors"
                aria-label="Clear author filter"
              >
                ×
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === "daily" && (
        <div className="space-y-2">
          {dayGroups.length === 0 ? (
            <div className="bg-card-bg border border-card-border rounded-lg p-8 text-center">
              <p className="text-muted-fg text-sm">No commits found{authorFilter ? ` by ${authorFilter}` : ""}.</p>
            </div>
          ) : (
            dayGroups.map((day, i) => (
              <DayDropdown
                key={day.date + authorSuffix}
                day={day}
                changelog={changelogs.get(dayCacheKey(day.date))}
                isGenerating={generating.has(dayCacheKey(day.date))}
                hasFailed={failedKeys.has(dayCacheKey(day.date))}
                onGenerate={() => callGenerate(dayCacheKey(day.date), day.commits, day.date)}
                defaultOpen={i === 0}
              />
            ))
          )}
        </div>
      )}

      {viewMode === "weekly" && (
        <CombinedPeriodView
          label={authorFilter ? `Last 7 Days — ${authorFilter}` : "Last 7 Days"}
          days={last7Days}
          allCommits={allCommits7}
          changelog={changelogs.get(weekCacheKey)}
          isGenerating={generating.has(weekCacheKey)}
          hasFailed={failedKeys.has(weekCacheKey)}
          onGenerate={() => callGenerate(weekCacheKey, allCommits7, "Last 7 days")}
        />
      )}

      {viewMode === "monthly" && (
        <CombinedPeriodView
          label={authorFilter ? `Last 30 Days — ${authorFilter}` : "Last 30 Days"}
          days={last30Days}
          allCommits={allCommits30}
          changelog={changelogs.get(monthCacheKey)}
          isGenerating={generating.has(monthCacheKey)}
          hasFailed={failedKeys.has(monthCacheKey)}
          onGenerate={() => callGenerate(monthCacheKey, allCommits30, "Last 30 days")}
        />
      )}
    </div>
  );
}

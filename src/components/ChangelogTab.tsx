"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Sparkles, Calendar, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "@/components/Toast";
import {
  groupCommitsByDay,
  getCachedChangelog,
  setCachedChangelog,
  type DayCommits,
  type GeneratedChangelog,
} from "@/lib/changelog";

interface ChangelogTabProps {
  owner: string;
  repo: string;
}

export function ChangelogTab({ owner, repo }: ChangelogTabProps) {
  const [commits, setCommits] = useState<any[]>([]);
  const [dayGroups, setDayGroups] = useState<DayCommits[]>([]);
  const [changelogs, setChangelogs] = useState<Map<string, GeneratedChangelog>>(new Map());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [failedDays, setFailedDays] = useState<Set<string>>(new Set());

  // Fetch commits
  useEffect(() => {
    async function loadCommits() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/repo/${owner}/${repo}/commits`);
        if (!response.ok) {
          const data = await response.json();

          if (response.status === 403) {
            throw new Error("GitHub API rate limit exceeded. Try again later.");
          }

          throw new Error(data.error || "Failed to fetch commits");
        }

        const data = await response.json();
        setCommits(data.commits);

        const grouped = groupCommitsByDay(data.commits);
        setDayGroups(grouped);

        // Load cached changelogs
        const cached = new Map<string, GeneratedChangelog>();
        grouped.forEach((day) => {
          const cachedDay = getCachedChangelog(owner, repo, day.date);
          if (cachedDay) {
            cached.set(day.date, cachedDay);
          }
        });
        setChangelogs(cached);
      } catch (err) {
        if (!navigator.onLine) {
          setError("You appear to be offline. Check your connection.");
        } else {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      } finally {
        setLoading(false);
      }
    }

    loadCommits();
  }, [owner, repo]);

  // Generate changelog for a single day
  const generateForDay = async (day: DayCommits) => {
    if (day.commits.length === 0) return;

    setGenerating((prev) => new Set(prev).add(day.date));
    setFailedDays((prev) => {
      const next = new Set(prev);
      next.delete(day.date);
      return next;
    });

    try {
      // Get settings from localStorage
      const storedSettings = localStorage.getItem("changelog-settings");
      let provider = "openrouter";
      let model = "meta-llama/llama-3.1-8b-instruct:free";

      if (storedSettings) {
        try {
          const settings = JSON.parse(storedSettings);
          provider = settings.aiProvider || "openrouter";

          if (provider === "openrouter") {
            model = settings.openrouterModel || "meta-llama/llama-3.1-8b-instruct:free";
          } else if (provider === "openai") {
            model = settings.openaiModel || "gpt-4o-mini";
          } else if (provider === "anthropic") {
            model = settings.anthropicModel || "claude-sonnet-4-5";
          }
        } catch (e) {
          console.error("Failed to parse settings:", e);
        }
      }

      const response = await fetch("/api/changelog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: day.date,
          commits: day.commits.map((c) => ({
            message: c.message,
            author: c.author,
          })),
          provider,
          model,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(data.error || "Failed to generate");
      }

      const generated: GeneratedChangelog = await response.json();

      // Cache it
      setCachedChangelog(owner, repo, day.date, generated);

      // Update state
      setChangelogs((prev) => {
        const next = new Map(prev);
        next.set(day.date, generated);
        return next;
      });
    } catch (err) {
      console.error(`Failed to generate changelog for ${day.date}:`, err);
      setFailedDays((prev) => new Set(prev).add(day.date));
      toast("error", `Failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setGenerating((prev) => {
        const next = new Set(prev);
        next.delete(day.date);
        return next;
      });
    }
  };

  // Generate all uncached days
  const generateAll = async () => {
    const uncached = dayGroups.filter((day) => !changelogs.has(day.date));

    for (const day of uncached) {
      await generateForDay(day);
    }

    const successCount = uncached.filter((d) => !failedDays.has(d.date)).length;
    if (successCount > 0) {
      toast("success", `Generated ${successCount} changelogs`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card-bg border border-card-border rounded-lg p-4 sm:p-6">
            <div className="h-5 bg-muted/20 rounded w-32 mb-3" />
            <div className="h-4 bg-muted/20 rounded w-full mb-2" />
            <div className="h-4 bg-muted/20 rounded w-3/4" />
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

  if (dayGroups.length === 0) {
    return (
      <div className="bg-card-bg border border-card-border rounded-lg p-8 sm:p-12 text-center">
        <p className="text-muted-fg">No commits found in the last 90 days.</p>
      </div>
    );
  }

  const uncachedCount = dayGroups.filter((day) => !changelogs.has(day.date)).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Generate button */}
      {uncachedCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-accent/10 border border-accent/30 rounded-lg p-4">
          <div>
            <p className="text-foreground font-medium text-sm sm:text-base">
              {uncachedCount} {uncachedCount === 1 ? "day" : "days"} without changelogs
            </p>
            <p className="text-xs sm:text-sm text-muted-fg">Generate AI-powered summaries</p>
          </div>
          <button
            onClick={generateAll}
            disabled={generating.size > 0}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] flex-shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            Generate All
          </button>
        </div>
      )}

      {/* Days */}
      <div className="space-y-4 sm:space-y-6">
        {dayGroups.map((day) => {
          const changelog = changelogs.get(day.date);
          const isGenerating = generating.has(day.date);
          const hasFailed = failedDays.has(day.date);
          const date = new Date(day.date + "T00:00:00");
          const dateStr = date.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          });

          return (
            <div key={day.date} className="bg-card-bg border border-card-border rounded-lg p-4 sm:p-6">
              {/* Date header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">{dateStr}</h3>
                  <span className="text-xs sm:text-sm text-muted-fg flex-shrink-0">
                    ({day.commits.length} {day.commits.length === 1 ? "commit" : "commits"})
                  </span>
                </div>
                {changelog && (
                  <button
                    onClick={() => generateForDay(day)}
                    disabled={isGenerating}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-muted-fg hover:text-foreground hover:bg-foreground/5 disabled:opacity-50 transition-colors min-h-[36px] self-start sm:self-auto"
                    title="Regenerate"
                  >
                    <RefreshCw className={clsx("w-3.5 h-3.5", isGenerating && "animate-spin")} />
                    Regenerate
                  </button>
                )}
              </div>

              {/* Content */}
              {isGenerating ? (
                <div className="flex items-center gap-3 text-muted-fg">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Generating...</span>
                </div>
              ) : changelog ? (
                <div>
                  {/* Summary */}
                  <p className="text-foreground/90 italic mb-4 text-sm sm:text-[15px] break-words">{changelog.summary}</p>
                  {/* Bullets */}
                  {changelog.bullets.length > 0 && (
                    <ul className="space-y-2">
                      {changelog.bullets.map((bullet, i) => (
                        <li key={i} className="flex gap-2 text-xs sm:text-sm text-muted-fg">
                          <span className="text-accent mt-0.5 flex-shrink-0">•</span>
                          <span className="break-words">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : hasFailed ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Generation failed</span>
                  </div>
                  <button
                    onClick={() => generateForDay(day)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors min-h-[36px] text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => generateForDay(day)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-colors min-h-[44px]"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Changelog
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

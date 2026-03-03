"use client";

import { useState, useEffect, useMemo } from "react";
import { GitCommit, TrendingUp, Calendar } from "lucide-react";
import { clsx } from "clsx";

// GitHub API commit shape
interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
}

interface CommitActivityProps {
  owner: string;
  repo: string;
}

function getWeekData(commits: GitHubCommit[]): { date: string; count: number; day: number; week: number }[] {
  const now = new Date();
  const days: { date: string; count: number; day: number; week: number }[] = [];

  // Last 12 weeks (84 days)
  for (let i = 83; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay(); // 0=Sun, 6=Sat
    const weekIndex = Math.floor((83 - i) / 7);

    days.push({
      date: dateStr,
      count: 0,
      day: dayOfWeek,
      week: weekIndex,
    });
  }

  // Count commits per day
  for (const commit of commits) {
    const commitDate = commit.commit?.author?.date?.split("T")[0];
    if (!commitDate) continue;
    const dayEntry = days.find((d) => d.date === commitDate);
    if (dayEntry) {
      dayEntry.count++;
    }
  }

  return days;
}

function getIntensity(count: number, max: number): string {
  if (count === 0) return "bg-muted/10";
  const ratio = count / Math.max(max, 1);
  if (ratio <= 0.25) return "bg-accent/25";
  if (ratio <= 0.5) return "bg-accent/50";
  if (ratio <= 0.75) return "bg-accent/75";
  return "bg-accent";
}

export function CommitActivity({ owner, repo }: CommitActivityProps) {
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCommits() {
      try {
        setLoading(true);
        const response = await fetch(`/api/repo/${owner}/${repo}/commits?per_page=100`);
        if (!response.ok) throw new Error("Failed to load commits");
        const data = await response.json();
        setCommits(data.commits || []);
      } catch (err) {
        console.error("Error loading commits:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCommits();
  }, [owner, repo]);

  const weekData = useMemo(() => getWeekData(commits), [commits]);
  const maxCount = useMemo(() => Math.max(...weekData.map((d) => d.count), 1), [weekData]);

  const totalCommits = commits.length;
  const thisWeekCommits = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return commits.filter((c) => new Date(c.commit?.author?.date) >= weekAgo).length;
  }, [commits]);

  const streak = useMemo(() => {
    let count = 0;
    const today = new Date().toISOString().split("T")[0];
    for (let i = weekData.length - 1; i >= 0; i--) {
      if (weekData[i].date > today) continue;
      if (weekData[i].count > 0) {
        count++;
      } else if (count > 0) {
        break;
      }
    }
    return count;
  }, [weekData]);

  // Group by week for the grid
  const weeks = useMemo(() => {
    const w: { date: string; count: number; day: number }[][] = [];
    for (const day of weekData) {
      if (!w[day.week]) w[day.week] = [];
      w[day.week].push(day);
    }
    return w;
  }, [weekData]);

  if (loading) {
    return (
      <div className="bg-card-bg border border-card-border rounded-xl p-4 sm:p-6 animate-pulse">
        <div className="h-5 bg-muted/20 rounded w-40 mb-4" />
        <div className="h-24 bg-muted/10 rounded" />
      </div>
    );
  }

  if (commits.length === 0) return null;

  return (
    <div className="bg-card-bg border border-card-border rounded-xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-accent" />
          Commit Activity
        </h3>
        <span className="text-xs text-muted-fg">Last 12 weeks</span>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 sm:gap-6 mb-4 text-xs">
        <div className="flex items-center gap-1.5 text-muted-fg">
          <TrendingUp className="w-3.5 h-3.5" />
          <span><strong className="text-foreground">{totalCommits}</strong> total</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-fg">
          <Calendar className="w-3.5 h-3.5" />
          <span><strong className="text-foreground">{thisWeekCommits}</strong> this week</span>
        </div>
        {streak > 0 && (
          <div className="text-muted-fg">
            🔥 <strong className="text-foreground">{streak}</strong> day streak
          </div>
        )}
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto">
        <div className="flex gap-[3px] min-w-fit">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={clsx(
                    "w-3 h-3 rounded-[2px] transition-colors",
                    getIntensity(day.count, maxCount)
                  )}
                  title={`${day.date}: ${day.count} commit${day.count !== 1 ? "s" : ""}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3 text-xs text-muted-fg">
        <span>Less</span>
        <div className="w-3 h-3 rounded-[2px] bg-muted/10" />
        <div className="w-3 h-3 rounded-[2px] bg-accent/25" />
        <div className="w-3 h-3 rounded-[2px] bg-accent/50" />
        <div className="w-3 h-3 rounded-[2px] bg-accent/75" />
        <div className="w-3 h-3 rounded-[2px] bg-accent" />
        <span>More</span>
      </div>
    </div>
  );
}

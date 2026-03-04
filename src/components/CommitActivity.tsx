"use client";

import { useState, useEffect, useMemo } from "react";
import { GitCommit, TrendingUp, Calendar } from "lucide-react";
import { clsx } from "clsx";

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

interface DayCell {
  date: string;
  count: number;
  day: number; // 0=Sun, 6=Sat
  week: number;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatTooltip(date: string, count: number): string {
  const d = new Date(date + "T00:00:00");
  const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  if (count === 0) return `No commits on ${dayName}, ${monthDay}`;
  return `${count} commit${count !== 1 ? "s" : ""} on ${dayName}, ${monthDay}`;
}

function buildYearGrid(commits: GitHubCommit[]): { days: DayCell[]; totalWeeks: number } {
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  // Go back ~1 year and align to the previous Sunday
  const start = new Date(now);
  start.setFullYear(start.getFullYear() - 1);
  start.setDate(start.getDate() + 1); // day after 1 year ago
  // Align to Sunday
  while (start.getDay() !== 0) {
    start.setDate(start.getDate() - 1);
  }
  start.setHours(0, 0, 0, 0);

  // Build commit count map for fast lookup
  const commitMap = new Map<string, number>();
  for (const commit of commits) {
    const date = commit.commit?.author?.date?.split("T")[0];
    if (date) commitMap.set(date, (commitMap.get(date) || 0) + 1);
  }

  const days: DayCell[] = [];
  const d = new Date(start);
  let weekIdx = 0;

  while (d <= now) {
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      count: commitMap.get(dateStr) || 0,
      day: d.getDay(),
      week: weekIdx,
    });

    // Advance day; increment week on Sunday
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) weekIdx++;
  }

  return { days, totalWeeks: weekIdx + 1 };
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

  const { days: yearData, totalWeeks } = useMemo(() => buildYearGrid(commits), [commits]);
  const maxCount = useMemo(() => Math.max(...yearData.map((d) => d.count), 1), [yearData]);

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
    for (let i = yearData.length - 1; i >= 0; i--) {
      if (yearData[i].date > today) continue;
      if (yearData[i].count > 0) {
        count++;
      } else if (count > 0) {
        break;
      }
    }
    return count;
  }, [yearData]);

  // Group into columns (weeks)
  const weeks = useMemo(() => {
    const w: DayCell[][] = [];
    for (const day of yearData) {
      if (!w[day.week]) w[day.week] = [];
      w[day.week].push(day);
    }
    return w;
  }, [yearData]);

  // Build month labels: find the first week column where each month appears
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    for (const day of yearData) {
      const m = new Date(day.date + "T00:00:00").getMonth();
      if (m !== lastMonth) {
        labels.push({ month: MONTH_NAMES[m], weekIndex: day.week });
        lastMonth = m;
      }
    }
    return labels;
  }, [yearData]);

  if (loading) {
    return (
      <div className="bg-card-bg border border-card-border rounded-xl p-4 sm:p-6 animate-pulse">
        <div className="h-5 bg-muted/20 rounded w-40 mb-4" />
        <div className="h-24 bg-muted/10 rounded" />
      </div>
    );
  }

  if (commits.length === 0) return null;

  // Cell size + gap
  const cellSize = 12; // w-3 = 12px
  const gap = 3;
  const colWidth = cellSize + gap;

  return (
    <div className="bg-card-bg border border-card-border rounded-xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-accent" />
          Commit Activity
        </h3>
        <span className="text-xs text-muted-fg">Last year</span>
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
            <strong className="text-foreground">{streak}</strong> day streak
          </div>
        )}
      </div>

      {/* Heatmap with month labels */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: totalWeeks * colWidth }}>
          {/* Month labels */}
          <div className="relative h-4 mb-1" style={{ width: totalWeeks * colWidth }}>
            {monthLabels.map((label, i) => (
              <span
                key={`${label.month}-${i}`}
                className="absolute text-[10px] text-muted-fg"
                style={{ left: label.weekIndex * colWidth }}
              >
                {label.month}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day) => (
                  <div
                    key={day.date}
                    className={clsx(
                      "w-3 h-3 rounded-[2px] transition-colors cursor-default",
                      getIntensity(day.count, maxCount)
                    )}
                    title={formatTooltip(day.date, day.count)}
                  />
                ))}
              </div>
            ))}
          </div>
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

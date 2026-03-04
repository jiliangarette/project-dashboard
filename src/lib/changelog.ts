export interface DayCommits {
  date: string; // YYYY-MM-DD
  commits: Array<{
    sha: string;
    message: string;
    author: string;
    timestamp: string;
  }>;
}

export interface GeneratedChangelog {
  date: string;
  summary: string;
  bullets: string[];
}

export function groupCommitsByDay(commits: { sha: string; commit: { message: string; author: { date: string } } }[]): DayCommits[] {
  const grouped = new Map<string, DayCommits>();

  commits.forEach((commit) => {
    const date = commit.commit.author.date.split("T")[0]; // Extract YYYY-MM-DD
    
    // Skip merge commits with no meaningful message
    const message = commit.commit.message.trim();
    if (message.startsWith("Merge") && message.split("\n").length === 1) {
      return;
    }

    if (!grouped.has(date)) {
      grouped.set(date, {
        date,
        commits: [],
      });
    }

    grouped.get(date)!.commits.push({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author.name,
      timestamp: commit.commit.author.date,
    });
  });

  // Convert to array and sort by date descending (newest first)
  return Array.from(grouped.values()).sort((a, b) => b.date.localeCompare(a.date));
}

export interface WeekCommits {
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string;   // YYYY-MM-DD (Sunday)
  days: DayCommits[];
  totalCommits: number;
}

function getMonday(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0 offset
  d.setDate(d.getDate() - diff);
  return d.toISOString().split("T")[0];
}

function getSunday(mondayStr: string): string {
  const d = new Date(mondayStr + "T00:00:00");
  d.setDate(d.getDate() + 6);
  return d.toISOString().split("T")[0];
}

export function groupCommitsByWeek(dayGroups: DayCommits[]): WeekCommits[] {
  const weekMap = new Map<string, WeekCommits>();

  dayGroups.forEach((day) => {
    const monday = getMonday(day.date);
    if (!weekMap.has(monday)) {
      weekMap.set(monday, {
        weekStart: monday,
        weekEnd: getSunday(monday),
        days: [],
        totalCommits: 0,
      });
    }
    const week = weekMap.get(monday)!;
    week.days.push(day);
    week.totalCommits += day.commits.length;
  });

  // Sort weeks descending, days within each week descending
  const weeks = Array.from(weekMap.values()).sort((a, b) =>
    b.weekStart.localeCompare(a.weekStart)
  );
  weeks.forEach((w) => w.days.sort((a, b) => b.date.localeCompare(a.date)));
  return weeks;
}

export function getChangelogCacheKey(owner: string, repo: string, date: string): string {
  return `changelog:${owner}/${repo}:${date}`;
}

export function getCachedChangelog(
  owner: string,
  repo: string,
  date: string
): GeneratedChangelog | null {
  try {
    const key = getChangelogCacheKey(owner, repo, date);
    const cached = localStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error("Failed to get cached changelog:", e);
  }
  return null;
}

export function setCachedChangelog(
  owner: string,
  repo: string,
  date: string,
  changelog: GeneratedChangelog
): void {
  try {
    const key = getChangelogCacheKey(owner, repo, date);
    localStorage.setItem(key, JSON.stringify(changelog));
  } catch (e) {
    console.error("Failed to cache changelog:", e);
  }
}

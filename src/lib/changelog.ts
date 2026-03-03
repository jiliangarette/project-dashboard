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

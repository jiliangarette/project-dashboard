export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  open_issues_count: number;
  forks_count: number;
  updated_at: string;
  default_branch: string;
}

export interface GitHubRateLimit {
  remaining: number;
  limit: number;
  reset: number;
}

export async function fetchUserRepos(
  accessToken: string
): Promise<{ repos: GitHubRepo[]; rateLimit: GitHubRateLimit }> {
  const repos: GitHubRepo[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        const remaining = response.headers.get("X-RateLimit-Remaining");
        if (remaining === "0") {
          const resetTime = response.headers.get("X-RateLimit-Reset");
          const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000).toLocaleTimeString() : "soon";
          throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate}.`);
        }
      }
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    repos.push(...data);

    // Check if there are more pages
    const linkHeader = response.headers.get("Link");
    hasMore = linkHeader?.includes('rel="next"') || false;
    page++;
  }

  // Get rate limit info from the last response
  const rateLimitResponse = await fetch("https://api.github.com/rate_limit", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });

  const rateLimitData = await rateLimitResponse.json();
  const rateLimit = rateLimitData.resources.core;

  return { repos, rateLimit };
}

export async function fetchRepoInfo(
  owner: string,
  repo: string,
  accessToken: string
): Promise<GitHubRepo> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      const remaining = response.headers.get("X-RateLimit-Remaining");
      if (remaining === "0") {
        throw new Error("GitHub API rate limit exceeded. Try again later.");
      }
    }
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `GitHub API error: ${response.status}`);
  }

  return response.json();
}

export async function fetchRepoCommits(
  owner: string,
  repo: string,
  accessToken: string,
  since?: string
): Promise<any[]> {
  const commits: any[] = [];
  let page = 1;
  let hasMore = true;

  const url = new URL(`https://api.github.com/repos/${owner}/${repo}/commits`);
  url.searchParams.set("per_page", "100");
  if (since) {
    url.searchParams.set("since", since);
  }

  while (hasMore) {
    url.searchParams.set("page", page.toString());

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        const remaining = response.headers.get("X-RateLimit-Remaining");
        if (remaining === "0") {
          throw new Error("GitHub API rate limit exceeded. Try again later.");
        }
      }
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    commits.push(...data);

    // Check if there are more pages
    const linkHeader = response.headers.get("Link");
    hasMore = linkHeader?.includes('rel="next"') || false;
    page++;

    // Stop if we've fetched enough (e.g., 90 days worth, roughly 900 commits max)
    if (commits.length >= 900) {
      hasMore = false;
    }
  }

  return commits;
}

export async function fetchRepoFile(
  owner: string,
  repo: string,
  path: string,
  accessToken: string
): Promise<string | null> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `GitHub API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.type !== "file" || !data.content) {
    return null;
  }

  // Decode base64 content
  const content = atob(data.content);
  return content;
}

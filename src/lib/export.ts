import type { GitHubRepo } from "./github";

/**
 * Export repository data as CSV
 */
export function exportToCSV(repos: GitHubRepo[]): string {
  const headers = [
    "Name",
    "Owner",
    "Description",
    "Language",
    "Stars",
    "Forks",
    "Open Issues",
    "Created At",
    "Updated At",
    "URL",
    "Is Private",
  ];

  const rows = repos.map((repo) => [
    repo.name,
    repo.owner.login,
    repo.description || "",
    repo.language || "",
    repo.stargazers_count.toString(),
    repo.forks_count.toString(),
    repo.open_issues_count.toString(),
    new Date(repo.created_at).toISOString(),
    new Date(repo.updated_at).toISOString(),
    repo.html_url,
    repo.private ? "Yes" : "No",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return csvContent;
}

/**
 * Export repository data as JSON
 */
export function exportToJSON(repos: GitHubRepo[]): string {
  const simplified = repos.map((repo) => ({
    name: repo.name,
    owner: repo.owner.login,
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
    url: repo.html_url,
    isPrivate: repo.private,
    topics: repo.topics,
  }));

  return JSON.stringify(simplified, null, 2);
}

/**
 * Trigger download of exported data
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export repos as CSV and download
 */
export function exportReposAsCSV(repos: GitHubRepo[]) {
  const csv = exportToCSV(repos);
  const timestamp = new Date().toISOString().split("T")[0];
  downloadFile(csv, `repos-${timestamp}.csv`, "text/csv");
}

/**
 * Export repos as JSON and download
 */
export function exportReposAsJSON(repos: GitHubRepo[]) {
  const json = exportToJSON(repos);
  const timestamp = new Date().toISOString().split("T")[0];
  downloadFile(json, `repos-${timestamp}.json`, "application/json");
}

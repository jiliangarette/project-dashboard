"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Star, GitFork, AlertCircle, Calendar } from "lucide-react";
import { clsx } from "clsx";
import { GitHubRepo } from "@/lib/github";

type Tab = "changelog" | "tasks";

// Language colors matching GitHub's
const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Vue: "#41b883",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Lua: "#000080",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const [repoData, setRepoData] = useState<GitHubRepo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("changelog");

  useEffect(() => {
    async function loadRepo() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/repo/${owner}/${repo}`);

        if (response.status === 404) {
          setError("Repository not found");
          return;
        }

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to load repository");
        }

        const data = await response.json();
        setRepoData(data.repo);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    loadRepo();
  }, [owner, repo]);

  const languageColor = repoData?.language
    ? languageColors[repoData.language] || "#8b949e"
    : "#8b949e";

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted/20 rounded" />
        <div className="h-32 bg-card-bg border border-card-border rounded-lg" />
        <div className="h-12 w-64 bg-muted/20 rounded" />
        <div className="h-96 bg-card-bg border border-card-border rounded-lg" />
      </div>
    );
  }

  if (error || !repoData) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-muted-fg hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-12 text-center">
          <p className="text-red-400 mb-4">{error || "Repository not found"}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-2 text-muted-fg hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Repo header */}
      <div className="bg-card-bg border border-card-border rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">{repoData.name}</h1>
            {repoData.description && (
              <p className="text-muted-fg">{repoData.description}</p>
            )}
          </div>
          <a
            href={repoData.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground/10 hover:bg-foreground/20 text-foreground transition-colors"
          >
            View on GitHub
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-6 text-sm">
          {repoData.language && (
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: languageColor }}
              />
              <span className="text-foreground">{repoData.language}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-fg">
            <Star className="w-4 h-4" />
            <span>{repoData.stargazers_count} stars</span>
          </div>
          <div className="flex items-center gap-2 text-muted-fg">
            <GitFork className="w-4 h-4" />
            <span>{repoData.forks_count} forks</span>
          </div>
          <div className="flex items-center gap-2 text-muted-fg">
            <AlertCircle className="w-4 h-4" />
            <span>{repoData.open_issues_count} open issues</span>
          </div>
          <div className="flex items-center gap-2 text-muted-fg">
            <Calendar className="w-4 h-4" />
            <span>Updated {new Date(repoData.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-card-border">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("changelog")}
            className={clsx(
              "pb-3 px-1 border-b-2 transition-colors font-medium",
              activeTab === "changelog"
                ? "border-accent text-accent"
                : "border-transparent text-muted-fg hover:text-foreground"
            )}
          >
            Changelog
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={clsx(
              "pb-3 px-1 border-b-2 transition-colors font-medium",
              activeTab === "tasks"
                ? "border-accent text-accent"
                : "border-transparent text-muted-fg hover:text-foreground"
            )}
          >
            Tasks
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {activeTab === "changelog" && (
          <div className="bg-card-bg border border-card-border rounded-lg p-12 text-center">
            <p className="text-muted-fg">Changelog will appear here (Phase 4)</p>
          </div>
        )}
        {activeTab === "tasks" && (
          <div className="bg-card-bg border border-card-border rounded-lg p-12 text-center">
            <p className="text-muted-fg">Tasks will appear here (Phase 5)</p>
          </div>
        )}
      </div>
    </div>
  );
}

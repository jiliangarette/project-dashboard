"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Star, GitFork, AlertCircle, Calendar, WifiOff } from "lucide-react";
import { clsx } from "clsx";
import { GitHubRepo } from "@/lib/github";
import { ChangelogTab } from "@/components/ChangelogTab";
import { TasksTab } from "@/components/TasksTab";
import { ReadmeTab } from "@/components/ReadmeTab";
import { CommitActivity } from "@/components/CommitActivity";
import { toast } from "@/components/Toast";

type Tab = "changelog" | "tasks" | "readme";

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

  // Keyboard shortcuts for tab switching
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "1") {
        setActiveTab("changelog");
      } else if (e.key === "2") {
        setActiveTab("tasks");
      } else if (e.key === "3") {
        setActiveTab("readme");
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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

        if (response.status === 403) {
          setError("GitHub API rate limit exceeded. Please wait a few minutes.");
          toast("warning", "Rate limit reached. Try again soon.");
          return;
        }

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to load repository");
        }

        const data = await response.json();
        setRepoData(data.repo);
      } catch (err) {
        if (!navigator.onLine) {
          setError("You appear to be offline. Check your connection and try again.");
        } else {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
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
      <div className="space-y-4 sm:space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted/20 rounded" />
        <div className="h-32 bg-card-bg border border-card-border rounded-lg" />
        <div className="h-12 w-64 bg-muted/20 rounded" />
        <div className="h-96 bg-card-bg border border-card-border rounded-lg" />
      </div>
    );
  }

  if (error || !repoData) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-muted-fg hover:text-foreground transition-colors py-2 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {!navigator.onLine && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-warning/30 bg-warning/10">
            <WifiOff className="w-5 h-5 text-warning flex-shrink-0" />
            <p className="text-warning text-sm">You appear to be offline.</p>
          </div>
        )}

        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-8 sm:p-12 text-center">
          <p className="text-red-400 mb-4">{error || "Repository not found"}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors min-h-[44px]"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-2 text-muted-fg hover:text-foreground transition-colors py-2 min-h-[44px]"
        aria-label="Back to Dashboard"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Repo header */}
      <div className="bg-card-bg border border-card-border rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold text-foreground mb-2 break-words">{repoData.name}</h1>
            {repoData.description && (
              <p className="text-muted-fg text-sm sm:text-base break-words">{repoData.description}</p>
            )}
          </div>
          <a
            href={repoData.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-foreground/10 hover:bg-foreground/20 text-foreground transition-colors min-h-[44px] flex-shrink-0 text-sm sm:text-base"
          >
            View on GitHub
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6 text-xs sm:text-sm">
          {repoData.language && (
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: languageColor }}
              />
              <span className="text-foreground">{repoData.language}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-muted-fg">
            <Star className="w-4 h-4 flex-shrink-0" />
            <span>{repoData.stargazers_count} stars</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-fg">
            <GitFork className="w-4 h-4 flex-shrink-0" />
            <span>{repoData.forks_count} forks</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-fg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{repoData.open_issues_count} issues</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-fg">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>Updated {new Date(repoData.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Commit Activity Heatmap */}
      <CommitActivity owner={owner} repo={repo} />

      {/* Tabs */}
      <div className="border-b border-card-border">
        <div className="flex gap-2 sm:gap-6" role="tablist" aria-label="Project views">
          <button
            onClick={() => setActiveTab("changelog")}
            role="tab"
            aria-selected={activeTab === "changelog"}
            aria-controls="tabpanel-changelog"
            className={clsx(
              "pb-3 px-2 sm:px-1 border-b-2 transition-colors font-medium min-h-[44px] text-sm sm:text-base",
              activeTab === "changelog"
                ? "border-accent text-accent"
                : "border-transparent text-muted-fg hover:text-foreground"
            )}
          >
            Changelog
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            role="tab"
            aria-selected={activeTab === "tasks"}
            aria-controls="tabpanel-tasks"
            className={clsx(
              "pb-3 px-2 sm:px-1 border-b-2 transition-colors font-medium min-h-[44px] text-sm sm:text-base",
              activeTab === "tasks"
                ? "border-accent text-accent"
                : "border-transparent text-muted-fg hover:text-foreground"
            )}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab("readme")}
            role="tab"
            aria-selected={activeTab === "readme"}
            aria-controls="tabpanel-readme"
            className={clsx(
              "pb-3 px-2 sm:px-1 border-b-2 transition-colors font-medium min-h-[44px] text-sm sm:text-base",
              activeTab === "readme"
                ? "border-accent text-accent"
                : "border-transparent text-muted-fg hover:text-foreground"
            )}
          >
            README
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {activeTab === "changelog" && <div id="tabpanel-changelog" role="tabpanel"><ChangelogTab owner={owner} repo={repo} /></div>}
        {activeTab === "tasks" && <div id="tabpanel-tasks" role="tabpanel"><TasksTab owner={owner} repo={repo} /></div>}
        {activeTab === "readme" && <div id="tabpanel-readme" role="tabpanel"><ReadmeTab owner={owner} repo={repo} /></div>}
      </div>
    </div>
  );
}

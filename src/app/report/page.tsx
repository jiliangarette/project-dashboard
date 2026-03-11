"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { fetchAliases } from "@/lib/aliases";

/* ─── Types ─────────────────────────────────────────────────────────── */

interface Repo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
}

interface ProjectReport {
  repoName: string;
  displayName: string;
  summary: string;
  bullets: string[];
  status: "pending" | "loading" | "done" | "error";
  error?: string;
}

/* ─── Multi-select combobox ─────────────────────────────────────────── */

function ProjectSelector({
  repos,
  selected,
  onToggle,
  aliases,
}: {
  repos: Repo[];
  selected: Set<string>;
  onToggle: (fullName: string) => void;
  aliases: Record<number, string>;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = repos.filter((r) => {
    const display = aliases[r.id] || r.name;
    return display.toLowerCase().includes(search.toLowerCase()) ||
      r.name.toLowerCase().includes(search.toLowerCase());
  });

  const getName = (r: Repo) => aliases[r.id] || r.name;

  return (
    <div ref={ref} className="relative w-full">
      {/* Selected chips + input */}
      <div
        className="flex flex-wrap gap-2 p-3 rounded-xl border border-white/[0.08] bg-white/[0.03] cursor-text min-h-[52px] transition-colors hover:border-white/[0.12] focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20"
        onClick={() => { setOpen(true); }}
      >
        {repos.filter((r) => selected.has(r.full_name)).map((r) => (
          <span
            key={r.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 text-sm font-medium border border-indigo-500/20"
          >
            {getName(r)}
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(r.full_name); }}
              className="hover:text-white transition-colors ml-0.5"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={selected.size === 0 ? "Select projects..." : ""}
          className="flex-1 min-w-[120px] bg-transparent text-white text-sm placeholder:text-zinc-500 outline-none"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/[0.08] bg-[#111113] shadow-2xl shadow-black/50 overflow-hidden animate-[fadeSlideDown_0.15s_ease-out]">
          <div className="max-h-[280px] overflow-y-auto p-1.5">
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-zinc-500">No projects found</div>
            )}
            {filtered.map((r) => {
              const isSelected = selected.has(r.full_name);
              return (
                <button
                  key={r.id}
                  onClick={() => onToggle(r.full_name)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isSelected ? "bg-indigo-500/10 text-indigo-300" : "text-zinc-300 hover:bg-white/[0.04]"
                  }`}
                >
                  {/* Checkbox */}
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? "bg-indigo-500 border-indigo-500" : "border-zinc-600"
                  }`}>
                    {isSelected && (
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{getName(r)}</div>
                    {aliases[r.id] && (
                      <div className="text-xs text-zinc-500 truncate">{r.name}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Report result card ────────────────────────────────────────────── */

function ReportCard({ report, index }: { report: ProjectReport; index: number }) {

  return (
    <div
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-[fadeSlideUp_0.5s_ease-out_both]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 00-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 004 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">{report.displayName}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {report.status === "loading" && (
            <div className="flex items-center gap-2 text-xs text-indigo-400">
              <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
              Generating...
            </div>
          )}
          {report.status === "done" && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Done
            </span>
          )}
          {report.status === "error" && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-xs border border-red-500/20">
              Failed
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      {report.status === "loading" && (
        <div className="px-6 py-8">
          <div className="space-y-3">
            <div className="h-4 w-3/4 rounded bg-white/[0.04] animate-pulse" />
            <div className="h-4 w-full rounded bg-white/[0.04] animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-white/[0.04] animate-pulse" />
          </div>
        </div>
      )}

      {report.status === "error" && (
        <div className="px-6 py-6 text-sm text-red-400/80">{report.error || "Failed to generate report"}</div>
      )}

      {report.status === "done" && (
        <div className="px-6 py-5">
          {/* Summary label */}
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span className="text-xs font-medium text-indigo-400 uppercase tracking-wide">AI Summary</span>
          </div>

          {/* Summary */}
          <p className="text-sm text-zinc-300 leading-relaxed mb-5">{report.summary}</p>

          {/* Bullets */}
          {report.bullets.length > 0 && (
            <ul className="space-y-2.5">
              {report.bullets.map((bullet, i) => (
                <li key={i} className="flex gap-3 text-sm text-zinc-400 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/40 mt-2 flex-shrink-0" />
                  {bullet}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Copy All button ───────────────────────────────────────────────── */

function CopyAllButton({ reports }: { reports: ProjectReport[] }) {
  const [copied, setCopied] = useState(false);
  const doneReports = reports.filter((r) => r.status === "done" && r.summary !== "No commits found today.");

  if (doneReports.length === 0) return null;

  const handleCopyAll = () => {
    const todayStr = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const lines: string[] = [];
    lines.push(`# EOD Report — ${todayStr}`);
    lines.push("");

    for (const r of doneReports) {
      lines.push(`## ${r.displayName}`);
      lines.push(r.summary);
      if (r.bullets.length > 0) {
        for (const b of r.bullets) {
          lines.push(`- ${b}`);
        }
      }
      lines.push("");
    }

    navigator.clipboard.writeText(lines.join("\n").trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopyAll}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.04] transition-all"
    >
      {copied ? (
        <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
      {copied ? "Copied all!" : "Copy all reports"}
    </button>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────── */

export default function ReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [aliases, setAliases] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [reports, setReports] = useState<ProjectReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [authorFilter, setAuthorFilter] = useState<"me" | "all">("me");

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Load repos and aliases
  useEffect(() => {
    if (!session) return;
    (async () => {
      try {
        const res = await fetch("/api/repos");
        if (!res.ok) throw new Error("Failed to load repos");
        const data = await res.json();
        setRepos(data.repos || []);
        setAliases(await fetchAliases());
      } catch {
        // silent
      } finally {
        setLoadingRepos(false);
      }
    })();
  }, [session]);

  const toggleProject = (fullName: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(fullName)) next.delete(fullName);
      else next.add(fullName);
      return next;
    });
  };

  // Read provider settings from localStorage (same as ChangelogTab)
  const getProviderSettings = () => {
    let provider = "openai";
    let model = "gpt-4.1-nano";
    try {
      const stored = localStorage.getItem("changelog-settings");
      if (stored) {
        const s = JSON.parse(stored);
        if (s.provider) provider = s.provider;
        if (s.model) model = s.model;
      }
    } catch { /* noop */ }
    return { provider, model };
  };

  const handleGenerate = async () => {
    if (selected.size === 0) return;
    setIsGenerating(true);

    // Initialize report slots
    const selectedRepos = repos.filter((r) => selected.has(r.full_name));
    const initial: ProjectReport[] = selectedRepos.map((r) => ({
      repoName: r.full_name,
      displayName: aliases[r.id] || r.name,
      summary: "",
      bullets: [],
      status: "pending",
    }));
    setReports(initial);

    const { provider, model } = getProviderSettings();

    // Generate sequentially to avoid rate limits
    for (let i = 0; i < selectedRepos.length; i++) {
      const repo = selectedRepos[i];

      // Set loading
      setReports((prev) =>
        prev.map((r, idx) => (idx === i ? { ...r, status: "loading" } : r))
      );

      try {
        // Fetch last 30 days of commits
        const commitsRes = await fetch(`/api/repo/${repo.owner.login}/${repo.name}/commits`);
        if (!commitsRes.ok) throw new Error("Failed to fetch commits");
        const commitsData = await commitsRes.json();
        const commits = commitsData.commits || [];

        if (commits.length === 0) {
          setReports((prev) =>
            prev.map((r, idx) =>
              idx === i ? { ...r, status: "done", summary: "No commits found today.", bullets: [] } : r
            )
          );
          continue;
        }

        // Filter to today's commits only (EOD report)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let todayCommits = commits.filter(
          (c: { commit: { author: { date: string } } }) =>
            new Date(c.commit.author.date) >= today
        );

        // Filter by author if "Only me" is selected
        if (authorFilter === "me" && session?.githubUsername) {
          const username = session.githubUsername.toLowerCase();
          todayCommits = todayCommits.filter(
            (c: { author?: { login?: string }; commit: { author: { name?: string } } }) =>
              c.author?.login?.toLowerCase() === username ||
              c.commit.author.name?.toLowerCase() === session?.user?.name?.toLowerCase()
          );
        }

        if (todayCommits.length === 0) {
          setReports((prev) =>
            prev.map((r, idx) =>
              idx === i ? { ...r, status: "done", summary: authorFilter === "me" ? "No commits by you today." : "No commits found today.", bullets: [] } : r
            )
          );
          continue;
        }

        const commitPayload = todayCommits.map(
          (c: { commit: { message: string; author: { name: string } } }) => ({
            message: c.commit.message,
            author: c.commit.author.name,
          })
        );

        const todayStr = new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        // Generate
        const genRes = await fetch("/api/changelog/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: todayStr,
            commits: commitPayload,
            provider,
            model,
          }),
        });

        if (!genRes.ok) {
          const err = await genRes.json().catch(() => ({}));
          throw new Error(err.error || "Generation failed");
        }

        const result = await genRes.json();
        setReports((prev) =>
          prev.map((r, idx) =>
            idx === i ? { ...r, status: "done", summary: result.summary, bullets: result.bullets } : r
          )
        );
      } catch (error) {
        setReports((prev) =>
          prev.map((r, idx) =>
            idx === i ? { ...r, status: "error", error: error instanceof Error ? error.message : "Unknown error" } : r
          )
        );
      }
    }

    setIsGenerating(false);
  };

  if (status === "loading" || loadingRepos) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="space-y-4">
          <div className="h-8 w-48 rounded-lg bg-white/[0.04] animate-pulse" />
          <div className="h-12 w-full rounded-xl bg-white/[0.04] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="max-w-3xl mx-auto py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">EOD Report</h1>
          <p className="text-muted-fg text-sm">Select projects and generate today&apos;s end-of-day report.</p>
        </div>

        {/* Selector + Generate */}
        <div className="space-y-4 mb-10">
          <ProjectSelector
            repos={repos}
            selected={selected}
            onToggle={toggleProject}
            aliases={aliases}
          />

          {/* Author filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Commits by:</span>
            <div className="inline-flex rounded-lg border border-white/[0.08] overflow-hidden">
              <button
                onClick={() => setAuthorFilter("me")}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  authorFilter === "me"
                    ? "bg-indigo-500/20 text-indigo-300 border-r border-indigo-500/30"
                    : "text-zinc-400 hover:bg-white/[0.04] border-r border-white/[0.08]"
                }`}
              >
                Only me
              </button>
              <button
                onClick={() => setAuthorFilter("all")}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  authorFilter === "all"
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "text-zinc-400 hover:bg-white/[0.04]"
                }`}
              >
                All authors
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={selected.size === 0 || isGenerating}
              className="group relative flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden cursor-pointer"
              style={{
                background: selected.size > 0 && !isGenerating
                  ? "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)"
                  : "rgba(255,255,255,0.06)",
                boxShadow: selected.size > 0 && !isGenerating
                  ? "0 0 0 1px rgba(99,102,241,0.3), 0 4px 16px -4px rgba(99,102,241,0.3)"
                  : "none",
              }}
            >
              {/* Shimmer */}
              {!isGenerating && selected.size > 0 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              )}
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 relative" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              )}
              <span className="relative">
                {isGenerating
                  ? "Generating..."
                  : selected.size === 0
                  ? "Select projects first"
                  : `Generate ${selected.size} report${selected.size > 1 ? "s" : ""}`}
              </span>
            </button>

            <CopyAllButton reports={reports} />
          </div>
        </div>

        {/* Reports */}
        {reports.length > 0 && (
          <div className="space-y-5">
            {reports.map((report, i) => (
              <ReportCard key={report.repoName} report={report} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

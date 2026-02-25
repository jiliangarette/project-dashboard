"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw, ListChecks, Circle, CheckCircle2 } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import type { ProjectSummary } from "@/lib/types";

export default function Home() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const hasSynced = useRef(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // On first load: sync all projects, then fetch updated summaries
  useEffect(() => {
    if (hasSynced.current) return;
    hasSynced.current = true;

    async function syncAndFetch() {
      setLoading(true);
      try {
        await fetch("/api/sync-all", { method: "POST" });
      } catch (err) {
        console.error("Auto-sync failed:", err);
      }
      // Always fetch projects after sync attempt
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    }

    syncAndFetch();
  }, []);

  const totalTasks = projects.reduce((a, p) => a + p.totalCount, 0);
  const totalPending = projects.reduce((a, p) => a + p.pendingCount, 0);
  const totalDone = totalTasks - totalPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-fg mt-1">
            {projects.length} projects &middot;{" "}
            {totalPending} pending tasks
          </p>
        </div>
        <button
          onClick={fetchProjects}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-card-border bg-card-bg hover:bg-card-hover text-muted-fg hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Global stats bar */}
      {projects.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card-bg border border-card-border rounded-lg p-4 flex items-center gap-3">
            <ListChecks className="w-5 h-5 text-accent" />
            <div>
              <p className="text-xl font-bold">{totalTasks}</p>
              <p className="text-xs text-muted-fg">Total Tasks</p>
            </div>
          </div>
          <div className="bg-card-bg border border-card-border rounded-lg p-4 flex items-center gap-3">
            <Circle className="w-5 h-5 text-warning" />
            <div>
              <p className="text-xl font-bold">{totalPending}</p>
              <p className="text-xs text-muted-fg">Pending</p>
            </div>
          </div>
          <div className="bg-card-bg border border-card-border rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <div>
              <p className="text-xl font-bold">{totalDone}</p>
              <p className="text-xs text-muted-fg">Done</p>
            </div>
          </div>
        </div>
      )}

      {loading && projects.length === 0 ? (
        <div className="space-y-6">
          {/* Stats skeleton */}
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton border border-card-border rounded-lg p-4 h-16" />
            ))}
          </div>
          {/* Cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="skeleton border border-card-border rounded-xl p-5 h-36" />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard key={p.name} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}

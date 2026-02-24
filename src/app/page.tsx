"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import type { ProjectSummary } from "@/lib/types";

export default function Home() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-fg mt-1">
            {projects.length} projects &middot;{" "}
            {projects.reduce((a, p) => a + p.pendingCount, 0)} pending tasks
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

      {loading && projects.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="bg-card-bg border border-card-border rounded-xl p-5 h-28 animate-pulse"
            />
          ))}
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

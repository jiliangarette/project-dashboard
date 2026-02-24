"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm } from "@/components/TaskForm";
import {
  TaskFilters,
  type SortField,
  type FilterAssignee,
  type FilterSource,
  type FilterStatus,
} from "@/components/TaskFilters";
import { DocsViewer } from "@/components/DocsViewer";
import type { Task, ProjectData } from "@/lib/types";

const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
const statusOrder: Record<string, number> = { "in-progress": 0, todo: 1, done: 2 };

export default function ProjectPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filters
  const [sortBy, setSortBy] = useState<SortField>("priority");
  const [filterAssignee, setFilterAssignee] = useState<FilterAssignee>("all");
  const [filterSource, setFilterSource] = useState<FilterSource>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${name}/tasks`);
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function syncTasks() {
    setSyncing(true);
    try {
      const res = await fetch(`/api/projects/${name}/sync`, { method: "POST" });
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  }

  async function handleStatusChange(id: string, status: Task["status"]) {
    const res = await fetch(`/api/projects/${name}/tasks`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setData((prev) =>
        prev
          ? {
              ...prev,
              tasks: prev.tasks.map((t) => (t.id === updated.id ? updated : t)),
            }
          : prev
      );
    }
  }

  async function handleSubmit(formData: Partial<Task>) {
    if (formData.id) {
      // Edit
      const res = await fetch(`/api/projects/${name}/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updated = await res.json();
        setData((prev) =>
          prev
            ? {
                ...prev,
                tasks: prev.tasks.map((t) =>
                  t.id === updated.id ? updated : t
                ),
              }
            : prev
        );
      }
    } else {
      // Create
      const res = await fetch(`/api/projects/${name}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const newTask = await res.json();
        setData((prev) =>
          prev ? { ...prev, tasks: [...prev.tasks, newTask] } : prev
        );
      }
    }
    setShowForm(false);
    setEditingTask(null);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/projects/${name}/tasks?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setData((prev) =>
        prev
          ? { ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }
          : prev
      );
    }
  }

  // Filter & sort
  const tasks = data?.tasks || [];
  const filtered = tasks
    .filter((t) => filterStatus === "all" || t.status === filterStatus)
    .filter((t) => filterAssignee === "all" || t.assignee === filterAssignee)
    .filter((t) => filterSource === "all" || t.source === filterSource);

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "priority":
        return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
      case "status":
        return (statusOrder[a.status] ?? 1) - (statusOrder[b.status] ?? 1);
      case "date":
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case "source":
        return a.source.localeCompare(b.source);
      default:
        return 0;
    }
  });

  const pendingCount = tasks.filter((t) => t.status !== "done").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="p-2 rounded-lg hover:bg-card-bg text-muted-fg hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{name}</h1>
          <p className="text-sm text-muted-fg">
            {pendingCount} pending &middot; {tasks.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={syncTasks}
            disabled={syncing}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-card-border bg-card-bg hover:bg-card-hover text-muted-fg hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            Sync TASKS.md
          </button>
          <button
            onClick={fetchTasks}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-card-border bg-card-bg hover:bg-card-hover text-muted-fg hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              setEditingTask(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-accent hover:bg-accent-hover text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Docs Viewer */}
      <div className="mb-6">
        <DocsViewer project={name} />
      </div>

      {/* Filters */}
      <div className="mb-4">
        <TaskFilters
          sortBy={sortBy}
          onSortChange={setSortBy}
          filterAssignee={filterAssignee}
          onAssigneeChange={setFilterAssignee}
          filterSource={filterSource}
          onSourceChange={setFilterSource}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
        />
      </div>

      {/* Task List */}
      {loading && !data ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-card-bg border border-card-border rounded-lg p-4 h-20 animate-pulse"
            />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 text-muted-fg">
          <p className="text-lg">No tasks found</p>
          <p className="text-sm mt-1">
            {tasks.length > 0
              ? "Try adjusting your filters"
              : "Add a task or sync from TASKS.md"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onEdit={(t) => {
                setEditingTask(t);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}

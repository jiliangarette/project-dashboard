"use client";

import { useState, useEffect } from "react";
import { Plus, FileText, User, Trash2, Edit2, Check, X } from "lucide-react";
import { clsx } from "clsx";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "done";
  priority: "low" | "medium" | "high";
  source: "repo" | "manual";
}

interface TasksTabProps {
  owner: string;
  repo: string;
}

function parseTasks(markdown: string): Task[] {
  const lines = markdown.split("\n");
  const tasks: Task[] = [];

  for (const line of lines) {
    const uncheckedMatch = line.match(/^[-*]\s+\[\s\]\s+(.+)$/);
    const checkedMatch = line.match(/^[-*]\s+\[x\]\s+(.+)$/i);

    if (uncheckedMatch || checkedMatch) {
      tasks.push({
        id: `repo-${Date.now()}-${Math.random()}`,
        title: (uncheckedMatch || checkedMatch)![1].trim(),
        status: checkedMatch ? "done" : "todo",
        priority: "medium",
        source: "repo",
      });
    }
  }

  return tasks;
}

export function TasksTab({ owner, repo }: TasksTabProps) {
  const [repoTasks, setRepoTasks] = useState<Task[]>([]);
  const [manualTasks, setManualTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPriority, setFormPriority] = useState<"low" | "medium" | "high">("medium");

  // Load repo tasks
  useEffect(() => {
    async function loadRepoTasks() {
      try {
        setLoading(true);
        const response = await fetch(`/api/repo/${owner}/${repo}/file/TASKS.md`);

        if (response.status === 404) {
          setRepoTasks([]);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch TASKS.md");
        }

        const data = await response.json();
        if (data.content) {
          const parsed = parseTasks(data.content);
          setRepoTasks(parsed);
        }
      } catch (err) {
        console.error("Error loading repo tasks:", err);
      } finally {
        setLoading(false);
      }
    }

    loadRepoTasks();
  }, [owner, repo]);

  // Load manual tasks from localStorage
  useEffect(() => {
    const key = `tasks:${owner}/${repo}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setManualTasks(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse manual tasks:", e);
      }
    }
  }, [owner, repo]);

  // Save manual tasks to localStorage
  useEffect(() => {
    const key = `tasks:${owner}/${repo}`;
    localStorage.setItem(key, JSON.stringify(manualTasks));
  }, [manualTasks, owner, repo]);

  const handleAddTask = () => {
    if (!formTitle.trim()) return;

    const newTask: Task = {
      id: `manual-${Date.now()}`,
      title: formTitle.trim(),
      description: formDescription.trim() || undefined,
      status: "todo",
      priority: formPriority,
      source: "manual",
    };

    setManualTasks((prev) => [...prev, newTask]);
    setFormTitle("");
    setFormDescription("");
    setFormPriority("medium");
    setShowAddForm(false);
  };

  const handleEditTask = () => {
    if (!editingTask || !formTitle.trim()) return;

    setManualTasks((prev) =>
      prev.map((t) =>
        t.id === editingTask.id
          ? {
              ...t,
              title: formTitle.trim(),
              description: formDescription.trim() || undefined,
              priority: formPriority,
            }
          : t
      )
    );

    setEditingTask(null);
    setFormTitle("");
    setFormDescription("");
    setFormPriority("medium");
  };

  const handleDeleteTask = (id: string) => {
    if (confirm("Delete this task?")) {
      setManualTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const toggleTaskStatus = (id: string) => {
    setManualTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === "todo" ? "done" : "todo" } : t
      )
    );
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || "");
    setFormPriority(task.priority);
    setShowAddForm(false);
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingTask(null);
    setFormTitle("");
    setFormDescription("");
    setFormPriority("medium");
  };

  const allTasks = [...repoTasks, ...manualTasks];
  const todoTasks = allTasks.filter((t) => t.status === "todo");
  const doneTasks = allTasks.filter((t) => t.status === "done");

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card-bg border border-card-border rounded-lg p-4">
            <div className="h-5 bg-muted/20 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Task Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingTask) && (
        <div className="bg-card-bg border border-accent/30 rounded-lg p-4 space-y-3">
          <input
            type="text"
            placeholder="Task title"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            autoFocus
          />
          <textarea
            placeholder="Description (optional)"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          />
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-fg">Priority:</label>
            <select
              value={formPriority}
              onChange={(e) => setFormPriority(e.target.value as Task["priority"])}
              className="px-3 py-1 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={editingTask ? handleEditTask : handleAddTask}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors"
            >
              <Check className="w-4 h-4" />
              {editingTask ? "Save" : "Add"}
            </button>
            <button
              onClick={cancelForm}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-card-border hover:bg-foreground/5 text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {allTasks.length === 0 && (
        <div className="bg-card-bg border border-card-border rounded-lg p-12 text-center">
          <p className="text-muted-fg mb-4">No tasks yet.</p>
          <p className="text-sm text-muted-fg">
            Create a task manually or add a TASKS.md file to your repository.
          </p>
        </div>
      )}

      {/* To Do Section */}
      {todoTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-fg uppercase tracking-wide mb-3">
            To Do ({todoTasks.length})
          </h3>
          <div className="space-y-2">
            {todoTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={task.source === "manual" ? toggleTaskStatus : undefined}
                onEdit={task.source === "manual" ? startEdit : undefined}
                onDelete={task.source === "manual" ? handleDeleteTask : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Section */}
      {doneTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-fg uppercase tracking-wide mb-3">
            Completed ({doneTasks.length})
          </h3>
          <div className="space-y-2">
            {doneTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={task.source === "manual" ? toggleTaskStatus : undefined}
                onEdit={task.source === "manual" ? startEdit : undefined}
                onDelete={task.source === "manual" ? handleDeleteTask : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onToggle?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
  const priorityColors = {
    low: "text-blue-400",
    medium: "text-yellow-400",
    high: "text-red-400",
  };

  return (
    <div
      className={clsx(
        "bg-card-bg border border-card-border rounded-lg p-4 transition-opacity",
        task.status === "done" && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle?.(task.id)}
          disabled={!onToggle}
          className={clsx(
            "mt-0.5 w-6 h-6 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0",
            "min-w-[24px] min-h-[24px]",
            task.status === "done"
              ? "bg-accent border-accent"
              : "border-card-border hover:border-accent",
            !onToggle && "cursor-default"
          )}
        >
          {task.status === "done" && <Check className="w-3.5 h-3.5 text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={clsx(
                "text-foreground font-medium break-words",
                task.status === "done" && "line-through"
              )}
            >
              {task.title}
            </h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Source badge */}
              <div
                className={clsx(
                  "flex items-center gap-1 px-2 py-0.5 rounded text-xs",
                  task.source === "repo"
                    ? "bg-blue-500/10 text-blue-400"
                    : "bg-purple-500/10 text-purple-400"
                )}
              >
                {task.source === "repo" ? (
                  <>
                    <FileText className="w-3 h-3" />
                    <span>Repo</span>
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3" />
                    <span>Manual</span>
                  </>
                )}
              </div>
              {/* Actions (manual only) */}
              {task.source === "manual" && (
                <div className="flex gap-0.5">
                  <button
                    onClick={() => onEdit?.(task)}
                    className="p-2 rounded hover:bg-foreground/5 text-muted-fg hover:text-foreground transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete?.(task.id)}
                    className="p-2 rounded hover:bg-red-500/10 text-muted-fg hover:text-red-400 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          {task.description && (
            <p className="text-sm text-muted-fg mt-1">{task.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className={priorityColors[task.priority]}>
              {task.priority.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

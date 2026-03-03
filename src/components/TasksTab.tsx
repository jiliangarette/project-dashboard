"use client";

import { useState, useEffect } from "react";
import { Plus, Check, X } from "lucide-react";
import { TaskCard } from "./TaskCard";
import type { Task, TaskNote } from "@/lib/types";

// Simplified interface for repo-parsed tasks (missing full Task fields)
interface RepoTask {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "done";
  priority: "low" | "medium" | "high";
  source: "manual" | "tasks.md";
  createdAt: string;
  updatedAt: string;
}

interface TasksTabProps {
  owner: string;
  repo: string;
}

function parseTasks(markdown: string): RepoTask[] {
  const lines = markdown.split("\n");
  const tasks: RepoTask[] = [];
  const now = new Date().toISOString();

  for (const line of lines) {
    const uncheckedMatch = line.match(/^[-*]\s+\[\s\]\s+(.+)$/);
    const checkedMatch = line.match(/^[-*]\s+\[x\]\s+(.+)$/i);

    if (uncheckedMatch || checkedMatch) {
      tasks.push({
        id: `repo-${Date.now()}-${Math.random()}`,
        title: (uncheckedMatch || checkedMatch)![1].trim(),
        status: checkedMatch ? "done" : "todo",
        priority: "medium",
        source: "tasks.md",
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return tasks;
}

export function TasksTab({ owner, repo }: TasksTabProps) {
  const [repoTasks, setRepoTasks] = useState<RepoTask[]>([]);
  const [manualTasks, setManualTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPriority, setFormPriority] = useState<"low" | "medium" | "high">("medium");
  const [formDueDate, setFormDueDate] = useState("");

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

    const now = new Date().toISOString();
    const newTask: Task = {
      id: `manual-${Date.now()}`,
      title: formTitle.trim(),
      description: formDescription.trim() || undefined,
      status: "todo",
      priority: formPriority,
      dueDate: formDueDate || undefined,
      notes: [],
      source: "manual",
      createdAt: now,
      updatedAt: now,
    };

    setManualTasks((prev) => [...prev, newTask]);
    setFormTitle("");
    setFormDescription("");
    setFormPriority("medium");
    setFormDueDate("");
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
              dueDate: formDueDate || undefined,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );

    setEditingTask(null);
    setFormTitle("");
    setFormDescription("");
    setFormPriority("medium");
    setFormDueDate("");
  };

  const handleDeleteTask = (id: string) => {
    if (confirm("Delete this task?")) {
      setManualTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const toggleTaskStatus = async (id: string, newStatus: Task["status"]) => {
    setManualTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const handleAddNote = (taskId: string, noteText: string) => {
    const newNote: TaskNote = {
      id: `note-${Date.now()}`,
      text: noteText,
      timestamp: new Date().toISOString(),
    };

    setManualTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, notes: [...(t.notes || []), newNote], updatedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const handleDeleteNote = (taskId: string, noteId: string) => {
    setManualTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              notes: (t.notes || []).filter((n) => n.id !== noteId),
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || "");
    setFormPriority(task.priority);
    setFormDueDate(task.dueDate || "");
    setShowAddForm(false);
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingTask(null);
    setFormTitle("");
    setFormDescription("");
    setFormPriority("medium");
    setFormDueDate("");
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
          <div className="flex flex-col sm:flex-row gap-3">
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
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-fg">Due date:</label>
              <input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="px-3 py-1 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
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
            {todoTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task as Task}
                onStatusChange={task.source === "manual" ? toggleTaskStatus : undefined}
                onEdit={task.source === "manual" ? startEdit : undefined}
                onDelete={task.source === "manual" ? handleDeleteTask : undefined}
                onAddNote={task.source === "manual" ? handleAddNote : undefined}
                onDeleteNote={task.source === "manual" ? handleDeleteNote : undefined}
                isFirst={index === 0}
                isLast={index === todoTasks.length - 1}
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
            {doneTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task as Task}
                onStatusChange={task.source === "manual" ? toggleTaskStatus : undefined}
                onEdit={task.source === "manual" ? startEdit : undefined}
                onDelete={task.source === "manual" ? handleDeleteTask : undefined}
                onAddNote={task.source === "manual" ? handleAddNote : undefined}
                onDeleteNote={task.source === "manual" ? handleDeleteNote : undefined}
                isFirst={index === 0}
                isLast={index === doneTasks.length - 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

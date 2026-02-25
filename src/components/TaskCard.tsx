"use client";

import { Pencil, Trash2, FileCode, ChevronUp, ChevronDown } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import type { Task } from "@/lib/types";

const nextStatus: Record<Task["status"], Task["status"]> = {
  todo: "in-progress",
  "in-progress": "done",
  done: "todo",
};

export function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  task: Task;
  onStatusChange: (id: string, status: Task["status"]) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="bg-card-bg border border-card-border rounded-lg p-4 hover:border-card-hover transition-colors">
      <div className="flex items-start justify-between gap-3">
        {/* Reorder arrows */}
        {onMoveUp && onMoveDown && (
          <div className="flex flex-col gap-0.5 shrink-0 -my-1">
            <button
              onClick={() => onMoveUp(task.id)}
              disabled={isFirst}
              className="p-0.5 rounded hover:bg-input-bg text-muted-fg hover:text-foreground transition-colors disabled:opacity-25 disabled:cursor-default"
              title="Move up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => onMoveDown(task.id)}
              disabled={isLast}
              className="p-0.5 rounded hover:bg-input-bg text-muted-fg hover:text-foreground transition-colors disabled:opacity-25 disabled:cursor-default"
              title="Move down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <StatusBadge
              status={task.status}
              onClick={() => onStatusChange(task.id, nextStatus[task.status])}
            />
            <PriorityBadge priority={task.priority} />
            {task.source === "tasks.md" && (
              <span className="text-xs text-muted flex items-center gap-0.5">
                <FileCode className="w-3 h-3" />
                md
              </span>
            )}
          </div>
          <h4 className="font-medium text-foreground truncate">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-muted-fg mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-md hover:bg-input-bg text-muted-fg hover:text-foreground transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-fg hover:text-danger transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

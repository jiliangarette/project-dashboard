"use client";

import { useState } from "react";
import { MessageSquare, Plus, X, Clock } from "lucide-react";
import { clsx } from "clsx";
import type { TaskNote } from "@/lib/types";

interface TaskNotesProps {
  notes: TaskNote[];
  onAddNote: (text: string) => void;
  onDeleteNote: (noteId: string) => void;
}

export function TaskNotes({ notes, onAddNote, onDeleteNote }: TaskNotesProps) {
  const [expanded, setExpanded] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");

  const handleAdd = () => {
    if (!newNoteText.trim()) return;
    onAddNote(newNoteText.trim());
    setNewNoteText("");
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="border-t border-card-border pt-3 mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-muted-fg hover:text-foreground transition-colors w-full"
      >
        <MessageSquare className="w-4 h-4" />
        <span>
          {notes.length === 0
            ? "Add notes"
            : notes.length === 1
            ? "1 note"
            : `${notes.length} notes`}
        </span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {/* Existing notes */}
          {notes.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-input-bg rounded-lg p-2 text-sm flex items-start gap-2 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground whitespace-pre-wrap break-words">
                      {note.text}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(note.timestamp)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="p-1 rounded hover:bg-danger/10 text-muted-fg hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete note"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new note */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="Add a note..."
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-input-border bg-input-bg text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors"
            />
            <button
              onClick={handleAdd}
              disabled={!newNoteText.trim()}
              className={clsx(
                "p-2 rounded-lg transition-colors flex-shrink-0",
                newNoteText.trim()
                  ? "bg-accent hover:bg-accent-hover text-white"
                  : "bg-card-bg text-muted-fg cursor-not-allowed"
              )}
              title="Add note"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

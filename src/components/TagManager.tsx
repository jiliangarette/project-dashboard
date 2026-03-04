"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, Tag } from "lucide-react";
import { clsx } from "clsx";

interface TagManagerProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  showInput?: boolean;
}

export function TagManager({ tags, onAddTag, onRemoveTag, showInput = false }: TagManagerProps) {
  const [isAdding, setIsAdding] = useState(showInput);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAddTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onAddTag(trimmed);
      setInputValue("");
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === "Escape") {
      setInputValue("");
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5" onClick={(e) => e.preventDefault()}>
      {/* Existing tags */}
      {tags.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-accent/10 text-accent border border-accent/20 transition-colors"
        >
          <Tag className="w-3 h-3" />
          {tag}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemoveTag(tag);
            }}
            className="ml-0.5 hover:text-accent-hover transition-colors"
            aria-label={`Remove tag ${tag}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {/* Add tag button or input */}
      {isAdding ? (
        <div className="inline-flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!inputValue.trim()) setIsAdding(false);
            }}
            placeholder="tag name"
            className="w-24 px-2 py-0.5 text-xs rounded border border-accent bg-input-bg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddTag();
            }}
            className="p-0.5 text-accent hover:text-accent-hover transition-colors"
            aria-label="Confirm add tag"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsAdding(true);
          }}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium text-muted-fg hover:text-accent hover:bg-accent/5 border border-dashed border-card-border hover:border-accent/30 transition-colors"
          aria-label="Add tag"
        >
          <Plus className="w-3 h-3" />
          tag
        </button>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { ChevronDown, Filter, X } from "lucide-react";

export type SortField = "priority" | "status" | "date" | "source" | "order" | "dueDate";
export type FilterSource = "all" | "manual" | "tasks.md";
export type FilterStatus = "all" | "todo" | "done";

interface TaskFiltersProps {
  sortBy: SortField;
  onSortChange: (v: SortField) => void;
  filterSource: FilterSource;
  onSourceChange: (v: FilterSource) => void;
  filterStatus: FilterStatus;
  onStatusChange: (v: FilterStatus) => void;
}

const chipBase =
  "px-3 py-1.5 text-xs rounded-full border transition-colors cursor-pointer select-none min-h-[32px]";
const chipActive =
  "bg-accent/15 text-accent border-accent/40";
const chipInactive =
  "bg-card-bg text-muted-fg border-card-border hover:border-muted";

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted font-medium uppercase tracking-wider">
        {label}
      </span>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={clsx(chipBase, value === o.value ? chipActive : chipInactive)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function TaskFilters({
  sortBy,
  onSortChange,
  filterSource,
  onSourceChange,
  filterStatus,
  onStatusChange,
}: TaskFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Count active filters
  const hasActiveFilters = 
    filterStatus !== "all" || 
    filterSource !== "all" || 
    sortBy !== "order";
  
  const activeCount = 
    (filterStatus !== "all" ? 1 : 0) +
    (filterSource !== "all" ? 1 : 0) +
    (sortBy !== "order" ? 1 : 0);

  return (
    <>
      {/* Mobile: Collapsible filter panel */}
      <div className="md:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={clsx(
            "w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg border transition-colors min-h-[44px]",
            hasActiveFilters
              ? "bg-accent/10 border-accent/30 text-accent"
              : "bg-card-bg border-card-border text-foreground hover:bg-card-hover"
          )}
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="font-medium text-sm">
              Filters
              {hasActiveFilters && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white text-xs font-bold">
                  {activeCount}
                </span>
              )}
            </span>
          </div>
          <ChevronDown
            className={clsx(
              "w-4 h-4 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </button>

        {isExpanded && (
          <div className="mt-3 p-4 bg-card-bg border border-card-border rounded-lg space-y-4">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-muted-fg mb-2 uppercase tracking-wider">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all" as const, label: "All" },
                  { value: "todo" as const, label: "To Do" },
                  { value: "done" as const, label: "Done" },
                ].map((o) => (
                  <button
                    key={o.value}
                    onClick={() => onStatusChange(o.value)}
                    className={clsx(
                      "px-4 py-2.5 text-sm rounded-lg border transition-colors min-h-[44px] flex-1 min-w-[80px]",
                      filterStatus === o.value
                        ? "bg-accent/15 text-accent border-accent/40"
                        : "bg-input-bg text-foreground border-card-border hover:border-muted"
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Source Filter */}
            <div>
              <label className="block text-xs font-medium text-muted-fg mb-2 uppercase tracking-wider">
                Source
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all" as const, label: "All" },
                  { value: "manual" as const, label: "Manual" },
                  { value: "tasks.md" as const, label: "TASKS.md" },
                ].map((o) => (
                  <button
                    key={o.value}
                    onClick={() => onSourceChange(o.value)}
                    className={clsx(
                      "px-4 py-2.5 text-sm rounded-lg border transition-colors min-h-[44px] flex-1 min-w-[80px]",
                      filterSource === o.value
                        ? "bg-accent/15 text-accent border-accent/40"
                        : "bg-input-bg text-foreground border-card-border hover:border-muted"
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-medium text-muted-fg mb-2 uppercase tracking-wider">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortField)}
                className="w-full px-4 py-3 text-base rounded-lg border border-card-border bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
              >
                <option value="order">Order</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="date">Date Created</option>
                <option value="source">Source</option>
              </select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  onStatusChange("all");
                  onSourceChange("all");
                  onSortChange("order");
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors min-h-[44px]"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Desktop: Inline chip filters (existing layout) */}
      <div className="hidden md:flex md:flex-wrap md:items-center md:gap-x-6 md:gap-y-2">
        <ChipGroup
          label="Status"
          options={[
            { value: "all" as const, label: "All" },
            { value: "todo" as const, label: "To Do" },
            { value: "done" as const, label: "Done" },
          ]}
          value={filterStatus}
          onChange={onStatusChange}
        />
        <ChipGroup
          label="Source"
          options={[
            { value: "all" as const, label: "All" },
            { value: "manual" as const, label: "Manual" },
            { value: "tasks.md" as const, label: "TASKS.md" },
          ]}
          value={filterSource}
          onChange={onSourceChange}
        />
        <ChipGroup
          label="Sort"
          options={[
            { value: "order" as const, label: "Order" },
            { value: "dueDate" as const, label: "Due Date" },
            { value: "priority" as const, label: "Priority" },
            { value: "status" as const, label: "Status" },
            { value: "date" as const, label: "Date" },
            { value: "source" as const, label: "Source" },
          ]}
          value={sortBy}
          onChange={onSortChange}
        />
      </div>
    </>
  );
}

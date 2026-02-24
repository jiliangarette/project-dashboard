"use client";

import { clsx } from "clsx";

export type SortField = "priority" | "status" | "date" | "source";
export type FilterAssignee = "all" | "jilian" | "openclaw" | "lovable";
export type FilterSource = "all" | "manual" | "tasks.md";
export type FilterStatus = "all" | "todo" | "in-progress" | "done";

interface TaskFiltersProps {
  sortBy: SortField;
  onSortChange: (v: SortField) => void;
  filterAssignee: FilterAssignee;
  onAssigneeChange: (v: FilterAssignee) => void;
  filterSource: FilterSource;
  onSourceChange: (v: FilterSource) => void;
  filterStatus: FilterStatus;
  onStatusChange: (v: FilterStatus) => void;
}

const chipBase =
  "px-3 py-1 text-xs rounded-full border transition-colors cursor-pointer select-none";
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
  filterAssignee,
  onAssigneeChange,
  filterSource,
  onSourceChange,
  filterStatus,
  onStatusChange,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      <ChipGroup
        label="Status"
        options={[
          { value: "all" as const, label: "All" },
          { value: "todo" as const, label: "To Do" },
          { value: "in-progress" as const, label: "In Progress" },
          { value: "done" as const, label: "Done" },
        ]}
        value={filterStatus}
        onChange={onStatusChange}
      />
      <ChipGroup
        label="Assignee"
        options={[
          { value: "all" as const, label: "All" },
          { value: "jilian" as const, label: "Jilian" },
          { value: "openclaw" as const, label: "OpenClaw" },
          { value: "lovable" as const, label: "Lovable" },
        ]}
        value={filterAssignee}
        onChange={onAssigneeChange}
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
          { value: "priority" as const, label: "Priority" },
          { value: "status" as const, label: "Status" },
          { value: "date" as const, label: "Date" },
          { value: "source" as const, label: "Source" },
        ]}
        value={sortBy}
        onChange={onSortChange}
      />
    </div>
  );
}

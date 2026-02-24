"use client";

import { clsx } from "clsx";

const priorityStyles = {
  low: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  medium: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  high: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function PriorityBadge({
  priority,
}: {
  priority: "low" | "medium" | "high";
}) {
  return (
    <span
      className={clsx(
        "text-xs font-medium px-2 py-0.5 rounded-full border inline-flex items-center capitalize",
        priorityStyles[priority]
      )}
    >
      {priority}
    </span>
  );
}

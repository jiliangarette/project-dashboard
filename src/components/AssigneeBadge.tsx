"use client";

import { clsx } from "clsx";

const assigneeStyles = {
  jilian: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  openclaw: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  lovable: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

export function AssigneeBadge({
  assignee,
}: {
  assignee: "jilian" | "openclaw" | "lovable";
}) {
  return (
    <span
      className={clsx(
        "text-xs font-medium px-2 py-0.5 rounded-full border inline-flex items-center capitalize",
        assigneeStyles[assignee]
      )}
    >
      {assignee}
    </span>
  );
}

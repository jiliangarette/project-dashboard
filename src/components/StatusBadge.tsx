"use client";

import { clsx } from "clsx";

const statusStyles = {
  todo: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  done: "bg-green-500/15 text-green-400 border-green-500/30",
};

const statusLabels = {
  todo: "To Do",
  done: "Done",
};

export function StatusBadge({
  status,
  onClick,
}: {
  status: "todo" | "done";
  onClick?: () => void;
}) {
  return (
    <span
      onClick={onClick}
      className={clsx(
        "text-xs font-medium px-2 py-0.5 rounded-full border inline-flex items-center",
        statusStyles[status],
        onClick && "cursor-pointer hover:opacity-80 transition-opacity"
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { clsx } from "clsx";

export function TaskCheckbox({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => Promise<void> | void;
}) {
  const [syncing, setSyncing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleClick() {
    setSyncing(true);
    setShowConfirm(false);
    try {
      await onToggle();
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 1200);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="relative flex items-center">
      <button
        onClick={handleClick}
        disabled={syncing}
        className={clsx(
          "task-checkbox p-2 rounded flex items-center justify-center shrink-0 transition-all duration-200",
          "min-w-[44px] min-h-[44px]", // Mobile-friendly touch target
          checked
            ? "bg-success border-2 border-success"
            : "border-2 border-muted-fg/40 hover:border-accent bg-transparent",
          syncing && "opacity-60"
        )}
        aria-label={checked ? "Mark as to do" : "Mark as done"}
      >
        <div className="w-5 h-5 flex items-center justify-center">
          {syncing ? (
            <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
          ) : checked ? (
            <Check className="w-4 h-4 text-white checkbox-check" />
          ) : null}
        </div>
      </button>
      {showConfirm && (
        <span className="sync-confirm absolute -right-5 text-success">
          <Check className="w-3.5 h-3.5" />
        </span>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, Info, WifiOff } from "lucide-react";
import { clsx } from "clsx";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

let addToastExternal: ((toast: Omit<ToastMessage, "id">) => void) | null = null;

export function toast(type: ToastType, message: string, duration = 4000) {
  addToastExternal?.({ type, message, duration });
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: WifiOff,
};

const styles = {
  success: "border-success/30 bg-success/10 text-success",
  error: "border-danger/30 bg-danger/10 text-danger",
  info: "border-accent/30 bg-accent/10 text-accent",
  warning: "border-warning/30 bg-warning/10 text-warning",
};

function ToastItem({ toast: t, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(t.id), 200);
    }, t.duration || 4000);
    return () => clearTimeout(timer);
  }, [t, onDismiss]);

  const Icon = icons[t.type];

  return (
    <div
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-200 max-w-[90vw] sm:max-w-sm",
        styles[t.type],
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm flex-1 break-words">{t.message}</p>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onDismiss(t.id), 200);
        }}
        className="p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0 min-w-[28px] min-h-[28px] flex items-center justify-center"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((t: Omit<ToastMessage, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { ...t, id }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    addToastExternal = addToast;
    return () => {
      addToastExternal = null;
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 sm:bottom-6 sm:right-6"
      aria-live="polite"
      role="status"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}

"use client";

import { useApp } from "@/context/app-context";

export function GlobalErrorBanner() {
  const { actionError, clearActionError } = useApp();

  if (!actionError) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
    >
      <div className="flex items-center justify-between p-4 rounded-lg shadow-lg bg-red-600 text-white dark:bg-red-700">
        <span className="text-sm font-medium pr-2">{actionError}</span>
        <button
          onClick={clearActionError}
          aria-label="Dismiss error"
          className="ml-auto px-2 py-1 text-xs font-bold uppercase rounded bg-red-800 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-white"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
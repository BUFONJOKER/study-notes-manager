"use client";

import { useEffect } from "react";
import { useApp } from "@/context/app-context";

export function GlobalErrorBanner() {
  const {
    actionError,
    clearActionError,
    actionNotice,
    clearActionNotice,
  } = useApp();

  const isSuccess = Boolean(actionNotice && !actionError);

  useEffect(() => {
    if (!actionError && !actionNotice) return;

    const timer = window.setTimeout(() => {
      if (isSuccess) {
        clearActionNotice();
      } else {
        clearActionError();
      }
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [
    actionError,
    actionNotice,
    clearActionError,
    clearActionNotice,
    isSuccess,
  ]);

  if (!actionError && !actionNotice) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
    >
      <div className={`flex items-center justify-between p-4 rounded-lg shadow-lg text-white ${
        isSuccess
          ? "bg-emerald-600 dark:bg-emerald-700"
          : "bg-red-600 dark:bg-red-700"
      }`}>
        <span className="text-sm font-medium pr-2">
          {isSuccess ? actionNotice : actionError}
        </span>
        <button
          onClick={isSuccess ? clearActionNotice : clearActionError}
          aria-label="Dismiss error"
          className={`ml-auto px-2 py-1 text-xs font-bold uppercase rounded focus:outline-none focus:ring-2 focus:ring-white ${
            isSuccess
              ? "bg-emerald-800 hover:bg-emerald-900"
              : "bg-red-800 hover:bg-red-900"
          }`}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
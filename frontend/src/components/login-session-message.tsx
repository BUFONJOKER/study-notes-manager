
"use client";

import { useSearchParams } from "next/navigation";

export function LoginSessionMessage() {
  const searchParams = useSearchParams();

  if (searchParams.get("reason") !== "session-expired") {
    return null;
  }

  return (
    <div
      role="alert"
      className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <p className="font-semibold">
        Session expired
      </p>
      <p className="mt-1">
        Your session has expired. Please log in again.
      </p>
    </div>
  );
}

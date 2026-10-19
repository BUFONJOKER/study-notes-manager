
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSession, signOut } from "next-auth/react";
import { Icon } from "@/components/ui";

export function SessionExpiredAlert() {
  const [visible, setVisible] = useState(false);
  const handlingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const handleExpiredSession = useCallback(() => {
    if (handlingRef.current) return;

    handlingRef.current = true;
    setVisible(true);

    timerRef.current = setTimeout(() => {
      void signOut({
        callbackUrl: "/login?reason=session-expired",
      });
    }, 2500);
  }, []);

  useEffect(() => {
    const handleEvent = () => handleExpiredSession();

    window.addEventListener(
      "app:session-expired",
      handleEvent,
    );

    // Check whether the NextAuth session is still valid.
    const checkSession = async () => {
      try {
        const session = await getSession();

        if (!session) {
          handleExpiredSession();
        }
      } catch {
        // A temporary network error is not proof that the
        // session has expired. Let the next check retry.
      }
    };

    void checkSession();

    const interval = window.setInterval(() => {
      void checkSession();
    }, 60_000);

    return () => {
      window.removeEventListener(
        "app:session-expired",
        handleEvent,
      );

      window.clearInterval(interval);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [handleExpiredSession]);

  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-x-4 top-4 z-100 mx-auto flex max-w-lg items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-xl dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200">
        <Icon name="clock" size={20} />
      </span>

      <div>
        <p className="font-semibold">
          Your session has expired
        </p>
        <p className="mt-1 text-sm">
          Please log in again to continue. Redirecting to login...
        </p>
      </div>
    </div>
  );
}

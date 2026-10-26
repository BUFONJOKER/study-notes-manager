
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function SessionExpiryHandler() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    let eventDispatched = false;

    const expireSession = () => {
      if (eventDispatched) return;

      eventDispatched = true;
      window.dispatchEvent(new Event("app:session-expired"));
    };

    const expiresAt = session.accessTokenExpires;

    if (
      session.error === "AccessTokenExpired" ||
      !expiresAt ||
      Date.now() >= expiresAt
    ) {
      expireSession();
      return;
    }

    const timer = window.setTimeout(
      expireSession,
      expiresAt - Date.now(),
    );

    return () => window.clearTimeout(timer);
  }, [session, status]);

  return null;
}

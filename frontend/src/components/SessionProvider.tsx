
"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { SessionExpiryHandler } from "@/components/auth/session-expiry-handler";
import { SessionExpiredAlert } from "@/components/session-expired-alert";

export default function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SessionProvider>
      <SessionExpiryHandler />
      <SessionExpiredAlert />
      {children}
    </SessionProvider>
  );
}

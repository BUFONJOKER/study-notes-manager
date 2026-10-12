import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Brand } from "@/components/ui";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className={cn("auth-shell")}>
      <div className={cn("auth-brand")}>
        <Brand />
      </div>
      {children}
    </main>
  );
}

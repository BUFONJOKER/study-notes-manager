"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export function BackLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const router = useRouter();
  return (
    <button className={cn("back-link")} onClick={() => router.push(href)}>
      <Icon name="arrow" size={17} />
      {children}
    </button>
  );
}
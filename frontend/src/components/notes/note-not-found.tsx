"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { Button, Icon } from "@/components/ui";

export function NoteNotFound() {
  const router = useRouter();

  return (
    <div className={cn("page")}>
      <div className={cn("empty panel")}>
        <span className={cn("empty-icon")}>
          <Icon name="search" />
        </span>
        <h2>Note not found</h2>
        <p>This note doesn’t exist or has been deleted.</p>
        <Button variant="secondary" onClick={() => router.push(routes.notes)}>Back to all notes</Button>
      </div>
    </div>
  );
}

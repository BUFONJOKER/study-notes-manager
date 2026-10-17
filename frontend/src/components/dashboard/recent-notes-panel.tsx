"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { Badge, Icon } from "@/components/ui";
import type { NoteResponse } from "@/types/notes";

export function RecentNotesPanel({ notes }: { notes: NoteResponse[] }) {
  const router = useRouter();

  return (
    <section className={cn("panel recent-panel")}>
      <div className={cn("panel-header")}>
        <div>
          <h2>Recently updated</h2>
          <p>Pick up where you left off</p>
        </div>
        <button className={cn("text-button")} onClick={() => router.push(routes.notes)}>
          View all <Icon name="chevron" size={15} />
        </button>
      </div>
      <div className={cn("recent-list")}>
        {notes.map((note) => (
          <button className={cn("recent-row")} key={note.note_id} onClick={() => router.push(routes.note(note.note_id))}>

            {note.quiz && (
              <span className={cn("quiz-ready")}>
                <Icon name="sparkle" size={14} /> Quiz ready
              </span>
            )}
            <Icon name="chevron" size={18} />
          </button>
        ))}
      </div>
    </section>
  );
}

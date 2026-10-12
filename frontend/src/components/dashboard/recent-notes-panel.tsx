"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { Badge, Icon } from "@/components/ui";
import type { Note } from "@/types";

export function RecentNotesPanel({ notes }: { notes: Note[] }) {
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
          <button className={cn("recent-row")} key={note.id} onClick={() => router.push(routes.note(note.id))}>
            <span className={cn(`note-glyph ${note.tone}`)}>
              <Icon name="notes" size={20} />
            </span>
            <span className={cn("recent-main")}>
              <strong>{note.title}</strong>
              <span>
                <Badge tone={note.tone}>{note.subject}</Badge>
                <small>{note.updated}</small>
              </span>
            </span>
            {note.hasQuiz && (
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

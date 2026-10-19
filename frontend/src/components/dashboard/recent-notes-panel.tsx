
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/ui";
import type { NoteResponse } from "@/types/notes";

export function RecentNotesPanel({
  notes,
}: {
  notes: NoteResponse[];
}) {
  const router = useRouter();

  const recentNotes = useMemo(
    () =>
      [...notes]
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() -
            new Date(a.updated_at).getTime(),
        )
        .slice(0, 5),
    [notes],
  );

  return (
    <section className={cn("panel recent-panel")}>
      <div className={cn("panel-header")}>
        <div>
          <h2>Recently updated</h2>
          <p>Pick up where you left off</p>
        </div>

        <button
          className={cn("text-button")}
          onClick={() => router.push(routes.notes)}
        >
          View all <Icon name="chevron" size={15} />
        </button>
      </div>

      <div className={cn("recent-list")}>
        {recentNotes.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">
            No notes yet. Create your first study note.
          </p>
        ) : (
          recentNotes.map((note) => (
            <button
              className={cn("recent-row")}
              key={note.note_id}
              onClick={() => router.push(routes.note(note.note_id))}
            >
              <div className="mr-4 flex min-w-0 flex-1 flex-col items-start text-left">
                <h4 className="w-full truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  {note.title}
                </h4>

                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">{note.subject}</span>
                  <span>•</span>
                  <span>
                    {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {note.quiz && (
                <span className={cn("quiz-ready")}>
                  <Icon name="sparkle" size={14} /> Quiz ready
                </span>
              )}

              <Icon name="chevron" size={18} />
            </button>
          ))
        )}
      </div>
    </section>
  );
}

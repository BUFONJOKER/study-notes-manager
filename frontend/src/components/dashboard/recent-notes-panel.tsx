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
        {/* Array is shallow-copied and sorted on-the-fly before mapping */}
        {[...notes]
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .map((note) => (
            <button
              className={cn("recent-row")}
              key={note.note_id}
              onClick={() => router.push(routes.note(note.note_id))}
            >
              {/* Note details layout container */}
              <div className="flex flex-col items-start text-left flex-1 min-w-0 mr-4">
                <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate w-full">
                  {note.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">{note.subject}</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span>{note.updated_at}</span>
                </div>
              </div>

              {/* Quiz badge status block */}
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

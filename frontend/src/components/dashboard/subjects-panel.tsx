"use client";

import { useRouter } from "next/navigation";
import { subjects } from "@/data/subjects";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/ui";
import { NoteResponse } from "@/types/notes";


export function SubjectsPanel({ notes }: { notes: NoteResponse[] }) {
  const router = useRouter();

  // 1. Create a key-value counter map of your real notes data (e.g., { "Mathematics": 1, "Biology": 1 })
  const liveSubjectCounts = notes.reduce((acc, note) => {
    acc[note.subject] = (acc[note.subject] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <section className={cn("panel subjects-panel")}>
      <div className={cn("panel-header")}>
        <div>
          <h2>Your subjects</h2>
          <p>A snapshot of your notes by course</p>
        </div>
        <button className={cn("text-button")} onClick={() => router.push(routes.notes)}>
          Manage subjects <Icon name="chevron" size={15} />
        </button>
      </div>
      <div className={cn("subject-cards")}>
        {subjects.map((subject) => {
          // 2. Look up the live count using the subject's name, defaulting to 0 if none exist yet
          const liveCount = liveSubjectCounts[subject.name] || 0;

          return (
            <button
              key={subject.name}
              onClick={() => router.push(routes.notes)}
              className={cn(`subject-card ${subject.tone}`)}
            >
              <span className={cn("subject-code")}>{subject.code}</span>
              <span>
                <strong>{subject.name}</strong>
                {/* 3. Render the live count with clean singular/plural formatting */}
                <small>{liveCount} {liveCount === 1 ? "note" : "notes"}</small>
              </span>
              <Icon name="chevron" size={17} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

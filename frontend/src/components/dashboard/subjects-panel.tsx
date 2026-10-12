"use client";

import { useRouter } from "next/navigation";
import { subjects } from "@/data/subjects";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/ui";

export function SubjectsPanel() {
  const router = useRouter();

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
        {subjects.map((subject) => (
          <button key={subject.name} onClick={() => router.push(routes.notes)} className={cn(`subject-card ${subject.tone}`)}>
            <span className={cn("subject-code")}>{subject.code}</span>
            <span>
              <strong>{subject.name}</strong>
              <small>{subject.notes} notes</small>
            </span>
            <Icon name="chevron" size={17} />
          </button>
        ))}
      </div>
    </section>
  );
}

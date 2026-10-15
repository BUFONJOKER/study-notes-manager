"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { Badge, Icon } from "@/components/ui";
import type { Note } from "@/types/note";

export function NoteRow({ note }: { note: Note }) {
  const router = useRouter();
  const { apiConfigured, requestAi, requestDelete } = useApp();

  return (
    <div className={cn("note-table-row")}>
      <button className={cn("note-title-cell")} onClick={() => router.push(routes.note(note.id))}>
        <span className={cn(`note-glyph ${note.tone}`)}>
          <Icon name="notes" size={20} />
        </span>
        <span>
          <strong>{note.title}</strong>
          <small>Created {note.created}</small>
        </span>
      </button>
      <span><Badge tone={note.tone}>{note.subject}</Badge></span>
      <span className={cn("muted")}>{note.updated}</span>
      <code>{note.id}</code>
      <span className={cn("row-actions")}>
        <button
          title={apiConfigured ? "Generate quiz" : "Add an API key to generate a quiz"}
          aria-disabled={!apiConfigured}
          className={cn(!apiConfigured ? "ai-action-locked" : "")}
          onClick={requestAi}
        >
          <Icon name={apiConfigured ? "sparkle" : "lock"} size={18} />
        </button>
        <button title="Edit note" onClick={() => router.push(routes.editNote(note.id))}><Icon name="edit" size={18} /></button>
        <button title="Delete note" onClick={() => requestDelete(note)}><Icon name="trash" size={18} /></button>
        <button title="More actions"><Icon name="more" size={18} /></button>
      </span>
    </div>
  );
}

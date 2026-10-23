"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { Badge, Icon } from "@/components/ui";
import type { NoteResponse } from "@/types/notes";
export function NoteRow({ note }: { note: NoteResponse }) {
  const router = useRouter();
  const { apiConfigured, requestAi, requestDelete } = useApp();



  return (
    <div className={cn("note-table-row")}>
      <button className={cn("note-title-cell")} onClick={() => router.push(routes.note(note.note_id))}>
        <span className={cn(`note-glyph ${note.subject.toLowerCase()}`)}>
          <Icon name="notes" size={20} />
        </span>
        <span>
          <strong>{note.title}</strong>
          <small>Created {note.created_at}</small>
        </span>
      </button>
      <span><Badge>{note.subject}</Badge></span>
      <span className={cn("muted")}>{note.updated_at}</span>
      <span className={cn("muted")}>ID: {note.note_id}</span>
      <span className={cn("row-actions")}>
        <button
          title={apiConfigured ? "Generate quiz" : "Add an API key to generate a quiz"}
          aria-disabled={!apiConfigured}
          className={cn(!apiConfigured ? "ai-action-locked" : "")}
          onClick={() => requestAi(note.note_id)}
        >
          <Icon name={apiConfigured ? "sparkle" : "lock"} size={18} />
        </button>
        <button title="Edit note" onClick={() => router.push(routes.editNote(note.note_id))}><Icon name="edit" size={18} /></button>
        <button title="Delete note" onClick={() => requestDelete(note)}><Icon name="trash" size={18} /></button>
        {/* <button title="More actions"><Icon name="more" size={18} /></button> */}
      </span>
    </div>
  );
}

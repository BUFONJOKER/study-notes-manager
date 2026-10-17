"use client";

import { useApp } from "@/context/app-context";
import { NoteForm } from "./note-form";
import { NoteNotFound } from "./note-not-found";

export function EditNote({ note_id }: { note_id: string }) {
  const { getNote } = useApp();
  const note = getNote(note_id);

  if (!note) return <NoteNotFound />;
  return <NoteForm mode="edit" note={note} />;
}

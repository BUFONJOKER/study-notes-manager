"use client";

import { useApp } from "@/context/app-context";
import { NoteForm } from "./note-form";
import { NoteNotFound } from "./note-not-found";

export function EditNote({ id }: { id: number }) {
  const { getNote } = useApp();
  const note = getNote(id);

  if (!note) return <NoteNotFound />;
  return <NoteForm mode="edit" note={note} />;
}

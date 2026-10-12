import type { Metadata } from "next";
import { NoteForm } from "@/components/notes/note-form";

export const metadata: Metadata = { title: "Create note" };

export default function NewNotePage() {
  return <NoteForm mode="create" />;
}

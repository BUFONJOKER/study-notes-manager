import type { Metadata } from "next";
import { NotesList } from "@/components/notes/notes-list";

export const metadata: Metadata = { title: "All notes" };

export default function NotesPage() {
  return <NotesList />;
}

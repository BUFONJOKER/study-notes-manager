import { NoteDetail } from "@/components/notes/note-detail";
import { safeDecode } from "@/lib/utils";

export default async function NoteDetailPage({ params }: { params: Promise<{ note_id: string }> }) {
  const { note_id } = await params;
  return <NoteDetail note_id={safeDecode(note_id)} />;
}

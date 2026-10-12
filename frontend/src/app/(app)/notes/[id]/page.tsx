import { NoteDetail } from "@/components/notes/note-detail";
import { safeDecode } from "@/lib/utils";

export default async function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NoteDetail id={safeDecode(id)} />;
}

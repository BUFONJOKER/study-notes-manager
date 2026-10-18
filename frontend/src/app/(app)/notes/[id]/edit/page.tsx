import { EditNote } from "@/components/notes/edit-note";
import { safeDecode } from "@/lib/utils";

export default async function EditNotePage({ params }: { params: Promise<{ note_id: string }> }) {
  const { note_id } = await params;
  return <EditNote note_id={safeDecode(note_id)} />;
}

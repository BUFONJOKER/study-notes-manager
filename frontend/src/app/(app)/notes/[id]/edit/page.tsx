import { EditNote } from "@/components/notes/edit-note";
import { safeDecode } from "@/lib/utils";

export default async function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditNote id={safeDecode(id)} />;
}

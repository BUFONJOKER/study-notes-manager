"use client";

import { cn } from "@/lib/cn";
import { Button, Icon, Modal } from "@/components/ui";
import type { Note } from "@/types/notes";

type DeleteNoteModalProps = {
  note: Note;
  close: () => void;
  confirm: () => void;
};

export function DeleteNoteModal({ note, close, confirm }: DeleteNoteModalProps) {
  return (
    <Modal onClose={close} labelledBy="delete-title">
      <span className={cn("danger-icon")}><Icon name="trash" /></span>
      <h2 id="delete-title">Delete this note?</h2>
      <p>You’re about to permanently delete <strong>“{note.title}”</strong>. Its generated quiz will also be removed.</p>
      <div className={cn("warning")}>
        <Icon name="alert" size={17} />
        <span>This action cannot be undone.</span>
      </div>
      <div className={cn("modal-actions")}>
        <Button variant="secondary" onClick={close}>Cancel</Button>
        <Button variant="danger" icon="trash" onClick={confirm}>Delete note</Button>
      </div>
    </Modal>
  );
}

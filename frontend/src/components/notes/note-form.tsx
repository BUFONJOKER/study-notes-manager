"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { BackLink, Button, Icon, PageHeading } from "@/components/ui";
import type { NoteCreate, NoteUpdate } from "@/types/notes";

type NoteFormProps = {
  mode: "create" | "edit";
  note?: NoteCreate | NoteUpdate;
};

type FormState = { note_id: string; title: string; subject: string; content: string };

function normalizeContent(content: string): string {
    return content
      .replace(/\r\n?/g, "\n")
      .replace(/[^\S\n]+/g, " ")
      .replace(/ *\n */g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

export function NoteForm({ mode, note }: NoteFormProps) {
  const router = useRouter();
  const { notes, profile, saveNote } = useApp();
  const [form, setForm] = useState<FormState>({
    note_id: note && "note_id" in note ? note.note_id : "",
    title: note?.title || "",
    subject: note?.subject || "",
    content: note?.content || "",
  });
  const subjectsList = [
    "Biology",
    "Chemistry",
    "Physics",
    "Mathematics",
    "English",
    "Computer Science",
    "History",
    "Geography",
    "Economics",
    "Psychology",
    "Other",
  ];
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  //  Fixed safe code:
  const backHref = mode === "edit" && note && "note_id" in note
    ? routes.note(note.note_id)
    : routes.notes;
  const duplicateId = mode === "create" && notes.some((n) => n.note_id === form.note_id.trim().toUpperCase());
  const update = (field: keyof FormState, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const error = (field: keyof FormState) => submitted && !form[field];





  const submit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);

    const id = form.note_id.trim().toUpperCase();
    const title = form.title.trim();
    const content = normalizeContent(form.content);

    if (
      !id ||
      !title ||
      !form.subject ||
      !content ||
      duplicateId
    ) {
      return;
    }

    setSaving(true);

    setTimeout(() => {
      saveNote({
        note_id: id,
        title,
        subject: form.subject,
        content,
        analysis_result: null,
        summary_result: null,
        key_concepts: null,
        quiz: null,
      });

      setSaving(false);
      router.push(routes.note(id));
    }, 700);
  };

  return (
    <div className={cn("page narrow-page")}>
      <BackLink href={backHref}>Back to {mode === "edit" ? "note" : "all notes"}</BackLink>
      <PageHeading
        title={mode === "create" ? "Create a new note" : "Edit note"}
        description={mode === "create" ? "Capture what you’re learning and keep it organized." : "Update your study material. Changes are saved to this note."}
      />
      {mode === "edit" && (
        <div className={cn("info-strip")}>
          <Icon name="clock" size={17} />
          <span>Last updated <strong>Today at 10:24 AM</strong></span>
          <span className={cn("save-status")}><i /> All changes saved</span>
        </div>
      )}

      <form className={cn("form-panel panel")} onSubmit={submit}>
        <section>
          <div className={cn("form-section-title")}>
            <span>1</span>
            <div>
              <h2>Note details</h2>
              <p>Give your note a clear title and subject.</p>
            </div>
          </div>
          <div className={cn("form-grid")}>
            <label>
              <span>Note ID <b>*</b></span>
              <input
                value={form.note_id}
                onChange={(e) => update("note_id", e.target.value.toUpperCase())}
                readOnly={mode === "edit"}
                className={cn(mode === "edit" ? "readonly" : error("note_id") || duplicateId ? "invalid" : "")}
                placeholder="e.g. BIO-204-08"
              />
              <small>{mode === "edit" ? "Unique ID cannot be changed" : "Use a unique, memorable identifier"}</small>
              {error("note_id") && <small className={cn("field-error")}>A unique note ID is required</small>}
              {duplicateId && <small className={cn("field-error")}>This Note ID already exists. Try another unique ID.</small>}
            </label>
            <label className={cn("span-two")}>
              <span>Note title <b>*</b></span>
              <input value={form.title} onChange={(e) => update("title", e.target.value)} className={cn(error("title") ? "invalid" : "")} placeholder="What is this note about?" />
              {error("title") && <small className={cn("field-error")}>Add a title for your note</small>}
            </label>
            <label className={cn("span-two")}>
              <span>Subject <b>*</b></span>
              <select value={form.subject} onChange={(e) => update("subject", e.target.value)} className={cn(error("subject") ? "invalid" : "")}>
                <option value="">Select a subject</option>
                {subjectsList.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section>
          <div className={cn("form-section-title")}>
            <span>2</span>
            <div>
              <h2>Study content</h2>
              <p>Add your key ideas, explanations, and important details.</p>
            </div>
          </div>
          <label className={cn("editor-label")}>
            <span>
              Note content <b>*</b>
              <small>{form.content.length} characters</small>
            </span>
            <div className={cn(`editor ${error("content") ? "invalid" : ""}`)}>
              <div className={cn("editor-toolbar")}>
                <button type="button"><strong>B</strong></button>
                <button type="button"><em>I</em></button>
                <button type="button">H1</button>
                <i />
                <button type="button">• List</button>
                <button type="button">1. List</button>
              </div>
              <textarea
                className="block min-h-80 w-full resize-y bg-white p-4 text-[13px] leading-[1.7] outline-none"
                value={form.content}
                onChange={(e) => update("content", e.target.value)}
                placeholder="Start writing your study notes here..."
              />
            </div>
            {error("content") && (
              <small className={cn("field-error")}>
                Note content cannot be empty
              </small>
            )}
          </label>
        </section>

        <div className={cn("form-actions")}>
          <span>Your note is private to your account.</span>
          <div>
            <Button variant="secondary" onClick={() => router.push(backHref)}>Cancel</Button>
            <Button type="submit" icon={saving ? undefined : "check"} disabled={saving}>
              {saving ? "Saving…" : mode === "create" ? "Save note" : "Save changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

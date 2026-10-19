"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { BackLink, Badge, Button, Icon } from "@/components/ui";
import { NoteNotFound } from "./note-not-found";

export function NoteDetail({ note_id }: { note_id: string }) {
  const router = useRouter();
  const { getNote, selectNote,selectedNote, requestDelete, requestAi, apiConfigured } = useApp();
  const note = getNote(note_id);

  useEffect(() => {
    if (note_id) {
      selectNote(note_id);
    }
  }, [note_id, selectNote]);

  const { notes } = useApp();

  // If notes are still loading from the API, show a loading state instead of false "Not Found"
  if (notes.length === 0) {
    return <div className={cn("page reading-page")}><p>Loading note...</p></div>;
  }

  if (!note) return <NoteNotFound />;

  return (
    <div className={cn("page reading-page")}>
      <BackLink href={routes.notes}>Back to all notes</BackLink>
      <div className={cn("detail-heading")}>
        <div>
          <Badge>{note.subject}</Badge>
          <h1>{note.title}</h1>
          <div className={cn("detail-meta")}>
            <code>{note.note_id}</code>
            <span>Created {note.created_at}</span>
            <span>Updated {note.updated_at}</span>
          </div>
        </div>
        <div className={cn("detail-actions")}>
          <Button variant="secondary" icon="edit" onClick={() => router.push(routes.editNote(note.note_id))}>Edit</Button>
          <Button variant="secondary" icon="trash" onClick={() => requestDelete(note)}>Delete</Button>
          <Button icon={apiConfigured ? "sparkle" : "lock"} onClick={()=> requestAi(note_id)}>Generate quiz</Button>
        </div>
      </div>

      <div className={cn("reading-layout")}>
        <article className={cn("note-content panel")}>
          <div className={cn("content-kicker")}>Study note</div>
          {note.content.split("\n\n").map((p, i) =>
            i === 0 ? (
              <p className={cn("lead")} key={p}>{p}</p>
            ) : p.includes("\n") ? (
              <div key={p}>
                {p.split("\n").map((line, j) => (j === 0 ? <h2 key={line}>{line}</h2> : <p key={line}>{line}</p>))}
              </div>
            ) : i % 2 ? (
              <div key={p}><h2>{p}</h2></div>
            ) : (
              <p key={p}>{p}</p>
            ),
          )}
          <div className={cn("study-callout")}>
            <span><Icon name={apiConfigured ? "sparkle" : "lock"} size={18} /></span>
            <div>
              <strong>{apiConfigured ? "Ready to check your understanding?" : "OpenAI API key required"}</strong>
              <p>{apiConfigured ? "Generate practice questions from this note in under a minute." : "Configure a valid key before using AI study tools."}</p>
            </div>
            <Button variant="secondary"  onClick={()=> requestAi(note_id)}>{apiConfigured ? "Create quiz" : "Set up AI"}</Button>
          </div>
        </article>

        <aside className={cn("note-outline")}>
          <span className={cn("eyebrow")}>On this page</span>
          <a className={cn("active")}>Overview</a>
          <a>Glycolysis</a>
          <a>Citric acid cycle</a>
          <a>Oxidative phosphorylation</a>
          <div className={cn("quiz-mini")}>
            <Icon name="check" size={18} />
            <div>
              <strong>Quiz available</strong>
              <p>10 questions generated</p>
              <button onClick={() => router.push(routes.quiz)}>View quiz <Icon name="chevron" size={14} /></button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

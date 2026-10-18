"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/app-context";
import { subjectOptions } from "@/data/subjects";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { Button, Icon, PageHeading } from "@/components/ui";
import { NoteRow } from "./note-row";

const ALL_SUBJECTS = "All subjects";

export function NotesList() {
  const router = useRouter();
  const { notes } = useApp();
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState(ALL_SUBJECTS);

  const visible = useMemo(
    () =>
      notes.filter(
        (n) =>
          (subject === ALL_SUBJECTS || n.subject === subject) &&
          `${n.title} ${n.subject} ${n.note_id}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [notes, query, subject],
  );

  return (
    <div className={cn("page")}>
      <PageHeading title="All notes" description="Search, organize, and manage everything you’re learning.">
        <Button icon="plus" onClick={() => router.push(routes.newNote)}>Create note</Button>
      </PageHeading>

      <div className={cn("toolbar")}>
        <label className={cn("search-field")}>
          <Icon name="search" size={19} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title, subject, or note ID..." />
        </label>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Filter by subject">
          <option>{ALL_SUBJECTS}</option>
          {subjectOptions.map((name) => <option key={name}>{name}</option>)}
        </select>
        <select aria-label="Sort notes">
          <option>Recently updated</option>
          <option>Recently created</option>
          <option>Title A–Z</option>
        </select>
      </div>

      <div className={cn("results-line")}>
        <span><strong>{visible.length}</strong> notes</span>
        <span>Updated moments ago</span>
      </div>

      {visible.length ? (
        <div className={cn("notes-table panel")}>
          <div className={cn("table-head")}>
            <span>Note</span>
            <span>Subject</span>
            <span>Updated</span>
            <span>Note ID</span>
            <span>Actions</span>
          </div>
          {visible.map((note) => <NoteRow key={note.note_id} note={note} />)}
        </div>
      ) : (
        <div className={cn("empty panel")}>
          <span className={cn("empty-icon")}>
            <Icon name="search" />
          </span>
          <h2>No notes found</h2>
          <p>Try another search or clear your filters to see more notes.</p>
          <Button variant="secondary" onClick={() => { setQuery(""); setSubject(ALL_SUBJECTS); }}>Clear filters</Button>
        </div>
      )}
    </div>
  );
}

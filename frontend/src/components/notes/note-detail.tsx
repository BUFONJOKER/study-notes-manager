"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { BackLink, Button, Icon } from "@/components/ui";
import { NoteNotFound } from "./note-not-found";

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function extractHeadings(content: string) {
  const counts = new Map<string, number>();

  return content
    .split("\n")
    .flatMap((line) => {
      const markdownMatch = line.match(/^#{1,3}\s+(.+?)\s*#*\s*$/);
      const numberedMatch = line.match(
        /^\s*\d+[.)]\s+(.+?)\s*$/,
      );

      const title = markdownMatch?.[1] ?? numberedMatch?.[1];

      if (!title) return [];

      const slug = slugifyHeading(title);
      const count = counts.get(slug) ?? 0;
      counts.set(slug, count + 1);

      return [
        {
          title: title.trim(),
          id: count === 0 ? slug : `${slug}-${count}`,
        },
      ];
    });
}
export function NoteDetail({ note_id }: { note_id: string }) {
  const router = useRouter();
  const { getNote, selectNote, requestDelete, requestAi, apiConfigured, notes } = useApp();
  const note = getNote(note_id);

  const headings = useMemo(
    () => extractHeadings(note?.content ?? ""),
    [note?.content],
  );

  useEffect(() => {
    if (note_id) {
      selectNote(note_id);
    }
  }, [note_id, selectNote]);

  if (notes.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-slate-500 animate-pulse bg-[#FAF8F5]">
        Loading note workspace...
      </div>
    );
  }

  if (!note) return <NoteNotFound />;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 px-8 py-8 transition-colors">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Back link */}
        <div className="pt-2">
          <BackLink href={routes.notes} className="text-xs font-medium text-slate-600 hover:text-slate-900">
            Back to all notes
          </BackLink>
        </div>

        {/* Page Title & Meta Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pt-2">
          <div className="space-y-2.5">
            {/* Subject Pill */}
            <div>
              <span className="inline-flex items-center rounded-md bg-[#E8EFE9] px-2.5 py-0.5 text-[11px] font-semibold text-[#2D5A3F]">
                {note.subject || "Biology"}
              </span>
            </div>

            {/* Serif Title */}
            <h1 className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight text-slate-900">
              {note.title}
            </h1>

            {/* Sub-meta */}
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span>{note.note_id}</span>
              <span>|</span>
              <span>Created {note.created_at}</span>
              <span>|</span>
              <span>Updated {note.updated_at}</span>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2.5 pt-1">
            <Button
              variant="secondary"
              icon="edit"
              onClick={() => router.push(routes.editNote(note.note_id))}
              className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs rounded-lg text-xs px-3.5 py-2 font-medium"
            >
              Edit
            </Button>
            <Button
              variant="secondary"
              icon="trash"
              onClick={() => requestDelete(note)}
              className="border-slate-200 bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 shadow-2xs rounded-lg text-xs px-3.5 py-2 font-medium"
            >
              Delete
            </Button>
            <Button
              icon="sparkle"
              onClick={() => requestAi(note_id)}
              className="bg-[#1B4332] hover:bg-[#133024] text-white shadow-2xs rounded-lg px-4 py-2 text-xs font-semibold"
            >
              Generate quiz
            </Button>
          </div>
        </div>

        {/* Main Grid Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 items-start">

          {/* Main Paper Note Card */}
          <article className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-8 sm:p-12 shadow-2xs space-y-8">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              STUDY NOTE
            </div>

            {/* Rendered Markdown Body using Tailwind Typography (prose) */}
            <div
              id="note-overview"
              className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-sans text-[15px]"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children, ...props }) => (
                    <h1 id={slugifyHeading(String(children))} {...props}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }) => (
                    <h2 id={slugifyHeading(String(children))} {...props}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3 id={slugifyHeading(String(children))} {...props}>
                      {children}
                    </h3>
                  ),
                }}
              >
                {note.content}
              </ReactMarkdown>
            </div>

            {/* Bottom API Key Banner */}
            <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl bg-[#EBEFEA] p-5">
              <div className="flex items-center gap-3.5">
                <div className="rounded-lg bg-white p-2 text-slate-700 shadow-2xs border border-slate-200/60">
                  <Icon name={apiConfigured ? "sparkle" : "lock"} size={16} />
                </div>
                <div>
                  <strong className="block text-slate-900 text-xs font-bold">
                    {apiConfigured ? "Ready to check your understanding?" : "OpenAI API key required"}
                  </strong>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {apiConfigured ? "Generate custom AI practice questions from this note." : "Configure a valid key before using AI study tools."}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => requestAi(note_id)}
                className="bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80 shadow-2xs whitespace-nowrap rounded-lg text-xs font-semibold px-3.5 py-1.5"
              >
                {apiConfigured ? "Create quiz" : "Set up AI"}
              </Button>
            </div>
          </article>

          {/* Right Sidebar */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            <div className="space-y-6 pl-2">

              {/* On This Page Section */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  ON THIS PAGE
                </span>

                <nav className="flex flex-col space-y-1 text-xs font-medium">
                  <a
                    href="#note-overview"
                    className="rounded-md px-3 py-2 text-[#1B4332] bg-[#E8EFE9] font-semibold"
                  >
                    Overview
                  </a>

                  {headings.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className="rounded-md px-3 py-2 text-slate-500 hover:bg-[#E8EFE9] hover:text-[#1B4332] transition"
                    >
                      {heading.title}
                    </a>
                  ))}

                  {headings.length === 0 && (
                    <p className="px-3 py-2 text-slate-400">
                      No headings in this note yet.
                    </p>
                  )}
                </nav>
              </div>

              {/* Quiz Status Card */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="text-emerald-700 mt-0.5">
                    <Icon name="check" size={16} />
                  </div>
                  <div className="space-y-1">
                    <strong className="text-xs font-bold block text-slate-900">
                      Quiz available
                    </strong>
                    <p className="text-[11px] text-slate-500">10 questions generated</p>
                    <button
                      onClick={() => router.push(`/quiz`)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4332] hover:underline pt-1"
                    >
                      View quiz <Icon name="chevron" size={12} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
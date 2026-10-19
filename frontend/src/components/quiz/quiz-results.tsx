
"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import {
  BackLink,
  Badge,
  Button,
  Icon,
  PageHeading,
} from "@/components/ui";

function parseQuiz(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "string") return item;

      if (item && typeof item === "object") {
        const question = item as Record<string, unknown>;

        return String(
          question.question ??
            question.text ??
            question.content ??
            JSON.stringify(item),
        );
      }

      return String(item);
    }).filter(Boolean);
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parseQuiz(parsed);
    }
  } catch {
    // The quiz may be plain text rather than JSON.
  }

  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:\d+[.)]|[-*])\s*/, "").trim())
    .filter(Boolean);
}

export function QuizResults() {
  const { selectedNote, requestAi, apiConfigured } = useApp();

  const [copied, setCopied] = useState(false);
  const [copiedQuestion, setCopiedQuestion] = useState<number | null>(null);
  const [copyError, setCopyError] = useState(false);

  const questions = useMemo(
    () => parseQuiz(selectedNote?.quiz),
    [selectedNote?.quiz],
  );

  const noteTitle = selectedNote?.title ?? "Study quiz";
  const subject = selectedNote?.subject ?? "General";

  const quizText = useMemo(
    () =>
      [
        noteTitle,
        `Subject: ${subject}`,
        "",
        ...questions.map((question, index) => `${index + 1}. ${question}`),
      ].join("\n"),
    [noteTitle, subject, questions],
  );

  async function copyText(text: string, questionIndex?: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyError(false);

      if (questionIndex === undefined) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      } else {
        setCopiedQuestion(questionIndex);
        window.setTimeout(() => setCopiedQuestion(null), 1800);
      }
    } catch {
      setCopyError(true);
    }
  }

  function exportQuiz() {
    const blob = new Blob([quizText], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${noteTitle.replace(/[^a-z0-9-_ ]/gi, "").trim() || "study-quiz"}.txt`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  if (!selectedNote) {
    return (
      <div className={cn("page")}>
        <BackLink href={routes.notes}>Return to notes</BackLink>

        <section className="panel mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <Icon name="book" size={28} />
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            No note selected
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Open a note to view its generated quiz.
          </p>
          <div className="mt-5">
            <Button onClick={() => window.location.assign(routes.notes)}>
              Browse notes
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={cn("page quiz-page")}>
      <BackLink href={routes.note(selectedNote.note_id)}>
        Return to note
      </BackLink>

      <PageHeading
        eyebrow="Study quiz"
        title={noteTitle}
        description={`${questions.length} practice ${
          questions.length === 1 ? "question" : "questions"
        } · ${subject}`}
      >
        <Button
          variant="secondary"
          icon={copied ? "check" : "copy"}
          disabled={!questions.length}
          onClick={() => void copyText(quizText)}
        >
          {copied ? "Copied!" : "Copy all"}
        </Button>

        <Button
          variant="secondary"
          icon="download"
          disabled={!questions.length}
          onClick={exportQuiz}
        >
          Export
        </Button>

        <Button
          icon={apiConfigured ? "refresh" : "lock"}
          disabled={!apiConfigured}
          onClick={() => void requestAi(selectedNote.note_id)}
        >
          Regenerate
        </Button>
      </PageHeading>

      {copyError && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
        >
          Copy failed. Please allow clipboard access and try again.
        </p>
      )}

      <div className={cn("quiz-layout")}>
        <main className="min-w-0 space-y-6">
          {selectedNote.analysis_result && (
            <section className="summary-card panel rounded-2xl border border-indigo-200/70 bg-indigo-50/70 p-5 dark:border-indigo-900/70 dark:bg-indigo-950/30 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/70 dark:text-indigo-300">
                  <Icon name="sparkle" size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <span className="eyebrow text-indigo-700 dark:text-indigo-300">
                    Analysis summary
                  </span>

                  <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Key findings
                  </h2>

                  <div className="mt-4 space-y-4 text-sm leading-6 text-slate-700 dark:text-slate-300">
                    {(
                      [
                        ["Main theme", selectedNote.analysis_result.main_theme],
                        ["Key points", selectedNote.analysis_result.key_points],
                        ["Critical insights", selectedNote.analysis_result.critical_insights],
                        ["Interconnections", selectedNote.analysis_result.interconnections],
                        ["Practical applications", selectedNote.analysis_result.practical_applications],
                      ] as const
                    ).map(([label, value]) =>
                      value ? (
                        <div key={label}>
                          <h3 className="mb-1 font-semibold text-slate-900 dark:text-slate-100">
                            {label}
                          </h3>
                          <p>{String(value)}</p>
                        </div>
                      ) : null,
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="questions panel rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="questions-head mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="eyebrow text-slate-500 dark:text-slate-400">
                  Practice set
                </span>
                <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Your questions
                </h2>
              </div>

              <Badge tone="mint">
                {questions.length}{" "}
                {questions.length === 1 ? "question" : "questions"}
              </Badge>
            </div>

            {questions.length ? (
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <article
                    className="question group flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20 sm:gap-4"
                    key={`${index}-${question}`}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-semibold tabular-nums text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <p className="min-w-0 flex-1 pt-1 text-sm leading-6 text-slate-800 dark:text-slate-200">
                      {question}
                    </p>

                    <button
                      type="button"
                      aria-label={`Copy question ${index + 1}`}
                      title="Copy question"
                      onClick={() => void copyText(question, index)}
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-indigo-100 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-indigo-950 dark:hover:text-indigo-300"
                    >
                      <Icon
                        name={copiedQuestion === index ? "check" : "copy"}
                        size={17}
                      />
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center dark:border-slate-700 dark:bg-slate-950/50">
                <Icon name="book" size={26} />
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-slate-100">
                  No quiz questions yet
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Generate a quiz from this note to see your practice questions
                  here.
                </p>
                <div className="mt-4">
                  <Button
                    disabled={!apiConfigured}
                    onClick={() => void requestAi(selectedNote.note_id)}
                  >
                    Generate quiz
                  </Button>
                </div>
              </div>
            )}
          </section>
        </main>

        <aside className={cn("quiz-aside space-y-5")}>
          <section className="panel concept-card rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/20">
            <span className="eyebrow text-emerald-700 dark:text-emerald-300">
              Key concepts
            </span>
            <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
              What to review
            </h3>

            {selectedNote.key_concepts?.length ? (
              <div className="concepts mt-4 flex flex-wrap gap-2">
                {selectedNote.key_concepts.map((concept) => (
                  <span
                    key={concept}
                    className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                No key concepts are available for this note.
              </p>
            )}
          </section>

          <section className="panel generated-summary rounded-2xl border border-amber-200/70 bg-amber-50/60 p-5 dark:border-amber-900/60 dark:bg-amber-950/20">
            <span className="eyebrow text-amber-700 dark:text-amber-300">
              Generated summary
            </span>
            <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
              In a nutshell
            </h3>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
              {selectedNote.summary_result ||
                "No summary has been generated for this note yet."}
            </p>
          </section>

          <div className="quiz-actions-card flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-5 dark:border-sky-900/60 dark:bg-sky-950/25">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900/70 dark:text-sky-300">
              <Icon name="book" size={20} />
            </div>

            <div>
              <strong className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Saved to your note
              </strong>
              <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-400">
                Your quiz is associated with this note. Return to it whenever
                you want to study.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}


"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/app-context";

function formatNodeName(node: string): string {
  return node
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function QuizProgress() {
  const params = useParams<{ noteId: string }>();
  const router = useRouter();

  const noteId = Array.isArray(params.noteId)
    ? params.noteId[0]
    : params.noteId;

  const {
    getNote,
    quizStatus,
    quizProgress,
    quizError,
    quizResult,
    generateQuiz,
    cancelQuizGeneration,
    resetQuizState,
  } = useApp();

  const startedForRef = useRef<string | null>(null);

  const note = getNote(noteId);
  const isGenerating = quizStatus === "generating";
  const isCompleted = quizStatus === "completed";
  const hasError = quizStatus === "error";

  // Start generation when this page opens for a new note.
  useEffect(() => {
    if (!noteId || startedForRef.current === noteId) return;

    startedForRef.current = noteId;

    void generateQuiz(noteId);
  }, [noteId, generateQuiz]);

  function retryGeneration() {
    resetQuizState();
    startedForRef.current = noteId;
    void generateQuiz(noteId);
  }

  function cancelAndGoBack() {
    cancelQuizGeneration();
    router.back();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-8 text-sm text-muted-foreground transition hover:text-foreground"
      >
        ← Back
      </button>

      <section className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-start gap-4">
          <div
            className={[
              "flex size-12 shrink-0 items-center justify-center rounded-xl",
              isCompleted
                ? "bg-green-100 text-green-700"
                : hasError
                  ? "bg-red-100 text-red-700"
                  : "bg-primary/10 text-primary",
            ].join(" ")}
          >
            {isCompleted ? (
              <span className="text-2xl" aria-hidden="true">
                ✓
              </span>
            ) : hasError ? (
              <span className="text-xl" aria-hidden="true">
                !
              </span>
            ) : (
              <span className="text-2xl" aria-hidden="true">
                ✦
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isCompleted
                ? "Quiz generated"
                : hasError
                  ? "Generation failed"
                  : "Generating your quiz"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {note
                ? `Creating a quiz from "${note.title}".`
                : "Preparing your study quiz."}
            </p>
          </div>
        </div>

        {isGenerating && (
          <div
            className="mb-6 flex items-center gap-3 rounded-lg bg-muted/60 p-4"
            role="status"
            aria-live="polite"
          >
            <span
              className="size-5 animate-spin rounded-full border-2 border-current border-r-transparent"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium">
                {quizProgress.node
                  ? formatNodeName(quizProgress.node)
                  : "Connecting to the workflow"}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Waiting for the next workflow update…
              </p>
            </div>
          </div>
        )}

        {quizProgress.history.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-semibold">
              Workflow activity
            </h2>

            <ol className="space-y-3">
              {quizProgress.history.map((node, index) => {
                const isCurrent = node === quizProgress.node;

                return (
                  <li
                    key={`${node}-${index}`}
                    className="flex items-center gap-3"
                  >
                    <span
                      className={[
                        "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        isCurrent && isGenerating
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      {index + 1}
                    </span>

                    <span
                      className={
                        isCurrent
                          ? "font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {formatNodeName(node)}
                    </span>

                    {isCurrent && isGenerating && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        Running
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {hasError && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800"
          >
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-1">
              {quizError ?? "Quiz generation failed. Please try again."}
            </p>
          </div>
        )}

        {isCompleted && (
          <div
            role="status"
            className="mb-6 rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-800"
          >
            <p className="font-semibold">
              Your quiz has been generated successfully.
            </p>
            <p className="mt-1">
              The backend has sent its completion event.
            </p>
          </div>
        )}

        {quizStatus === "cancelled" && (
          <p className="mb-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            Quiz generation was cancelled.
          </p>
        )}

        <div className="flex flex-wrap gap-3 border-t pt-6">
          {isGenerating && (
            <button
              type="button"
              onClick={cancelAndGoBack}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Cancel generation
            </button>
          )}

          {(hasError || quizStatus === "cancelled") && (
            <button
              type="button"
              onClick={retryGeneration}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Try again
            </button>
          )}

          {isCompleted && (
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Back to notes
            </button>
          )}
        </div>

        {isCompleted && quizResult && (
          <details className="mt-6 rounded-lg border p-4">
            <summary className="cursor-pointer text-sm font-medium">
              View completion data
            </summary>

            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap wrap-break-word text-xs">
              {JSON.stringify(quizResult, null, 2)}
            </pre>
          </details>
        )}
      </section>
    </main>
  );
}

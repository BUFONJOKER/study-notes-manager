"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/cn";
import { Badge, Icon } from "@/components/ui";

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

  // Auto-redirect to results after completion
  useEffect(() => {
    if (isCompleted) {
      const timer = setTimeout(() => {
        router.push("/quiz/results");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, router]);

  function retryGeneration() {
    resetQuizState();
    startedForRef.current = noteId;
    void generateQuiz(noteId);
  }

  function cancelAndGoBack() {
    cancelQuizGeneration();
    router.back();
  }

  // Define fallback stages list matched to workflow or default progression
  const defaultStages = [
    ["Analyzing note", "Reading structure and context"],
    ["Creating summary", "Condensing the core ideas"],
    ["Extracting key concepts", "Finding important terms"],
    ["Generating questions", "Building your practice set"],
  ];

  // Calculate stage index based on history length or completion
  const currentStageIndex = isCompleted
    ? 4
    : Math.min(3, Math.max(0, quizProgress.history.length - 1));

  return (
    <div className={cn("page progress-page")}>
      <button
        type="button"
        className={cn("back-link")}
        onClick={cancelAndGoBack}
      >
        <Icon name="arrow" size={17} /> {isGenerating ? "Cancel and return to note" : "← Back"}
      </button>

      <div className={cn("progress-card panel")}>
        <div className={cn("orb")}>
          <Icon name="sparkle" size={31} />
          <span />
          <span />
        </div>

        <Badge tone="mint">AI quiz generator</Badge>

        <h1>
          {isCompleted
            ? "Your quiz is ready"
            : hasError
              ? "Generation failed"
              : "Creating your study quiz"}
        </h1>

        <p>
          {hasError
            ? (quizError ?? "An error occurred during generation.")
            : note
              ? <>Turning <strong>{note.title}</strong> into focused practice questions.</>
              : "Preparing your study quiz."}
        </p>

        {/* Progress bar */}
        <div className={cn("progress-meter")}>
          <span style={{ width: `${isCompleted ? 100 : Math.min(95, (currentStageIndex + 0.45) * 25)}%` }} />
        </div>

        <div className={cn("progress-label")}>
          <span>
            {isCompleted
              ? "Complete"
              : hasError
                ? "Failed"
                : `${Math.round((currentStageIndex + 0.45) * 25)}% complete`}
          </span>
          <span>Usually takes less than a minute</span>
        </div>

        {/* Stages breakdown */}
        <div className={cn("stage-list")}>
          {defaultStages.map(([title, desc], i) => {
            const isDone = isCompleted || i < currentStageIndex;
            const isCurrent = !isCompleted && i === currentStageIndex && isGenerating;

            return (
              <div
                className={cn(`stage ${isDone ? "done" : isCurrent ? "current" : ""}`)}
                key={title}
              >
                <span className={cn("stage-status")}>
                  {isDone ? <Icon name="check" size={16} /> : isCurrent ? <i /> : i + 1}
                </span>
                <div>
                  <strong>{title}</strong>
                  <small>{isCurrent ? desc : isDone ? "Complete" : "Waiting"}</small>
                </div>
                {isCurrent && <span className={cn("working")}>Working…</span>}
              </div>
            );
          })}
        </div>

        {/* Error state alert box */}
        {hasError && (
          <div role="alert" className="mt-4 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-1">{quizError ?? "Quiz generation failed. Please try again."}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-6 flex flex-wrap gap-3 border-t pt-6">
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
              onClick={() => router.push("/quiz")}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 active:scale-[0.98]"
            >
              View quiz results →
            </button>
          )}
        </div>

        <div className={cn("progress-note")}>
          <Icon name="sparkle" size={16} />
          <span>You can leave this screen. We’ll save the quiz to your note when it’s ready.</span>
        </div>
      </div>
    </div>
  );
}
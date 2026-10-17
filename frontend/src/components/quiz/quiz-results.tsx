"use client";

import { useState } from "react";
import { useApp } from "@/context/app-context";
import { keyConcepts, quizQuestions } from "@/data/quiz";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { BackLink, Badge, Button, Icon, PageHeading } from "@/components/ui";

export function QuizResults() {
  const { selectedNote, requestAi, apiConfigured } = useApp();
  const [copied, setCopied] = useState(false);

  return (
    <div className={cn("page quiz-page")}>
      <BackLink href={selectedNote ? routes.note(selectedNote.note_id) : routes.notes}>Return to note</BackLink>
      <PageHeading
        eyebrow="Quiz generated successfully"
        title="Cellular Respiration & Energy"
        description="10 practice questions • Biology • Generated just now"
      >
        <Button
          variant="secondary"
          icon={copied ? "check" : "copy"}
          onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }}
        >
          {copied ? "Copied" : "Copy all"}
        </Button>
        <Button variant="secondary" icon="download">Export</Button>
        <Button icon={apiConfigured ? "refresh" : "lock"} onClick={() => selectedNote?.note_id && requestAi(selectedNote.note_id)}>Regenerate</Button>
      </PageHeading>

      <div className={cn("quiz-layout")}>
        <main>
          <section className={cn("summary-card panel")}>
            <div className={cn("summary-icon")}><Icon name="sparkle" /></div>
            <div>
              <span className={cn("eyebrow")}>Analysis summary</span>
              <h2>Aerobic energy production</h2>
              <p>{selectedNote?.analysis_result?.critical_insights}</p>
              <p>{selectedNote?.analysis_result?.interconnections}</p>
              <p>{selectedNote?.analysis_result?.key_points}</p>
              <p>{selectedNote?.analysis_result?.main_theme}</p>
              <p>{selectedNote?.analysis_result?.practical_applications}</p>
            </div>
          </section>

          <section className={cn("questions panel")}>
            <div className={cn("questions-head")}>
              <div>
                <span className={cn("eyebrow")}>Practice set</span>
                <h2>Generated questions</h2>
              </div>
              <Badge tone="mint">10 questions</Badge>
            </div>
            {selectedNote?.quiz?.map((q, i) => (
              <div className={cn("question")} key={q}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <p>{q}</p>
                <button aria-label={`Copy question ${i + 1}`}><Icon name="copy" size={17} /></button>
              </div>
            ))}
          </section>
        </main>

        <aside className={cn("quiz-aside")}>
          <section className={cn("panel concept-card")}>
            <span className={cn("eyebrow")}>Key concepts</span>
            <h3>What to review</h3>
            <div className={cn("concepts")}>
              {selectedNote?.key_concepts?.map((x) => <span key={x}>{x}</span>)}
            </div>
          </section>
          <section className={cn("panel generated-summary")}>
            <span className={cn("eyebrow")}>Generated summary</span>
            <h3>In a nutshell</h3>
            <p>{selectedNote?.summary_result}</p>
          </section>
          <div className={cn("quiz-actions-card")}>
            <Icon name="book" />
            <div>
              <strong>Saved to your note</strong>
              <p>You can return to this quiz anytime.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/app-context";
import { quizStages } from "@/data/quiz";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { BackLink, Badge, Icon } from "@/components/ui";

export function QuizProgress() {
  const router = useRouter();
  const { selectedNote } = useApp();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setStage((s) => (s < 4 ? s + 1 : s)), 900);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (stage !== 4) return;
    const done = setTimeout(() => router.push(routes.quiz), 700);
    return () => clearTimeout(done);
  }, [stage, router]);

  const percent = Math.round((stage + 0.45) * 25);

  return (
    <div className={cn("page progress-page")}>
      <BackLink href={selectedNote ? routes.note(selectedNote.note_id) : routes.notes}>Cancel and return to note</BackLink>
      <div className={cn("progress-card panel")}>
        <div className={cn("orb")}>
          <Icon name="sparkle" size={31} />
          <span />
          <span />
        </div>
        <Badge tone="mint">AI quiz generator</Badge>
        <h1>{stage === 4 ? "Your quiz is ready" : "Creating your study quiz"}</h1>
        <p>Turning <strong>Cellular Respiration & Energy</strong> into focused practice questions.</p>
        <div className={cn("progress-meter")}>
          <span style={{ width: `${Math.min(100, (stage + 0.45) * 25)}%` }} />
        </div>
        <div className={cn("progress-label")}>
          <span>{stage === 4 ? "Complete" : `${percent}% complete`}</span>
          <span>Usually takes less than a minute</span>
        </div>
        <div className={cn("stage-list")}>
          {quizStages.map(([title, desc], i) => (
            <div className={cn(`stage ${i < stage ? "done" : i === stage ? "current" : ""}`)} key={title}>
              <span className={cn("stage-status")}>
                {i < stage ? <Icon name="check" size={16} /> : i === stage ? <i /> : i + 1}
              </span>
              <div>
                <strong>{title}</strong>
                <small>{i === stage ? desc : i < stage ? "Complete" : "Waiting"}</small>
              </div>
              {i === stage && <span className={cn("working")}>Working…</span>}
            </div>
          ))}
        </div>
        <div className={cn("progress-note")}>
          <Icon name="sparkle" size={16} />
          <span>You can leave this screen. We’ll save the quiz to your note when it’s ready.</span>
        </div>
      </div>
    </div>
  );
}

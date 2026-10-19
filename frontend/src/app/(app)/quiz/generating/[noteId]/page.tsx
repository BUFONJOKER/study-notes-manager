import type { Metadata } from "next";
import { QuizProgress } from "@/components/quiz/quiz-progress";

export const metadata: Metadata = { title: "Generating quiz" };

export default function QuizGeneratingPage() {
  return <QuizProgress />;
}

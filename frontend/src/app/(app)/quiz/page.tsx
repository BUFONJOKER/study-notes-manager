import type { Metadata } from "next";
import { QuizResults } from "@/components/quiz/quiz-results";

export const metadata: Metadata = { title: "Quiz results" };

export default function QuizPage() {
  return <QuizResults />;
}

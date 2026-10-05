"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Copy,
  Download,
  Lock,
  Sparkles,
  BookmarkCheck,
  Check,
} from "lucide-react";

interface QuestionItem {
  id: string;
  number: string;
  text: string;
}

const QUESTIONS: QuestionItem[] = [
  {
    id: "q1",
    number: "01",
    text: "What is the primary purpose of cellular respiration in living cells?",
  },
  {
    id: "q2",
    number: "02",
    text: "Where in the cell does glycolysis occur, and does it require oxygen?",
  },
  {
    id: "q3",
    number: "03",
    text: "What are the net products generated from one glucose molecule during glycolysis?",
  },
  {
    id: "q4",
    number: "04",
    text: "How does pyruvate prepare to enter the citric acid cycle?",
  },
];

const KEY_CONCEPTS = [
  "ATP",
  "Glycolysis",
  "Pyruvate",
  "NADH",
  "Citric acid cycle",
  "Electron transport chain",
  "Proton gradient",
  "ATP synthase",
  "Oxygen",
];

export default function Page() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyQuestion = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCopyAll = () => {
    const allText = QUESTIONS.map((q) => `${q.number}. ${q.text}`).join("\n\n");
    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Back Link */}
      <Link
        href="/notes"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#51605a] transition-colors hover:text-[#18231f]"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Return to note</span>
      </Link>

      {/* Heading & Top Actions */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#1f5b45]">
            Quiz generated successfully
          </span>
          <h1 className="mt-1 font-serif text-[38px] font-semibold leading-tight tracking-[-0.02em] text-[#18231f]">
            Cellular Respiration &amp; Energy
          </h1>
          <p className="mt-1.5 text-xs text-[#51605a]">
            10 practice questions • Biology • Generated just now
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyAll}
            className="flex items-center gap-2 rounded-xl border border-[#dde4df] bg-white px-4 py-2.5 text-xs font-semibold text-[#18231f] shadow-xs transition-colors hover:bg-[#fafbf9]"
          >
            {copiedAll ? (
              <Check className="h-3.5 w-3.5 text-[#1f5b45]" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-[#78847f]" />
            )}
            <span>{copiedAll ? "Copied" : "Copy all"}</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-[#dde4df] bg-white px-4 py-2.5 text-xs font-semibold text-[#18231f] shadow-xs transition-colors hover:bg-[#fafbf9]"
          >
            <Download className="h-3.5 w-3.5 text-[#78847f]" />
            <span>Export</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-[#1f5b45] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#174b38]"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* Two-Column Grid: Questions vs Review Sidebar */}
      <div className="grid grid-cols-12 gap-5 items-start">
        {/* Left Side: Analysis Card & Questions Set */}
        <div className="col-span-8 space-y-5">
          {/* Analysis Summary Card */}
          <div className="flex items-start gap-4 rounded-2xl border border-[#dde4df] bg-white p-5 shadow-xs">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e9e2f2] text-[#7c629b]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#78847f]">
                Analysis summary
              </span>
              <h2 className="mt-0.5 font-serif text-xl font-semibold text-[#18231f]">
                Aerobic energy production
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#51605a]">
                This note explains how cells convert glucose into ATP through
                three connected stages: glycolysis, the citric acid cycle, and
                oxidative phosphorylation. It emphasizes energy carriers,
                location, and oxygen&apos;s essential role.
              </p>
            </div>
          </div>

          {/* Generated Questions List */}
          <div className="overflow-hidden rounded-2xl border border-[#dde4df] bg-white shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e9eeeb] px-6 py-4">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#78847f]">
                  Practice set
                </span>
                <h2 className="mt-0.5 text-sm font-semibold text-[#18231f]">
                  Generated questions
                </h2>
              </div>
              <span className="rounded-full bg-[#dcefe5] px-2.5 py-0.5 text-[10px] font-semibold text-[#32694f]">
                10 questions
              </span>
            </div>

            {/* Questions list */}
            <div className="divide-y divide-[#e9eeeb]">
              {QUESTIONS.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#fafbf9]"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#e8f1ec] text-[11px] font-bold text-[#1f5b45]">
                    {item.number}
                  </span>
                  <p className="flex-1 text-xs leading-relaxed text-[#18231f]">
                    {item.text}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyQuestion(item.id, item.text)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#78847f] hover:bg-[#e8f1ec] hover:text-[#1f5b45] transition-colors"
                  >
                    {copiedId === item.id ? (
                      <Check className="h-4 w-4 text-[#1f5b45]" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Key Concepts & Summary */}
        <aside className="col-span-4 space-y-4">
          {/* Key Concepts Card */}
          <div className="rounded-2xl border border-[#dde4df] bg-white p-5 shadow-xs">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#78847f]">
              Key concepts
            </span>
            <h3 className="mt-0.5 font-serif text-lg font-semibold text-[#18231f]">
              What to review
            </h3>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {KEY_CONCEPTS.map((concept) => (
                <span
                  key={concept}
                  className="rounded-lg bg-[#e8f1ec] px-2.5 py-1 text-[11px] font-medium text-[#1f5b45]"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>

          {/* Generated Summary Card */}
          <div className="rounded-2xl border border-[#dde4df] bg-white p-5 shadow-xs">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#78847f]">
              Generated summary
            </span>
            <h3 className="mt-0.5 font-serif text-lg font-semibold text-[#18231f]">
              In a nutshell
            </h3>
            <p className="mt-3 text-xs leading-relaxed text-[#51605a]">
              Glucose is gradually oxidized to transfer energy into ATP.
              Glycolysis begins the process; the citric acid cycle loads electron
              carriers; and the electron transport chain uses those electrons to
              power most ATP production.
            </p>
          </div>

          {/* Saved to Note Callout */}
          <div className="flex items-start gap-3 rounded-2xl bg-[#e9e2f2]/60 p-4">
            <BookmarkCheck className="h-5 w-5 shrink-0 text-[#7c629b]" />
            <div>
              <strong className="block text-xs font-semibold text-[#18231f]">
                Saved to your note
              </strong>
              <p className="mt-0.5 text-[11px] leading-tight text-[#51605a]">
                You can return to this quiz anytime.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import {
  BookOpen,
  LayoutDashboard,
  FileText,
  Sparkles,
  KeyRound,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import ApiKeyModal from "./ApiKeyModal";
import { usePathname } from "next/navigation";
import Link from "next/link";

const SUBJECTS = [
  { name: "Biology", count: 4, dot: "bg-[#67a789]" },
  { name: "History", count: 3, dot: "bg-[#d6a64f]" },
  { name: "Chemistry", count: 2, dot: "bg-[#9b7db9]" },
  { name: "Mathematics", count: 2, dot: "bg-[#6f9fc4]" },
];

export function Sidebar() {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);
  const pathname = usePathname();
  const isDashboardActive = pathname === "/dashboard";
  const isNotesActive = pathname.startsWith("/dashboard/notes");
  const isQuizActive = pathname.startsWith("/dashboard/quiz");

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 flex w-65 flex-col border-r border-[#dde4df] bg-[#f1f3ee] p-5">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#1f5b45] text-white">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <strong className="block font-serif text-lg leading-tight text-[#18231f]">
              Noteflow
            </strong>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#78847f]">
              Study Workspace
            </span>
          </div>
        </div>

        {/* Main Nav */}
        <nav className="mt-8 space-y-1">
          <Link
            href="/dashboard"
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              isDashboardActive
                ? "bg-[#e2e9e3] font-semibold text-[#1f5b45]"
                : "text-[#51605a] hover:bg-[#e2e9e3] hover:text-[#1f5b45]"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/dashboard/notes"
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              isNotesActive
                ? "bg-[#e2e9e3] font-semibold text-[#1f5b45]"
                : "text-[#51605a] hover:bg-[#e2e9e3] hover:text-[#1f5b45]"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>All notes</span>
            <span className="ml-auto rounded-full bg-white/70 px-2 py-0.5 text-xs text-[#18231f]">
              12
            </span>
          </Link>

          <Link
            href="/dashboard/quiz"
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              isQuizActive
                ? "bg-[#e2e9e3] font-semibold text-[#1f5b45]"
                : "text-[#51605a] hover:bg-[#e2e9e3] hover:text-[#1f5b45]"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Quiz library</span>
          </Link>
        </nav>

        {/* Subjects */}
        <div className="mt-8 px-2">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#78847f]">
            Subjects
          </span>
          <div className="mt-2 space-y-1">
            {SUBJECTS.map((s) => (
              <button
                key={s.name}
                className="flex w-full items-center gap-3 rounded-lg px-1 py-1.5 text-xs font-medium text-[#51605a] hover:text-[#1f5b45]"
              >
                <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                <span>{s.name}</span>
                <span className="ml-auto text-[11px] text-[#78847f]">
                  {s.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Connect API Card */}
        <div className="mt-auto rounded-2xl border border-[#e1d8c6] bg-[#faf6ed] p-4">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#dcefe5] text-[#1f5b45]">
            <KeyRound className="h-4 w-4" />
          </div>
          <strong className="mt-2.5 block text-xs font-semibold text-[#18231f]">
            Connect OpenAI
          </strong>
          <p className="mt-1 text-[11px] leading-relaxed text-[#78847f]">
            Add an API key to generate quizzes.
          </p>
          <button
            type="button"
            onClick={() => setIsApiKeyModalOpen(true)}
            className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#1f5b45] hover:underline"
          >
            <span>Set up API key</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* User Footer */}
        <div className="mt-4 flex items-center gap-3 border-t border-[#dde4df] pt-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#b56f53] text-xs font-bold text-white">
            AM
          </span>
          <div className="min-w-0 flex-1">
            <strong className="block truncate text-xs font-medium text-[#18231f]">
              Alex Morgan
            </strong>
            <small className="block truncate text-[10px] text-[#78847f]">
              @alexm
            </small>
          </div>
          <MoreHorizontal className="h-4 w-4 text-[#78847f]" />
        </div>
      </aside>
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSuccess={() => setIsApiKeyConfigured(true)}
        isConfigured={isApiKeyConfigured}
      />
    </>
  );
}

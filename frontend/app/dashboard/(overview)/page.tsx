"use client";

import {
  FileText,
  BookOpen,
  Sparkles,
  Clock,
  Lock,
  Plus,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ApiKeyModal from "@/app/components/ApiKeyModal";

const STATS = [
  {
    label: "Total notes",
    value: "12",
    subtext: "+3 this month",
    icon: FileText,
    iconBg: "bg-[#dcefe5] text-[#1f5b45]",
  },
  {
    label: "Subjects",
    value: "5",
    subtext: "Across this semester",
    icon: BookOpen,
    iconBg: "bg-[#f5ead0] text-[#a27624]",
  },
  {
    label: "Generated quizzes",
    value: "8",
    subtext: "+2 this week",
    icon: Sparkles,
    iconBg: "bg-[#e9e2f2] text-[#7c629b]",
  },
  {
    label: "Recently updated",
    value: "4",
    subtext: "In the last 7 days",
    icon: Clock,
    iconBg: "bg-[#dfeaf3] text-[#4c7c9f]",
  },
];

const RECENT_NOTES = [
  {
    id: "1",
    title: "Cellular Respiration & Energy",
    badge: "Biology",
    badgeStyle: "bg-[#dcefe5] text-[#32694f]",
    iconStyle: "bg-[#dcefe5] text-[#32694f]",
    date: "Today, 10:24 AM",
    quizReady: true,
  },
  {
    id: "2",
    title: "The Industrial Revolution",
    badge: "History",
    badgeStyle: "bg-[#f5ead0] text-[#84611e]",
    iconStyle: "bg-[#f5ead0] text-[#84611e]",
    date: "Yesterday, 4:18 PM",
  },
  {
    id: "3",
    title: "Organic Chemistry: Functional Groups",
    badge: "Chemistry",
    badgeStyle: "bg-[#e9e2f2] text-[#73588c]",
    iconStyle: "bg-[#e9e2f2] text-[#73588c]",
    date: "Sep 20, 2024",
  },
  {
    id: "4",
    title: "Integration Techniques",
    badge: "Mathematics",
    badgeStyle: "bg-[#dfeaf3] text-[#426d8a]",
    iconStyle: "bg-[#dfeaf3] text-[#426d8a]",
    date: "Sep 18, 2024",
  },
];

const BAR_CHART = [
  { day: "M", height: "h-[35%]" },
  { day: "T", height: "h-[65%]" },
  { day: "W", height: "h-[50%]" },
  { day: "T", height: "h-[80%]" },
  { day: "F", height: "h-[60%]" },
  { day: "S", height: "h-[100%]", active: true },
  { day: "S", height: "h-[45%]" },
];

const COURSE_CARDS = [
  {
    code: "BIO",
    title: "Biology",
    notes: "4 notes",
    bg: "bg-[#edf6f0]",
  },
  {
    code: "HIS",
    title: "History",
    notes: "3 notes",
    bg: "bg-[#faf4e7]",
  },
  {
    code: "CHE",
    title: "Chemistry",
    notes: "2 notes",
    bg: "bg-[#f5f1f8]",
  },
  {
    code: "MAT",
    title: "Mathematics",
    notes: "2 notes",
    bg: "bg-[#eff5f8]",
  },
];

export default function Page() {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);
  const [activityRange, setActivityRange] = useState("week");
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-end justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1f5b45]">
            Monday, September 23
          </span>
          <h1 className="mt-1 font-serif text-4xl tracking-tight text-[#18231f]">
            Good morning, Alex
          </h1>
          <p className="mt-1 text-sm text-[#51605a]">
            Here’s what’s happening in your study space.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 rounded-xl border border-[#dde4df] bg-white px-4 py-2.5 text-xs font-semibold text-[#18231f] shadow-xs hover:bg-[#fafbf9]"
            onClick={() => setIsApiKeyModalOpen(true)}
          >
            <Lock className="h-3.5 w-3.5 text-[#78847f]" />
            <span>Generate quiz</span>
          </button>
          <Link
            href="/dashboard/notes/create"
            className="flex items-center gap-2 rounded-xl bg-[#1f5b45] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#174b38] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New note</span>
          </Link>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-start gap-4 rounded-2xl border border-[#dde4df] bg-white p-5 shadow-xs"
            >
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${stat.iconBg}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs text-[#51605a]">{stat.label}</span>
                <strong className="block text-2xl font-bold leading-tight text-[#18231f]">
                  {stat.value}
                </strong>
                <small className="text-[10px] text-[#78847f]">
                  {stat.subtext}
                </small>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Recently Updated & Activity */}
      <div className="grid grid-cols-12 gap-5">
        {/* Recently Updated */}
        <section className="col-span-8 rounded-2xl border border-[#dde4df] bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-[#e9eeeb] px-6 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[#18231f]">
                Recently updated
              </h2>
              <p className="text-[11px] text-[#78847f]">
                Pick up where you left off
              </p>
            </div>
            <Link
              href="/dashboard/notes"
              className="flex items-center gap-1 text-xs font-semibold text-[#1f5b45] hover:underline"
            >
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#e9eeeb]">
            {RECENT_NOTES.map((note) => (
              <div
                key={note.id}
                className="group flex cursor-pointer items-center gap-3 px-6 py-3.5 transition-colors hover:bg-[#fafbf9]"
              >
                <div
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${note.iconStyle}`}
                >
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-xs font-semibold text-[#18231f]">
                    {note.title}
                  </strong>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${note.badgeStyle}`}
                    >
                      {note.badge}
                    </span>
                    <span className="text-[10px] text-[#78847f]">
                      {note.date}
                    </span>
                  </div>
                </div>

                {note.quizReady && (
                  <span className="flex items-center gap-1 rounded-md bg-[#f1ecf6] px-2 py-1 text-[10px] font-semibold text-[#6f558c]">
                    <Sparkles className="h-3 w-3" />
                    Quiz ready
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-[#78847f] opacity-60 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </section>

        {/* Study Activity Chart */}
        <section className="col-span-4 flex flex-col justify-between rounded-2xl border border-[#dde4df] bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-[#e9eeeb] px-6 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[#18231f]">
                Study activity
              </h2>
              <p className="text-[11px] text-[#78847f]">
                Notes updated this week
              </p>
            </div>
            <div className="relative">
              <select
                value={activityRange}
                onChange={(event) => setActivityRange(event.target.value)}
                aria-label="Study activity range"
                className="appearance-none rounded-lg border border-[#dde4df] bg-white py-1 pl-2.5 pr-7 text-[11px] text-[#51605a] outline-hidden focus:border-[#1f5b45]"
              >
                <option value="week">This week</option>
                <option value="month">This month</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#78847f]" />
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="flex h-44 items-end justify-between gap-3 px-6 pb-4 pt-6">
            {BAR_CHART.map((b, idx) => (
              <div
                key={idx}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <div
                  className={`w-full max-w-5 rounded-t-sm transition-all ${b.height} ${
                    b.active ? "bg-[#1f5b45]" : "bg-[#d9e5dd]"
                  }`}
                />
                <span className="text-[10px] font-medium text-[#78847f]">
                  {b.day}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-[#e9eeeb] px-6 py-3 text-[10px] text-[#78847f]">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1f5b45]" />
              <b className="font-semibold text-[#18231f]">8 notes</b> updated
            </span>
            <span>Most active on Saturday</span>
          </div>
        </section>
      </div>

      {/* Your Subjects Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#18231f]">
              Your subjects
            </h2>
            <p className="text-[11px] text-[#78847f]">
              A snapshot of your notes by course
            </p>
          </div>
          <button className="flex items-center gap-1 text-xs font-semibold text-[#1f5b45] hover:underline">
            <span>Manage subjects</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {COURSE_CARDS.map((card) => (
            <div
              key={card.code}
              className={`flex cursor-pointer items-center gap-3 rounded-xl p-3.5 transition-transform hover:-translate-y-0.5 ${card.bg}`}
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-black/5 bg-white/70 text-[10px] font-bold text-[#18231f]">
                {card.code}
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-xs font-semibold text-[#18231f]">
                  {card.title}
                </strong>
                <small className="block text-[10px] text-[#78847f]">
                  {card.notes}
                </small>
              </div>
              <ChevronRight className="h-4 w-4 text-[#78847f]" />
            </div>
          ))}
        </div>
      </section>
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSuccess={() => setIsApiKeyConfigured(true)}
        isConfigured={isApiKeyConfigured}
      />
    </div>
  );
}

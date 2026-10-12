"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ChevronDown,
  FileText,
  Lock,
  Pencil,
  Trash2,
  MoreHorizontal,
} from "lucide-react";

interface NoteItem {
  id: string;
  title: string;
  createdDate: string;
  updatedDate: string;
  subject: string;
  noteIdCode: string;
  badgeStyle: string;
  iconBg: string;
  iconColor: string;
}

const INITIAL_NOTES: NoteItem[] = [
  {
    id: "1",
    title: "Cellular Respiration & Energy",
    createdDate: "Created Sep 18, 2024",
    updatedDate: "Today, 10:24 AM",
    subject: "Biology",
    noteIdCode: "BIO-204-07",
    badgeStyle: "bg-[#dcefe5] text-[#32694f]",
    iconBg: "bg-[#dcefe5]",
    iconColor: "text-[#32694f]",
  },
  {
    id: "2",
    title: "The Industrial Revolution",
    createdDate: "Created Sep 14, 2024",
    updatedDate: "Yesterday, 4:18 PM",
    subject: "History",
    noteIdCode: "HIST-112-03",
    badgeStyle: "bg-[#f5ead0] text-[#84611e]",
    iconBg: "bg-[#f5ead0]",
    iconColor: "text-[#84611e]",
  },
  {
    id: "3",
    title: "Organic Chemistry: Functional Groups",
    createdDate: "Created Sep 10, 2024",
    updatedDate: "Sep 20, 2024",
    subject: "Chemistry",
    noteIdCode: "CHEM-301-12",
    badgeStyle: "bg-[#e9e2f2] text-[#73588c]",
    iconBg: "bg-[#e9e2f2]",
    iconColor: "text-[#73588c]",
  },
  {
    id: "4",
    title: "Integration Techniques",
    createdDate: "Created Sep 8, 2024",
    updatedDate: "Sep 18, 2024",
    subject: "Mathematics",
    noteIdCode: "MATH-220-08",
    badgeStyle: "bg-[#dfeaf3] text-[#426d8a]",
    iconBg: "bg-[#dfeaf3]",
    iconColor: "text-[#426d8a]",
  },
  {
    id: "5",
    title: "Memory & Cognitive Processing",
    createdDate: "Created Sep 2, 2024",
    updatedDate: "Sep 16, 2024",
    subject: "Psychology",
    noteIdCode: "PSY-101-04",
    badgeStyle: "bg-[#f3e1e1] text-[#925858]",
    iconBg: "bg-[#f3e1e1]",
    iconColor: "text-[#925858]",
  },
];

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_NOTES);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.noteIdCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject =
        selectedSubject === "all" ||
        note.subject.toLowerCase() === selectedSubject.toLowerCase();

      return matchesSearch && matchesSubject;
    });
  }, [notes, searchQuery, selectedSubject]);

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Page Title Heading */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[38px] font-semibold leading-tight tracking-[-0.02em] text-[#18231f]">
            All notes
          </h1>
          <p className="mt-1 text-sm text-[#51605a]">
            Search, organize, and manage everything you&apos;re learning.
          </p>
        </div>

        <Link
          href="/dashboard/notes/create"
          className="flex items-center gap-2 rounded-xl bg-[#1f5b45] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#174b38]"
        >
          <Plus className="h-4 w-4" />
          <span>Create note</span>
        </Link>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="grid grid-cols-[1fr_200px_200px] gap-3">
        {/* Search Field */}
        <div className="relative flex h-11 items-center rounded-xl border border-[#dde4df] bg-white px-3.5 shadow-xs focus-within:border-[#1f5b45]">
          <Search className="h-4 w-4 text-[#78847f]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, subject, or note ID..."
            className="ml-2.5 w-full bg-transparent text-xs text-[#18231f] outline-hidden placeholder:text-[#78847f]"
          />
        </div>

        {/* Subject Filter */}
        <div className="relative">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="h-11 w-full appearance-none rounded-xl border border-[#dde4df] bg-white px-3.5 pr-8 text-xs text-[#51605a] outline-hidden shadow-xs focus:border-[#1f5b45]"
          >
            <option value="all">All subjects</option>
            <option value="Biology">Biology</option>
            <option value="History">History</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Psychology">Psychology</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#78847f]" />
        </div>

        {/* Sort Filter */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-11 w-full appearance-none rounded-xl border border-[#dde4df] bg-white px-3.5 pr-8 text-xs text-[#51605a] outline-hidden shadow-xs focus:border-[#1f5b45]"
          >
            <option value="recent">Recently updated</option>
            <option value="oldest">Oldest first</option>
            <option value="alpha">Alphabetical (A-Z)</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#78847f]" />
        </div>
      </div>

      {/* Meta Counter Sub-line */}
      <div className="flex items-center justify-between text-xs text-[#78847f]">
        <span>
          <strong className="font-semibold text-[#18231f]">
            {filteredNotes.length}
          </strong>{" "}
          notes
        </span>
        <span className="text-[11px]">Updated moments ago</span>
      </div>

      {/* Notes Table */}
      <div className="overflow-hidden rounded-2xl border border-[#dde4df] bg-white shadow-xs">
        {/* Table Head */}
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_120px] items-center border-b border-[#dde4df] bg-[#f9faf8] px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[#78847f]">
          <span>Note</span>
          <span>Subject</span>
          <span>Updated</span>
          <span>Note ID</span>
          <span className="text-right">Actions</span>
        </div>

        {/* Table Body Rows */}
        <div className="divide-y divide-[#e9eeeb]">
          {filteredNotes.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#78847f]">
              No notes found matching your criteria.
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className="grid grid-cols-[1.5fr_1fr_1fr_1fr_120px] items-center px-6 py-4 transition-colors hover:bg-[#fafbf9]"
              >
                {/* Note title and date */}
                <div className="flex items-center gap-3 pr-4">
                  <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${note.iconBg} ${note.iconColor}`}
                  >
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/notes/${note.id}`}
                      className="block truncate text-xs font-semibold text-[#18231f] hover:underline"
                    >
                      {note.title}
                    </Link>
                    <span className="block text-[10px] text-[#78847f]">
                      {note.createdDate}
                    </span>
                  </div>
                </div>

                {/* Subject badge */}
                <div>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${note.badgeStyle}`}
                  >
                    {note.subject}
                  </span>
                </div>

                {/* Updated timestamp */}
                <span className="text-xs text-[#78847f]">
                  {note.updatedDate}
                </span>

                {/* Note ID Code */}
                <div>
                  <span className="rounded bg-[#f2f4f2] px-2 py-1 text-[11px] font-medium text-[#51605a]">
                    {note.noteIdCode}
                  </span>
                </div>

                {/* Action Icons */}
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    title="AI locked"
                    className="grid h-8 w-8 place-items-center rounded-lg text-[#c59032] hover:bg-[#fbf6e9] transition-colors"
                  >
                    <Lock className="h-4 w-4" />
                  </button>

                  <Link
                    href={`/dashboard/notes/${note.id}/edit`}
                    title="Edit note"
                    className="grid h-8 w-8 place-items-center rounded-lg text-[#78847f] hover:bg-[#e8f1ec] hover:text-[#1f5b45] transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(note.id)}
                    title="Delete note"
                    className="grid h-8 w-8 place-items-center rounded-lg text-[#78847f] hover:bg-[#f3e1e1] hover:text-[#b7443d] transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    title="More options"
                    className="grid h-8 w-8 place-items-center rounded-lg text-[#78847f] hover:bg-[#f6f7f3] transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
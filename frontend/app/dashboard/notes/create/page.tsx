"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";

export default function Page() {
  const [username] = useState("alexm");
  const [noteId, setNoteId] = useState("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const handleToolbarClick = (action: string) => {
    switch (action) {
      case "bold":
        setContent((prev) => `${prev}**bold text**`);
        break;
      case "italic":
        setContent((prev) => `${prev}*italic text*`);
        break;
      case "h1":
        setContent((prev) => `${prev}\n# Heading 1\n`);
        break;
      case "bullet":
        setContent((prev) => `${prev}\n• List item`);
        break;
      case "number":
        setContent((prev) => `${prev}\n1. List item`);
        break;
    }
  };

  const handleSave = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    console.log({ username, noteId, title, subject, content });
  };

  return (
    <div className="mx-auto max-w-[970px] pb-16 pt-2">
      {/* Page Header */}
      <div className="mb-7">
        <h1 className="font-serif text-[38px] font-semibold leading-tight tracking-[-0.02em] text-[#18231f]">
          Create a new note
        </h1>
        <p className="mt-1.5 text-sm text-[#51605a]">
          Capture what you&apos;re learning and keep it organized.
        </p>
      </div>

      {/* Main Panel Card */}
      <form
        onSubmit={handleSave}
        className="overflow-hidden rounded-2xl border border-[#dde4df] bg-white shadow-[0_3px_14px_rgba(32,48,41,0.025)]"
      >
        {/* Section 1: Note Details */}
        <section className="border-b border-[#dde4df] p-[26px_30px]">
          <div className="mb-5 flex items-start gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e8f1ec] text-[11px] font-bold text-[#1f5b45]">
              1
            </span>
            <div>
              <h2 className="text-[14px] font-semibold text-[#18231f]">
                Note details
              </h2>
              <p className="text-[11px] text-[#78847f]">
                Give your note a clear title and subject.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#51605a]">
                Username <span className="text-[#b7443d]">*</span>
              </label>
              <input
                type="text"
                value={username}
                readOnly
                className="h-11 w-full rounded-lg border border-[#dde4df] bg-[#f5f6f4] px-3 text-xs text-[#78847f] outline-hidden select-none cursor-default"
              />
            </div>

            {/* Note ID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#51605a]">
                Note ID <span className="text-[#b7443d]">*</span>
              </label>
              <input
                type="text"
                value={noteId}
                onChange={(e) => setNoteId(e.target.value)}
                placeholder="e.g. BIO-204-08"
                className="h-11 w-full rounded-lg border border-[#dde4df] bg-white px-3 text-xs text-[#18231f] outline-hidden placeholder:text-[#78847f] focus:border-[#7fa38f] focus:ring-3 focus:ring-[#1f5b45]/10"
              />
              <span className="text-[9px] text-[#78847f]">
                Use a unique, memorable identifier
              </span>
            </div>

            {/* Note Title */}
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#51605a]">
                Note title <span className="text-[#b7443d]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What is this note about?"
                className="h-11 w-full rounded-lg border border-[#dde4df] bg-white px-3 text-xs text-[#18231f] outline-hidden placeholder:text-[#78847f] focus:border-[#7fa38f] focus:ring-3 focus:ring-[#1f5b45]/10"
              />
            </div>

            {/* Subject */}
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#51605a]">
                Subject <span className="text-[#b7443d]">*</span>
              </label>
              <div className="relative">
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-11 w-full appearance-none rounded-lg border border-[#dde4df] bg-white px-3 text-xs text-[#18231f] outline-hidden focus:border-[#7fa38f] focus:ring-3 focus:ring-[#1f5b45]/10"
                >
                  <option value="" disabled>
                    Select a subject
                  </option>
                  <option value="Biology">Biology</option>
                  <option value="History">History</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78847f]" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Study Content */}
        <section className="border-b border-[#dde4df] p-[26px_30px]">
          <div className="mb-5 flex items-start gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e8f1ec] text-[11px] font-bold text-[#1f5b45]">
              2
            </span>
            <div>
              <h2 className="text-[14px] font-semibold text-[#18231f]">
                Study content
              </h2>
              <p className="text-[11px] text-[#78847f]">
                Add your key ideas, explanations, and important details.
              </p>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-[#51605a]">
                Note content <span className="text-[#b7443d]">*</span>
              </span>
              <span className="text-[10px] text-[#78847f]">
                {content.length} characters
              </span>
            </div>

            {/* Custom Markdown Editor Container */}
            <div className="overflow-hidden rounded-xl border border-[#dde4df]">
              {/* Toolbar */}
              <div className="flex h-10 items-center gap-1 border-b border-[#dde4df] bg-[#fafbf9] px-2">
                <button
                  type="button"
                  onClick={() => handleToolbarClick("bold")}
                  className="h-7 min-w-7 rounded px-1.5 text-[11px] font-bold text-[#51605a] hover:bg-[#e8f1ec] hover:text-[#1f5b45] transition-colors"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => handleToolbarClick("italic")}
                  className="h-7 min-w-7 rounded px-1.5 text-[11px] italic font-serif text-[#51605a] hover:bg-[#e8f1ec] hover:text-[#1f5b45] transition-colors"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => handleToolbarClick("h1")}
                  className="h-7 min-w-7 rounded px-1.5 text-[10px] font-bold text-[#51605a] hover:bg-[#e8f1ec] hover:text-[#1f5b45] transition-colors"
                >
                  H1
                </button>
                <span className="mx-1 h-4 w-px bg-[#dde4df]" />
                <button
                  type="button"
                  onClick={() => handleToolbarClick("bullet")}
                  className="h-7 rounded px-2 text-[10px] font-medium text-[#51605a] hover:bg-[#e8f1ec] hover:text-[#1f5b45] transition-colors"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => handleToolbarClick("number")}
                  className="h-7 rounded px-2 text-[10px] font-medium text-[#51605a] hover:bg-[#e8f1ec] hover:text-[#1f5b45] transition-colors"
                >
                  1. List
                </button>
              </div>

              {/* Textarea */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your study notes here..."
                rows={12}
                className="w-full resize-y border-0 bg-white p-4 text-[13px] leading-relaxed text-[#18231f] outline-hidden placeholder:text-[#78847f]"
              />
            </div>
          </div>
        </section>

        {/* Footer Actions */}
        <div className="flex items-center justify-between bg-[#fafbf9] px-[30px] py-4">
          <span className="text-[10px] text-[#78847f]">
            Your note is private to your account.
          </span>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex h-10 items-center justify-center rounded-xl border border-[#dde4df] bg-white px-5 text-xs font-semibold text-[#18231f] transition-colors hover:bg-[#fafbf9]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex h-10 items-center gap-1.5 rounded-xl bg-[#1f5b45] px-5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#174b38]"
            >
              <Check className="h-4 w-4" />
              <span>Save note</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
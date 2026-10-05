"use client";

import { Search, Lock, Plus } from "lucide-react";
import Link from "next/link";

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-[#dde4df] bg-[#f6f7f3]/90 px-8 backdrop-blur-md">
      <span className="text-sm font-semibold text-[#18231f]">Dashboard</span>

      <div className="flex items-center gap-3">
        {/* AI Status Badge */}
        <div className="flex items-center gap-1.5 rounded-full border border-[#e3dac7] bg-[#fbf6e9] px-3 py-1.5 text-xs font-semibold text-[#84611e]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#c59032]" />
          <Lock className="h-3 w-3" />
          <span>AI locked</span>
        </div>

        {/* Global Search Input */}
        <div className="relative flex w-[280px] items-center rounded-xl border border-[#dde4df] bg-white px-3 py-2 shadow-xs focus-within:border-[#1f5b45]">
          <Search className="h-4 w-4 text-[#78847f]" />
          <input
            type="text"
            placeholder="Search anything..."
            className="ml-2 w-full bg-transparent text-xs text-[#18231f] outline-hidden placeholder:text-[#78847f]"
          />
          <kbd className="rounded border border-[#dde4df] bg-[#f8f9f7] px-1.5 py-0.5 font-sans text-[10px] text-[#78847f]">
            ⌘K
          </kbd>
        </div>

        {/* New Note Button */}
        <Link
          href="/dashboard/notes/create"
          className="flex items-center gap-2 rounded-xl bg-[#1f5b45] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#174b38] transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New note</span>
        </Link>
      </div>
    </header>
  );
}
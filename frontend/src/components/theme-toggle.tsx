"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  // Prevent hydration mismatch by only rendering after client mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
        <Moon className="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown when clicking outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-36 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-lg z-50 text-sm">
            <button
              onClick={() => { setTheme("light"); setIsOpen(false); }}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                theme === "light" ? "bg-slate-100 dark:bg-slate-800 font-medium" : ""
              }`}
            >
              <Sun className="h-4 w-4 text-amber-500" />
              Light
            </button>
            <button
              onClick={() => { setTheme("dark"); setIsOpen(false); }}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                theme === "dark" ? "bg-slate-100 dark:bg-slate-800 font-medium" : ""
              }`}
            >
              <Moon className="h-4 w-4 text-blue-400" />
              Dark
            </button>
            <button
              onClick={() => { setTheme("system"); setIsOpen(false); }}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                theme === "system" ? "bg-slate-100 dark:bg-slate-800 font-medium" : ""
              }`}
            >
              <Monitor className="h-4 w-4 text-slate-500" />
              System
            </button>
          </div>
        </>
      )}
    </div>
  );
}
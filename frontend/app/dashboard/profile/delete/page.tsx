"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Trash2,
  AlertTriangle,
  User,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

export default function Page() {
  const targetUsername = "mani";
  const [confirmUsername, setConfirmUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Require exact username match and non-empty password to enable action
  const isFormValid =
    confirmUsername.trim() === targetUsername && password.length > 0;

  const handleDelete = (
    e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>
  ) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsDeleting(true);
    // Add delete account API call / server action here
    setTimeout(() => {
      setIsDeleting(false);
      console.log("Account deleted permanently");
    }, 800);
  };

  return (
    <div className="mx-auto max-w-155 pb-20 pt-2">
      {/* Back Link */}
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#51605a] transition-colors hover:text-[#18231f]"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Back to account settings</span>
      </Link>

      {/* Page Heading */}
      <div className="mt-6 mb-7">
        <span className="block text-[10px] font-bold uppercase tracking-widest text-[#78847f]">
          Account settings
        </span>
        <h1 className="mt-1 font-serif text-[38px] font-semibold leading-tight tracking-[-0.02em] text-[#18231f]">
          Delete your account
        </h1>
        <p className="mt-1 text-xs text-[#51605a]">
          Review what will be removed before continuing.
        </p>
      </div>

      {/* Warning Card */}
      <div className="overflow-hidden rounded-2xl border border-[#dde4df] bg-white shadow-xs">
        {/* Top Warning Section */}
        <div className="border-b border-[#e9eeeb] p-7 pb-6">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#f7e9e7] text-[#b7443d]">
            <Trash2 className="h-5 w-5" />
          </div>

          <h2 className="mt-4 font-serif text-2xl font-semibold text-[#18231f]">
            This action is permanent
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-[#51605a]">
            Deleting your account removes your profile, all study notes,
            generated quizzes, subjects, and account settings. This information
            cannot be recovered.
          </p>
        </div>

        {/* Confirmation Form */}
        <form onSubmit={handleDelete} className="p-7 space-y-4">
          {/* Warning Banner */}
          <div className="flex items-center gap-2 rounded-xl bg-[#f9edeb] p-3 text-xs text-[#8d3b36]">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[#b7443d]" />
            <p className="text-[11px] font-medium leading-relaxed">
              Type{" "}
              <span className="font-bold underline decoration-dashed">
                {targetUsername}
              </span>{" "}
              and enter your password to confirm.
            </p>
          </div>

          {/* Confirm Username */}
          <div className="space-y-1.5">
            <label
              htmlFor="confirmUsername"
              className="block text-xs font-semibold text-[#51605a]"
            >
              Confirm username
            </label>
            <div className="flex h-11 items-center rounded-xl border border-[#dde4df] bg-white px-3.5 transition-colors focus-within:border-[#b7443d] focus-within:ring-2 focus-within:ring-[#b7443d]/10">
              <User className="h-4 w-4 shrink-0 text-[#78847f]" />
              <input
                id="confirmUsername"
                type="text"
                required
                value={confirmUsername}
                onChange={(e) => setConfirmUsername(e.target.value)}
                placeholder={targetUsername}
                className="ml-2.5 w-full bg-transparent text-xs text-[#18231f] outline-hidden placeholder:text-[#a0aba5]"
              />
            </div>
          </div>

          {/* Current Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-[#51605a]"
            >
              Current password
            </label>
            <div className="flex h-11 items-center rounded-xl border border-[#dde4df] bg-white px-3.5 transition-colors focus-within:border-[#b7443d] focus-within:ring-2 focus-within:ring-[#b7443d]/10">
              <Lock className="h-4 w-4 shrink-0 text-[#78847f]" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="ml-2.5 w-full bg-transparent text-xs text-[#18231f] outline-hidden placeholder:text-[#a0aba5]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-1 text-[#78847f] hover:text-[#18231f] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <Link
              href="/profile"
              className="flex h-10 items-center justify-center rounded-xl border border-transparent px-4 text-xs font-semibold text-[#51605a] transition-colors hover:text-[#18231f]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={!isFormValid || isDeleting}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-[#cc8580] px-4 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#b7443d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>
                {isDeleting ? "Deleting..." : "Delete account permanently"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
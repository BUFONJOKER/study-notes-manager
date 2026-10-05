"use client";

import React, { useState } from "react";
import { KeyRound, X, Eye, EyeOff, Lock, Check } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (key: string) => void;
  isConfigured?: boolean;
}

export default function ApiKeyModal({
  isOpen,
  onClose,
  onSuccess,
  isConfigured = false,
}: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError("Please enter a valid OpenAI API key.");
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate API key verification (or connect to your /api/verify endpoint)
    setTimeout(() => {
      setLoading(false);
      onSuccess(apiKey);
      setApiKey("");
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141f1b]/55 p-5 backdrop-blur-xs">
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-122.5 rounded-2xl bg-white p-7 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-[#78847f] transition-colors hover:bg-[#f6f7f3] hover:text-[#18231f]"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Top Gold Key Badge */}
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#f5ead0] text-[#a27624]">
          <KeyRound className="h-5 w-5" />
        </div>

        {/* Session Status Pill */}
        <div className="mt-5 flex h-9 items-center justify-between rounded-lg border border-[#dde4df] bg-[#fafbf9] px-3.5 text-[11px]">
          <div className="flex items-center gap-2 text-[#78847f]">
            <span
              className={`h-2 w-2 rounded-full ${
                isConfigured ? "bg-[#4e8c6d]" : "bg-[#bf8f36]"
              }`}
            />
            <span>Session status</span>
          </div>
          <strong className="text-[11px] font-semibold text-[#18231f]">
            {isConfigured ? "Configured" : "Not configured"}
          </strong>
        </div>

        {/* Title & Description */}
        <h2 className="mt-5 font-serif text-[26px] font-semibold leading-tight text-[#18231f]">
          Set up AI features
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-[#51605a]">
          Enter your OpenAI API key to generate quizzes and use AI study tools.
          The application uses <b className="font-semibold text-[#18231f]">gpt-5-nano</b>.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5">
          <label className="block text-[11px] font-semibold text-[#51605a]">
            OpenAI API key
            <div className="mt-1.5 flex h-11 items-center rounded-xl border border-[#dde4df] bg-white px-3 transition-colors focus-within:border-[#1f5b45] focus-within:ring-2 focus-within:ring-[#1f5b45]/10">
              <KeyRound className="h-4 w-4 text-[#78847f]" />
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-••••••••••••••••••••••••••••"
                className="ml-2 w-full bg-transparent text-xs text-[#18231f] outline-hidden placeholder:text-[#78847f]"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="grid h-8 w-8 place-items-center text-[#78847f] hover:text-[#18231f]"
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </label>

          {error && (
            <p className="mt-2 text-[11px] text-[#b7443d]">{error}</p>
          )}

          {/* Secure Note Notice */}
          <div className="mt-3.5 flex items-start gap-2.5 rounded-xl bg-[#f2f7f3] p-3 text-[#1f5b45]">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#1f5b45]" />
            <div>
              <strong className="block text-[11px] font-semibold text-[#18231f]">
                Secure by design
              </strong>
              <span className="block text-[10px] leading-tight text-[#78847f]">
                Your key is discarded from the form after verification and is never shown again.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-[#dde4df] bg-white text-xs font-semibold text-[#18231f] hover:bg-[#fafbf9] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#1f5b45] text-xs font-semibold text-white shadow-xs hover:bg-[#174b38] transition-colors disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{loading ? "Verifying..." : "Verify & connect"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
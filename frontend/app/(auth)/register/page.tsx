"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Plus,
    BookOpen,
    HelpCircle,
} from "lucide-react";

export default function Page() {

    const [username, setUsername] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    // Compute password strength segments (0 to 4 bars)
    const getPasswordStrength = () => {
        if (!password) return 0;
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    };

    const strength = getPasswordStrength();

    const handleSubmit = (
        e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>
    ) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return;
        }

        setIsLoading(true);
        // Handle registration submission logic or server action
        setTimeout(() => {
            setIsLoading(false);
            console.log({ username, password });
        }, 800);
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center bg-[#f6f7f3] px-4 py-12 antialiased">
            {/* Top-Left Brand Header */}
            <div className="absolute left-8 top-8 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#1f5b45] text-white shadow-md shadow-[#1f5b45]/20">
                    <BookOpen className="h-5 w-5" />
                </div>
                <div>
                    <strong className="block font-serif text-lg leading-tight text-[#18231f]">
                        Noteflow
                    </strong>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#78847f]">
                        Study Workspace
                    </span>
                </div>
            </div>

            {/* Main Register Card */}
            <div className="w-full max-w-115rounded-3xl border border-[#dde4df]/70 bg-white p-9 shadow-[0_12px_40px_rgba(24,35,31,0.04)]">
                {/* Top Plus Icon Badge */}
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#e8f1ec] text-[#1f5b45]">
                    <Plus className="h-5 w-5 stroke-[2.5]" />
                </div>

                {/* Heading */}
                <div className="mt-4 text-center">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-[#78847f]">
                        Create your workspace
                    </span>
                    <h1 className="mt-1 font-serif text-[32px] font-semibold tracking-tight text-[#18231f]">
                        Start studying smarter
                    </h1>
                    <p className="mt-1.5 text-xs text-[#51605a] leading-relaxed max-w-85 mx-auto">
                        Create an account to organize notes and generate focused practice
                        questions.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">

                    {/* Username */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="username"
                            className="block text-xs font-semibold text-[#51605a]"
                        >
                            Username
                        </label>
                        <div className="flex h-11 items-center rounded-xl border border-[#dde4df] bg-white px-3.5 transition-colors focus-within:border-[#1f5b45] focus-within:ring-2 focus-within:ring-[#1f5b45]/10">
                            <User className="h-4 w-4 shrink-0 text-[#78847f]" />
                            <input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="alexm"
                                className="ml-2.5 w-full bg-transparent text-xs text-[#18231f] outline-hidden placeholder:text-[#a0aba5]"
                            />
                        </div>
                    </div>



                    {/* Password */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="password"
                            className="block text-xs font-semibold text-[#51605a]"
                        >
                            Password
                        </label>
                        <div className="flex h-11 items-center rounded-xl border border-[#dde4df] bg-white px-3.5 transition-colors focus-within:border-[#1f5b45] focus-within:ring-2 focus-within:ring-[#1f5b45]/10">
                            <Lock className="h-4 w-4 shrink-0 text-[#78847f]" />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a secure password"
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

                        {/* Password Strength Indicator Bars */}
                        <div className="grid grid-cols-4 gap-1.5 pt-1">
                            {[1, 2, 3, 4].map((step) => (
                                <div
                                    key={step}
                                    className={`h-1 rounded-full transition-colors ${strength >= step ? "bg-[#1f5b45]" : "bg-[#e9eeeb]"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="confirmPassword"
                            className="block text-xs font-semibold text-[#51605a]"
                        >
                            Confirm password
                        </label>
                        <div className="flex h-11 items-center rounded-xl border border-[#dde4df] bg-white px-3.5 transition-colors focus-within:border-[#1f5b45] focus-within:ring-2 focus-within:ring-[#1f5b45]/10">
                            <Lock className="h-4 w-4 shrink-0 text-[#78847f]" />
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Enter the password again"
                                className="ml-2.5 w-full bg-transparent text-xs text-[#18231f] outline-hidden placeholder:text-[#a0aba5]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="ml-1 text-[#78847f] hover:text-[#18231f] transition-colors"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>


                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex h-11 w-full items-center justify-center rounded-xl bg-[#1f5b45] text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#174b38] disabled:opacity-50"
                        >
                            {isLoading ? "Creating account..." : "Create account"}
                        </button>
                    </div>
                </form>

                {/* Bottom Switch Link */}
                <div className="mt-5 flex items-center justify-between text-xs">
                    <span className="text-[#78847f]">Already have an account?</span>
                    <Link
                        href="/login"
                        className="font-semibold text-[#1f5b45] hover:underline"
                    >
                        Sign in
                    </Link>
                </div>
            </div>

            {/* Floating Bottom Left Badge */}
            <div className="fixed bottom-6 left-6 grid h-9 w-9 place-items-center rounded-full bg-[#18231f] text-xs font-semibold text-white shadow-md">
                N
            </div>

            {/* Floating Bottom Right Help Button */}
            <button
                type="button"
                className="fixed bottom-6 right-6 grid h-9 w-9 place-items-center rounded-full bg-[#18231f] text-white shadow-md hover:opacity-90 transition-opacity"
            >
                <HelpCircle className="h-5 w-5" />
            </button>
        </div>
    );
}
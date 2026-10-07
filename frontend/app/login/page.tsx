"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Lock, Eye, EyeOff, BookOpen, HelpCircle } from "lucide-react";

export default function Page() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = (
		e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
	) => {
		e.preventDefault();
		setIsLoading(true);

		// Add authentication handling / server action here
		setTimeout(() => {
			setIsLoading(false);
			console.log({ username, password, rememberMe });
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

			{/* Main Login Card */}
			<div className="w-full max-w-110 rounded-3xl border border-[#dde4df]/70 bg-white p-10 shadow-[0_12px_40px_rgba(24,35,31,0.04)]">
				{/* User Icon Badge */}
				<div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#e8f1ec] text-[#1f5b45]">
					<User className="h-6 w-6" />
				</div>

				{/* Heading */}
				<div className="mt-5 text-center">
					<span className="block text-[10px] font-bold uppercase tracking-widest text-[#78847f]">
						Welcome back
					</span>
					<h1 className="mt-1 font-serif text-[32px] font-semibold tracking-tight text-[#18231f]">
						Sign in to Noteflow
					</h1>
					<p className="mt-1.5 text-xs text-[#51605a]">
						Continue to your notes, subjects, and saved quizzes.
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="mt-7 space-y-4">
					{/* Username Input */}
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
								placeholder="Enter your username"
								className="ml-2.5 w-full bg-transparent text-xs text-[#18231f] outline-hidden placeholder:text-[#a0aba5]"
							/>
						</div>
					</div>

					{/* Password Input */}
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

					{/* Remember Me & Forgot Password */}
					<div className="flex items-center justify-between pt-1 text-xs">
						<label className="flex cursor-pointer items-center gap-2 text-[#51605a]">
							<input
								type="checkbox"
								checked={rememberMe}
								onChange={(e) => setRememberMe(e.target.checked)}
								className="h-4 w-4 rounded border-[#dde4df] text-[#1f5b45] accent-[#1f5b45] focus:ring-0"
							/>
							<span>Remember me</span>
						</label>
						<Link
							href="/forgot-password"
							className="font-semibold text-[#1f5b45] hover:underline"
						>
							Forgot password?
						</Link>
					</div>

					{/* Sign In Button */}
					<button
						type="submit"
						disabled={isLoading}
						className="flex h-11 w-full items-center justify-center rounded-xl bg-[#1f5b45] text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#174b38] disabled:opacity-50"
					>
						{isLoading ? "Signing in..." : "Sign in"}
					</button>
				</form>

				{/* Separator */}
				<div className="relative my-6 flex items-center justify-center">
					<div className="w-full border-t border-[#e9eeeb]" />
					<span className="absolute bg-white px-3 text-[9px] font-bold uppercase tracking-wider text-[#a0aba5]">
						New to Noteflow?
					</span>
				</div>

				{/* Create Account Link */}
				<div className="text-center">
					<Link
						href="/register"
						className="text-xs font-semibold text-[#18231f] hover:underline"
					>
						Create an account
					</Link>
				</div>

				{/* Secure Access Callout */}
				<div className="mt-6 flex items-start gap-2.5 rounded-xl bg-[#f2f7f3] p-3.5 text-[#1f5b45]">
					<Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#1f5b45]" />
					<p className="text-[11px] leading-relaxed text-[#51605a]">
						<strong className="font-semibold text-[#1f5b45]">
							Secure access{" "}
						</strong>
						Your password is never displayed or included in the interface.
					</p>
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

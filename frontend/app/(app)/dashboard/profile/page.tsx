"use client";

import React, { useState } from "react";
import {
    User,
    Lock,
    Trash2,
    LogOut,
    Eye,
    EyeOff,
    Check,
} from "lucide-react";
import Link from "next/link";
type SettingsTab = "profile" | "password" | "delete";

export default function Page() {
    const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

    // Personal Information state
    const [fullName, setFullName] = useState("ABDUL REHMAN JAVAID");
    const [username, setUsername] = useState("mani");
    const [email, setEmail] = useState("mani@gmail.com");

    // Change password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const handleSaveProfile = (
        e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>
    ) => {
        e.preventDefault();
        setIsSavingProfile(true);
        setTimeout(() => {
            setIsSavingProfile(false);
        }, 600);
    };

    const handleUpdatePassword = (
        e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>
    ) => {
        e.preventDefault();
        setIsUpdatingPassword(true);
        setTimeout(() => {
            setIsUpdatingPassword(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }, 600);
    };

    return (
        <div className="mx-auto max-w-245 pb-20 pt-1">
            {/* Page Heading */}
            <div className="mb-8">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-[#78847f]">
                    Account settings
                </span>
                <h1 className="mt-1 font-serif text-[38px] font-semibold leading-tight tracking-[-0.02em] text-[#18231f]">
                    Your profile
                </h1>
                <p className="mt-1 text-xs text-[#51605a]">
                    Manage your account details, password, and security.
                </p>
            </div>

            {/* Two-Column Grid: Navigation Tabs + Main Form Area */}
            <div className="grid grid-cols-[190px_1fr] items-start gap-6">
                {/* Settings Navigation Menu */}
                <aside className="rounded-2xl border border-[#dde4df] bg-white p-2 shadow-xs">
                    <nav className="flex flex-col gap-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab("profile")}
                            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${activeTab === "profile"
                                    ? "bg-[#e2e9e3] text-[#1f5b45]"
                                    : "text-[#51605a] hover:bg-[#f6f7f3] hover:text-[#18231f]"
                                }`}
                        >
                            <User className="h-4 w-4 shrink-0" />
                            <span>Profile details</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("password")}
                            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${activeTab === "password"
                                    ? "bg-[#e2e9e3] text-[#1f5b45]"
                                    : "text-[#51605a] hover:bg-[#f6f7f3] hover:text-[#18231f]"
                                }`}
                        >
                            <Lock className="h-4 w-4 shrink-0" />
                            <span>Password</span>
                        </button>

                        <Link
                            href="/dashboard/profile/delete"
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#b7443d] transition-colors hover:bg-[#f3e1e1]/50"
                        >
                            <Trash2 className="h-4 w-4 shrink-0" />
                            <span>Delete account</span>
                        </Link>

                        <div className="my-1 border-t border-[#e9eeeb]" />

                        <button
                            type="button"
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#51605a] transition-colors hover:bg-[#f6f7f3] hover:text-[#18231f]"
                        >
                            <LogOut className="h-4 w-4 shrink-0" />
                            <span>Sign out</span>
                        </button>
                    </nav>
                </aside>

                {/* Content Panel */}
                <div className="space-y-6">
                    {/* Main Profile & Personal Information Card */}
                    <div className="rounded-2xl border border-[#dde4df] bg-white p-7 shadow-xs">
                        {/* Profile Photo Header */}
                        <div className="flex items-center justify-between border-b border-[#e9eeeb] pb-6">
                            <div className="flex items-center gap-4">
                                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#b56f53] text-sm font-bold text-white shadow-xs">
                                    AR
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-[#18231f]">
                                        Profile photo
                                    </h3>
                                    <p className="mt-0.5 text-[11px] text-[#78847f]">
                                        Initials are generated from your full name.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="rounded-xl border border-[#dde4df] bg-white px-3.5 py-2 text-xs font-semibold text-[#18231f] transition-colors hover:bg-[#fafbf9]"
                            >
                                Upload photo
                            </button>
                        </div>

                        {/* Personal Information Form */}
                        <form onSubmit={handleSaveProfile} className="pt-6">
                            <div>
                                <h3 className="text-sm font-semibold text-[#18231f]">
                                    Personal information
                                </h3>
                                <p className="mt-0.5 text-[11px] text-[#78847f]">
                                    Update the details associated with your account.
                                </p>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-4">
                                {/* Full name */}
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="fullName"
                                        className="block text-xs font-semibold text-[#51605a]"
                                    >
                                        Full name
                                    </label>
                                    <input
                                        id="fullName"
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="h-11 w-full rounded-xl border border-[#dde4df] bg-white px-3.5 text-xs text-[#18231f] outline-hidden transition-colors focus:border-[#1f5b45] focus:ring-2 focus:ring-[#1f5b45]/10"
                                    />
                                </div>

                                {/* Username */}
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="username"
                                        className="block text-xs font-semibold text-[#51605a]"
                                    >
                                        Username
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="h-11 w-full rounded-xl border border-[#dde4df] bg-white px-3.5 text-xs text-[#18231f] outline-hidden transition-colors focus:border-[#1f5b45] focus:ring-2 focus:ring-[#1f5b45]/10"
                                    />
                                    <span className="block text-[10px] text-[#78847f]">
                                        Your unique public identifier
                                    </span>
                                </div>

                                {/* Email address */}
                                <div className="col-span-2 space-y-1.5">
                                    <label
                                        htmlFor="email"
                                        className="block text-xs font-semibold text-[#51605a]"
                                    >
                                        Email address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-11 w-full rounded-xl border border-[#dde4df] bg-white px-3.5 text-xs text-[#18231f] outline-hidden transition-colors focus:border-[#1f5b45] focus:ring-2 focus:ring-[#1f5b45]/10"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSavingProfile}
                                    className="flex items-center gap-1.5 rounded-xl bg-[#1f5b45] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#174b38] disabled:opacity-50"
                                >
                                    <Check className="h-4 w-4" />
                                    <span>
                                        {isSavingProfile ? "Saving..." : "Save profile"}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password Card */}
                    <div className="rounded-2xl border border-[#dde4df] bg-white p-7 shadow-xs">
                        <div>
                            <h3 className="text-sm font-semibold text-[#18231f]">
                                Change password
                            </h3>
                            <p className="mt-0.5 text-[11px] text-[#78847f]">
                                Use at least 8 characters for your new password.
                            </p>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="mt-5 space-y-4">
                            {/* Current Password */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="currentPassword"
                                    className="block text-xs font-semibold text-[#51605a]"
                                >
                                    Current password
                                </label>
                                <div className="flex h-11 items-center rounded-xl border border-[#dde4df] bg-white px-3.5 transition-colors focus-within:border-[#1f5b45] focus-within:ring-2 focus-within:ring-[#1f5b45]/10">
                                    <Lock className="h-4 w-4 shrink-0 text-[#78847f]" />
                                    <input
                                        id="currentPassword"
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="ml-2.5 w-full bg-transparent text-xs text-[#18231f] outline-hidden placeholder:text-[#a0aba5]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="ml-1 text-[#78847f] hover:text-[#18231f] transition-colors"
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="newPassword"
                                    className="block text-xs font-semibold text-[#51605a]"
                                >
                                    New password
                                </label>
                                <div className="flex h-11 items-center rounded-xl border border-[#dde4df] bg-white px-3.5 transition-colors focus-within:border-[#1f5b45] focus-within:ring-2 focus-within:ring-[#1f5b45]/10">
                                    <Lock className="h-4 w-4 shrink-0 text-[#78847f]" />
                                    <input
                                        id="newPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="ml-2.5 w-full bg-transparent text-xs text-[#18231f] outline-hidden placeholder:text-[#a0aba5]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="ml-1 text-[#78847f] hover:text-[#18231f] transition-colors"
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm New Password */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-xs font-semibold text-[#51605a]"
                                >
                                    Confirm new password
                                </label>
                                <div className="flex h-11 items-center rounded-xl border border-[#dde4df] bg-white px-3.5 transition-colors focus-within:border-[#1f5b45] focus-within:ring-2 focus-within:ring-[#1f5b45]/10">
                                    <Lock className="h-4 w-4 shrink-0 text-[#78847f]" />
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="ml-2.5 w-full bg-transparent text-xs text-[#18231f] outline-hidden placeholder:text-[#a0aba5]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(!showConfirmPassword)
                                        }
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

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isUpdatingPassword}
                                    className="rounded-xl bg-[#1f5b45] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#174b38] disabled:opacity-50"
                                >
                                    {isUpdatingPassword ? "Updating..." : "Update password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
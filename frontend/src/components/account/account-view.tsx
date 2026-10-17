"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { Icon, PageHeading } from "@/components/ui";
import { PasswordForm } from "./password-form";
import { ProfileForm } from "./profile-form";
import { ProfilePhotoSection } from "./profile-photo-section";
import { signOut } from "next-auth/react";

export function AccountView() {
  const router = useRouter();
  const { profile } = useApp();
  const [saved, setSaved] = useState("");

  const flash = (message: string) => {
    setSaved(message);
    window.setTimeout(() => setSaved(""), 2400);
  };

  const handleLogOut = async () => {
    await signOut({
      callbackUrl: routes.login, // Redirect to the login page after signing out
      redirect: true, // Ensure the redirect happens
    });
  };

  return (
    <div className={cn("account-page")}>
      <PageHeading eyebrow="Account settings" title="Your profile" description="Manage your account details, password, and security." />
      {saved && (
        <div className={cn("success-banner")}>
          <Icon name="check" size={17} />
          {saved}
        </div>
      )}
      <div className={cn("account-grid mt-4")}>
        <aside className={cn("account-nav")}>
          <button className={cn("active")}><Icon name="user" size={17} />Profile details</button>
          <button onClick={() => document.getElementById("password-section")?.scrollIntoView({ behavior: "smooth" })}>
            <Icon name="lock" size={17} />Password
          </button>
          <button className="text-[#a2413b]!" onClick={() => router.push(routes.deleteAccount)}>
            <Icon name="trash" size={17} />Delete account
          </button>
          <button onClick={handleLogOut}><Icon name="arrow" size={17} />Sign out</button>
        </aside>
        <div className={cn("account-panel")}>
          <ProfilePhotoSection name={profile?.user_name || 'User'} />
          <ProfileForm onSaved={flash} />
          <PasswordForm onSaved={flash} />
        </div>
      </div>
    </div>
  );
}

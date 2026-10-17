"use client";

import { useState, useEffect, type SubmitEvent } from "react";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";

export function ProfileForm({ onSaved }: { onSaved: (message: string) => void }) {
  const { profile, updateUser } = useApp();
  const [userName, setUserName] = useState(profile?.user_name ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    setUserName(profile?.user_name ?? "");
  }, [profile]);

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) {
      setError("Your profile is not available.");
      return;
    }
    const trimmedName = userName.trim();
    if (!trimmedName) {
      setError("Username cannot be empty.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateUser(profile.user_id, {
        user_name: trimmedName,
      });
      onSaved("Profile details updated successfully.");
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  if (!profile) {
    return <p>Loading profile...</p>;
  }
  return (
    <form className={cn("account-section")} onSubmit={submit}>
      <div className="mb-5">
        <h2>Personal information</h2>
        <p>Update the details associated with your account.</p>
      </div>
      <div className={cn("form-grid")}>

        <label>
          <span>Username</span>
          <input value={userName} onChange={(event) => setUserName(event.target.value.replace(/\s/g, "").toLowerCase())} required disabled={saving} />
          <small>Your unique public identifier</small>
        </label>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="mt-5 flex justify-end">
        <Button type="submit" icon="check" disabled={saving}>
          {saving ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </form>
  );
}

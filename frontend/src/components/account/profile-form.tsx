"use client";

import { useState, type FormEvent } from "react";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";

export function ProfileForm({ onSaved }: { onSaved: (message: string) => void }) {
  const { profile, setProfile } = useApp();
  const [form, setForm] = useState(profile);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setProfile(form);
    onSaved("Profile details updated successfully.");
  };

  return (
    <form className={cn("account-section")} onSubmit={submit}>
      <div className="mb-5">
        <h2>Personal information</h2>
        <p>Update the details associated with your account.</p>
      </div>
      <div className={cn("form-grid")}>
        <label>
          <span>Full name</span>
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label>
          <span>Username</span>
          <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value.replace(/\s/g, "").toLowerCase() })} />
          <small>Your unique public identifier</small>
        </label>
        <label className={cn("span-two")}>
          <span>Email address</span>
          <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
      </div>
      <div className="mt-5 flex justify-end">
        <Button type="submit" icon="check">Save profile</Button>
      </div>
    </form>
  );
}

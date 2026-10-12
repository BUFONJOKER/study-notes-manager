"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { Button, PasswordInput } from "@/components/ui";

export function PasswordForm({ onSaved }: { onSaved: (message: string) => void }) {
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (passwords.current.length < 6 || passwords.next.length < 8 || passwords.next !== passwords.confirm) return;
    setPasswords({ current: "", next: "", confirm: "" });
    onSaved("Password updated successfully.");
  };

  return (
    <form id="password-section" className={cn("account-section")} onSubmit={submit}>
      <div className="mb-5">
        <h2>Change password</h2>
        <p>Use at least 8 characters for your new password.</p>
      </div>
      <div className="grid gap-4">
        <PasswordInput label="Current password" value={passwords.current} onChange={(value) => setPasswords({ ...passwords, current: value })} />
        <PasswordInput label="New password" value={passwords.next} onChange={(value) => setPasswords({ ...passwords, next: value })} autoComplete="new-password" />
        <PasswordInput
          label="Confirm new password"
          value={passwords.confirm}
          onChange={(value) => setPasswords({ ...passwords, confirm: value })}
          autoComplete="new-password"
          error={passwords.confirm && passwords.confirm !== passwords.next ? "Passwords do not match" : undefined}
        />
      </div>
      <div className="mt-5 flex justify-end">
        <Button type="submit">Update password</Button>
      </div>
    </form>
  );
}

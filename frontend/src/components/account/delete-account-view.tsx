"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { BackLink, Button, Icon, PageHeading, PasswordInput } from "@/components/ui";

export function DeleteAccountView() {
  const router = useRouter();
  const { profile, deleteAccount } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const canDelete = username === profile?.user_name && password.length >= 6;

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canDelete) return;
    setLoading(true);
    window.setTimeout(deleteAccount, 900);
  };

  return (
    <div className={cn("account-page")}>
      <BackLink href={routes.account}>Back to account settings</BackLink>
      <div className="mx-auto max-w-155">
        <PageHeading eyebrow="Account settings" title="Delete your account" description="Review what will be removed before continuing." />
        <section className={cn("account-panel")}>
          <div className={cn("account-section")}>
            <span className={cn("danger-icon")}><Icon name="trash" /></span>
            <h2 className="mt-4 font-heading! text-[25px]!">This action is permanent</h2>
            <p className="text-xs! leading-relaxed!">
              Deleting your account removes your profile, all study notes, generated quizzes, subjects, and account settings. This information cannot be recovered.
            </p>
          </div>
          <form className={cn("account-section")} onSubmit={submit}>
            <div className={cn("warning")}>
              <Icon name="alert" size={17} />
              Type <strong>{profile?.user_name}</strong> and enter your password to confirm.
            </div>
            <div className="grid gap-4">
              <label className={cn("auth-field")}>
                <span>Confirm username</span>
                <div className={cn(username && username !== profile?.user_name ? "invalid" : "")}>
                  <Icon name="user" size={18} />
                  <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder={profile?.user_name} />
                </div>
                {username && username !== profile?.user_name && <small className={cn("field-error")}>Username does not match</small>}
              </label>
              <PasswordInput label="Current password" value={password} onChange={setPassword} />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2 max-[500px]:grid-cols-1">
              <Button variant="secondary" onClick={() => router.push(routes.account)}>Cancel</Button>
              <Button type="submit" variant="danger" icon="trash" disabled={!canDelete || loading}>
                {loading ? "Deleting…" : "Delete account permanently"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

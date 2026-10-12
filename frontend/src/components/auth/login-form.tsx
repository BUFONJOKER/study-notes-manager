"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { Button, Icon, PasswordInput } from "@/components/ui";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!username.trim() || password.length < 6) return;
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      router.push(routes.dashboard);
    }, 800);
  };

  return (
    <section className={cn("auth-card")}>
      <div className={cn("auth-heading")}>
        <span className={cn("auth-icon")}><Icon name="user" /></span>
        <span className={cn("eyebrow")}>Welcome back</span>
        <h1>Sign in to Noteflow</h1>
        <p>Continue to your notes, subjects, and saved quizzes.</p>
      </div>
      <form className={cn("auth-form")} onSubmit={submit}>
        <label className={cn("auth-field")}>
          <span>Username</span>
          <div className={cn(submitted && !username.trim() ? "invalid" : "")}>
            <Icon name="user" size={18} />
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter your username" autoComplete="username" />
          </div>
          {submitted && !username.trim() && <small className={cn("field-error")}>Username is required</small>}
        </label>
        <PasswordInput
          label="Password"
          value={password}
          onChange={setPassword}
          error={submitted && password.length < 6 ? "Password must contain at least 6 characters" : undefined}
        />
        <div className={cn("auth-row")}>
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" className="size-4 accent-[#1f5b45]" /> Remember me
          </label>
          <button type="button" className={cn("auth-link")}>Forgot password?</button>
        </div>
        <Button className={cn("full")} type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
        <div className={cn("auth-divider")}>New to Noteflow?</div>
        <Button className={cn("full")} variant="secondary" onClick={() => router.push(routes.register)}>Create an account</Button>
      </form>
      <div className={cn("secure-note")}>
        <Icon name="lock" size={16} />
        <div>
          <strong>Secure access</strong>
          <span>Your password is never displayed or included in the interface.</span>
        </div>
      </div>
    </section>
  );
}

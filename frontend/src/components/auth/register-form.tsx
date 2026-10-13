"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { Button, Icon, PasswordInput } from "@/components/ui";

type FormState = { name: string; username: string; email: string; password: string; confirm: string };

export function RegisterForm() {
  const router = useRouter();
  const { registerUser } = useApp();
  const [form, setForm] = useState<FormState>({ name: "", username: "", email: "", password: "", confirm: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: keyof FormState, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const validEmail = /\S+@\S+\.\S+/.test(form.email);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!form.name.trim() || form.username.length < 3 || !validEmail || form.password.length < 8 || form.password !== form.confirm) return;
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      registerUser({ name: form.name, username: form.username, email: form.email });
    }, 900);
  };

  return (
    <section className={cn("auth-card")}>
      <div className={cn("auth-heading")}>
        <span className={cn("auth-icon")}><Icon name="plus" /></span>
        <span className={cn("eyebrow")}>Create your workspace</span>
        <h1>Start studying smarter</h1>
        <p>Create an account to organize notes and generate focused practice questions.</p>
      </div>
      <form className={cn("auth-form")} onSubmit={submit}>
        <label className={cn("auth-field")}>
          <span>Full name</span>
          <div className={cn(submitted && !form.name.trim() ? "invalid" : "")}>
            <Icon name="user" size={18} />
            <input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Alex Morgan" autoComplete="name" />
          </div>
        </label>
        <label className={cn("auth-field")}>
          <span>Username</span>
          <div className={cn(submitted && form.username.length < 3 ? "invalid" : "")}>
            <Icon name="user" size={18} />
            <input
              value={form.username}
              onChange={(event) => update("username", event.target.value.replace(/\s/g, "").toLowerCase())}
              placeholder="alexm"
              autoComplete="username"
            />
          </div>
          {submitted && form.username.length < 3 && <small className={cn("field-error")}>Use at least 3 characters</small>}
        </label>
        <label className={cn("auth-field")}>
          <span>Email address</span>
          <div className={cn(submitted && !validEmail ? "invalid" : "")}>
            <Icon name="notes" size={18} />
            <input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="alex@example.com" autoComplete="email" />
          </div>
          {submitted && !validEmail && <small className={cn("field-error")}>Enter a valid email address</small>}
        </label>
        <PasswordInput
          label="Password"
          value={form.password}
          onChange={(value) => update("password", value)}
          autoComplete="new-password"
          placeholder="Create a secure password"
          error={submitted && form.password.length < 8 ? "Use at least 8 characters" : undefined}
        />
        <div className={cn("password-meter")}>
          {[0, 1, 2, 3].map((index) => (
            <i key={index} className={form.password.length >= (index + 1) * 2 ? "bg-[#4e8c6d]!" : ""} />
          ))}
        </div>
        <PasswordInput
          label="Confirm password"
          value={form.confirm}
          onChange={(value) => update("confirm", value)}
          autoComplete="new-password"
          placeholder="Enter the password again"
          error={submitted && form.confirm !== form.password ? "Passwords do not match" : undefined}
        />
        <label className="flex items-start gap-2 text-[10px] leading-relaxed text-[#65716c]">
          <input type="checkbox" required className="mt-0.5 size-4 shrink-0 accent-[#1f5b45]" />
          I agree to the Terms of Service and Privacy Policy.
        </label>
        <Button className={cn("full")} type="submit" disabled={loading}>{loading ? "Creating account…" : "Create account"}</Button>
        <div className={cn("auth-row")}>
          <span>Already have an account?</span>
          <button type="button" className={cn("auth-link")} onClick={() => router.push(routes.login)}>Sign in</button>

        </div>
      </form>
    </section>
  );
}

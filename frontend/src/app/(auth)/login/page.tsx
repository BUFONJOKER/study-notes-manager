import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { LoginSessionMessage } from "@/components/login-session-message";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <LoginSessionMessage />
      <LoginForm />
    </div>
  );
}

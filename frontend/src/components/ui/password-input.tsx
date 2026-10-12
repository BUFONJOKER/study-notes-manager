"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

type PasswordInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
};

export function PasswordInput({ label, value, onChange, placeholder = "Enter your password", error, autoComplete = "current-password" }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <label className={cn("auth-field")}>
      <span>{label}</span>
      <div className={cn(error ? "invalid" : "")}>
        <Icon name="lock" size={18} />
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Hide password" : "Show password"}>
          <Icon name={visible ? "eyeOff" : "eye"} size={18} />
        </button>
      </div>
      {error && <small className={cn("field-error")}>{error}</small>}
    </label>
  );
}

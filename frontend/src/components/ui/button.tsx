"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  icon?: IconName;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
};

export function Button({ children, variant = "primary", icon, onClick, type = "button", className = "", disabled = false }: ButtonProps) {
  return (
    <button type={type} disabled={disabled} className={cn(`btn btn-${variant} ${className}`)} onClick={onClick}>
      {icon && <Icon name={icon} size={18} />}
      <span>{children}</span>
    </button>
  );
}

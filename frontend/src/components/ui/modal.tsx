"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

type ModalProps = {
  children: ReactNode;
  onClose: () => void;
  labelledBy: string;
  className?: string;
};

/** Shared backdrop + dialog frame used by the delete-note and API-key modals. */
export function Modal({ children, onClose, labelledBy, className = "" }: ModalProps) {
  return (
    <div className={cn("modal-backdrop")} role="presentation" onMouseDown={onClose}>
      <div
        className={cn(`modal ${className}`)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className={cn("modal-close")} onClick={onClose} aria-label="Close">
          <Icon name="close" />
        </button>
        {children}
      </div>
    </div>
  );
}

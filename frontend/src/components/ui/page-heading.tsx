import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PageHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
};

export function PageHeading({ eyebrow, title, description, children }: PageHeadingProps) {
  return (
    <div className={cn("page-heading")}>
      <div>
        {eyebrow && <span className={cn("eyebrow")}>{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className={cn("heading-actions")}>{children}</div>}
    </div>
  );
}

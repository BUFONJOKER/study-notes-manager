"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { getInitials } from "@/lib/utils";
import { Brand, Button, Icon } from "@/components/ui";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header({ title, onMenu }: { title: string; onMenu: () => void }) {
  const router = useRouter();
  const { profile, apiConfigured, openApiModal } = useApp();

  return (
    <header className={cn("topbar")}>
      <button className={cn("icon-button mobile-menu")} onClick={onMenu} aria-label="Open menu">
        <Icon name="menu" />
      </button>
      <div className={cn("mobile-brand")}>
        <Brand />
      </div>
      <span className={cn("topbar-title")}>{title}</span>
      <div className={cn("top-actions")}>
        <ThemeToggle />
        <button className={cn(`api-status ${apiConfigured ? "ready" : ""}`)} onClick={openApiModal}>
          <i />
          <Icon name={apiConfigured ? "check" : "lock"} size={14} />
          <span>{apiConfigured ? "AI ready" : "AI locked"}</span>
        </button>
        {/* <label className={cn("global-search")}>
          <Icon name="search" size={18} />
          <input aria-label="Search all notes" placeholder="Search anything..." />
          <kbd>⌘ K</kbd>
        </label> */}
        <Button icon="plus" onClick={() => router.push(routes.newNote)}>New note</Button>
        <button className={cn("avatar mobile-avatar")} onClick={() => router.push(routes.account)}>
          {getInitials(profile?.user_name)}
        </button>
      </div>
    </header>
  );
}

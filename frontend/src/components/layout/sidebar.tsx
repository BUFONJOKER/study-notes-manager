"use client";

import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/app-context";
import { subjects } from "@/data/subjects";
import { cn } from "@/lib/cn";
import { getNavState } from "@/lib/nav";
import { routes } from "@/lib/routes";
import { getInitials } from "@/lib/utils";
import { Brand, Icon } from "@/components/ui";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, apiConfigured, openApiModal } = useApp();
  const nav = getNavState(pathname);

  return (
    <aside className={cn("sidebar")}>
      <Brand />
      <nav className={cn("side-nav")} aria-label="Main navigation">
        <button className={cn(nav.dashboard ? "active" : "")} onClick={() => router.push(routes.dashboard)}>
          <Icon name="home" />
          <span>Dashboard</span>
        </button>
        <button className={cn(nav.notes ? "active" : "")} onClick={() => router.push(routes.notes)}>
          <Icon name="notes" />
          <span>All notes</span>
          <span className={cn("nav-count")}>12</span>
        </button>
        <button className={cn(nav.quiz ? "active" : "")} onClick={() => router.push(routes.quiz)}>
          <Icon name="sparkle" />
          <span>Quiz library</span>
        </button>
      </nav>

      <div className={cn("side-section")}>
        <span className={cn("eyebrow")}>Subjects</span>
        {subjects.map((subject) => (
          <button key={subject.name}>
            <i className={cn(`subject-dot dot-${subject.tone}`)} />
            {subject.name}
            <span>{subject.notes}</span>
          </button>
        ))}
      </div>

      <div className={cn(`sidebar-tip api-tip ${apiConfigured ? "configured" : ""}`)}>
        <div className={cn("tip-icon")}>
          <Icon name={apiConfigured ? "check" : "key"} size={17} />
        </div>
        <strong>{apiConfigured ? "AI is ready" : "Connect OpenAI"}</strong>
        <p>{apiConfigured ? "API key configured for this session." : "Add an API key to generate quizzes."}</p>
        <button onClick={openApiModal}>
          {apiConfigured ? "Manage API key" : "Set up API key"} <Icon name="chevron" size={14} />
        </button>
      </div>

      <button className={cn("profile")} onClick={() => router.push(routes.account)}>
        <span className={cn("avatar")}>{getInitials(profile?.user_name)}</span>
        <span>
          <strong>{profile?.user_name}</strong>
          <small>@{profile?.user_name}</small>
        </span>
        <Icon name="more" />
      </button>
    </aside>
  );
}

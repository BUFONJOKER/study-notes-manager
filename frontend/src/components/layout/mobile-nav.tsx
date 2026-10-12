"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { getNavState } from "@/lib/nav";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/ui";

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const nav = getNavState(pathname);

  return (
    <nav className={cn("mobile-nav")}>
      <button className={cn(nav.dashboard ? "active" : "")} onClick={() => router.push(routes.dashboard)}>
        <Icon name="home" />
        <span>Home</span>
      </button>
      <button className={cn(nav.notes ? "active" : "")} onClick={() => router.push(routes.notes)}>
        <Icon name="notes" />
        <span>Notes</span>
      </button>
      <button className={cn("mobile-create")} onClick={() => router.push(routes.newNote)}>
        <span><Icon name="plus" /></span>
        <small>Create</small>
      </button>
      <button className={cn(nav.quiz ? "active" : "")} onClick={() => router.push(routes.quiz)}>
        <Icon name="sparkle" />
        <span>Quizzes</span>
      </button>
      <button className={cn(nav.account ? "active" : "")} onClick={() => router.push(routes.account)}>
        <Icon name="user" />
        <span>Profile</span>
      </button>
    </nav>
  );
}

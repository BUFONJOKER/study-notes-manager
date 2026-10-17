"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { Button, PageHeading } from "@/components/ui";
import { ActivityPanel } from "./activity-panel";
import { EmptyDashboard } from "./empty-dashboard";
import { RecentNotesPanel } from "./recent-notes-panel";
import { StatsGrid } from "./stats-grid";
import { SubjectsPanel } from "./subjects-panel";

export function DashboardView() {
  const router = useRouter();
  const { notes, selectedNote, profile, isNewUser, requestAi, apiConfigured } = useApp();

  if (isNewUser) return <EmptyDashboard />;

  return (
    <div className={cn("page")}>
      <PageHeading
        eyebrow="Monday, September 23"
        title={`Good morning, ${profile?.user_name.split(" ")[0]}`}
        description="Here’s what’s happening in your study space."
      >
        <Button variant="secondary" icon={apiConfigured ? "sparkle" : "lock"} onClick={()=> requestAi(selectedNote?.note_id || "")}>Generate quiz</Button>
        <Button icon="plus" onClick={() => router.push(routes.newNote)}>Create note</Button>
      </PageHeading>

      <StatsGrid totalNotes={notes.length + 7} />

      <div className={cn("dashboard-grid")}>
        <RecentNotesPanel notes={notes.slice(0, 4)} />
        <ActivityPanel />
      </div>

      <SubjectsPanel />
    </div>
  );
}

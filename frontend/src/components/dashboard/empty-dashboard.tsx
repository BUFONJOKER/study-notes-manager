"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { Badge, Button, Icon, PageHeading } from "@/components/ui";

export function EmptyDashboard() {
  const router = useRouter();

  return (
    <div className={cn("page")}>
      <PageHeading title="Welcome, new student" description="Your study space is ready when you are." />
      <div className={cn("first-note panel")}>
        <span className={cn("empty-icon")}>
          <Icon name="notes" />
        </span>
        <Badge tone="mint">Start here</Badge>
        <h2>Create your first study note</h2>
        <p>Add lecture notes, reading summaries, or key concepts. Once saved, you can instantly turn them into a practice quiz.</p>
        <Button icon="plus" onClick={() => router.push(routes.newNote)}>Create your first note</Button>
        <div>
          <span><Icon name="check" size={15} /> Keep subjects organized</span>
          <span><Icon name="check" size={15} /> Generate AI practice questions</span>
        </div>
      </div>
    </div>
  );
}

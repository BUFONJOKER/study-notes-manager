import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui";

export function ProfilePhotoSection({ name }: { name: string }) {
  return (
    <section className={cn("account-section")}>
      <div className="flex items-center gap-4">
        <span className={cn("account-avatar")}>{getInitials(name)}</span>
        <div>
          <h2>Profile photo</h2>
          <p>Initials are generated from your full name.</p>
        </div>
        <Button className="ml-auto max-[620px]:hidden" variant="secondary">Upload photo</Button>
      </div>
    </section>
  );
}

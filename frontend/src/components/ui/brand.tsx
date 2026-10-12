import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export function Brand() {
  return (
    <div className={cn("brand")}>
      <div className={cn("brand-mark")}>
        <Icon name="book" size={21} />
      </div>
      <div>
        <strong>Noteflow</strong>
        <span>Study workspace</span>
      </div>
    </div>
  );
}

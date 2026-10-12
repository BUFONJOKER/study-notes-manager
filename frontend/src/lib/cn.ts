import { ui } from "./ui";

/** Expands alias names from the `ui` map into Tailwind classes. Unknown names pass through untouched. */
export function cn(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((name) => (ui[name] ?? name).split(/\s+/))
    .join(" ");
}

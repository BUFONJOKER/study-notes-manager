import { cn } from "@/lib/cn";
import { useRouter } from "next/navigation";
import {NoteResponse} from "@/types/notes";
// Define standard labels for a week starting on Sunday or Monday
const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface ActivityPanelProps {
  notes: NoteResponse[]; // Replace with your NoteResponse[] type if imported
}

export function ActivityPanel({ notes }: ActivityPanelProps) {
  // 1. Initialize an array of 7 elements matching the index of weekdays (0 = Sunday, 6 = Saturday)
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyActivity = Array(7).fill(0);

  // 2. Loop through real notes and increment counts for matching weekdays
  notes.forEach((note) => {
    const noteDate = new Date(note.updated_at);
    const dayIndex = noteDate.getDay(); // Returns 0-6
    weeklyActivity[dayIndex] += 1;
  });

  // 3. Compute dynamic metrics for the layout footer elements
  const totalNotesUpdated = weeklyActivity.reduce((sum, val) => sum + val, 0);
  const dynamicPeakIndex = weeklyActivity.indexOf(Math.max(...weeklyActivity));
  const peakDayName = weekdayLabels[dynamicPeakIndex];

  // 4. Calculate a percentage scaling factor so the chart bars render with accurate relative CSS heights
  const maxActivityVal = Math.max(...weeklyActivity);

  return (
    <section className={cn("panel activity-panel")}>
      <div className={cn("panel-header")}>
        <div>
          <h2>Study activity</h2>
          <p>Notes updated this week</p>
        </div>
        <select aria-label="Activity period">
          <option>This week</option>
          <option>This month</option>
        </select>
      </div>

      <div className={cn("chart")}>
        {weeklyActivity.map((count, i) => {
          // Prevent division by zero if there are no updates at all
          const percentageHeight = maxActivityVal > 0 ? (count / maxActivityVal) * 100 : 0;

          return (
            <div className={cn("bar-wrap")} key={i}>
              <div
                className={cn(`bar ${i === dynamicPeakIndex && maxActivityVal > 0 ? "peak" : ""}`)}
                style={{ height: `${percentageHeight}%` }}
              />
              <span>{weekdayLabels[i]}</span>
            </div>
          );
        })}
      </div>

      <div className={cn("activity-foot")}>
        <span>
          <i className={cn("subject-dot dot-mint")} />
          {totalNotesUpdated} {totalNotesUpdated === 1 ? "note" : "notes"} updated
        </span>
        {totalNotesUpdated > 0 ? (
          <strong>Most active on {peakDayName}</strong>
        ) : (
          <strong>No recent activity</strong>
        )}
      </div>
    </section>
  );
}

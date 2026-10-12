import { peakDayIndex, weekdayLabels, weeklyActivity } from "@/data/activity";
import { cn } from "@/lib/cn";

export function ActivityPanel() {
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
        {weeklyActivity.map((value, i) => (
          <div className={cn("bar-wrap")} key={i}>
            <div className={cn(`bar ${i === peakDayIndex ? "peak" : ""}`)} style={{ height: `${value}%` }} />
            <span>{weekdayLabels[i]}</span>
          </div>
        ))}
      </div>
      <div className={cn("activity-foot")}>
        <span>
          <i className={cn("subject-dot dot-mint")} />8 notes updated
        </span>
        <strong>Most active on Saturday</strong>
      </div>
    </section>
  );
}

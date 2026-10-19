import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui";

type Stat = {
  label: string;
  value: number;
  note: React.ReactNode;
  icon: IconName;
  tone: "green" | "gold" | "purple" | "blue";
};

export function StatsGrid({ totalNotes, subjects, generatedQuizzes, recentlyUpdated }: { totalNotes: number; subjects: number; generatedQuizzes: number; recentlyUpdated: number }) {
  const stats: Stat[] = [
    { label: "Total notes", value: totalNotes, note: <><b>+3</b> this month</>, icon: "notes", tone: "green" },
    { label: "Subjects", value: subjects, note: "Across this semester", icon: "book", tone: "gold" },
    { label: "Generated quizzes", value: generatedQuizzes, note: <><b>+2</b> this week</>, icon: "sparkle", tone: "purple" },
    { label: "Recently updated", value: recentlyUpdated, note: "In the last 7 days", icon: "clock", tone: "blue" },
  ];

  return (
    <section className={cn("stats-grid")} aria-label="Study overview">
      {stats.map((stat) => (
        <article className={cn("stat-card")} key={stat.label}>
          <div className={cn(`stat-icon ${stat.tone}`)}>
            <Icon name={stat.icon} />
          </div>
          <div>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.note}</small>
          </div>
        </article>
      ))}
    </section>
  );
}

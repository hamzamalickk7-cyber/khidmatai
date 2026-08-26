import { Check, Circle } from "lucide-react";

interface ProfileCompletenessChecklistItem {
  label: string;
  isComplete: boolean;
}

interface ProfileCompletenessCardProps {
  checklist: ProfileCompletenessChecklistItem[];
}

export function ProfileCompletenessCard({ checklist }: ProfileCompletenessCardProps) {
  const completedCount = checklist.filter((item) => item.isComplete).length;
  const completionPercentage = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="rounded-3xl border border-ink/10 bg-white p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Profile completeness</h2>
        <span className="text-sm font-semibold text-brand">{completionPercentage}%</span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={completionPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Profile completeness"
        className="mt-4 h-2 w-full overflow-hidden rounded-full bg-ink/8"
      >
        <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-deep transition-all" style={{ width: `${completionPercentage}%` }} />
      </div>

      <ul className="mt-5 space-y-3">
        {checklist.map((item) => (
          <li key={item.label} className="flex items-center gap-2.5 text-sm">
            <span className={`grid size-5 shrink-0 place-items-center rounded-full ${item.isComplete ? "bg-brand text-white" : "bg-ink/8 text-ink/30"}`}>
              {item.isComplete ? <Check className="size-3" strokeWidth={3} /> : <Circle className="size-2 fill-current" />}
            </span>
            <span className={item.isComplete ? "text-ink/70" : "text-ink/45"}>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

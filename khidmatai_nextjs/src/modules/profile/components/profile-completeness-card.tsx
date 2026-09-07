import { Check, Circle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileCompletenessChecklistItem {
  label: string;
  isComplete: boolean;
}

interface ProfileCompletenessCardProps {
  checklist: ProfileCompletenessChecklistItem[];
  onCompleteNow?: () => void;
  onSubmitForReview?: () => void;
  hasBeenSubmitted?: boolean;
  isApproved?: boolean;
}

const GAUGE_RADIUS = 26;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

export function ProfileCompletenessCard({
  checklist,
  onCompleteNow,
  onSubmitForReview,
  hasBeenSubmitted = false,
  isApproved = false,
}: ProfileCompletenessCardProps) {
  const completedCount = checklist.filter((item) => item.isComplete).length;
  const completionPercentage = checklist.length ? Math.round((completedCount / checklist.length) * 100) : 0;
  const gaugeOffset = GAUGE_CIRCUMFERENCE - (completionPercentage / 100) * GAUGE_CIRCUMFERENCE;

  return (
    <section className="border-brand/15 to-brand-soft/30 overflow-hidden rounded-2xl border bg-gradient-to-br from-white p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex shrink-0 items-center gap-4 lg:min-w-64">
          <svg viewBox="0 0 64 64" className="size-16 shrink-0 -rotate-90">
            <circle
              cx="32"
              cy="32"
              r={GAUGE_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-ink/8"
            />
            <circle
              cx="32"
              cy="32"
              r={GAUGE_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={GAUGE_CIRCUMFERENCE}
              strokeDashoffset={gaugeOffset}
              className="text-brand transition-all"
            />
          </svg>
          <div>
            <p className="text-ink flex items-center gap-1.5 text-lg font-semibold">
              {completionPercentage === 100 && <Sparkles className="text-brand size-4" />}
              {completionPercentage}% complete
            </p>
            <p className="text-ink/50 mt-1 max-w-48 text-xs leading-5">
              {completionPercentage === 100
                ? "Your profile has all the essential information."
                : `${checklist.length - completedCount} sections still need attention.`}
            </p>
          </div>
        </div>

        <div className="flex-1">
          <div
            role="progressbar"
            aria-valuenow={completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Profile completeness"
            className="bg-ink/8 h-2 w-full overflow-hidden rounded-full"
          >
            <div
              className="bg-brand h-full rounded-full transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <ul className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {checklist.map((item) => (
              <li
                key={item.label}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
                  item.isComplete
                    ? "border-brand/10 text-ink/70 bg-white/80"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                <span
                  className={`grid size-4 shrink-0 place-items-center rounded-full ${item.isComplete ? "bg-brand text-white" : "bg-ink/8 text-ink/30"}`}
                >
                  {item.isComplete ? (
                    <Check className="size-2.5" strokeWidth={3} />
                  ) : (
                    <Circle className="size-1.5 fill-current" />
                  )}
                </span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {onCompleteNow && completionPercentage < 100 && (
          <Button
            type="button"
            onClick={onCompleteNow}
            className="bg-brand hover:bg-brand-deep h-9 shrink-0 rounded-lg px-4 font-semibold text-white"
          >
            Complete now
          </Button>
        )}
        {onSubmitForReview && completionPercentage === 100 && (
          <Button
            type="button"
            disabled={hasBeenSubmitted || isApproved}
            onClick={onSubmitForReview}
            className="bg-brand hover:bg-brand-deep h-9 shrink-0 rounded-lg px-4 font-semibold text-white"
          >
            {isApproved ? "Profile approved" : hasBeenSubmitted ? "Review in progress" : "Submit for review"}
          </Button>
        )}
      </div>
    </section>
  );
}

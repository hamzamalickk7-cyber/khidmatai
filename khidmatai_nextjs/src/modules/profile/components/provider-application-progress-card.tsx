import { Check } from "lucide-react";

interface ProviderApplicationStageDefinition {
  key: string;
  label: string;
}

const providerApplicationStageList: ProviderApplicationStageDefinition[] = [
  { key: "draft", label: "Draft" },
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Under review" },
  { key: "active", label: "Active" },
];

interface ProviderApplicationProgressCardProps {
  currentStageKey: string;
}

export function ProviderApplicationProgressCard({ currentStageKey }: ProviderApplicationProgressCardProps) {
  const currentStageIndex = providerApplicationStageList.findIndex((stage) => stage.key === currentStageKey);

  return (
    <div className="rounded-3xl border border-ink/10 bg-white p-6 sm:p-7">
      <h2 className="text-lg font-semibold">Application status</h2>
      <p className="mt-1 text-sm leading-6 text-ink/55">
        Complete every section, then submit for review. An administrator activates your profile once everything checks out.
      </p>

      <ol className="mt-6 space-y-0">
        {providerApplicationStageList.map((stage, stageIndex) => {
          const isComplete = stageIndex < currentStageIndex;
          const isCurrent = stageIndex === currentStageIndex;
          const isLast = stageIndex === providerApplicationStageList.length - 1;

          return (
            <li key={stage.key} className="relative flex gap-3.5 pb-6 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden
                  className={`absolute left-[11px] top-6 h-full w-px ${isComplete ? "bg-brand" : "bg-ink/10"}`}
                />
              )}
              <span
                className={`relative grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  isComplete
                    ? "bg-brand text-white"
                    : isCurrent
                      ? "border-2 border-brand bg-white text-brand"
                      : "border border-ink/15 bg-white text-ink/30"
                }`}
              >
                {isComplete ? <Check className="size-3.5" strokeWidth={3} /> : stageIndex + 1}
              </span>
              <div className="-mt-0.5">
                <p className={`text-sm font-semibold ${isCurrent ? "text-ink" : isComplete ? "text-ink/70" : "text-ink/40"}`}>{stage.label}</p>
                {isCurrent && <p className="mt-0.5 text-xs text-ink/50">You are here. Finish the sections below to submit.</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

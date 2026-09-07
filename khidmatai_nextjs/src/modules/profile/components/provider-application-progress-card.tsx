import { AlertTriangle, Check } from "lucide-react";
import type { ProviderProfileData } from "@/modules/profile/types/provider-profile-types";

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
  latestReviewDecision?: ProviderProfileData["latestReviewDecision"];
}

export function ProviderApplicationProgressCard({
  currentStageKey,
  latestReviewDecision,
}: ProviderApplicationProgressCardProps) {
  const requestedChangeKeys = latestReviewDecision?.requestedChangeKeys ?? [];
  const normalizedStageKey = normalizeProviderApplicationStage(currentStageKey);
  const currentStageIndex = providerApplicationStageList.findIndex((stage) => stage.key === normalizedStageKey);
  const statusMessage = getProviderApplicationStatusMessage(currentStageKey);

  return (
    <div className="border-ink/10 rounded-2xl border bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold">Application status</h2>
      <p className="text-ink/55 mt-1 text-sm leading-6">{statusMessage.summary}</p>

      {currentStageKey === "changes_required" && latestReviewDecision?.action === "request_changes" && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">Changes requested by the review team</p>
              {requestedChangeKeys.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {requestedChangeKeys.map((sectionKey) => (
                    <span key={sectionKey} className="rounded-full bg-white px-3 py-1 text-xs font-medium capitalize ring-1 ring-amber-200">
                      {formatRequestedSectionLabel(sectionKey)}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 rounded-xl bg-white/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Administrator’s message</p>
                <p className="mt-1 whitespace-pre-line text-sm leading-6">{latestReviewDecision.reason}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ol className="mt-6 space-y-0">
        {providerApplicationStageList.map((stage, stageIndex) => {
          const isComplete = stageIndex < currentStageIndex;
          const isCurrent = stageIndex === currentStageIndex;
          const isApprovedStage = currentStageKey === "active" && stage.key === "active";
          const shouldShowCompletedState = isComplete || isApprovedStage;
          const isLast = stageIndex === providerApplicationStageList.length - 1;

          return (
            <li key={stage.key} className="relative flex gap-3.5 pb-6 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden
                  className={`absolute top-6 left-[11px] h-full w-px ${shouldShowCompletedState ? "bg-brand" : "bg-ink/10"}`}
                />
              )}
              <span
                className={`relative grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  shouldShowCompletedState
                    ? "bg-brand text-white"
                    : isCurrent
                      ? "border-brand text-brand border-2 bg-white"
                      : "border-ink/15 text-ink/30 border bg-white"
                }`}
              >
                {shouldShowCompletedState ? <Check className="size-3.5" strokeWidth={3} /> : stageIndex + 1}
              </span>
              <div className="-mt-0.5">
                <p
                  className={`text-sm font-semibold ${isCurrent ? "text-ink" : isComplete ? "text-ink/70" : "text-ink/40"}`}
                >
                  {stage.label}
                </p>
                {isCurrent && <p className="text-ink/50 mt-0.5 text-xs">{statusMessage.currentStage}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function formatRequestedSectionLabel(sectionKey: string) {
  const labels: Record<string, string> = {
    identity: "Identity and CNIC",
    contact: "Contact information",
    address: "Address and service location",
    services: "Services and coverage areas",
    experience: "Experience and professional title",
    biography: "Professional biography",
    availability: "Availability",
    references: "Professional references",
  };
  return labels[sectionKey] ?? sectionKey.replaceAll("_", " ");
}

function getProviderApplicationStatusMessage(status: string) {
  const messages: Record<string, { summary: string; currentStage: string }> = {
    draft: {
      summary: "Complete the required profile details, save them, and submit your application for review.",
      currentStage: "Complete and save the required sections before submitting.",
    },
    submitted: {
      summary: "Your profile has been sent to the KhidmatAI administration team for review.",
      currentStage: "Submitted successfully. Check this page for the latest review status.",
    },
    under_review: {
      summary: "An administrator is currently checking your provider information and references.",
      currentStage: "Your application is being reviewed. No action is needed right now.",
    },
    changes_required: {
      summary: "An administrator returned your profile because some information needs to be updated.",
      currentStage: "Review the requested changes, update your profile, and submit it again.",
    },
    active: {
      summary: "Your provider profile has been approved and is eligible to appear to customers.",
      currentStage: "Approved. Your provider profile is active.",
    },
    rejected: {
      summary: "Your provider application was not approved after review.",
      currentStage: "The application was rejected. Check the administrator's reason for details.",
    },
    suspended: {
      summary: "Your previously active provider profile has been suspended by an administrator.",
      currentStage: "Your provider listing is currently suspended.",
    },
    removed: {
      summary: "Your provider profile has been removed and is no longer visible to customers.",
      currentStage: "Your provider listing has been removed.",
    },
  };

  return messages[status] ?? messages.draft;
}

function normalizeProviderApplicationStage(status: string) {
  if (status === "changes_required" || status === "rejected") return "draft";
  if (status === "suspended" || status === "removed") return "active";
  return status;
}

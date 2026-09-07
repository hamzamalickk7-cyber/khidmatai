// Mirrors the backend's authoritative providerReviewTransitionCatalog
// (khidmatai_server/src/modules/administration/administration-types.ts) so the
// review table can show only actions that are actually valid for a provider's
// current status. The backend independently re-validates every transition;
// this is presentation only, never the security boundary.
export interface ProviderReviewActionDefinition {
  action: string;
  label: string;
  permittedPreviousStatuses: readonly string[];
}

export const providerReviewActionCatalog: readonly ProviderReviewActionDefinition[] = [
  { action: "start_review", label: "Start review", permittedPreviousStatuses: ["submitted"] },
  { action: "approve", label: "Approve", permittedPreviousStatuses: ["submitted", "under_review"] },
  { action: "request_changes", label: "Request changes", permittedPreviousStatuses: ["submitted", "under_review"] },
  { action: "reject", label: "Reject", permittedPreviousStatuses: ["submitted", "under_review"] },
  { action: "suspend", label: "Suspend", permittedPreviousStatuses: ["active"] },
  { action: "reinstate", label: "Reinstate", permittedPreviousStatuses: ["suspended"] },
  { action: "remove", label: "Remove", permittedPreviousStatuses: ["rejected", "suspended"] },
];

export function getAvailableProviderReviewActions(currentStatus: string): ProviderReviewActionDefinition[] {
  return providerReviewActionCatalog.filter((actionDefinition) =>
    actionDefinition.permittedPreviousStatuses.includes(currentStatus),
  );
}

export const providerReviewTransitionCatalog = {
  start_review: { permittedPreviousStatuses: ["submitted"], nextStatus: "under_review" },
  approve: { permittedPreviousStatuses: ["submitted", "under_review"], nextStatus: "active" },
  reject: { permittedPreviousStatuses: ["submitted", "under_review"], nextStatus: "rejected" },
  request_changes: { permittedPreviousStatuses: ["submitted", "under_review"], nextStatus: "changes_required" },
  suspend: { permittedPreviousStatuses: ["active"], nextStatus: "suspended" },
  reinstate: { permittedPreviousStatuses: ["suspended"], nextStatus: "active" },
  remove: { permittedPreviousStatuses: ["rejected", "suspended"], nextStatus: "removed" },
} as const;

export type ProviderReviewAction = keyof typeof providerReviewTransitionCatalog;
export interface ProviderReviewActionInput {
  providerProfileId: string;
  action: ProviderReviewAction;
  reason?: string;
  requestedChangeKeys?: string[];
  expectedVersion: number;
}
export interface ProviderReviewActor {
  authenticationUserId: string;
  accountRole: "admin";
}

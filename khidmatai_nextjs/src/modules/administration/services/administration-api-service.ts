import { apiEndpointPaths } from "@/api/api-endpoint-paths";
import type { ProviderAdministrationListItem, ProviderReviewActionInput } from "@/modules/administration/types/provider-administration-types";
import { requestKhidmatAiBackendApi, requestKhidmatAiBackendApiWithMeta } from "@/services/khidmatai-backend-api-client";

export function getProviderOnboardingProfilesForAdministration(forwardedCookieHeader: string, page: number, pageSize: number) {
  return requestKhidmatAiBackendApiWithMeta<ProviderAdministrationListItem[]>(
    `${apiEndpointPaths.administrationProviderOnboardingProfiles}?page=${page}&pageSize=${pageSize}`,
    { headers: { cookie: forwardedCookieHeader } },
  );
}
export function submitProviderOnboardingReviewAction(providerReviewAction: ProviderReviewActionInput) {
  return requestKhidmatAiBackendApi<{ version: number }>(apiEndpointPaths.administrationProviderReviewActions, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(providerReviewAction) });
}

import { apiEndpointPaths } from "@/api/api-endpoint-paths";
import type { ProviderAdministrationListItem, ProviderReviewActionInput } from "@/modules/administration/types/provider-administration-types";
import { requestKhidmatAiBackendApi, requestKhidmatAiBackendApiWithMeta } from "@/services/khidmatai-backend-api-client";

export function getProviderOnboardingProfilesForAdministration(forwardedCookieHeader: string, page: number, pageSize: number) {
  return requestKhidmatAiBackendApiWithMeta<ProviderAdministrationListItem[]>(
    `${apiEndpointPaths.administrationProviderProfiles}?page=${page}&pageSize=${pageSize}`,
    { headers: { cookie: forwardedCookieHeader } },
  );
}
export function submitProviderOnboardingReviewAction(providerReviewAction: ProviderReviewActionInput) {
  const { providerProfileId, ...providerReviewActionRequestBody } = providerReviewAction;
  return requestKhidmatAiBackendApi<{ version: number }>(apiEndpointPaths.administrationProviderReviewActions(providerProfileId), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(providerReviewActionRequestBody) });
}

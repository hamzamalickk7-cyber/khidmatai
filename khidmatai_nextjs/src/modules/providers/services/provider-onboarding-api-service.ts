import { apiEndpointPaths } from "@/api/api-endpoint-paths";
import type { ProviderOnboardingProfile, ProviderOnboardingUpdate } from "@/modules/providers/types/provider-onboarding-types";
import { requestKhidmatAiBackendApi } from "@/services/khidmatai-backend-api-client";

export function getAuthenticatedProviderOnboarding() {
  return requestKhidmatAiBackendApi<ProviderOnboardingProfile>(apiEndpointPaths.providerOnboarding);
}
export function updateAuthenticatedProviderOnboarding(providerOnboardingUpdate: ProviderOnboardingUpdate) {
  return requestKhidmatAiBackendApi<{ version: number; status: string }>(apiEndpointPaths.providerOnboarding, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(providerOnboardingUpdate) });
}
export function submitAuthenticatedProviderOnboarding(expectedVersion: number) {
  return requestKhidmatAiBackendApi<{ version: number }>(apiEndpointPaths.providerOnboardingSubmission, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ expectedVersion }) });
}

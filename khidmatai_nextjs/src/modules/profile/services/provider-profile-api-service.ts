import { apiEndpointPaths } from "@/api/api-endpoint-paths";
import { khidmatAiAxiosApiClient } from "@/services/khidmatai-axios-api-client";
import type { SuccessfulApiEnvelope } from "../types/customer-profile-types";
import type { ProviderProfileData, ProviderProfilePatchInput, ProviderProfileUpdateResult } from "../types/provider-profile-types";

export async function getAuthenticatedProviderProfile() {
  const response = await khidmatAiAxiosApiClient.get<SuccessfulApiEnvelope<ProviderProfileData>>(
    apiEndpointPaths.providerProfile,
  );
  return response.data.data;
}
export async function updateAuthenticatedProviderProfile(input: ProviderProfilePatchInput) {
  const response = await khidmatAiAxiosApiClient.patch<SuccessfulApiEnvelope<ProviderProfileUpdateResult>>(
    apiEndpointPaths.providerProfile,
    input,
  );
  return response.data.data;
}
export async function submitAuthenticatedProviderProfile(expectedVersion: number) {
  const response = await khidmatAiAxiosApiClient.post<SuccessfulApiEnvelope<{ version: number }>>(
    `${apiEndpointPaths.providerProfile}/submissions`,
    { expectedVersion },
  );
  return response.data.data;
}

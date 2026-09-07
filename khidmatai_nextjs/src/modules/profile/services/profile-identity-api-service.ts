import { apiEndpointPaths } from "@/api/api-endpoint-paths";
import { khidmatAiAxiosApiClient } from "@/services/khidmatai-axios-api-client";
import type { SuccessfulApiEnvelope } from "../types/customer-profile-types";

export async function updateAuthenticatedProfileUsername(username: string) {
  const response = await khidmatAiAxiosApiClient.patch<SuccessfulApiEnvelope<{ username: string }>>(apiEndpointPaths.profileUsername, { username });
  return response.data.data;
}

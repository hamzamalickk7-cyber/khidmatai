import { frontendEnvironmentConfiguration } from "@/api/frontend-environment-configuration";
import type { PublicApiEnvelope, PublicProviderDetails, PublicProviderDirectoryItem, PublicServiceCategory } from "../types/public-provider-directory-types";

async function fetchPublicApi<Data>(path: string): Promise<Data> {
  const response = await fetch(`${frontendEnvironmentConfiguration.backendApiUrl}${path}`, { next: { revalidate: 60 } });
  if (!response.ok) throw new Error(`Public marketplace request failed with status ${response.status}.`);
  return ((await response.json()) as PublicApiEnvelope<Data>).data;
}
export const getPublicProviderDirectory = () => fetchPublicApi<PublicProviderDirectoryItem[]>("/api/v1/public/providers?pageSize=24");
export const getPublicServiceCategories = () => fetchPublicApi<PublicServiceCategory[]>("/api/v1/public/service-categories");
export async function getPublicProviderByUsername(username: string) {
  const response = await fetch(`${frontendEnvironmentConfiguration.backendApiUrl}/api/v1/public/providers/${encodeURIComponent(username)}`, { next: { revalidate: 60 } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Public provider request failed with status ${response.status}.`);
  return ((await response.json()) as PublicApiEnvelope<PublicProviderDetails>).data;
}

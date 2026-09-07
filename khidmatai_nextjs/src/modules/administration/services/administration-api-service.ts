import { apiEndpointPaths } from "@/api/api-endpoint-paths";
import type {
  ProviderAdministrationDetail,
  ProviderAdministrationListItem,
  ProviderReviewActionInput,
} from "@/modules/administration/types/provider-administration-types";
import type {
  AdministrationAuditEvent,
  AdministrationOverview,
  AdministrationUserDetail,
  AdministrationUserListItem,
} from "../types/administration-workspace-types";
import {
  requestKhidmatAiBackendApi,
  requestKhidmatAiBackendApiWithMeta,
} from "@/services/khidmatai-backend-api-client";
import { khidmatAiAxiosApiClient } from "@/services/khidmatai-axios-api-client";

export interface AdministrationServiceCategory { id: string; parentCategoryId: string | null; slug: string; displayName: string; description: string; iconIdentifier: string; displayOrder: number; isActive: boolean }

export function getProviderOnboardingProfilesForAdministration(
  forwardedCookieHeader: string,
  page: number,
  pageSize: number,
) {
  return requestKhidmatAiBackendApiWithMeta<ProviderAdministrationListItem[]>(
    `${apiEndpointPaths.administrationProviderProfiles}?page=${page}&pageSize=${pageSize}`,
    { headers: { cookie: forwardedCookieHeader } },
  );
}
export function getProviderProfileForAdministration(forwardedCookieHeader: string, providerProfileId: string) {
  return requestKhidmatAiBackendApi<ProviderAdministrationDetail>(apiEndpointPaths.administrationProviderProfile(providerProfileId), { headers: { cookie: forwardedCookieHeader } });
}
export function getAdministrationOverview(cookie: string) {
  return requestKhidmatAiBackendApi<AdministrationOverview>(apiEndpointPaths.administrationOverview, {
    headers: { cookie },
  });
}
export function getAdministrationServiceCategories(cookie: string) {
  return requestKhidmatAiBackendApi<AdministrationServiceCategory[]>(apiEndpointPaths.administrationServiceCategories, { headers: { cookie } });
}
export async function createAdministrationServiceCategory(input: Omit<AdministrationServiceCategory, "id">) { return (await khidmatAiAxiosApiClient.post<{ data: AdministrationServiceCategory }>(apiEndpointPaths.administrationServiceCategories, input)).data.data; }
export async function updateAdministrationServiceCategory(categoryId: string, input: Pick<AdministrationServiceCategory, "displayName" | "description" | "iconIdentifier" | "displayOrder" | "isActive">) { return (await khidmatAiAxiosApiClient.patch<{ data: AdministrationServiceCategory }>(apiEndpointPaths.administrationServiceCategory(categoryId), input)).data.data; }
export async function deleteAdministrationServiceCategory(categoryId: string) { await khidmatAiAxiosApiClient.delete(apiEndpointPaths.administrationServiceCategory(categoryId)); }
export function getAdministrationUsers(cookie: string, query: string) {
  return requestKhidmatAiBackendApiWithMeta<AdministrationUserListItem[]>(
    `${apiEndpointPaths.administrationUsers}?${query}`,
    { headers: { cookie } },
  );
}
export function getAdministrationUser(cookie: string, userId: string) {
  return requestKhidmatAiBackendApi<AdministrationUserDetail>(apiEndpointPaths.administrationUser(userId), {
    headers: { cookie },
  });
}
export function getAdministrationAuditEvents(cookie: string, query: string) {
  return requestKhidmatAiBackendApiWithMeta<AdministrationAuditEvent[]>(
    `${apiEndpointPaths.administrationAuditEvents}?${query}`,
    { headers: { cookie } },
  );
}
export function submitAdministrationUserAction(userId: string, actionType: "role" | "ban" | "status", body: unknown) {
  const path =
    actionType === "role"
      ? apiEndpointPaths.administrationUserRoleChanges(userId)
      : actionType === "ban"
        ? apiEndpointPaths.administrationUserBanActions(userId)
        : apiEndpointPaths.administrationUserAccountStatusActions(userId);
  return requestKhidmatAiBackendApi<AdministrationUserDetail>(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
export function submitProviderOnboardingReviewAction(providerReviewAction: ProviderReviewActionInput) {
  const { providerProfileId, ...providerReviewActionRequestBody } = providerReviewAction;
  return requestKhidmatAiBackendApi<{ version: number }>(
    apiEndpointPaths.administrationProviderReviewActions(providerProfileId),
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(providerReviewActionRequestBody),
    },
  );
}

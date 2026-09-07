import { ApplicationError } from "../../shared/application-error.js";
import { getConfiguredCloudinaryClient } from "../../config/cloudinary-configuration.js";
import type { ProviderOnboardingListPage } from "./administration-repository.js";
import {
  findAdministrationUserDetail,
  findProviderProfileForAdministration,
  getAdministrationDashboardMetrics,
  listAdministrationAuditEvents,
  listAdministrationUsers,
  listProviderOnboardingProfilesForAdministration,
  mutateAdministrationUser,
  persistProviderReviewAction,
  type AdministrationCollectionQuery,
} from "./administration-repository.js";
import type { ProviderReviewActionInput, ProviderReviewActor } from "./administration-types.js";

export async function getProviderOnboardingProfilesForAdministration({ page, pageSize }: ProviderOnboardingListPage) {
  const { items, total } = await listProviderOnboardingProfilesForAdministration({ page, pageSize });
  return { items, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
}
export async function getProviderProfileForAdministration(providerProfileId: string, canViewSensitiveMedia: boolean) {
  const profile = await findProviderProfileForAdministration(providerProfileId, canViewSensitiveMedia);
  if (!profile) throw new ApplicationError(404, "PROVIDER_PROFILE_NOT_FOUND", "The requested provider profile could not be found.");
  const containsAuthenticatedMedia = profile.mediaAssets.some(
    ({ cloudinaryDeliveryType }) => cloudinaryDeliveryType === "authenticated",
  );
  const cloudinary = containsAuthenticatedMedia ? getConfiguredCloudinaryClient().cloudinary : null;
  return {
    ...profile,
    mediaAssets: profile.mediaAssets.map(({ cloudinaryPublicIdentifier, cloudinaryDeliveryType, ...asset }) => ({
      ...asset,
      url:
        cloudinaryDeliveryType === "authenticated" && cloudinary
          ? cloudinary.url(cloudinaryPublicIdentifier, {
              resource_type: "image",
              type: "authenticated",
              secure: true,
              sign_url: true,
            })
          : asset.url,
    })),
  };
}

export async function applyProviderOnboardingReviewAction(
  providerReviewAction: ProviderReviewActionInput,
  providerReviewActor: ProviderReviewActor,
) {
  const updatedProviderProfile = await persistProviderReviewAction(providerReviewAction, providerReviewActor);
  if (!updatedProviderProfile)
    throw new ApplicationError(
      409,
      "PROVIDER_REVIEW_TRANSITION_CONFLICT",
      "The provider profile changed or this review action is unavailable.",
    );
  return updatedProviderProfile;
}

export const getAdministrationOverview = getAdministrationDashboardMetrics;
export async function getAdministrationUsers(query: AdministrationCollectionQuery) {
  const result = await listAdministrationUsers(query);
  return {
    items: result.items,
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      total: result.total,
      totalPages: Math.max(1, Math.ceil(result.total / query.pageSize)),
    },
  };
}
export async function getAdministrationUser(userId: string) {
  const user = await findAdministrationUserDetail(userId);
  if (!user)
    throw new ApplicationError(404, "ADMINISTRATION_USER_NOT_FOUND", "The requested account could not be found.");
  return user;
}
export async function applyAdministrationUserMutation(
  userId: string,
  actorUserId: string,
  mutation: Parameters<typeof mutateAdministrationUser>[2],
) {
  const result = await mutateAdministrationUser(userId, actorUserId, mutation);
  if (!result)
    throw new ApplicationError(404, "ADMINISTRATION_USER_NOT_FOUND", "The requested account could not be found.");
  if (result.conflict === "self")
    throw new ApplicationError(
      409,
      "ADMINISTRATION_SELF_MUTATION_BLOCKED",
      "You cannot apply this security action to your own account.",
    );
  if (result.conflict === "last_admin")
    throw new ApplicationError(
      409,
      "LAST_ACTIVE_ADMIN_REQUIRED",
      "The platform must retain at least one active administrator.",
    );
  if (result.conflict === "deactivated")
    throw new ApplicationError(
      409,
      "DEACTIVATED_ACCOUNT_ACTION_BLOCKED",
      "Reactivate this account before changing its ban status.",
    );
  return getAdministrationUser(userId);
}
export async function getAdministrationAuditEvents(query: {
  page: number;
  pageSize: number;
  search: string;
  eventKey?: string;
}) {
  const result = await listAdministrationAuditEvents(query);
  return {
    items: result.items,
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      total: result.total,
      totalPages: Math.max(1, Math.ceil(result.total / query.pageSize)),
    },
  };
}

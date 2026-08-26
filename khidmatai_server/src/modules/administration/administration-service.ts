import { ApplicationError } from "../../shared/application-error.js";
import type { ProviderOnboardingListPage } from "./administration-repository.js";
import { listProviderOnboardingProfilesForAdministration, persistProviderReviewAction } from "./administration-repository.js";
import type { ProviderReviewActionInput, ProviderReviewActor } from "./administration-types.js";

export async function getProviderOnboardingProfilesForAdministration({ page, pageSize }: ProviderOnboardingListPage) {
  const { items, total } = await listProviderOnboardingProfilesForAdministration({ page, pageSize });
  return { items, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
}

export async function applyProviderOnboardingReviewAction(providerReviewAction: ProviderReviewActionInput, providerReviewActor: ProviderReviewActor) {
  const updatedProviderProfile = await persistProviderReviewAction(providerReviewAction, providerReviewActor);
  if (!updatedProviderProfile) throw new ApplicationError(409, "PROVIDER_REVIEW_TRANSITION_CONFLICT", "The provider profile changed or this review action is unavailable.");
  return updatedProviderProfile;
}

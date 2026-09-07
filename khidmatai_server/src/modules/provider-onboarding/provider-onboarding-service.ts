import { ApplicationError } from "../../shared/application-error.js";
import type { ProviderOnboardingPatchInput } from "./provider-onboarding-types.js";
import { findOrCreateProviderOnboardingByAuthenticationUserId, submitCompletedProviderOnboarding, updateProviderOnboardingDraft } from "./provider-onboarding-repository.js";

export async function getAuthenticatedProviderOnboarding(authenticationUserId: string) {
  const providerOnboarding = await findOrCreateProviderOnboardingByAuthenticationUserId(authenticationUserId);
  if (!providerOnboarding) throw new ApplicationError(500, "PROVIDER_ONBOARDING_INITIALIZATION_FAILED", "The provider profile could not be initialized.");
  return providerOnboarding;
}

export async function saveAuthenticatedProviderOnboardingDraft(authenticationUserId: string, providerOnboardingUpdate: ProviderOnboardingPatchInput) {
  const updatedProviderOnboarding = await updateProviderOnboardingDraft(authenticationUserId, providerOnboardingUpdate);
  if (!updatedProviderOnboarding) throw new ApplicationError(409, "PROVIDER_ONBOARDING_VERSION_CONFLICT", "This onboarding profile changed or can no longer be edited. Reload and try again.");
  return updatedProviderOnboarding;
}

export async function submitAuthenticatedProviderOnboarding(authenticationUserId: string, expectedProviderProfileVersion: number) {
  const submittedProviderOnboarding = await submitCompletedProviderOnboarding(authenticationUserId, expectedProviderProfileVersion);
  if (!submittedProviderOnboarding) throw new ApplicationError(409, "PROVIDER_ONBOARDING_NOT_READY", "Complete and save all required onboarding information, then reload and try again.");
  return submittedProviderOnboarding;
}

import { ApplicationError } from "../../shared/application-error.js";
import type { ProviderOnboardingUpdateInput } from "./provider-onboarding-types.js";
import { findProviderOnboardingByAuthenticationUserId, submitCompletedProviderOnboarding, updateProviderOnboardingDraft } from "./provider-onboarding-repository.js";

export async function getAuthenticatedProviderOnboarding(authenticationUserId: string) {
  const providerOnboarding = await findProviderOnboardingByAuthenticationUserId(authenticationUserId);
  if (!providerOnboarding) throw new ApplicationError(404, "PROVIDER_ONBOARDING_NOT_FOUND", "The provider onboarding profile could not be found.");
  return providerOnboarding;
}

export async function saveAuthenticatedProviderOnboardingDraft(authenticationUserId: string, providerOnboardingUpdate: ProviderOnboardingUpdateInput) {
  const updatedProviderOnboarding = await updateProviderOnboardingDraft(authenticationUserId, providerOnboardingUpdate);
  if (!updatedProviderOnboarding) throw new ApplicationError(409, "PROVIDER_ONBOARDING_VERSION_CONFLICT", "This onboarding profile changed or can no longer be edited. Reload and try again.");
  return updatedProviderOnboarding;
}

export async function submitAuthenticatedProviderOnboarding(authenticationUserId: string, expectedProviderProfileVersion: number) {
  const submittedProviderOnboarding = await submitCompletedProviderOnboarding(authenticationUserId, expectedProviderProfileVersion);
  if (!submittedProviderOnboarding) throw new ApplicationError(409, "PROVIDER_ONBOARDING_NOT_READY", "Complete and save all required onboarding information, then reload and try again.");
  return submittedProviderOnboarding;
}

export const apiEndpointPaths = {
  authenticationBase: "/api/auth",
  authenticationSession: "/api/auth/get-session",
  providerOnboarding: "/api/provider/onboarding",
  providerOnboardingSubmission: "/api/provider/onboarding/submit",
  administrationProviderOnboardingProfiles: "/api/administration/provider-onboarding-profiles",
  administrationProviderReviewActions: "/api/administration/provider-onboarding-profiles/review-actions",
} as const;

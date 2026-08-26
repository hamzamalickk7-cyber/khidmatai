export const apiEndpointPaths = {
  authenticationBase: "/api/auth",
  authenticationSession: "/api/auth/get-session",
  customerProfile: "/api/v1/customer-profile",
  customerSavedAddresses: "/api/v1/customer-profile/addresses",
  customerSavedAddress: (addressId: string) => `/api/v1/customer-profile/addresses/${addressId}`,
  providerProfile: "/api/v1/provider-profile",
  administrationProviderProfiles: "/api/v1/administration/provider-profiles",
  administrationProviderReviewActions: (providerProfileId: string) => `/api/v1/administration/provider-profiles/${providerProfileId}/review-actions`,
} as const;

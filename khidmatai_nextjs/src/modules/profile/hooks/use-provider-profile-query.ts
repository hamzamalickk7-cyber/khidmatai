"use client";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAuthenticatedProviderProfile,
  submitAuthenticatedProviderProfile,
  updateAuthenticatedProviderProfile,
} from "../services/provider-profile-api-service";
import type { ProviderProfileData } from "../types/provider-profile-types";
export const createProviderProfileQueryKey = (authenticationUserId: string) => ["authenticated-provider-profile", authenticationUserId] as const;
export function useProviderProfileQuery(authenticationUserId: string) {
  return useQuery({
    queryKey: createProviderProfileQueryKey(authenticationUserId),
    queryFn: getAuthenticatedProviderProfile,
    // A newly registered provider can reach /profile a fraction of a second
    // before the authentication creation hook has finished its profile setup.
    // Keep that short-lived race behind the loading state instead of showing a
    // false permanent error that disappears on a browser refresh.
    retry: (failureCount, error) => {
      if (failureCount >= 5 || !axios.isAxiosError(error)) return false;
      const responseStatus = error.response?.status;
      return responseStatus === undefined || responseStatus === 401 || responseStatus === 404 || responseStatus >= 500;
    },
    retryDelay: (attemptIndex) => Math.min(350 * (attemptIndex + 1), 1_500),
  });
}
export function useUpdateProviderProfileMutation(authenticationUserId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: updateAuthenticatedProviderProfile,
    onSuccess: (updateResult, submittedPatch) => {
      const queryKey = createProviderProfileQueryKey(authenticationUserId);
      client.setQueryData<ProviderProfileData>(queryKey, (currentProfile) => {
        if (!currentProfile) return currentProfile;

        const scalarPatch = {
          ...(submittedPatch.fullName !== undefined ? { fullName: submittedPatch.fullName } : {}),
          ...(submittedPatch.phoneNumber !== undefined ? { phoneNumber: submittedPatch.phoneNumber } : {}),
          ...(submittedPatch.addressLine !== undefined ? { addressLine: submittedPatch.addressLine } : {}),
          ...(submittedPatch.city !== undefined ? { city: submittedPatch.city } : {}),
          ...(submittedPatch.professionalTitle !== undefined ? { professionalTitle: submittedPatch.professionalTitle } : {}),
          ...(submittedPatch.yearsOfExperience !== undefined ? { yearsOfExperience: submittedPatch.yearsOfExperience } : {}),
          ...(submittedPatch.professionalBio !== undefined ? { professionalBio: submittedPatch.professionalBio } : {}),
          ...(submittedPatch.availabilitySummary !== undefined ? { availabilitySummary: submittedPatch.availabilitySummary } : {}),
          ...(submittedPatch.governmentIdentityNumber !== undefined ? { governmentIdentityNumber: submittedPatch.governmentIdentityNumber } : {}),
          ...(submittedPatch.categoryKeys !== undefined ? { categoryKeys: submittedPatch.categoryKeys } : {}),
          ...(submittedPatch.serviceAreas !== undefined ? { serviceAreas: submittedPatch.serviceAreas } : {}),
          ...(submittedPatch.isAvailableForNewJobs !== undefined ? { isAvailableForNewJobs: submittedPatch.isAvailableForNewJobs } : {}),
          ...(submittedPatch.offersEmergencyService !== undefined ? { offersEmergencyService: submittedPatch.offersEmergencyService } : {}),
          ...(submittedPatch.maximumTravelDistanceKilometers !== undefined
            ? { maximumTravelDistanceKilometers: submittedPatch.maximumTravelDistanceKilometers }
            : {}),
        };

        return { ...currentProfile, ...scalarPatch, version: updateResult.version, status: updateResult.status };
      });
      void client.invalidateQueries({ queryKey });
    },
  });
}
export function useSubmitProviderProfileMutation(authenticationUserId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: submitAuthenticatedProviderProfile,
    onSuccess: () => client.invalidateQueries({ queryKey: createProviderProfileQueryKey(authenticationUserId) }),
  });
}

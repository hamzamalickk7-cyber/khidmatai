"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAuthenticatedCustomerProfile,
  updateAuthenticatedCustomerProfile,
} from "../services/customer-profile-api-service";

export const createCustomerProfileQueryKey = (authenticationUserId: string) => ["authenticated-customer-profile", authenticationUserId] as const;
export function useCustomerProfileQuery(authenticationUserId: string) {
  return useQuery({ queryKey: createCustomerProfileQueryKey(authenticationUserId), queryFn: getAuthenticatedCustomerProfile });
}
export function useUpdateCustomerProfileMutation(authenticationUserId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAuthenticatedCustomerProfile,
    onSuccess: (profile) => queryClient.setQueryData(createCustomerProfileQueryKey(authenticationUserId), profile),
  });
}

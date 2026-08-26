"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAuthenticatedCustomerProfile,
  updateAuthenticatedCustomerProfile,
} from "../services/customer-profile-api-service";

export const customerProfileQueryKey = ["authenticated-customer-profile"] as const;
export function useCustomerProfileQuery() {
  return useQuery({ queryKey: customerProfileQueryKey, queryFn: getAuthenticatedCustomerProfile });
}
export function useUpdateCustomerProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAuthenticatedCustomerProfile,
    onSuccess: (profile) => queryClient.setQueryData(customerProfileQueryKey, profile),
  });
}

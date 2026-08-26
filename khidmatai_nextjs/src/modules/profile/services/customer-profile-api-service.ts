import type { CustomerProfile, CustomerSavedAddress, SuccessfulApiEnvelope } from "../types/customer-profile-types";
import type {
  CustomerProfileFormValues,
  CustomerSavedAddressFormValues,
} from "../validations/customer-profile-form-validation-schema";
import { apiEndpointPaths } from "@/api/api-endpoint-paths";
import { khidmatAiAxiosApiClient } from "@/services/khidmatai-axios-api-client";

export async function getAuthenticatedCustomerProfile() {
  const response = await khidmatAiAxiosApiClient.get<SuccessfulApiEnvelope<CustomerProfile>>(
    apiEndpointPaths.customerProfile,
  );
  return response.data.data;
}
export async function updateAuthenticatedCustomerProfile(input: CustomerProfileFormValues) {
  const response = await khidmatAiAxiosApiClient.put<SuccessfulApiEnvelope<CustomerProfile>>(
    apiEndpointPaths.customerProfile,
    input,
  );
  return response.data.data;
}
export async function createAuthenticatedCustomerSavedAddress(input: CustomerSavedAddressFormValues) {
  const response = await khidmatAiAxiosApiClient.post<SuccessfulApiEnvelope<CustomerSavedAddress>>(
    apiEndpointPaths.customerSavedAddresses,
    input,
  );
  return response.data.data;
}
export async function updateAuthenticatedCustomerSavedAddress(
  addressId: string,
  input: CustomerSavedAddressFormValues,
) {
  const response = await khidmatAiAxiosApiClient.put<SuccessfulApiEnvelope<CustomerSavedAddress>>(
    apiEndpointPaths.customerSavedAddress(addressId),
    input,
  );
  return response.data.data;
}
export async function deleteAuthenticatedCustomerSavedAddress(addressId: string) {
  await khidmatAiAxiosApiClient.delete(apiEndpointPaths.customerSavedAddress(addressId));
}

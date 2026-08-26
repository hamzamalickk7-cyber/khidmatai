import { ApplicationError } from "../../shared/application-error.js";
import type { CustomerProfileUpdateInput, CustomerSavedAddressInput } from "./customer-profile-types.js";
import {
  createCustomerSavedAddress,
  deleteCustomerSavedAddress,
  findCustomerProfileByAuthenticationUserId,
  updateCustomerProfile,
  updateCustomerSavedAddress,
} from "./customer-profile-repository.js";

export async function getAuthenticatedCustomerProfile(authenticationUserId: string) {
  const profile = await findCustomerProfileByAuthenticationUserId(authenticationUserId);
  if (!profile)
    throw new ApplicationError(404, "CUSTOMER_PROFILE_NOT_FOUND", "The customer profile could not be found.");
  return profile;
}

export async function saveAuthenticatedCustomerProfile(
  authenticationUserId: string,
  input: CustomerProfileUpdateInput,
) {
  const profile = await updateCustomerProfile(authenticationUserId, input);
  if (!profile)
    throw new ApplicationError(
      409,
      "CUSTOMER_PROFILE_VERSION_CONFLICT",
      "This profile changed in another session. Reload it and try again.",
    );
  return getAuthenticatedCustomerProfile(authenticationUserId);
}

export async function addAuthenticatedCustomerSavedAddress(
  authenticationUserId: string,
  input: CustomerSavedAddressInput,
) {
  const address = await createCustomerSavedAddress(authenticationUserId, input);
  if (!address)
    throw new ApplicationError(404, "CUSTOMER_PROFILE_NOT_FOUND", "The customer profile could not be found.");
  return address;
}

export async function saveAuthenticatedCustomerSavedAddress(
  authenticationUserId: string,
  addressId: string,
  input: CustomerSavedAddressInput,
) {
  const address = await updateCustomerSavedAddress(authenticationUserId, addressId, input);
  if (!address)
    throw new ApplicationError(
      404,
      "SAVED_ADDRESS_NOT_FOUND",
      "The saved address does not exist or does not belong to this account.",
    );
  return address;
}

export async function removeAuthenticatedCustomerSavedAddress(authenticationUserId: string, addressId: string) {
  if (!(await deleteCustomerSavedAddress(authenticationUserId, addressId)))
    throw new ApplicationError(
      404,
      "SAVED_ADDRESS_NOT_FOUND",
      "The saved address does not exist or does not belong to this account.",
    );
}

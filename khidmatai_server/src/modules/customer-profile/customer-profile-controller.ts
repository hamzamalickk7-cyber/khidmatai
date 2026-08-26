import type { Request, Response } from "express";
import { sendSuccessfulApiResponse } from "../../shared/api-response.js";
import {
  addAuthenticatedCustomerSavedAddress,
  getAuthenticatedCustomerProfile,
  removeAuthenticatedCustomerSavedAddress,
  saveAuthenticatedCustomerProfile,
  saveAuthenticatedCustomerSavedAddress,
} from "./customer-profile-service.js";
import {
  customerProfileUpdateValidationSchema,
  customerSavedAddressCreationValidationSchema,
  customerSavedAddressPathParametersValidationSchema,
  customerSavedAddressUpdateValidationSchema,
} from "./customer-profile-validation-schemas.js";

const authenticatedUserId = (request: Request) => request.authenticatedSession!.user.id;

export async function getCustomerProfileController(request: Request, response: Response) {
  return sendSuccessfulApiResponse(response, await getAuthenticatedCustomerProfile(authenticatedUserId(request)));
}
export async function updateCustomerProfileController(request: Request, response: Response) {
  return sendSuccessfulApiResponse(
    response,
    await saveAuthenticatedCustomerProfile(
      authenticatedUserId(request),
      customerProfileUpdateValidationSchema.parse(request.body),
    ),
  );
}
export async function createCustomerSavedAddressController(request: Request, response: Response) {
  return sendSuccessfulApiResponse(
    response,
    await addAuthenticatedCustomerSavedAddress(
      authenticatedUserId(request),
      customerSavedAddressCreationValidationSchema.parse(request.body),
    ),
    201,
  );
}
export async function updateCustomerSavedAddressController(request: Request, response: Response) {
  const { addressId } = customerSavedAddressPathParametersValidationSchema.parse(request.params);
  return sendSuccessfulApiResponse(
    response,
    await saveAuthenticatedCustomerSavedAddress(
      authenticatedUserId(request),
      addressId,
      customerSavedAddressUpdateValidationSchema.parse(request.body),
    ),
  );
}
export async function deleteCustomerSavedAddressController(request: Request, response: Response) {
  const { addressId } = customerSavedAddressPathParametersValidationSchema.parse(request.params);
  await removeAuthenticatedCustomerSavedAddress(authenticatedUserId(request), addressId);
  return response.status(204).send();
}

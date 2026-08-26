import type { Request, Response } from "express";
import { sendSuccessfulApiResponse } from "../../shared/api-response.js";
import { applyProviderOnboardingReviewAction, getProviderOnboardingProfilesForAdministration } from "./administration-service.js";
import { providerOnboardingListQueryValidationSchema, providerProfileRouteParametersValidationSchema, providerReviewActionRequestBodyValidationSchema } from "./administration-validation-schemas.js";

export async function listProviderOnboardingProfilesController(request: Request, response: Response) {
  const { page, pageSize } = providerOnboardingListQueryValidationSchema.parse(request.query);
  const { items, meta } = await getProviderOnboardingProfilesForAdministration({ page, pageSize });
  return sendSuccessfulApiResponse(response, items, 200, meta);
}

export async function applyProviderOnboardingReviewActionController(request: Request, response: Response) {
  const validatedProviderProfileRouteParameters = providerProfileRouteParametersValidationSchema.parse(request.params);
  const validatedProviderReviewActionRequestBody = providerReviewActionRequestBodyValidationSchema.parse(request.body);
  const validatedProviderReviewAction = { ...validatedProviderProfileRouteParameters, ...validatedProviderReviewActionRequestBody };
  const updatedProviderProfile = await applyProviderOnboardingReviewAction(validatedProviderReviewAction, {
    authenticationUserId: request.authenticatedSession!.user.id,
    accountRole: "admin",
  });
  return sendSuccessfulApiResponse(response, updatedProviderProfile);
}

import type { Request, Response } from "express";
import { sendSuccessfulApiResponse } from "../../shared/api-response.js";
import { applyProviderOnboardingReviewAction, getProviderOnboardingProfilesForAdministration } from "./administration-service.js";
import { providerOnboardingListQueryValidationSchema, providerReviewActionValidationSchema } from "./administration-validation-schemas.js";

export async function listProviderOnboardingProfilesController(request: Request, response: Response) {
  const { page, pageSize } = providerOnboardingListQueryValidationSchema.parse(request.query);
  const { items, meta } = await getProviderOnboardingProfilesForAdministration({ page, pageSize });
  return sendSuccessfulApiResponse(response, items, 200, meta);
}

export async function applyProviderOnboardingReviewActionController(request: Request, response: Response) {
  const validatedProviderReviewAction = providerReviewActionValidationSchema.parse(request.body);
  const updatedProviderProfile = await applyProviderOnboardingReviewAction(validatedProviderReviewAction, {
    authenticationUserId: request.authenticatedSession!.user.id,
    accountRole: "admin",
  });
  return sendSuccessfulApiResponse(response, updatedProviderProfile);
}

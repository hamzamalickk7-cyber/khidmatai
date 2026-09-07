import type { Request, Response } from "express";
import { sendSuccessfulApiResponse } from "../../shared/api-response.js";
import { getAuthenticatedProviderOnboarding, saveAuthenticatedProviderOnboardingDraft, submitAuthenticatedProviderOnboarding } from "./provider-onboarding-service.js";
import { providerOnboardingPatchValidationSchema, providerOnboardingSubmissionValidationSchema, providerOnboardingUpdateValidationSchema } from "./provider-onboarding-validation-schemas.js";

function getAuthenticatedProviderUserId(request: Request) {
  return request.authenticatedSession!.user.id;
}

export async function getProviderOnboardingController(request: Request, response: Response) {
  const providerOnboarding = await getAuthenticatedProviderOnboarding(getAuthenticatedProviderUserId(request));
  return sendSuccessfulApiResponse(response, providerOnboarding);
}

export async function updateProviderOnboardingController(request: Request, response: Response) {
  const validatedProviderOnboardingUpdate = request.method === "PATCH" ? providerOnboardingPatchValidationSchema.parse(request.body) : providerOnboardingUpdateValidationSchema.parse(request.body);
  const updatedProviderOnboarding = await saveAuthenticatedProviderOnboardingDraft(getAuthenticatedProviderUserId(request), validatedProviderOnboardingUpdate);
  return sendSuccessfulApiResponse(response, updatedProviderOnboarding);
}

export async function submitProviderOnboardingController(request: Request, response: Response) {
  const { expectedVersion } = providerOnboardingSubmissionValidationSchema.parse(request.body);
  const submittedProviderOnboarding = await submitAuthenticatedProviderOnboarding(getAuthenticatedProviderUserId(request), expectedVersion);
  return sendSuccessfulApiResponse(response, submittedProviderOnboarding);
}

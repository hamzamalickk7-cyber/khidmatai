import type { Request, Response } from "express";
import { sendSuccessfulApiResponse } from "../../shared/api-response.js";
import {
  applyAdministrationUserMutation,
  applyProviderOnboardingReviewAction,
  getAdministrationAuditEvents,
  getAdministrationOverview,
  getAdministrationUser,
  getAdministrationUsers,
  getProviderOnboardingProfilesForAdministration,
  getProviderProfileForAdministration,
} from "./administration-service.js";
import {
  administrationAccountStatusValidationSchema,
  administrationAuditQueryValidationSchema,
  administrationBanValidationSchema,
  administrationCollectionQueryValidationSchema,
  administrationRoleChangeValidationSchema,
  administrationUserRouteParametersValidationSchema,
  providerOnboardingListQueryValidationSchema,
  providerProfileRouteParametersValidationSchema,
  providerReviewActionRequestBodyValidationSchema,
} from "./administration-validation-schemas.js";

export async function listProviderOnboardingProfilesController(request: Request, response: Response) {
  const { page, pageSize } = providerOnboardingListQueryValidationSchema.parse(request.query);
  const { items, meta } = await getProviderOnboardingProfilesForAdministration({ page, pageSize });
  return sendSuccessfulApiResponse(response, items, 200, meta);
}
export async function getProviderProfileForAdministrationController(request: Request, response: Response) {
  const { providerProfileId } = providerProfileRouteParametersValidationSchema.parse(request.params);
  return sendSuccessfulApiResponse(
    response,
    await getProviderProfileForAdministration(providerProfileId, request.authenticatedSession!.user.role === "admin"),
  );
}

export async function getAdministrationOverviewController(_request: Request, response: Response) {
  return sendSuccessfulApiResponse(response, await getAdministrationOverview());
}
export async function listAdministrationUsersController(request: Request, response: Response) {
  const query = administrationCollectionQueryValidationSchema.parse(request.query);
  const result = await getAdministrationUsers(query);
  return sendSuccessfulApiResponse(response, result.items, 200, result.meta);
}
export async function getAdministrationUserController(request: Request, response: Response) {
  const { userId } = administrationUserRouteParametersValidationSchema.parse(request.params);
  return sendSuccessfulApiResponse(response, await getAdministrationUser(userId));
}
export async function changeAdministrationUserRoleController(request: Request, response: Response) {
  const { userId } = administrationUserRouteParametersValidationSchema.parse(request.params);
  const input = administrationRoleChangeValidationSchema.parse(request.body);
  return sendSuccessfulApiResponse(
    response,
    await applyAdministrationUserMutation(userId, request.authenticatedSession!.user.id, { kind: "role", ...input }),
  );
}
export async function changeAdministrationUserBanController(request: Request, response: Response) {
  const { userId } = administrationUserRouteParametersValidationSchema.parse(request.params);
  const input = administrationBanValidationSchema.parse(request.body);
  return sendSuccessfulApiResponse(
    response,
    await applyAdministrationUserMutation(userId, request.authenticatedSession!.user.id, {
      kind: "ban",
      banned: input.action === "ban",
      reason: input.reason ?? "Administrator removed the account ban.",
    }),
  );
}
export async function changeAdministrationUserAccountStatusController(request: Request, response: Response) {
  const { userId } = administrationUserRouteParametersValidationSchema.parse(request.params);
  const input = administrationAccountStatusValidationSchema.parse(request.body);
  return sendSuccessfulApiResponse(
    response,
    await applyAdministrationUserMutation(userId, request.authenticatedSession!.user.id, {
      kind: "deactivation",
      deactivated: input.action === "deactivate",
      reason: input.reason ?? "Administrator reactivated the account.",
    }),
  );
}
export async function listAdministrationAuditEventsController(request: Request, response: Response) {
  const query = administrationAuditQueryValidationSchema.parse(request.query);
  const result = await getAdministrationAuditEvents(query);
  return sendSuccessfulApiResponse(response, result.items, 200, result.meta);
}

export async function applyProviderOnboardingReviewActionController(request: Request, response: Response) {
  const validatedProviderProfileRouteParameters = providerProfileRouteParametersValidationSchema.parse(request.params);
  const validatedProviderReviewActionRequestBody = providerReviewActionRequestBodyValidationSchema.parse(request.body);
  const validatedProviderReviewAction = {
    ...validatedProviderProfileRouteParameters,
    ...validatedProviderReviewActionRequestBody,
  };
  const updatedProviderProfile = await applyProviderOnboardingReviewAction(validatedProviderReviewAction, {
    authenticationUserId: request.authenticatedSession!.user.id,
    accountRole: "admin",
  });
  return sendSuccessfulApiResponse(response, updatedProviderProfile);
}

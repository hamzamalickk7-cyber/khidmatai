import { Router } from "express";
import { requireAccountRoleMiddleware } from "../../middleware/require-account-role-middleware.js";
import { requireAuthenticatedSessionMiddleware } from "../../middleware/require-authenticated-session-middleware.js";
import { requireTrustedRequestOriginMiddleware } from "../../middleware/require-trusted-request-origin-middleware.js";
import { createAsyncRequestHandler } from "../../shared/async-request-handler.js";
import { applyProviderOnboardingReviewActionController, listProviderOnboardingProfilesController } from "./administration-controller.js";

export const administrationRoutes = Router();
administrationRoutes.use(createAsyncRequestHandler(requireAuthenticatedSessionMiddleware));
administrationRoutes.get("/provider-onboarding-profiles", requireAccountRoleMiddleware("admin", "support"), createAsyncRequestHandler(listProviderOnboardingProfilesController));
administrationRoutes.post("/provider-onboarding-profiles/review-actions", requireTrustedRequestOriginMiddleware, requireAccountRoleMiddleware("admin"), createAsyncRequestHandler(applyProviderOnboardingReviewActionController));

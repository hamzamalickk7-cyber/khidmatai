import { Router } from "express";
import { requireAccountRoleMiddleware } from "../../middleware/require-account-role-middleware.js";
import { requireAuthenticatedSessionMiddleware } from "../../middleware/require-authenticated-session-middleware.js";
import { requireTrustedRequestOriginMiddleware } from "../../middleware/require-trusted-request-origin-middleware.js";
import { createAsyncRequestHandler } from "../../shared/async-request-handler.js";
import { getProviderOnboardingController, submitProviderOnboardingController, updateProviderOnboardingController } from "./provider-onboarding-controller.js";

export const providerOnboardingRoutes = Router();
providerOnboardingRoutes.use(createAsyncRequestHandler(requireAuthenticatedSessionMiddleware), requireAccountRoleMiddleware("provider"));
providerOnboardingRoutes.get("/", createAsyncRequestHandler(getProviderOnboardingController));
providerOnboardingRoutes.put("/", requireTrustedRequestOriginMiddleware, createAsyncRequestHandler(updateProviderOnboardingController));
providerOnboardingRoutes.post("/submit", requireTrustedRequestOriginMiddleware, createAsyncRequestHandler(submitProviderOnboardingController));

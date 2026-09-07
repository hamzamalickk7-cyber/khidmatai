import { Router } from "express";
import { createAsyncRequestHandler } from "../../shared/async-request-handler.js";
import { requireAuthenticatedSessionMiddleware } from "../../middleware/require-authenticated-session-middleware.js";
import { requireTrustedRequestOriginMiddleware } from "../../middleware/require-trusted-request-origin-middleware.js";
import { updateAuthenticatedUsernameController } from "./profile-identity-controller.js";

export const profileIdentityRoutes = Router();
profileIdentityRoutes.use(createAsyncRequestHandler(requireAuthenticatedSessionMiddleware));
profileIdentityRoutes.patch("/username", requireTrustedRequestOriginMiddleware, createAsyncRequestHandler(updateAuthenticatedUsernameController));

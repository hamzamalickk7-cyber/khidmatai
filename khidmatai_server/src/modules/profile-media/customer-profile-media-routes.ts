import { Router } from "express";
import { z } from "zod";
import { requireAuthenticatedSessionMiddleware } from "../../middleware/require-authenticated-session-middleware.js";
import { requireAccountRoleMiddleware } from "../../middleware/require-account-role-middleware.js";
import { requireTrustedRequestOriginMiddleware } from "../../middleware/require-trusted-request-origin-middleware.js";
import { createAsyncRequestHandler } from "../../shared/async-request-handler.js";
import { sendSuccessfulApiResponse } from "../../shared/api-response.js";
import { confirmCustomerAvatarUpload, createCustomerAvatarUploadSignature, deleteCustomerAvatar } from "./profile-media-service.js";

const confirmationSchema = z.object({ cloudinaryPublicIdentifier: z.string().min(10).max(300) }).strict();
export const customerProfileMediaRoutes = Router();
customerProfileMediaRoutes.use(createAsyncRequestHandler(requireAuthenticatedSessionMiddleware), requireAccountRoleMiddleware("customer"), requireTrustedRequestOriginMiddleware);
customerProfileMediaRoutes.post("/upload-signatures", createAsyncRequestHandler(async (request, response) => sendSuccessfulApiResponse(response, await createCustomerAvatarUploadSignature(request.authenticatedSession!.user.id), 201)));
customerProfileMediaRoutes.post("/confirmations", createAsyncRequestHandler(async (request, response) => { const input = confirmationSchema.parse(request.body); return sendSuccessfulApiResponse(response, await confirmCustomerAvatarUpload(request.authenticatedSession!.user.id, input.cloudinaryPublicIdentifier), 201); }));
customerProfileMediaRoutes.delete("/profile-image", createAsyncRequestHandler(async (request, response) => { await deleteCustomerAvatar(request.authenticatedSession!.user.id); return response.status(204).send(); }));

import { Router } from "express";
import { requireAuthenticatedSessionMiddleware } from "../../middleware/require-authenticated-session-middleware.js";
import { requireAccountRoleMiddleware } from "../../middleware/require-account-role-middleware.js";
import { requireTrustedRequestOriginMiddleware } from "../../middleware/require-trusted-request-origin-middleware.js";
import { createAsyncRequestHandler } from "../../shared/async-request-handler.js";
import { confirmMediaUploadController, createMediaUploadSignatureController, deleteMediaAssetController } from "./profile-media-controller.js";

export const profileMediaRoutes = Router();
profileMediaRoutes.use(createAsyncRequestHandler(requireAuthenticatedSessionMiddleware), requireAccountRoleMiddleware("provider"), requireTrustedRequestOriginMiddleware);
profileMediaRoutes.post("/upload-signatures", createAsyncRequestHandler(createMediaUploadSignatureController));
profileMediaRoutes.post("/confirmations", createAsyncRequestHandler(confirmMediaUploadController));
profileMediaRoutes.delete("/:mediaAssetId", createAsyncRequestHandler(deleteMediaAssetController));

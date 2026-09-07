import type { Request, Response } from "express";
import { sendSuccessfulApiResponse } from "../../shared/api-response.js";
import { confirmMediaUploadValidationSchema, createMediaUploadSignatureValidationSchema, mediaAssetPathValidationSchema } from "./profile-media-validation-schemas.js";
import { confirmProviderMediaUpload, createProviderMediaUploadSignature, deleteProviderMediaAsset } from "./profile-media-service.js";

const userId = (request: Request) => request.authenticatedSession!.user.id;
export async function createMediaUploadSignatureController(request: Request, response: Response) {
  const { mediaPurpose } = createMediaUploadSignatureValidationSchema.parse(request.body);
  return sendSuccessfulApiResponse(response, await createProviderMediaUploadSignature(userId(request), mediaPurpose), 201);
}
export async function confirmMediaUploadController(request: Request, response: Response) {
  const input = confirmMediaUploadValidationSchema.parse(request.body);
  return sendSuccessfulApiResponse(response, await confirmProviderMediaUpload(userId(request), input.mediaPurpose, input.cloudinaryPublicIdentifier, input.originalFileName, input.documentSide), 201);
}
export async function deleteMediaAssetController(request: Request, response: Response) {
  const { mediaAssetId } = mediaAssetPathValidationSchema.parse(request.params);
  await deleteProviderMediaAsset(userId(request), mediaAssetId);
  return response.status(204).send();
}

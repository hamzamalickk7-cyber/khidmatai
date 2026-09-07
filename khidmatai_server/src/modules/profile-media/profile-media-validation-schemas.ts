import { z } from "zod";

export const providerMediaPurposeValidationSchema = z.enum(["profile_image", "work_gallery", "identity_document", "professional_certificate"]);
export const createMediaUploadSignatureValidationSchema = z.object({ mediaPurpose: providerMediaPurposeValidationSchema }).strict();
export const confirmMediaUploadValidationSchema = z.object({
  mediaPurpose: providerMediaPurposeValidationSchema,
  cloudinaryPublicIdentifier: z.string().min(10).max(300),
  originalFileName: z.string().trim().max(255).optional(),
  documentSide: z.enum(["front", "back"]).optional(),
}).strict();
export const mediaAssetPathValidationSchema = z.object({ mediaAssetId: z.uuid() }).strict();

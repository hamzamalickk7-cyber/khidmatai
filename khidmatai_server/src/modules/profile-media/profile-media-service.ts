import { and, eq } from "drizzle-orm";
import { getConfiguredCloudinaryClient } from "../../config/cloudinary-configuration.js";
import { applicationLogger } from "../../config/logger-configuration.js";
import { khidmatAiDatabase } from "../../database/database-connection.js";
import { authenticationUsers } from "../../database/schema/authentication-schema.js";
import { providerProfiles } from "../../database/schema/provider-onboarding-schema.js";
import { providerProfileMediaAssets } from "../../database/schema/platform-catalogue-schema.js";
import { customerProfileMediaAssets } from "../../database/schema/platform-catalogue-schema.js";
import { customerProfiles } from "../../database/schema/customer-profile-schema.js";
import { ApplicationError } from "../../shared/application-error.js";
import type { z } from "zod";
import type { providerMediaPurposeValidationSchema } from "./profile-media-validation-schemas.js";

type ProviderMediaPurpose = z.infer<typeof providerMediaPurposeValidationSchema>;
const publicMediaPurposes = new Set<ProviderMediaPurpose>(["profile_image", "work_gallery"]);
const maximumBytesByPurpose: Record<ProviderMediaPurpose, number> = {
  profile_image: 5_242_880, work_gallery: 8_388_608, identity_document: 10_485_760, professional_certificate: 10_485_760,
};

async function destroyCloudinaryAssetWithoutBreakingDatabaseReferences(
  publicIdentifier: string,
  deliveryType: string,
) {
  try {
    const { cloudinary } = getConfiguredCloudinaryClient();
    await cloudinary.uploader.destroy(publicIdentifier, {
      resource_type: "image",
      type: deliveryType,
      invalidate: true,
    });
  } catch (error) {
    applicationLogger.error(
      { err: error, cloudinaryPublicIdentifier: publicIdentifier },
      "Cloudinary asset cleanup failed; the database remains consistent and cleanup can be retried.",
    );
  }
}

async function requireProviderProfile(authenticationUserId: string) {
  const [profile] = await khidmatAiDatabase.select({ id: providerProfiles.id }).from(providerProfiles)
    .where(eq(providerProfiles.userId, authenticationUserId)).limit(1);
  if (!profile) throw new ApplicationError(404, "PROVIDER_PROFILE_NOT_FOUND", "The provider profile could not be found.");
  return profile;
}

export async function createProviderMediaUploadSignature(authenticationUserId: string, mediaPurpose: ProviderMediaPurpose) {
  await requireProviderProfile(authenticationUserId);
  const { cloudinary, cloudName, apiKey, apiSecret } = getConfiguredCloudinaryClient();
  const timestamp = Math.floor(Date.now() / 1000);
  const deliveryType = publicMediaPurposes.has(mediaPurpose) ? "upload" : "authenticated";
  const folder = `khidmatai/providers/${authenticationUserId}/${mediaPurpose}`;
  // `resource_type` belongs in the REST endpoint path and must not be included
  // in Cloudinary's signature input or repeated as a form field.
  const parameters = { timestamp, folder, type: deliveryType };
  return {
    cloudName, apiKey, uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    signature: cloudinary.utils.api_sign_request(parameters, apiSecret), parameters,
    constraints: { allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"], maximumBytes: maximumBytesByPurpose[mediaPurpose] },
  };
}

// Verify the new Cloudinary asset first, commit the complete local replacement
// transaction next, and only then remove superseded remote assets. A cleanup
// failure can therefore leave a recoverable Cloudinary orphan, but never a
// live database row that points at an already-deleted asset.
export async function confirmProviderMediaUpload(authenticationUserId: string, mediaPurpose: ProviderMediaPurpose, publicIdentifier: string, originalFileName?: string, documentSide?: "front" | "back") {
  const profile = await requireProviderProfile(authenticationUserId);
  const expectedPrefix = `khidmatai/providers/${authenticationUserId}/${mediaPurpose}/`;
  if (!publicIdentifier.startsWith(expectedPrefix)) throw new ApplicationError(403, "MEDIA_OWNERSHIP_INVALID", "This uploaded file does not belong to your profile.");
  const { cloudinary } = getConfiguredCloudinaryClient();
  const deliveryType = publicMediaPurposes.has(mediaPurpose) ? "upload" : "authenticated";
  const resource = await cloudinary.api.resource(publicIdentifier, { resource_type: "image", type: deliveryType });
  const mimeType = `image/${resource.format === "jpg" ? "jpeg" : resource.format}`;
  if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType) || resource.bytes > maximumBytesByPurpose[mediaPurpose]) {
    await cloudinary.uploader.destroy(publicIdentifier, { resource_type: "image", type: deliveryType, invalidate: true });
    throw new ApplicationError(422, "MEDIA_FILE_INVALID", "The uploaded file type or size is not allowed.");
  }
  if (mediaPurpose === "identity_document" && !documentSide) throw new ApplicationError(422, "DOCUMENT_SIDE_REQUIRED", "Choose whether this is the front or back of the identity document.");

  let existingProfileImageAssets: (typeof providerProfileMediaAssets.$inferSelect)[] = [];
  if (mediaPurpose === "profile_image") {
    existingProfileImageAssets = await khidmatAiDatabase.select().from(providerProfileMediaAssets)
      .where(and(eq(providerProfileMediaAssets.providerProfileId, profile.id), eq(providerProfileMediaAssets.mediaPurpose, "profile_image")));
  }

  let previousDocumentSideAsset: typeof providerProfileMediaAssets.$inferSelect | undefined;
  if (mediaPurpose === "identity_document" && documentSide) {
    [previousDocumentSideAsset] = await khidmatAiDatabase.select().from(providerProfileMediaAssets)
      .where(and(eq(providerProfileMediaAssets.providerProfileId, profile.id), eq(providerProfileMediaAssets.mediaPurpose, "identity_document"), eq(providerProfileMediaAssets.documentSide, documentSide))).limit(1);
  }

  let savedMediaAsset: typeof providerProfileMediaAssets.$inferSelect;
  try {
    savedMediaAsset = await khidmatAiDatabase.transaction(async (databaseTransaction) => {
      if (existingProfileImageAssets.length) {
        await databaseTransaction.delete(providerProfileMediaAssets)
          .where(and(eq(providerProfileMediaAssets.providerProfileId, profile.id), eq(providerProfileMediaAssets.mediaPurpose, "profile_image")));
      }
      if (previousDocumentSideAsset) {
        await databaseTransaction.delete(providerProfileMediaAssets).where(eq(providerProfileMediaAssets.id, previousDocumentSideAsset.id));
      }
      const [saved] = await databaseTransaction.insert(providerProfileMediaAssets).values({
        providerProfileId: profile.id, ownerUserId: authenticationUserId, mediaPurpose, cloudinaryPublicIdentifier: publicIdentifier,
        cloudinaryDeliveryType: deliveryType, secureDeliveryUrl: resource.secure_url, originalFileName, mimeType, byteSize: resource.bytes,
        width: resource.width, height: resource.height, documentSide,
      }).returning();
      if (!saved) throw new Error("Provider media insert returned no row.");
      if (mediaPurpose === "profile_image") {
        await databaseTransaction.update(authenticationUsers).set({ image: resource.secure_url, updatedAt: new Date() }).where(eq(authenticationUsers.id, authenticationUserId));
      }
      return saved;
    });
  } catch (error) {
    await destroyCloudinaryAssetWithoutBreakingDatabaseReferences(publicIdentifier, deliveryType);
    throw error;
  }

  const supersededAssets = [
    ...existingProfileImageAssets,
    ...(previousDocumentSideAsset ? [previousDocumentSideAsset] : []),
  ];
  await Promise.all(supersededAssets.map((asset) =>
    destroyCloudinaryAssetWithoutBreakingDatabaseReferences(asset.cloudinaryPublicIdentifier, asset.cloudinaryDeliveryType),
  ));
  return savedMediaAsset;
}

export async function deleteProviderMediaAsset(authenticationUserId: string, mediaAssetId: string) {
  const [asset] = await khidmatAiDatabase.select().from(providerProfileMediaAssets)
    .where(and(eq(providerProfileMediaAssets.id, mediaAssetId), eq(providerProfileMediaAssets.ownerUserId, authenticationUserId))).limit(1);
  if (!asset) throw new ApplicationError(404, "MEDIA_ASSET_NOT_FOUND", "The media item could not be found.");
  await khidmatAiDatabase.transaction(async (databaseTransaction) => {
    await databaseTransaction.delete(providerProfileMediaAssets).where(eq(providerProfileMediaAssets.id, asset.id));
    if (asset.mediaPurpose === "profile_image") {
      await databaseTransaction.update(authenticationUsers).set({ image: null, updatedAt: new Date() }).where(eq(authenticationUsers.id, authenticationUserId));
    }
  });
  await destroyCloudinaryAssetWithoutBreakingDatabaseReferences(asset.cloudinaryPublicIdentifier, asset.cloudinaryDeliveryType);
}

async function requireCustomerProfile(authenticationUserId: string) {
  const [profile] = await khidmatAiDatabase.select({ id: customerProfiles.id }).from(customerProfiles).where(eq(customerProfiles.userId, authenticationUserId)).limit(1);
  if (!profile) throw new ApplicationError(404, "CUSTOMER_PROFILE_NOT_FOUND", "The customer profile could not be found.");
  return profile;
}
export async function createCustomerAvatarUploadSignature(authenticationUserId: string) {
  await requireCustomerProfile(authenticationUserId); const { cloudinary, cloudName, apiKey, apiSecret } = getConfiguredCloudinaryClient(); const timestamp = Math.floor(Date.now() / 1000);
  const parameters = { timestamp, folder: `khidmatai/customers/${authenticationUserId}/profile_image`, type: "upload" };
  return { cloudName, apiKey, uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, signature: cloudinary.utils.api_sign_request(parameters, apiSecret), parameters, constraints: { allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"], maximumBytes: 5_242_880 } };
}
export async function confirmCustomerAvatarUpload(authenticationUserId: string, publicIdentifier: string) {
  const profile = await requireCustomerProfile(authenticationUserId); const prefix = `khidmatai/customers/${authenticationUserId}/profile_image/`;
  if (!publicIdentifier.startsWith(prefix)) throw new ApplicationError(403, "MEDIA_OWNERSHIP_INVALID", "This uploaded file does not belong to your profile.");
  const { cloudinary } = getConfiguredCloudinaryClient(); const resource = await cloudinary.api.resource(publicIdentifier, { resource_type: "image", type: "upload" }); const mimeType = `image/${resource.format === "jpg" ? "jpeg" : resource.format}`;
  if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType) || resource.bytes > 5_242_880) { await cloudinary.uploader.destroy(publicIdentifier, { invalidate: true }); throw new ApplicationError(422, "MEDIA_FILE_INVALID", "The uploaded file type or size is not allowed."); }
  const [previous] = await khidmatAiDatabase.select().from(customerProfileMediaAssets).where(eq(customerProfileMediaAssets.customerProfileId, profile.id)).limit(1);
  let savedMediaAsset: typeof customerProfileMediaAssets.$inferSelect;
  try {
    savedMediaAsset = await khidmatAiDatabase.transaction(async (databaseTransaction) => {
      if (previous) await databaseTransaction.delete(customerProfileMediaAssets).where(eq(customerProfileMediaAssets.id, previous.id));
      const [saved] = await databaseTransaction.insert(customerProfileMediaAssets).values({ customerProfileId: profile.id, ownerUserId: authenticationUserId, cloudinaryPublicIdentifier: publicIdentifier, secureDeliveryUrl: resource.secure_url, mimeType, byteSize: resource.bytes, width: resource.width, height: resource.height }).returning();
      if (!saved) throw new Error("Customer media insert returned no row.");
      await databaseTransaction.update(authenticationUsers).set({ image: resource.secure_url, updatedAt: new Date() }).where(eq(authenticationUsers.id, authenticationUserId));
      return saved;
    });
  } catch (error) {
    await destroyCloudinaryAssetWithoutBreakingDatabaseReferences(publicIdentifier, "upload");
    throw error;
  }
  if (previous) await destroyCloudinaryAssetWithoutBreakingDatabaseReferences(previous.cloudinaryPublicIdentifier, "upload");
  return savedMediaAsset;
}
export async function deleteCustomerAvatar(authenticationUserId: string) {
  const [asset] = await khidmatAiDatabase.select().from(customerProfileMediaAssets).where(eq(customerProfileMediaAssets.ownerUserId, authenticationUserId)).limit(1); if (!asset) return;
  await khidmatAiDatabase.transaction(async (databaseTransaction) => {
    await databaseTransaction.delete(customerProfileMediaAssets).where(eq(customerProfileMediaAssets.id, asset.id));
    await databaseTransaction.update(authenticationUsers).set({ image: null, updatedAt: new Date() }).where(eq(authenticationUsers.id, authenticationUserId));
  });
  await destroyCloudinaryAssetWithoutBreakingDatabaseReferences(asset.cloudinaryPublicIdentifier, "upload");
}

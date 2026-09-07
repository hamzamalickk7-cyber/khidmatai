import { v2 as cloudinary } from "cloudinary";
import { backendEnvironmentConfiguration } from "./environment-configuration.js";
import { ApplicationError } from "../shared/application-error.js";

export function getConfiguredCloudinaryClient() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = backendEnvironmentConfiguration;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new ApplicationError(503, "MEDIA_STORAGE_NOT_CONFIGURED", "Media uploads are not configured yet.");
  }
  cloudinary.config({ cloud_name: CLOUDINARY_CLOUD_NAME, api_key: CLOUDINARY_API_KEY, api_secret: CLOUDINARY_API_SECRET, secure: true });
  return { cloudinary, cloudName: CLOUDINARY_CLOUD_NAME, apiKey: CLOUDINARY_API_KEY, apiSecret: CLOUDINARY_API_SECRET };
}

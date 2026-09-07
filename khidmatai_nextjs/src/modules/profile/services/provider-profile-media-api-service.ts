import axios from "axios";
import { apiEndpointPaths } from "@/api/api-endpoint-paths";
import { khidmatAiAxiosApiClient } from "@/services/khidmatai-axios-api-client";
import type { SuccessfulApiEnvelope } from "../types/customer-profile-types";

export type ProviderMediaPurpose = "profile_image" | "work_gallery" | "identity_document" | "professional_certificate";
interface SignatureResponse { uploadUrl: string; apiKey: string; signature: string; parameters: { timestamp: number; folder: string; type: string }; constraints: { allowedMimeTypes: string[]; maximumBytes: number } }
export interface SavedProviderMediaAsset { id: string; secureDeliveryUrl: string; mediaPurpose: ProviderMediaPurpose }

export async function uploadProviderProfileMedia(file: File, mediaPurpose: ProviderMediaPurpose, documentSide?: "front" | "back") {
  const signature = (await khidmatAiAxiosApiClient.post<SuccessfulApiEnvelope<SignatureResponse>>(apiEndpointPaths.providerProfileMediaUploadSignatures, { mediaPurpose })).data.data;
  if (!signature.constraints.allowedMimeTypes.includes(file.type) || file.size > signature.constraints.maximumBytes) throw new Error("This image type or size is not allowed.");
  const form = new FormData(); form.set("file", file); form.set("api_key", signature.apiKey); form.set("signature", signature.signature);
  Object.entries(signature.parameters).forEach(([key, value]) => form.set(key, String(value)));
  const uploaded = await axios.post<{ public_id: string }>(signature.uploadUrl, form, { timeout: 60_000 });
  return (await khidmatAiAxiosApiClient.post<SuccessfulApiEnvelope<SavedProviderMediaAsset>>(apiEndpointPaths.providerProfileMediaConfirmations, { mediaPurpose, cloudinaryPublicIdentifier: uploaded.data.public_id, originalFileName: file.name, ...(documentSide ? { documentSide } : {}) })).data.data;
}
export async function deleteProviderProfileMedia(mediaAssetId: string) { await khidmatAiAxiosApiClient.delete(apiEndpointPaths.providerProfileMediaAsset(mediaAssetId)); }

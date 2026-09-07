import axios from "axios";
import { apiEndpointPaths } from "@/api/api-endpoint-paths";
import { khidmatAiAxiosApiClient } from "@/services/khidmatai-axios-api-client";
import type { SuccessfulApiEnvelope } from "../types/customer-profile-types";

interface CustomerAvatarUploadSignature { uploadUrl: string; apiKey: string; signature: string; parameters: Record<string, string | number>; constraints: { allowedMimeTypes: string[]; maximumBytes: number } }

export async function uploadCustomerProfileImage(file: File) {
  const signature = (await khidmatAiAxiosApiClient.post<SuccessfulApiEnvelope<CustomerAvatarUploadSignature>>(apiEndpointPaths.customerProfileMediaUploadSignatures)).data.data;
  if (!signature.constraints.allowedMimeTypes.includes(file.type) || file.size > signature.constraints.maximumBytes) throw new Error("This image type or size is not allowed.");
  const form = new FormData(); form.set("file", file); form.set("api_key", signature.apiKey); form.set("signature", signature.signature);
  Object.entries(signature.parameters).forEach(([key, value]) => form.set(key, String(value)));
  const uploaded = await axios.post<{ public_id: string }>(signature.uploadUrl, form, { timeout: 60_000 });
  return (await khidmatAiAxiosApiClient.post<SuccessfulApiEnvelope<{ id: string; secureDeliveryUrl: string }>>(apiEndpointPaths.customerProfileMediaConfirmations, { cloudinaryPublicIdentifier: uploaded.data.public_id })).data.data;
}

export async function deleteCustomerProfileImage() { await khidmatAiAxiosApiClient.delete(apiEndpointPaths.customerProfileImage); }

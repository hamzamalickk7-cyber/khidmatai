import { frontendEnvironmentConfiguration } from "@/api/frontend-environment-configuration";

export interface PaginationResponseMeta { page: number; pageSize: number; total: number; totalPages: number; }

interface FailedApiResponse { success: false; error: { code: string; message: string; details?: unknown }; }
interface SuccessfulApiResponse<ResponseData> { success: true; data: ResponseData; meta?: PaginationResponseMeta; }

export class KhidmatAiBackendApiError extends Error {
  constructor(public readonly statusCode: number, public readonly errorCode: string, message: string, public readonly details?: unknown) { super(message); }
}

export function createBackendApiUrl(apiPath: string) {
  if (typeof window !== "undefined") {
    return apiPath.replace(/^\/api(?=\/|$)/, "/backend-api");
  }

  return `${frontendEnvironmentConfiguration.backendApiUrl}${apiPath}`;
}

async function requestKhidmatAiBackendApiEnvelope<ResponseData>(apiPath: string, requestConfiguration: RequestInit = {}): Promise<SuccessfulApiResponse<ResponseData>> {
  const apiResponse = await fetch(createBackendApiUrl(apiPath), { ...requestConfiguration, credentials: "include", cache: "no-store" });
  const responseText = await apiResponse.text();
  let responseBody: SuccessfulApiResponse<ResponseData> | FailedApiResponse;
  try {
    responseBody = JSON.parse(responseText) as SuccessfulApiResponse<ResponseData> | FailedApiResponse;
  } catch {
    throw new KhidmatAiBackendApiError(
      apiResponse.status,
      "BACKEND_RESPONSE_INVALID",
      apiResponse.ok
        ? "The server returned an invalid response."
        : `The backend request failed with status ${apiResponse.status}. Check the backend terminal for the original error.`,
      process.env.NODE_ENV === "development" ? responseText.slice(0, 500) : undefined,
    );
  }
  if (!apiResponse.ok || !responseBody.success) {
    const failedResponse = responseBody as FailedApiResponse;
    throw new KhidmatAiBackendApiError(apiResponse.status, failedResponse.error?.code ?? "API_REQUEST_FAILED", failedResponse.error?.message ?? "The request could not be completed.", failedResponse.error?.details);
  }
  return responseBody;
}

export async function requestKhidmatAiBackendApi<ResponseData>(apiPath: string, requestConfiguration: RequestInit = {}) {
  const responseBody = await requestKhidmatAiBackendApiEnvelope<ResponseData>(apiPath, requestConfiguration);
  return responseBody.data;
}

export async function requestKhidmatAiBackendApiWithMeta<ResponseData>(apiPath: string, requestConfiguration: RequestInit = {}) {
  const responseBody = await requestKhidmatAiBackendApiEnvelope<ResponseData>(apiPath, requestConfiguration);
  return { data: responseBody.data, meta: responseBody.meta };
}

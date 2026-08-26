const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

if (!backendApiUrl) throw new Error("NEXT_PUBLIC_BACKEND_API_URL is required.");

export const frontendEnvironmentConfiguration = {
  backendApiUrl: backendApiUrl.replace(/\/$/, ""),
} as const;

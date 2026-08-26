const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
const applicationUrl = process.env.NEXT_PUBLIC_APPLICATION_URL;

if (!backendApiUrl || !applicationUrl) throw new Error("NEXT_PUBLIC_BACKEND_API_URL and NEXT_PUBLIC_APPLICATION_URL are required.");

export const frontendEnvironmentConfiguration = {
  backendApiUrl: backendApiUrl.replace(/\/$/, ""),
  applicationUrl: applicationUrl.replace(/\/$/, ""),
} as const;

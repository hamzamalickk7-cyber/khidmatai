"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { apiEndpointPaths } from "@/api/api-endpoint-paths";
import { frontendEnvironmentConfiguration } from "@/api/frontend-environment-configuration";

export const authenticationClient = createAuthClient({
  baseURL: frontendEnvironmentConfiguration.backendApiUrl,
  basePath: apiEndpointPaths.authenticationBase,
  fetchOptions: { credentials: "include" },
  plugins: [inferAdditionalFields({ user: {
    accountType: { type: "string", required: true, input: true },
  } }), adminClient()],
});

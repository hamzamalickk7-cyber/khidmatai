"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { apiEndpointPaths } from "@/api/api-endpoint-paths";

export const authenticationClient = createAuthClient({
  // Authentication stays on Express. The same-origin Next.js rewrite proxies
  // this browser path to Railway so the session is a first-party Vercel cookie.
  basePath: apiEndpointPaths.authenticationBase.replace("/api", "/backend-api"),
  fetchOptions: { credentials: "include" },
  plugins: [inferAdditionalFields({ user: {
    accountType: { type: "string", required: true, input: true },
  } }), adminClient()],
});

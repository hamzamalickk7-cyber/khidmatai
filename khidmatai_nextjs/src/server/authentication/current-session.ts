import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { apiEndpointPaths } from "@/api/api-endpoint-paths";
import type { AccountRole } from "@/modules/authentication/types/authentication-role";
import type { AuthenticationSession } from "@/modules/authentication/types/authentication-session-types";
import { createBackendApiUrl } from "@/services/khidmatai-backend-api-client";

export const getCurrentAuthenticationSession = cache(async function getCurrentAuthenticationSession() {
  const incomingRequestHeaders = await headers();
  const authenticationSessionResponse = await fetch(createBackendApiUrl(apiEndpointPaths.authenticationSession), { headers: { cookie: incomingRequestHeaders.get("cookie") ?? "" }, cache: "no-store" });
  if (!authenticationSessionResponse.ok) return null;
  return await authenticationSessionResponse.json() as AuthenticationSession | null;
});

// `pathToReturnToAfterLogin` becomes `${loginPath}?redirect=<path>`, read back
// by AuthenticationFormView/AdminLoginView so the user lands where they were
// headed instead of always at the role's default landing page. `loginPath`
// defaults to the customer/provider login; admin routes pass "/admin/login"
// so an unauthenticated visitor never sees the public sign-in screen.
export async function requireCurrentAuthenticationSession(pathToReturnToAfterLogin?: string, loginPath = "/login") {
  const authenticationSession = await getCurrentAuthenticationSession();
  if (!authenticationSession) {
    redirect(pathToReturnToAfterLogin ? `${loginPath}?redirect=${encodeURIComponent(pathToReturnToAfterLogin)}` : loginPath);
  }
  return authenticationSession;
}

export async function requireAuthenticatedAccountRole(
  permittedAccountRoles: AccountRole[],
  pathToReturnToAfterLogin?: string,
  loginPath = "/login",
) {
  const authenticationSession = await requireCurrentAuthenticationSession(pathToReturnToAfterLogin, loginPath);
  const authenticatedAccountRole = authenticationSession.user.role;
  if (!permittedAccountRoles.includes(authenticatedAccountRole)) redirect("/dashboard");
  return { authenticationSession, authenticatedAccountRole };
}

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { apiEndpointPaths } from "@/api/api-endpoint-paths";
import type { AccountRole } from "@/modules/authentication/types/authentication-role";
import type { AuthenticationSession } from "@/modules/authentication/types/authentication-session-types";
import { createBackendApiUrl } from "@/services/khidmatai-backend-api-client";

export async function getCurrentAuthenticationSession() {
  const incomingRequestHeaders = await headers();
  const authenticationSessionResponse = await fetch(createBackendApiUrl(apiEndpointPaths.authenticationSession), { headers: { cookie: incomingRequestHeaders.get("cookie") ?? "" }, cache: "no-store" });
  if (!authenticationSessionResponse.ok) return null;
  return await authenticationSessionResponse.json() as AuthenticationSession | null;
}

// `pathToReturnToAfterLogin` becomes /login?redirect=<path>, read back by
// AuthenticationFormView so the user lands where they were headed instead of
// always at the role's default landing page.
export async function requireCurrentAuthenticationSession(pathToReturnToAfterLogin?: string) {
  const authenticationSession = await getCurrentAuthenticationSession();
  if (!authenticationSession) {
    redirect(pathToReturnToAfterLogin ? `/login?redirect=${encodeURIComponent(pathToReturnToAfterLogin)}` : "/login");
  }
  return authenticationSession;
}

export async function requireAuthenticatedAccountRole(permittedAccountRoles: AccountRole[], pathToReturnToAfterLogin?: string) {
  const authenticationSession = await requireCurrentAuthenticationSession(pathToReturnToAfterLogin);
  const authenticatedAccountRole = authenticationSession.user.role;
  if (!permittedAccountRoles.includes(authenticatedAccountRole)) redirect("/dashboard");
  return { authenticationSession, authenticatedAccountRole };
}

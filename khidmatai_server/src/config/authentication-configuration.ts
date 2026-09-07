import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { admin } from "better-auth/plugins";
import { postgresqlConnectionPool } from "../database/database-connection.js";
import { publiclyRegistrableAccountRoles } from "../modules/authorization/account-role-catalog.js";
import { backendEnvironmentConfiguration } from "./environment-configuration.js";
import { deactivatedAccountAuthenticationGuard } from "../modules/authentication/deactivated-account-authentication-guard.js";

function resolvePublicAccountRole(accountType: unknown): "customer" | "provider" {
  return accountType === "provider" ? "provider" : "customer";
}

export const authenticationConfiguration = betterAuth({
  appName: "KhidmatAI",
  baseURL: backendEnvironmentConfiguration.BETTER_AUTH_URL,
  secret: backendEnvironmentConfiguration.BETTER_AUTH_SECRET,
  trustedOrigins: [backendEnvironmentConfiguration.FRONTEND_URL],
  database: postgresqlConnectionPool,
  emailAndPassword: {
    // No email provider is configured (hackathon build): email verification
    // is off, so sign-up signs the user in immediately, and password reset
    // is intentionally left unconfigured (Better Auth returns a clean
    // RESET_PASSWORD_DISABLED error if that endpoint is ever called; see
    // node_modules/better-auth/dist/api/routes/password.mjs). Add
    // requireEmailVerification, sendResetPassword and a real transactional
    // email provider together when email is actually integrated.
    enabled: true, requireEmailVerification: false, minPasswordLength: 10, maxPasswordLength: 128, revokeSessionsOnPasswordReset: true,
    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
      ...coreFields,
      ...additionalFields,
      id,
      role: resolvePublicAccountRole(additionalFields.accountType),
      banned: false,
      banReason: null,
      banExpires: null,
    }),
  },
  user: { additionalFields: { accountType: { type: "string", required: true, input: true } } },
  databaseHooks: { user: { create: {
    before: async (prospectiveAuthenticationUser) => {
      if (!publiclyRegistrableAccountRoles.includes(prospectiveAuthenticationUser.accountType as "customer" | "provider")) throw new APIError("BAD_REQUEST", { message: "Only customer and provider registration is public." });
      return {
        data: {
          ...prospectiveAuthenticationUser,
          role: resolvePublicAccountRole(prospectiveAuthenticationUser.accountType),
        },
      };
    },
    after: async (createdAuthenticationUser) => {
      const assignedAccountRole = resolvePublicAccountRole(createdAuthenticationUser.accountType);
      if (assignedAccountRole === "provider") await postgresqlConnectionPool.query("insert into provider_profiles (user_id, status) values ($1, 'draft') on conflict (user_id) do nothing", [createdAuthenticationUser.id]);
      if (assignedAccountRole === "customer") await postgresqlConnectionPool.query("insert into customer_profiles (user_id) values ($1) on conflict (user_id) do nothing", [createdAuthenticationUser.id]);
    },
  } } },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    // Short signed-cookie cache: within this window, repeated requests from
    // the same browser (e.g. a page firing several API calls at once) skip
    // the session-table round trip entirely, which is real pool pressure
    // removed under load. Deliberately short (not Better Auth's longer
    // defaults) because this app synchronously deletes session rows on ban
    // and deactivation (deactivated-account-authentication-guard.ts,
    // administration-repository.ts) specifically so access is cut off
    // immediately — a longer cache would let a just-banned/deactivated
    // account keep making authenticated requests until it expired. 5s caps
    // that residual-access window while still absorbing request bursts. See
    // SYSTEM_HARDENING_AND_SCALABILITY_PLAN.md (B5).
    cookieCache: { enabled: true, maxAge: 5 },
  },
  // Stays in-memory (Better Auth's default) rather than "database" storage:
  // that mode expects its own `rateLimit` table with a shape this project
  // doesn't control (Better Auth's internal adapter, not a Drizzle-migrated
  // table like every other table here), and getting that shape wrong would
  // break real sign-in/sign-up traffic with no way to verify it from this
  // environment. Left as an accepted residual risk — every request to
  // `/api/auth/*` already passes through the general process-local API limiter
  // first. A shared external store is intentionally deferred until the
  // deployment actually moves beyond one backend instance.
  rateLimit: { enabled: true, window: 60, max: 100 },
  plugins: [deactivatedAccountAuthenticationGuard, admin({ defaultRole: "customer", adminRoles: ["admin"] })],
});

export type AuthenticatedSession = typeof authenticationConfiguration.$Infer.Session;

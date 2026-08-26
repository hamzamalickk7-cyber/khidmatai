import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { admin } from "better-auth/plugins";
import { postgresqlConnectionPool } from "../database/database-connection.js";
import { publiclyRegistrableAccountRoles } from "../modules/authorization/account-role-catalog.js";
import { backendEnvironmentConfiguration } from "./environment-configuration.js";

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
    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({ ...coreFields, role: "customer", banned: false, banReason: null, banExpires: null, ...additionalFields, id }),
  },
  user: { additionalFields: { accountType: { type: "string", required: true, input: true } } },
  databaseHooks: { user: { create: {
    before: async (prospectiveAuthenticationUser) => {
      if (!publiclyRegistrableAccountRoles.includes(prospectiveAuthenticationUser.accountType as "customer" | "provider")) throw new APIError("BAD_REQUEST", { message: "Only customer and provider registration is public." });
      return { data: prospectiveAuthenticationUser };
    },
    after: async (createdAuthenticationUser) => {
      const assignedAccountRole = createdAuthenticationUser.accountType === "provider" ? "provider" : "customer";
      await postgresqlConnectionPool.query('update "user" set role = $1 where id = $2', [assignedAccountRole, createdAuthenticationUser.id]);
      if (assignedAccountRole === "provider") await postgresqlConnectionPool.query("insert into provider_profiles (user_id, status) values ($1, 'draft') on conflict (user_id) do nothing", [createdAuthenticationUser.id]);
      if (assignedAccountRole === "customer") await postgresqlConnectionPool.query("insert into customer_profiles (user_id) values ($1) on conflict (user_id) do nothing", [createdAuthenticationUser.id]);
    },
  } } },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  rateLimit: { enabled: true, window: 60, max: 100 },
  plugins: [admin({ defaultRole: "customer", adminRoles: ["admin"] })],
});

export type AuthenticatedSession = typeof authenticationConfiguration.$Infer.Session;

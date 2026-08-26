import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { backendEnvironmentConfiguration } from "../config/environment-configuration.js";
import { applicationLogger } from "../config/logger-configuration.js";
import * as authenticationDatabaseSchema from "./schema/authentication-schema.js";
import * as providerOnboardingDatabaseSchema from "./schema/provider-onboarding-schema.js";
import * as customerProfileDatabaseSchema from "./schema/customer-profile-schema.js";

export const postgresqlConnectionPool = new Pool({
  connectionString: backendEnvironmentConfiguration.DATABASE_URL,
  max: backendEnvironmentConfiguration.NODE_ENV === "production" ? 20 : 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

// An idle client's connection can drop (network blip, DB restart) after it has
// already been returned to the pool. Without this handler, `pg` emits an
// unhandled "error" event that crashes the process.
postgresqlConnectionPool.on("error", (idleClientError) => {
  applicationLogger.error({ err: idleClientError }, "Unexpected error on an idle PostgreSQL client.");
});

export const khidmatAiDatabase = drizzle(postgresqlConnectionPool, {
  schema: { ...authenticationDatabaseSchema, ...customerProfileDatabaseSchema, ...providerOnboardingDatabaseSchema },
});

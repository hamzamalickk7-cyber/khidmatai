import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { z } from "zod";

const administratorCredentialsFilePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
  ".env.admin.local",
);
config({ path: administratorCredentialsFilePath });

const administratorCredentialsSchema = z
  .object({
    ADMIN_FULL_NAME: z.string().trim().min(2).max(120),
    ADMIN_EMAIL: z.email(),
    ADMIN_PASSWORD: z.string().min(14).max(128),
  })
  .strict();

async function provisionInitialAdministratorAccount() {
  const credentials = administratorCredentialsSchema.parse({
    ADMIN_FULL_NAME: process.env.ADMIN_FULL_NAME,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  });
  const [{ authenticationConfiguration }, { postgresqlConnectionPool }] = await Promise.all([
    import("../../config/authentication-configuration.js"),
    import("../database-connection.js"),
  ]);
  let newlyCreatedUserId: string | null = null;
  try {
    const existing = await postgresqlConnectionPool.query<{ id: string; role: string; accountType: string; createdAt: Date }>(
      'select id, role, "accountType", "createdAt" from "user" where lower(email) = lower($1)',
      [credentials.ADMIN_EMAIL],
    );
    let userId: string;
    if (existing.rowCount) {
      const existingUser = existing.rows[0]!;
      const interruptedSetupWindowStartedAt = Date.now() - 30 * 60 * 1000;
      if (existingUser.role !== "customer" || existingUser.accountType !== "customer" || existingUser.createdAt.getTime() < interruptedSetupWindowStartedAt)
        throw new Error("An established account already exists for ADMIN_EMAIL. Provisioning will not promote it.");
      await authenticationConfiguration.api.signInEmail({ body: { email: credentials.ADMIN_EMAIL.toLowerCase(), password: credentials.ADMIN_PASSWORD } });
      userId = existingUser.id;
      console.info("Recovering the password-verified account created by the interrupted provisioning attempt.");
    } else {
      const result = await authenticationConfiguration.api.signUpEmail({ body: { name: credentials.ADMIN_FULL_NAME, email: credentials.ADMIN_EMAIL.toLowerCase(), password: credentials.ADMIN_PASSWORD, accountType: "customer" } });
      userId = result.user.id;
      newlyCreatedUserId = userId;
    }
    await postgresqlConnectionPool.query("begin");
    await postgresqlConnectionPool.query(
      'update "user" set role = $1, "accountType" = $1, "emailVerified" = true where id = $2',
      ["admin", userId],
    );
    await postgresqlConnectionPool.query("delete from customer_profiles where user_id = $1", [userId]);
    await postgresqlConnectionPool.query('delete from "session" where "userId" = $1', [userId]);
    await postgresqlConnectionPool.query(
      "insert into audit_events (actor_user_id, actor_role, event_key, entity_type, entity_id, reason) values ($1, 'admin', 'administrator.provisioned', 'user', $1, 'Initial administrator provisioned through the secure CLI workflow.')",
      [userId],
    );
    await postgresqlConnectionPool.query("commit");
    console.info(
      `Administrator account provisioned for ${credentials.ADMIN_EMAIL}. Delete .env.admin.local now, then sign in through /login.`,
    );
  } catch (error) {
    await postgresqlConnectionPool.query("rollback").catch(() => undefined);
    if (newlyCreatedUserId)
      await postgresqlConnectionPool.query('delete from "user" where id = $1', [newlyCreatedUserId]).catch(() => undefined);
    throw error;
  } finally {
    await postgresqlConnectionPool.end();
  }
}

void provisionInitialAdministratorAccount();

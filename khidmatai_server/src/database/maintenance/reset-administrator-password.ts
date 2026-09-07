import { randomBytes } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { z } from "zod";
import { postgresqlConnectionPool } from "../database-connection.js";

const administratorEmailSchema = z.email();

async function resetAdministratorPassword() {
  const administratorEmail = administratorEmailSchema.parse(process.argv[2]).toLowerCase();
  const temporaryPassword = `${randomBytes(18).toString("base64url")}Aa1!`;
  const passwordHash = await hashPassword(temporaryPassword);
  const databaseClient = await postgresqlConnectionPool.connect();

  try {
    await databaseClient.query("begin");

    const administratorResult = await databaseClient.query<{ id: string }>(
      `select id from "user" where lower(email) = lower($1) and role = 'admin' for update`,
      [administratorEmail],
    );
    if (administratorResult.rowCount !== 1) {
      throw new Error("Exactly one administrator account must match the supplied email address.");
    }

    const administratorUserId = administratorResult.rows[0]!.id;
    const credentialUpdateResult = await databaseClient.query(
      `update "account" set password = $1, "updatedAt" = now() where "userId" = $2 and "providerId" = 'credential'`,
      [passwordHash, administratorUserId],
    );
    if (credentialUpdateResult.rowCount !== 1) {
      throw new Error("The administrator must have exactly one email-and-password credential.");
    }

    await databaseClient.query(`delete from "session" where "userId" = $1`, [administratorUserId]);
    await databaseClient.query(
      `insert into audit_events (actor_user_id, actor_role, event_key, entity_type, entity_id, reason)
       values ($1, 'admin', 'administrator.password_reset', 'user', $1, 'Administrator password reset through the secure CLI workflow.')`,
      [administratorUserId],
    );
    await databaseClient.query("commit");

    console.info(`Administrator email: ${administratorEmail}`);
    console.info(`Temporary password: ${temporaryPassword}`);
    console.info("All existing sessions were revoked. Store the password securely; it will not be shown again.");
  } catch (error) {
    await databaseClient.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    databaseClient.release();
    await postgresqlConnectionPool.end();
  }
}

void resetAdministratorPassword();

import { backendEnvironmentConfiguration } from "../../config/environment-configuration.js";
import { postgresqlConnectionPool } from "../database-connection.js";

async function deleteDevelopmentAccountByEmailAddress() {
  if (backendEnvironmentConfiguration.NODE_ENV === "production") throw new Error("Development account deletion cannot run in production.");
  const requestedEmailAddress = process.argv[2]?.trim().toLowerCase();
  if (!requestedEmailAddress) throw new Error("Provide the exact account email address as the first argument.");

  const databaseClient = await postgresqlConnectionPool.connect();
  try {
    await databaseClient.query("begin");
    const matchingAccountResult = await databaseClient.query<{ id: string; email: string }>('select id, email from "user" where lower(email) = $1 for update', [requestedEmailAddress]);
    const matchingAccount = matchingAccountResult.rows[0];
    if (!matchingAccount) {
      await databaseClient.query("rollback");
      console.info(`No development account exists for ${requestedEmailAddress}.`);
      return;
    }

    const providerProfilesResult = await databaseClient.query<{ id: string }>("select id from provider_profiles where user_id = $1", [matchingAccount.id]);
    const providerProfileIdentifiers = providerProfilesResult.rows.map(({ id }) => id);
    let deletedProviderReviewDecisionCount = 0;
    if (providerProfileIdentifiers.length > 0) {
      const deletedProviderReviewDecisions = await databaseClient.query("delete from provider_review_decisions where provider_profile_id = any($1::uuid[]) or actor_user_id = $2", [providerProfileIdentifiers, matchingAccount.id]);
      deletedProviderReviewDecisionCount = deletedProviderReviewDecisions.rowCount ?? 0;
      await databaseClient.query("delete from provider_profiles where id = any($1::uuid[])", [providerProfileIdentifiers]);
    } else {
      const deletedProviderReviewDecisions = await databaseClient.query("delete from provider_review_decisions where actor_user_id = $1", [matchingAccount.id]);
      deletedProviderReviewDecisionCount = deletedProviderReviewDecisions.rowCount ?? 0;
    }

    const deletedVerificationRecords = await databaseClient.query("delete from verification where position($1 in lower(identifier)) > 0", [requestedEmailAddress]);
    const deletedAuthenticationAccount = await databaseClient.query('delete from "user" where id = $1', [matchingAccount.id]);
    await databaseClient.query("commit");

    console.info("Development account deleted.", {
      emailAddress: matchingAccount.email,
      deletedAuthenticationAccountCount: deletedAuthenticationAccount.rowCount ?? 0,
      deletedProviderProfileCount: providerProfileIdentifiers.length,
      deletedProviderReviewDecisionCount,
      deletedVerificationRecordCount: deletedVerificationRecords.rowCount ?? 0,
    });
  } catch (accountDeletionError) {
    await databaseClient.query("rollback");
    throw accountDeletionError;
  } finally {
    databaseClient.release();
    await postgresqlConnectionPool.end();
  }
}

void deleteDevelopmentAccountByEmailAddress();

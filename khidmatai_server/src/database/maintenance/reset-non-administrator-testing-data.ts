import "dotenv/config";
import { Pool } from "pg";

async function resetNonAdministratorTestingData() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  if (process.env.NODE_ENV === "production") {
    throw new Error("Testing-data reset is disabled when NODE_ENV=production.");
  }
  if (process.env.CONFIRM_RESET_TESTING_DATA !== "DELETE_NON_ADMIN_TEST_DATA") {
    throw new Error("Set CONFIRM_RESET_TESTING_DATA=DELETE_NON_ADMIN_TEST_DATA for this command only.");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const client = await pool.connect();
  try {
    await client.query("begin");
    const adminResult = await client.query<{ count: number }>(`select count(*)::int as count from "user" where role = 'admin' and "deactivatedAt" is null and banned = false`);
    if ((adminResult.rows[0]?.count ?? 0) < 1) throw new Error("Reset refused because no active administrator account exists.");
    const userResult = await client.query<{ count: number }>(`select count(*)::int as count from "user" where role <> 'admin'`);
    const providerResult = await client.query<{ count: number }>(`select count(*)::int as count from provider_profiles where user_id in (select id from "user" where role <> 'admin')`);
    const customerResult = await client.query<{ count: number }>(`select count(*)::int as count from customer_profiles where user_id in (select id from "user" where role <> 'admin')`);

    await client.query(`delete from provider_review_decisions where provider_profile_id in (select id from provider_profiles where user_id in (select id from "user" where role <> 'admin'))`);
    await client.query(`delete from provider_profiles where user_id in (select id from "user" where role <> 'admin')`);
    await client.query(`delete from customer_profiles where user_id in (select id from "user" where role <> 'admin')`);
    await client.query(`delete from "user" where role <> 'admin'`);
    await client.query("commit");
    console.log(`Testing data reset successfully. Preserved all administrator accounts. Removed ${userResult.rows[0]?.count ?? 0} users, ${providerResult.rows[0]?.count ?? 0} provider profiles, and ${customerResult.rows[0]?.count ?? 0} customer profiles.`);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release(); await pool.end();
  }
}

void resetNonAdministratorTestingData();

import { postgresqlConnectionPool } from "../../database/database-connection.js";
import { ApplicationError } from "../../shared/application-error.js";

/** Must be called inside every future booking write path; frontend checks are only UX. */
export async function requireCustomerBookingEligibility(authenticationUserId: string) {
  const result = await postgresqlConnectionPool.query({
    text: `select users.role, users.username, profiles.phone_number, coalesce(cities.name, profiles.city) as city_name
      from "user" users left join customer_profiles profiles on profiles.user_id = users.id
      left join cities on cities.id = profiles.city_id where users.id = $1 and users.banned = false and users."deactivatedAt" is null limit 1`,
    values: [authenticationUserId],
  });
  const customer = result.rows[0];
  if (!customer || customer.role !== "customer") throw new ApplicationError(403, "CUSTOMER_ACCOUNT_REQUIRED", "Only customers can book a provider.");
  if (!customer.username || !customer.phone_number || !customer.city_name) throw new ApplicationError(409, "CUSTOMER_BASIC_PROFILE_REQUIRED", "Complete your username, phone number, and city before booking a provider.");
  return customer;
}

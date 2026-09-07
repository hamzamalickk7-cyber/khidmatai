import { beforeEach, describe, expect, it, vi } from "vitest";

const { databaseQueryMock } = vi.hoisted(() => ({ databaseQueryMock: vi.fn() }));
vi.mock("../../database/database-connection.js", () => ({
  postgresqlConnectionPool: { query: databaseQueryMock },
}));

import { requireCustomerBookingEligibility } from "./customer-booking-eligibility-service.js";

describe("customer booking eligibility", () => {
  beforeEach(() => databaseQueryMock.mockReset());

  it("rejects a provider even when profile-looking fields are present", async () => {
    databaseQueryMock.mockResolvedValue({ rows: [{ role: "provider", username: "provider_one", phone_number: "+923001234567", city_name: "Islamabad" }] });
    await expect(requireCustomerBookingEligibility("provider-id")).rejects.toMatchObject({ httpStatusCode: 403, publicErrorCode: "CUSTOMER_ACCOUNT_REQUIRED" });
  });

  it("rejects an incomplete customer profile", async () => {
    databaseQueryMock.mockResolvedValue({ rows: [{ role: "customer", username: null, phone_number: null, city_name: null }] });
    await expect(requireCustomerBookingEligibility("customer-id")).rejects.toMatchObject({ httpStatusCode: 409, publicErrorCode: "CUSTOMER_BASIC_PROFILE_REQUIRED" });
  });

  it("returns the database-resolved eligible customer", async () => {
    const customer = { role: "customer", username: "customer_one", phone_number: "+923001234567", city_name: "Islamabad" };
    databaseQueryMock.mockResolvedValue({ rows: [customer] });
    await expect(requireCustomerBookingEligibility("customer-id")).resolves.toEqual(customer);
    expect(databaseQueryMock).toHaveBeenCalledWith(expect.objectContaining({ values: ["customer-id"] }));
  });
});

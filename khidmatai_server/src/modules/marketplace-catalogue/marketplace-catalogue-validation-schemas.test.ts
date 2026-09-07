import { describe, expect, it } from "vitest";
import { publicCityQueryValidationSchema, publicProviderDirectoryQueryValidationSchema, publicProviderUsernamePathValidationSchema } from "./marketplace-catalogue-validation-schemas.js";

describe("marketplace catalogue validation", () => {
  it("normalizes a public provider username", () => {
    expect(publicProviderUsernamePathValidationSchema.parse({ providerUsername: "Usman_Plumber" })).toEqual({ providerUsername: "usman_plumber" });
  });
  it.each(["_provider", "provider_", "ab", "provider-name", "provider name"])("rejects invalid username %s", (providerUsername) => {
    expect(() => publicProviderUsernamePathValidationSchema.parse({ providerUsername })).toThrow();
  });
  it("limits public directory pagination", () => {
    expect(() => publicProviderDirectoryQueryValidationSchema.parse({ pageSize: "100" })).toThrow();
    expect(publicProviderDirectoryQueryValidationSchema.parse({})).toMatchObject({ page: 1, pageSize: 12 });
  });
  it("defaults geography queries to serviceable Pakistani cities", () => {
    expect(publicCityQueryValidationSchema.parse({})).toEqual({ countryCode: "PK", serviceableOnly: true });
  });
});

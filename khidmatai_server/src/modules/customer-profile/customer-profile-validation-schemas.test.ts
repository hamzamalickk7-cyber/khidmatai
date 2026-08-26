import { describe, expect, it } from "vitest";
import {
  customerProfileUpdateValidationSchema,
  customerSavedAddressCreationValidationSchema,
} from "./customer-profile-validation-schemas.js";

describe("customer profile validation", () => {
  it("accepts a complete strictly shaped update", () => {
    expect(
      customerProfileUpdateValidationSchema.safeParse({
        fullName: "Ayesha Khan",
        phoneNumber: "+92 300 1234567",
        city: "Lahore",
        preferredContactMethod: "whatsapp",
        servicePreferenceKeys: ["plumbing"],
        expectedVersion: 1,
      }).success,
    ).toBe(true);
  });
  it("rejects duplicate preferences and unknown client-controlled fields", () => {
    expect(
      customerProfileUpdateValidationSchema.safeParse({
        fullName: "Ayesha Khan",
        phoneNumber: null,
        city: null,
        preferredContactMethod: "email",
        servicePreferenceKeys: ["plumbing", "plumbing"],
        expectedVersion: 1,
        role: "admin",
      }).success,
    ).toBe(false);
  });
  it("requires a real address and explicit default selection", () => {
    expect(
      customerSavedAddressCreationValidationSchema.safeParse({
        label: "Home",
        addressLine: "12 Model Town",
        city: "Lahore",
        isDefault: true,
      }).success,
    ).toBe(true);
    expect(
      customerSavedAddressCreationValidationSchema.safeParse({
        label: "H",
        addressLine: "x",
        city: "L",
        isDefault: true,
      }).success,
    ).toBe(false);
  });
});

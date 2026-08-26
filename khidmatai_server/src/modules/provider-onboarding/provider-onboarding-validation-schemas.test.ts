import { describe, expect, it } from "vitest";
import { providerOnboardingSubmissionValidationSchema, providerOnboardingUpdateValidationSchema } from "./provider-onboarding-validation-schemas.js";

const validProviderOnboardingUpdate = {
  fullName: "Hamza Malik",
  phoneNumber: "+92 300 1234567",
  addressLine: "Model Town, Lahore",
  city: "Lahore",
  professionalTitle: "Residential electrician",
  yearsOfExperience: 8,
  professionalBio: "Qualified electrician providing residential installation and repair services.",
  availabilitySummary: "Monday to Saturday",
  governmentIdentityNumber: "35202-1234567-1",
  categoryKeys: ["electrician"],
  serviceAreas: ["Model Town"],
  references: [],
  expectedVersion: 1,
};

describe("provider onboarding request validation", () => {
  it("accepts a complete provider onboarding draft", () => {
    expect(providerOnboardingUpdateValidationSchema.safeParse(validProviderOnboardingUpdate).success).toBe(true);
  });

  it("rejects unknown fields and incomplete professional information", () => {
    const validationResult = providerOnboardingUpdateValidationSchema.safeParse({ ...validProviderOnboardingUpdate, professionalBio: "Too short", unexpectedField: true });
    expect(validationResult.success).toBe(false);
  });

  it("requires an optimistic version when submitting", () => {
    expect(providerOnboardingSubmissionValidationSchema.safeParse({ expectedVersion: 0 }).success).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { providerOnboardingPatchValidationSchema, providerOnboardingSubmissionValidationSchema, providerOnboardingUpdateValidationSchema } from "./provider-onboarding-validation-schemas.js";

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
  categoryKeys: ["electrical-services"],
  serviceAreas: ["Model Town"],
  references: [],
  languages: ["Urdu", "English"],
  services: [{ categorySlug: "electrical-services", name: "Home wiring", description: "Safe residential wiring installation and repair.", startingPriceAmount: 3000 }],
  weeklyAvailability: [{ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" }],
  isAvailableForNewJobs: true,
  offersEmergencyService: false,
  maximumTravelDistanceKilometers: 25,
  expectedVersion: 1,
};

describe("provider onboarding request validation", () => {
  it("accepts a complete provider onboarding draft", () => {
    expect(providerOnboardingUpdateValidationSchema.safeParse(validProviderOnboardingUpdate).success).toBe(true);
  });

  it.each(["03001234567", "923001234567", "+923001234567"])(
    "accepts and normalizes the familiar Pakistani mobile format %s",
    (phoneNumber) => {
      const result = providerOnboardingPatchValidationSchema.safeParse({ phoneNumber, expectedVersion: 2 });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.phoneNumber).toBe("+923001234567");
    },
  );

  it("rejects unknown fields and incomplete professional information", () => {
    const validationResult = providerOnboardingUpdateValidationSchema.safeParse({ ...validProviderOnboardingUpdate, professionalBio: "Too short", unexpectedField: true });
    expect(validationResult.success).toBe(false);
  });

  it("requires an optimistic version when submitting", () => {
    expect(providerOnboardingSubmissionValidationSchema.safeParse({ expectedVersion: 0 }).success).toBe(false);
  });

  it("accepts one strictly validated field in a versioned draft patch", () => {
    expect(providerOnboardingPatchValidationSchema.safeParse({ professionalTitle: "Master plumber", expectedVersion: 2 }).success).toBe(true);
  });

  it("rejects empty, unknown, and invalid draft patches", () => {
    expect(providerOnboardingPatchValidationSchema.safeParse({ expectedVersion: 2 }).success).toBe(false);
    expect(providerOnboardingPatchValidationSchema.safeParse({ expectedVersion: 2, actorRole: "admin" }).success).toBe(false);
    expect(providerOnboardingPatchValidationSchema.safeParse({ phoneNumber: "x", expectedVersion: 2 }).success).toBe(false);
  });
});

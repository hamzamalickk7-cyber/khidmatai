import { z } from "zod";

export const providerOnboardingFormValidationSchema = z.object({
  phoneNumber: z.string().trim().min(7).max(30),
  governmentIdentityNumber: z.string().trim().min(5).max(100),
  addressLine: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(100),
  yearsOfExperience: z.number().int().min(0).max(80),
  categoryKeys: z.string().trim().min(2),
  serviceAreas: z.string().trim().min(2),
  availabilitySummary: z.string().trim().min(3).max(300),
  professionalBio: z.string().trim().min(30).max(1200),
});

export type ProviderOnboardingFormValues = z.infer<typeof providerOnboardingFormValidationSchema>;

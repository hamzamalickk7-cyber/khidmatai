import { z } from "zod";

const providerReferenceValidationSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  relationship: z.string().trim().min(2).max(120),
  email: z.email().optional(),
  phoneNumber: z.string().trim().min(7).max(30).optional(),
}).strict().refine((providerReference) => providerReference.email || providerReference.phoneNumber, { message: "A reference email address or phone number is required." });

export const providerOnboardingUpdateValidationSchema = z.object({
  phoneNumber: z.string().trim().min(7).max(30),
  addressLine: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(100),
  yearsOfExperience: z.number().int().min(0).max(80),
  professionalBio: z.string().trim().min(30).max(1200),
  availabilitySummary: z.string().trim().min(3).max(300),
  governmentIdentityNumber: z.string().trim().min(5).max(100),
  categoryKeys: z.array(z.string().trim().min(2).max(80)).min(1).max(10),
  serviceAreas: z.array(z.string().trim().min(2).max(100)).min(1).max(20),
  references: z.array(providerReferenceValidationSchema).max(5),
  expectedVersion: z.number().int().positive(),
}).strict();

export const providerOnboardingSubmissionValidationSchema = z.object({ expectedVersion: z.number().int().positive() }).strict();

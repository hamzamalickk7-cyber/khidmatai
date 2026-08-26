import { z } from "zod";

const providerReferenceValidationSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  relationship: z.string().trim().min(2).max(120),
  email: z.email().optional(),
  phoneNumber: z.string().trim().min(7).max(30).optional(),
}).strict().refine((providerReference) => providerReference.email || providerReference.phoneNumber, { message: "A reference email address or phone number is required." });

export const providerOnboardingUpdateValidationSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phoneNumber: z.string().trim().min(7).max(30),
  addressLine: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(100),
  professionalTitle: z.string().trim().min(2).max(120),
  yearsOfExperience: z.number().int().min(0).max(80),
  professionalBio: z.string().trim().min(30).max(1200),
  availabilitySummary: z.string().trim().min(3).max(300),
  governmentIdentityNumber: z.string().trim().regex(/^\d{5}-\d{7}-\d$/, "Use the CNIC format 12345-1234567-1."),
  categoryKeys: z.array(z.string().trim().min(2).max(80)).min(1).max(10).refine((values) => new Set(values).size === values.length, "Service categories must be unique."),
  serviceAreas: z.array(z.string().trim().min(2).max(100)).min(1).max(20).refine((values) => new Set(values).size === values.length, "Service areas must be unique."),
  references: z.array(providerReferenceValidationSchema).max(5),
  expectedVersion: z.number().int().positive(),
}).strict();

export const providerOnboardingSubmissionValidationSchema = z.object({ expectedVersion: z.number().int().positive() }).strict();

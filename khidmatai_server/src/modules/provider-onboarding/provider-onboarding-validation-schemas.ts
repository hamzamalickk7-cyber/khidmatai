import { z } from "zod";
import { pakistanMobileNumberValidationSchema } from "../../shared/pakistan-phone-number.js";

const providerReferenceValidationSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  relationship: z.string().trim().min(2).max(120),
  email: z.email().optional(),
  phoneNumber: pakistanMobileNumberValidationSchema.optional(),
}).strict().refine((providerReference) => providerReference.email || providerReference.phoneNumber, { message: "A reference email address or phone number is required." });

const providerOnboardingEditableFieldsValidationSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phoneNumber: pakistanMobileNumberValidationSchema,
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
  languages: z.array(z.string().trim().min(2).max(50)).min(1).max(10).refine((values) => new Set(values.map((value) => value.toLowerCase())).size === values.length, "Languages must be unique."),
  services: z.array(z.object({
    categorySlug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().min(10).max(500).optional(),
    startingPriceAmount: z.number().int().min(0).max(100_000_000),
  }).strict()).min(1).max(30),
  weeklyAvailability: z.array(z.object({ dayOfWeek: z.number().int().min(0).max(6), startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/) }).strict().refine((window) => window.startTime < window.endTime, "Availability end time must be after its start time.")).max(21),
  isAvailableForNewJobs: z.boolean(),
  offersEmergencyService: z.boolean(),
  maximumTravelDistanceKilometers: z.number().int().min(1).max(500),
}).strict();

export const providerOnboardingUpdateValidationSchema = providerOnboardingEditableFieldsValidationSchema.extend({ expectedVersion: z.number().int().positive() }).strict();
export const providerOnboardingPatchValidationSchema = providerOnboardingEditableFieldsValidationSchema.partial().extend({ expectedVersion: z.number().int().positive() }).strict().refine((input) => Object.keys(input).some((key) => key !== "expectedVersion"), "Provide at least one profile field to update.");

export const providerOnboardingSubmissionValidationSchema = z.object({ expectedVersion: z.number().int().positive() }).strict();

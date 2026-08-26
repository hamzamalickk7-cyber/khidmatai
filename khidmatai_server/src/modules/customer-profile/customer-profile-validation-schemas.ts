import { z } from "zod";

export const customerProfileUpdateValidationSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    phoneNumber: z.string().trim().min(7).max(30).nullable(),
    city: z.string().trim().min(2).max(100).nullable(),
    preferredContactMethod: z.enum(["phone", "whatsapp", "email"]),
    servicePreferenceKeys: z
      .array(z.string().trim().min(2).max(80))
      .max(20)
      .refine((values) => new Set(values).size === values.length, "Service preferences must be unique."),
    expectedVersion: z.number().int().positive(),
  })
  .strict();

export const customerSavedAddressCreationValidationSchema = z
  .object({
    label: z.string().trim().min(2).max(80),
    addressLine: z.string().trim().min(5).max(300),
    city: z.string().trim().min(2).max(100),
    isDefault: z.boolean(),
  })
  .strict();

export const customerSavedAddressUpdateValidationSchema = customerSavedAddressCreationValidationSchema;
export const customerSavedAddressPathParametersValidationSchema = z.object({ addressId: z.uuid() }).strict();

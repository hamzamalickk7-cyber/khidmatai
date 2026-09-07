import { z } from "zod";
import {
  pakistanMobileNumberInputPattern,
  pakistanMobileNumberValidationMessage,
} from "./pakistan-phone-number-validation";

export const customerProfileFormValidationSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter at least 2 characters.").max(120),
    phoneNumber: z
      .string()
      .trim()
      .regex(pakistanMobileNumberInputPattern, pakistanMobileNumberValidationMessage)
      .nullable(),
    city: z.string().trim().min(2, "Enter your city.").max(100).nullable(),
    preferredContactMethod: z.enum(["phone", "whatsapp", "email"]),
    servicePreferenceKeys: z.array(z.string().trim().min(2).max(80)).max(20),
    expectedVersion: z.number().int().positive(),
  })
  .strict();

export const customerSavedAddressFormValidationSchema = z
  .object({
    label: z.string().trim().min(2).max(80),
    addressLine: z.string().trim().min(5).max(300),
    city: z.string().trim().min(2).max(100),
    isDefault: z.boolean(),
  })
  .strict();
export type CustomerProfileFormValues = z.infer<typeof customerProfileFormValidationSchema>;
export type CustomerSavedAddressFormValues = z.infer<typeof customerSavedAddressFormValidationSchema>;

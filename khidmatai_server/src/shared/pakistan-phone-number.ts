import { z } from "zod";

export const pakistanMobileNumberInputPattern = /^(?:\+92\s?|92\s?|0)3\d{2}[-\s]?\d{7}$/;

export const pakistanMobileNumberValidationSchema = z
  .string()
  .trim()
  .regex(
    pakistanMobileNumberInputPattern,
    "Enter a Pakistani mobile number such as 03001234567, 923001234567, or +923001234567.",
  )
  .transform(normalizePakistanMobileNumber);

export function normalizePakistanMobileNumber(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, "");
  return digits.startsWith("0") ? `+92${digits.slice(1)}` : `+${digits}`;
}

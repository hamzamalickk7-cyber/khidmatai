import { z } from "zod";

export const adminLoginFormValidationSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Enter your password."),
});

export type AdminLoginFormValues = z.infer<typeof adminLoginFormValidationSchema>;

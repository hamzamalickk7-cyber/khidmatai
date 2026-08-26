import { z } from "zod";

export const authenticationFormValidationSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
  accountType: z.string(),
});

export type AuthenticationFormValues = z.infer<typeof authenticationFormValidationSchema>;

export function validateAuthenticationFormValues(authenticationFormMode: "sign-in" | "sign-up") {
  return authenticationFormValidationSchema.superRefine((authenticationFormValues, validationContext) => {
    if (authenticationFormMode === "sign-up" && authenticationFormValues.name.trim().length < 2) validationContext.addIssue({ code: "custom", path: ["name"], message: "Enter your full name." });
    if (!z.email().safeParse(authenticationFormValues.email).success) validationContext.addIssue({ code: "custom", path: ["email"], message: "Enter a valid email address." });
    if (authenticationFormValues.password.length < 10 || authenticationFormValues.password.length > 128) validationContext.addIssue({ code: "custom", path: ["password"], message: "Password must contain between 10 and 128 characters." });
    if (authenticationFormMode === "sign-up" && authenticationFormValues.password !== authenticationFormValues.confirmPassword) validationContext.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match." });
    if (authenticationFormMode === "sign-up" && authenticationFormValues.accountType !== "customer" && authenticationFormValues.accountType !== "provider") validationContext.addIssue({ code: "custom", path: ["accountType"], message: "Choose whether you need a service or you offer one." });
  });
}

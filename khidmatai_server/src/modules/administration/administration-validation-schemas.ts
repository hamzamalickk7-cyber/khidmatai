import { z } from "zod";

export const providerOnboardingListQueryValidationSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const providerProfileRouteParametersValidationSchema = z
  .object({
    providerProfileId: z.uuid(),
  })
  .strict();

const providerReviewActionRequestBodyBaseValidationSchema = z.object({
  action: z.enum(["start_review", "approve", "reject", "request_changes", "suspend", "reinstate", "remove"]),
  reason: z.string().trim().max(1000).optional(),
  requestedChangeKeys: z
    .array(
      z.enum(["identity", "contact", "address", "services", "experience", "biography", "availability", "references"]),
    )
    .max(8)
    .optional(),
  expectedVersion: z.number().int().positive(),
});

function validateProviderReviewActionDetails(
  input: z.infer<typeof providerReviewActionRequestBodyBaseValidationSchema>,
  refinementContext: z.RefinementCtx,
) {
  if (input.action === "request_changes" && !input.requestedChangeKeys?.length) {
    refinementContext.addIssue({
      code: "custom",
      path: ["requestedChangeKeys"],
      message: "Select at least one profile section that needs changes.",
    });
  }
  if (["request_changes", "reject", "suspend", "remove"].includes(input.action) && (input.reason?.length ?? 0) < 10) {
    refinementContext.addIssue({
      code: "custom",
      path: ["reason"],
      message: "Explain this decision in at least 10 characters.",
    });
  }
}

export const providerReviewActionRequestBodyValidationSchema = providerReviewActionRequestBodyBaseValidationSchema
  .strict()
  .superRefine(validateProviderReviewActionDetails);

export const providerReviewActionValidationSchema = providerProfileRouteParametersValidationSchema
  .extend(providerReviewActionRequestBodyBaseValidationSchema.shape)
  .strict()
  .superRefine(validateProviderReviewActionDetails);

export const administrationCollectionQueryValidationSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(120).default(""),
    role: z.enum(["customer", "provider", "support", "admin"]).optional(),
    status: z.enum(["active", "banned", "deactivated"]).optional(),
  })
  .strict();

export const administrationAuditQueryValidationSchema = administrationCollectionQueryValidationSchema
  .omit({ role: true, status: true })
  .extend({ eventKey: z.string().trim().max(120).optional() })
  .strict();
export const administrationUserRouteParametersValidationSchema = z
  .object({ userId: z.string().trim().min(1).max(200) })
  .strict();
export const administrationReasonValidationSchema = z.object({ reason: z.string().trim().min(5).max(1000) }).strict();
export const administrationRoleChangeValidationSchema = administrationReasonValidationSchema
  .extend({ role: z.enum(["customer", "provider"]) })
  .strict();
export const administrationBanValidationSchema = z
  .object({ action: z.enum(["ban", "unban"]), reason: z.string().trim().min(10).max(1000).optional() })
  .strict()
  .refine((input) => input.action === "unban" || Boolean(input.reason), {
    path: ["reason"],
    message: "A reason is required when banning an account.",
  });
export const administrationAccountStatusValidationSchema = z
  .object({ action: z.enum(["deactivate", "reactivate"]), reason: z.string().trim().min(10).max(1000).optional() })
  .strict()
  .refine((input) => input.action === "reactivate" || Boolean(input.reason), {
    path: ["reason"],
    message: "A reason is required when deactivating an account.",
  });

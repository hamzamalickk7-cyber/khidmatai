import { z } from "zod";

export const providerOnboardingListQueryValidationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export const providerReviewActionValidationSchema = z.object({
  providerProfileId: z.uuid(),
  action: z.enum(["start_review", "approve", "reject", "request_changes", "suspend", "reinstate", "remove"]),
  reason: z.string().trim().min(5).max(1000),
  expectedVersion: z.number().int().positive(),
}).strict();

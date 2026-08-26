import { describe, expect, it } from "vitest";
import { providerOnboardingListQueryValidationSchema, providerReviewActionValidationSchema } from "./administration-validation-schemas.js";

const validReviewAction = {
  providerProfileId: "5f7c2b3a-9b1a-4a7a-9c1a-0f2b3a9b1a4a",
  action: "approve",
  reason: "All required documents were verified.",
  expectedVersion: 3,
};

describe("providerReviewActionValidationSchema", () => {
  it("accepts a complete, valid review action", () => {
    expect(providerReviewActionValidationSchema.safeParse(validReviewAction).success).toBe(true);
  });

  it("rejects an unknown action outside the documented transition catalog", () => {
    expect(providerReviewActionValidationSchema.safeParse({ ...validReviewAction, action: "activate" }).success).toBe(false);
  });

  it("rejects a reason under 5 characters, so a decision cannot be left unexplained", () => {
    expect(providerReviewActionValidationSchema.safeParse({ ...validReviewAction, reason: "no" }).success).toBe(false);
  });

  it("requires expectedVersion so a stale review cannot silently overwrite a newer decision", () => {
    const { expectedVersion: _expectedVersion, ...withoutExpectedVersion } = validReviewAction;
    expect(providerReviewActionValidationSchema.safeParse(withoutExpectedVersion).success).toBe(false);
  });

  it("rejects unknown fields, such as an attacker-supplied actorRole override", () => {
    expect(providerReviewActionValidationSchema.safeParse({ ...validReviewAction, actorRole: "admin" }).success).toBe(false);
  });

  it("rejects a non-UUID providerProfileId, closing off SQL-injection-shaped identifiers", () => {
    expect(providerReviewActionValidationSchema.safeParse({ ...validReviewAction, providerProfileId: "1 OR 1=1" }).success).toBe(false);
  });
});

describe("providerOnboardingListQueryValidationSchema", () => {
  it("defaults to page 1 and a bounded page size when the client sends nothing", () => {
    const parsedQuery = providerOnboardingListQueryValidationSchema.parse({});
    expect(parsedQuery).toEqual({ page: 1, pageSize: 20 });
  });

  it("coerces string query parameters, since Express query values arrive as strings", () => {
    expect(providerOnboardingListQueryValidationSchema.parse({ page: "3", pageSize: "10" })).toEqual({ page: 3, pageSize: 10 });
  });

  it("rejects a page size above the bound, preventing an unbounded full-table scan", () => {
    expect(providerOnboardingListQueryValidationSchema.safeParse({ pageSize: "500" }).success).toBe(false);
  });

  it("rejects a page below 1", () => {
    expect(providerOnboardingListQueryValidationSchema.safeParse({ page: "0" }).success).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { providerReviewTransitionCatalog } from "./administration-types.js";

const allProviderProfileStatuses = ["draft", "submitted", "under_review", "changes_required", "active", "paused", "rejected", "suspended", "removed"];

describe("providerReviewTransitionCatalog", () => {
  it("never lists the removed 'approved' status as a permitted previous status", () => {
    // Regression guard for DEC-001: "approve" always activates directly, so
    // "approved" is not a reachable provider_profiles.status value. If this
    // ever starts failing, either the removed status was reintroduced without
    // updating drizzle/0001_remove_unreachable_provider_approved_status.sql,
    // or a new intermediate status was added and this test needs updating.
    for (const transitionRule of Object.values(providerReviewTransitionCatalog)) {
      expect(transitionRule.permittedPreviousStatuses).not.toContain("approved");
      expect(transitionRule.nextStatus).not.toBe("approved");
    }
  });

  it("only references statuses that exist in the database status check constraint", () => {
    for (const transitionRule of Object.values(providerReviewTransitionCatalog)) {
      expect(allProviderProfileStatuses).toContain(transitionRule.nextStatus);
      for (const previousStatus of transitionRule.permittedPreviousStatuses) {
        expect(allProviderProfileStatuses).toContain(previousStatus);
      }
    }
  });

  it("activates a provider directly from submitted or under_review via approve", () => {
    expect(providerReviewTransitionCatalog.approve.permittedPreviousStatuses).toEqual(["submitted", "under_review"]);
    expect(providerReviewTransitionCatalog.approve.nextStatus).toBe("active");
  });

  it("only allows suspending a currently active provider", () => {
    expect(providerReviewTransitionCatalog.suspend.permittedPreviousStatuses).toEqual(["active"]);
  });

  it("only allows removal from a rejected or suspended provider, never directly from active", () => {
    expect(providerReviewTransitionCatalog.remove.permittedPreviousStatuses).not.toContain("active");
  });
});

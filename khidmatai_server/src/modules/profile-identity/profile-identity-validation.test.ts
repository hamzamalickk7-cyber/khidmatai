import { describe, expect, it } from "vitest";
import { usernameUpdateValidationSchema } from "./profile-identity-validation-schemas.js";

describe("profile identity validation", () => {
  it("normalizes a valid username", () => {
    expect(usernameUpdateValidationSchema.parse({ username: "  Hamza_7  " })).toEqual({ username: "hamza_7" });
  });

  it("rejects boundary underscores and client-controlled identity fields", () => {
    expect(usernameUpdateValidationSchema.safeParse({ username: "_hamza" }).success).toBe(false);
    expect(usernameUpdateValidationSchema.safeParse({ username: "hamza", userId: "another-user" }).success).toBe(false);
  });
});

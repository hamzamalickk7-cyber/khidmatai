import { describe, expect, it } from "vitest";
import { confirmMediaUploadValidationSchema, createMediaUploadSignatureValidationSchema } from "./profile-media-validation-schemas.js";

describe("profile media validation", () => {
  it("permits only supported media purposes", () => {
    expect(createMediaUploadSignatureValidationSchema.parse({ mediaPurpose: "work_gallery" })).toEqual({ mediaPurpose: "work_gallery" });
    expect(() => createMediaUploadSignatureValidationSchema.parse({ mediaPurpose: "arbitrary_file" })).toThrow();
  });
  it("rejects unexpected confirmation fields", () => {
    expect(() => confirmMediaUploadValidationSchema.parse({ mediaPurpose: "profile_image", cloudinaryPublicIdentifier: "khidmatai/providers/one/profile_image/file", ownerUserId: "attacker" })).toThrow();
  });
});

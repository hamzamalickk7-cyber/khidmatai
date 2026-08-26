DROP TABLE IF EXISTS "provider_verification_documents";

ALTER TABLE "provider_profiles"
  DROP COLUMN IF EXISTS "phone_verification_status",
  DROP COLUMN IF EXISTS "profile_photograph_key",
  DROP COLUMN IF EXISTS "selfie_evidence_key",
  DROP COLUMN IF EXISTS "government_identity_front_key",
  DROP COLUMN IF EXISTS "government_identity_back_key";

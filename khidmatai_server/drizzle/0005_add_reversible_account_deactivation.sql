ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "deactivatedAt" timestamptz;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "deactivatedBy" text REFERENCES "user"("id") ON DELETE SET NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "deactivationReason" text;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_role_check' AND conrelid = '"user"'::regclass) THEN
    ALTER TABLE "user" ADD CONSTRAINT "user_role_check" CHECK ("role" IN ('customer', 'provider', 'support', 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_account_type_check' AND conrelid = '"user"'::regclass) THEN
    ALTER TABLE "user" ADD CONSTRAINT "user_account_type_check" CHECK ("accountType" IN ('customer', 'provider', 'support', 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_deactivation_consistency_check' AND conrelid = '"user"'::regclass) THEN
    ALTER TABLE "user" ADD CONSTRAINT "user_deactivation_consistency_check" CHECK (
      ("deactivatedAt" IS NULL AND "deactivationReason" IS NULL) OR
      ("deactivatedAt" IS NOT NULL AND "deactivationReason" IS NOT NULL AND char_length("deactivationReason") BETWEEN 5 AND 1000)
    );
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS "user_role_status_index" ON "user" ("role", "deactivatedAt", "banned");

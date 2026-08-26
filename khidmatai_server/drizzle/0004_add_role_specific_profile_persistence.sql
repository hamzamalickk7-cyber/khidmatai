CREATE TABLE IF NOT EXISTS "customer_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
  "phone_number" text,
  "city" text,
  "preferred_contact_method" text NOT NULL DEFAULT 'whatsapp',
  "version" integer NOT NULL DEFAULT 1,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "customer_profiles_contact_method_check" CHECK ("preferred_contact_method" IN ('phone','whatsapp','email')),
  CONSTRAINT "customer_profiles_version_check" CHECK ("version" > 0)
);

CREATE TABLE IF NOT EXISTS "customer_saved_addresses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "customer_profile_id" uuid NOT NULL REFERENCES "customer_profiles"("id") ON DELETE CASCADE,
  "label" text NOT NULL,
  "address_line" text NOT NULL,
  "city" text NOT NULL,
  "is_default" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "customer_saved_addresses_profile_index" ON "customer_saved_addresses" ("customer_profile_id");
CREATE UNIQUE INDEX IF NOT EXISTS "customer_saved_addresses_one_default_per_profile_unique" ON "customer_saved_addresses" ("customer_profile_id") WHERE "is_default" = true;
ALTER TABLE "customer_saved_addresses" ADD CONSTRAINT "customer_saved_addresses_label_length_check" CHECK (char_length("label") BETWEEN 2 AND 80);
ALTER TABLE "customer_saved_addresses" ADD CONSTRAINT "customer_saved_addresses_address_line_length_check" CHECK (char_length("address_line") BETWEEN 5 AND 300);
ALTER TABLE "customer_saved_addresses" ADD CONSTRAINT "customer_saved_addresses_city_length_check" CHECK (char_length("city") BETWEEN 2 AND 100);

CREATE TABLE IF NOT EXISTS "customer_service_preferences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "customer_profile_id" uuid NOT NULL REFERENCES "customer_profiles"("id") ON DELETE CASCADE,
  "category_key" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "customer_service_preferences_profile_category_unique" UNIQUE ("customer_profile_id", "category_key")
);
ALTER TABLE "customer_service_preferences" ADD CONSTRAINT "customer_service_preferences_category_key_length_check" CHECK (char_length("category_key") BETWEEN 2 AND 80);

ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_phone_number_length_check" CHECK ("phone_number" IS NULL OR char_length("phone_number") BETWEEN 7 AND 30);
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_city_length_check" CHECK ("city" IS NULL OR char_length("city") BETWEEN 2 AND 100);

ALTER TABLE "provider_profiles" ADD COLUMN IF NOT EXISTS "professional_title" text;
ALTER TABLE "provider_profiles" ADD CONSTRAINT "provider_profiles_status_check" CHECK ("status" IN ('draft', 'submitted', 'under_review', 'changes_required', 'active', 'suspended', 'rejected', 'removed'));
ALTER TABLE "provider_profiles" ADD CONSTRAINT "provider_profiles_years_of_experience_check" CHECK ("years_of_experience" IS NULL OR "years_of_experience" BETWEEN 0 AND 80);
ALTER TABLE "provider_profiles" ADD CONSTRAINT "provider_profiles_professional_title_length_check" CHECK ("professional_title" IS NULL OR char_length("professional_title") BETWEEN 2 AND 120);

INSERT INTO "customer_profiles" ("user_id")
SELECT "id" FROM "user" WHERE "role" = 'customer'
ON CONFLICT ("user_id") DO NOTHING;

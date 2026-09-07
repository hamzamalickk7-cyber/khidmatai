ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS is_available_for_new_jobs boolean NOT NULL DEFAULT false;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS offers_emergency_service boolean NOT NULL DEFAULT false;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS maximum_travel_distance_kilometers integer;
ALTER TABLE provider_profiles ADD CONSTRAINT provider_profiles_travel_distance_check CHECK (maximum_travel_distance_kilometers IS NULL OR maximum_travel_distance_kilometers BETWEEN 1 AND 500);

CREATE TABLE IF NOT EXISTS provider_spoken_languages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), provider_profile_id uuid NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
 language_name text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT provider_spoken_languages_profile_language_unique UNIQUE(provider_profile_id, language_name),
 CONSTRAINT provider_spoken_languages_name_length_check CHECK(char_length(language_name) BETWEEN 2 AND 50)
);
CREATE TABLE IF NOT EXISTS provider_offered_services (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), provider_profile_id uuid NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
 category_id uuid REFERENCES service_categories(id) ON DELETE RESTRICT, service_name text NOT NULL, service_description text,
 starting_price_amount integer NOT NULL, currency_code text NOT NULL DEFAULT 'PKR', display_order integer NOT NULL DEFAULT 0,
 is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT provider_offered_services_name_length_check CHECK(char_length(service_name) BETWEEN 2 AND 100),
 CONSTRAINT provider_offered_services_description_length_check CHECK(service_description IS NULL OR char_length(service_description) BETWEEN 10 AND 500),
 CONSTRAINT provider_offered_services_price_check CHECK(starting_price_amount BETWEEN 0 AND 100000000),
 CONSTRAINT provider_offered_services_currency_check CHECK(currency_code ~ '^[A-Z]{3}$')
);
CREATE INDEX IF NOT EXISTS provider_offered_services_profile_order_index ON provider_offered_services(provider_profile_id, display_order);
CREATE TABLE IF NOT EXISTS provider_weekly_availability_windows (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), provider_profile_id uuid NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
 day_of_week integer NOT NULL, start_time time NOT NULL, end_time time NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT provider_availability_window_unique UNIQUE(provider_profile_id, day_of_week, start_time, end_time),
 CONSTRAINT provider_availability_day_check CHECK(day_of_week BETWEEN 0 AND 6),
 CONSTRAINT provider_availability_time_check CHECK(start_time < end_time)
);
ALTER TABLE provider_profile_media_assets ADD COLUMN IF NOT EXISTS document_side text;
ALTER TABLE provider_profile_media_assets ADD CONSTRAINT provider_media_document_side_check CHECK(document_side IS NULL OR document_side IN ('front','back'));
CREATE UNIQUE INDEX IF NOT EXISTS provider_identity_document_side_unique ON provider_profile_media_assets(provider_profile_id, document_side) WHERE media_purpose = 'identity_document';

CREATE TABLE IF NOT EXISTS customer_profile_media_assets (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), customer_profile_id uuid NOT NULL UNIQUE REFERENCES customer_profiles(id) ON DELETE CASCADE,
 owner_user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE, cloudinary_public_identifier text NOT NULL UNIQUE,
 secure_delivery_url text NOT NULL, mime_type text NOT NULL, byte_size integer NOT NULL, width integer, height integer,
 created_at timestamptz NOT NULL DEFAULT now(), CONSTRAINT customer_profile_media_assets_byte_size_check CHECK(byte_size > 0 AND byte_size <= 5242880)
);

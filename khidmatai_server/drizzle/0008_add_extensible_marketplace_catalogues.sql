ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "username" text;
CREATE UNIQUE INDEX IF NOT EXISTS "user_username_case_insensitive_unique" ON "user" (lower("username")) WHERE "username" IS NOT NULL;
ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "user_username_format_check";
ALTER TABLE "user" ADD CONSTRAINT "user_username_format_check" CHECK ("username" IS NULL OR "username" ~ '^[a-z0-9](?:[a-z0-9_]{1,28}[a-z0-9])?$');

CREATE TABLE IF NOT EXISTS "countries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "iso_alpha_2_code" text NOT NULL UNIQUE,
  "iso_alpha_3_code" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "international_calling_code" text,
  "default_currency_code" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "countries_iso_alpha_2_format_check" CHECK ("iso_alpha_2_code" ~ '^[A-Z]{2}$'),
  CONSTRAINT "countries_iso_alpha_3_format_check" CHECK ("iso_alpha_3_code" ~ '^[A-Z]{3}$')
);

CREATE TABLE IF NOT EXISTS "country_administrative_areas" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "country_id" uuid NOT NULL REFERENCES "countries"("id") ON DELETE RESTRICT,
  "code" text,
  "name" text NOT NULL,
  "area_type" text NOT NULL DEFAULT 'province',
  "is_active" boolean NOT NULL DEFAULT true,
  CONSTRAINT "country_administrative_areas_country_name_unique" UNIQUE ("country_id", "name")
);
CREATE INDEX IF NOT EXISTS "country_administrative_areas_country_index" ON "country_administrative_areas" ("country_id");

CREATE TABLE IF NOT EXISTS "cities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "country_id" uuid NOT NULL REFERENCES "countries"("id") ON DELETE RESTRICT,
  "administrative_area_id" uuid REFERENCES "country_administrative_areas"("id") ON DELETE SET NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "geonames_identifier" integer UNIQUE,
  "latitude" numeric(9,6),
  "longitude" numeric(9,6),
  "time_zone_identifier" text,
  "is_serviceable" boolean NOT NULL DEFAULT false,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "cities_country_slug_unique" UNIQUE ("country_id", "slug")
);
CREATE INDEX IF NOT EXISTS "cities_country_serviceability_index" ON "cities" ("country_id", "is_serviceable", "is_active");

CREATE TABLE IF NOT EXISTS "service_categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "parent_category_id" uuid REFERENCES "service_categories"("id") ON DELETE RESTRICT,
  "slug" text NOT NULL UNIQUE,
  "display_name" text NOT NULL,
  "description" text NOT NULL,
  "icon_identifier" text NOT NULL,
  "display_order" integer NOT NULL DEFAULT 0,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "service_categories_slug_format_check" CHECK ("slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT "service_categories_display_order_check" CHECK ("display_order" >= 0)
);
CREATE INDEX IF NOT EXISTS "service_categories_parent_display_order_index" ON "service_categories" ("parent_category_id", "display_order");

ALTER TABLE "provider_profiles" ADD COLUMN IF NOT EXISTS "city_id" uuid REFERENCES "cities"("id") ON DELETE RESTRICT;
ALTER TABLE "customer_profiles" ADD COLUMN IF NOT EXISTS "city_id" uuid REFERENCES "cities"("id") ON DELETE RESTRICT;
ALTER TABLE "customer_saved_addresses" ADD COLUMN IF NOT EXISTS "city_id" uuid REFERENCES "cities"("id") ON DELETE RESTRICT;
ALTER TABLE "provider_service_categories" ADD COLUMN IF NOT EXISTS "category_id" uuid REFERENCES "service_categories"("id") ON DELETE RESTRICT;
ALTER TABLE "customer_service_preferences" ADD COLUMN IF NOT EXISTS "category_id" uuid REFERENCES "service_categories"("id") ON DELETE RESTRICT;

CREATE TABLE IF NOT EXISTS "provider_profile_media_assets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "provider_profile_id" uuid NOT NULL REFERENCES "provider_profiles"("id") ON DELETE CASCADE,
  "owner_user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "media_purpose" text NOT NULL,
  "cloudinary_public_identifier" text NOT NULL UNIQUE,
  "cloudinary_resource_type" text NOT NULL DEFAULT 'image',
  "cloudinary_delivery_type" text NOT NULL DEFAULT 'upload',
  "secure_delivery_url" text NOT NULL,
  "original_file_name" text,
  "mime_type" text NOT NULL,
  "byte_size" integer NOT NULL,
  "width" integer,
  "height" integer,
  "display_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "provider_profile_media_assets_purpose_check" CHECK ("media_purpose" IN ('profile_image','work_gallery','identity_document','professional_certificate')),
  CONSTRAINT "provider_profile_media_assets_byte_size_check" CHECK ("byte_size" > 0 AND "byte_size" <= 10485760)
);
CREATE INDEX IF NOT EXISTS "provider_profile_media_assets_profile_purpose_index" ON "provider_profile_media_assets" ("provider_profile_id", "media_purpose", "display_order");

INSERT INTO "countries" ("iso_alpha_2_code", "iso_alpha_3_code", "name", "international_calling_code", "default_currency_code")
VALUES ('PK', 'PAK', 'Pakistan', '+92', 'PKR') ON CONFLICT ("iso_alpha_2_code") DO NOTHING;

INSERT INTO "country_administrative_areas" ("country_id", "code", "name", "area_type")
SELECT c.id, seed.code, seed.name, seed.area_type FROM "countries" c
CROSS JOIN (VALUES
  ('ICT','Islamabad Capital Territory','federal territory'), ('PB','Punjab','province'),
  ('SD','Sindh','province'), ('KP','Khyber Pakhtunkhwa','province'),
  ('BA','Balochistan','province'), ('GB','Gilgit-Baltistan','administrative territory'),
  ('AJK','Azad Jammu and Kashmir','administrative territory')
) AS seed(code, name, area_type) WHERE c.iso_alpha_2_code = 'PK'
ON CONFLICT ("country_id", "name") DO NOTHING;

INSERT INTO "cities" ("country_id", "administrative_area_id", "name", "slug", "latitude", "longitude", "time_zone_identifier", "is_serviceable")
SELECT c.id, a.id, seed.name, seed.slug, seed.latitude, seed.longitude, 'Asia/Karachi', seed.serviceable
FROM "countries" c
JOIN (VALUES
 ('Islamabad','islamabad','Islamabad Capital Territory',33.684400,73.047900,true),
 ('Rawalpindi','rawalpindi','Punjab',33.565100,73.016900,true), ('Lahore','lahore','Punjab',31.520400,74.358700,true),
 ('Karachi','karachi','Sindh',24.860700,67.001100,true), ('Faisalabad','faisalabad','Punjab',31.450400,73.135000,true),
 ('Multan','multan','Punjab',30.157500,71.524900,true), ('Gujranwala','gujranwala','Punjab',32.187700,74.194500,false),
 ('Sialkot','sialkot','Punjab',32.494500,74.522900,false), ('Peshawar','peshawar','Khyber Pakhtunkhwa',34.015100,71.524900,false),
 ('Quetta','quetta','Balochistan',30.179800,66.975000,false), ('Hyderabad','hyderabad','Sindh',25.396000,68.357800,false)
) AS seed(name, slug, area_name, latitude, longitude, serviceable) ON true
JOIN "country_administrative_areas" a ON a.country_id = c.id AND a.name = seed.area_name
WHERE c.iso_alpha_2_code = 'PK' ON CONFLICT ("country_id", "slug") DO NOTHING;

INSERT INTO "service_categories" ("slug", "display_name", "description", "icon_identifier", "display_order") VALUES
 ('electrical-services','Electrical Services','Wiring, fixtures, switches, and electrical fault repair.','zap',10),
 ('plumbing-services','Plumbing Services','Leaks, pipes, taps, drainage, and sanitary fitting work.','wrench',20),
 ('air-conditioning-refrigeration','Air Conditioning & Refrigeration','Installation, maintenance, and repair for cooling equipment.','snowflake',30),
 ('appliance-repair','Appliance Repair','Diagnosis and repair of household electrical appliances.','washing-machine',40),
 ('home-cleaning','Home Cleaning','Routine, deep, kitchen, bathroom, and move-in cleaning.','sparkles',50),
 ('painting-wall-finishing','Painting & Wall Finishing','Interior and exterior paint, polish, and wall finishing.','paint-roller',60),
 ('carpentry-furniture-repair','Carpentry & Furniture Repair','Custom woodwork, doors, cabinets, and furniture repairs.','hammer',70),
 ('welding-metal-fabrication','Welding & Metal Fabrication','Gates, grills, railings, repairs, and custom metal work.','anvil',80),
 ('automotive-repair','Automotive Repair','Mechanical diagnosis, maintenance, and roadside vehicle repair.','car',90),
 ('pest-control','Pest Control','Inspection and treatment for common household pests.','bug',100),
 ('gardening-landscaping','Gardening & Landscaping','Garden maintenance, planting, trimming, and landscaping.','leaf',110),
 ('moving-packing','Moving & Packing','Household and office packing, loading, and relocation help.','truck',120),
 ('locksmith-services','Locksmith Services','Lock installation, repair, replacement, and emergency access.','key-round',130),
 ('roofing-waterproofing','Roofing & Waterproofing','Roof repair, seepage treatment, and waterproof coatings.','house',140),
 ('masonry-general-construction','Masonry & General Construction','Brickwork, plaster, tile, concrete, and small construction jobs.','brick-wall',150),
 ('solar-installation-maintenance','Solar Installation & Maintenance','Solar panels, inverters, batteries, and system maintenance.','sun',160),
 ('cctv-security-systems','CCTV & Security Systems','Camera, access control, alarm, and security equipment setup.','cctv',170),
 ('internet-network-installation','Internet & Network Installation','Routers, cabling, Wi-Fi coverage, and network troubleshooting.','wifi',180),
 ('generator-ups-services','Generator & UPS Services','Generator, UPS, inverter, and backup-power maintenance.','battery-charging',190),
 ('laundry-dry-cleaning','Laundry & Dry Cleaning','Laundry pickup, pressing, and specialist garment cleaning.','shirt',200)
ON CONFLICT ("slug") DO NOTHING;

UPDATE "provider_service_categories" psc SET "category_id" = sc.id
FROM "service_categories" sc WHERE psc.category_id IS NULL AND sc.slug = replace(psc.category_key, '_', '-');
UPDATE "customer_service_preferences" csp SET "category_id" = sc.id
FROM "service_categories" sc WHERE csp.category_id IS NULL AND sc.slug = replace(csp.category_key, '_', '-');

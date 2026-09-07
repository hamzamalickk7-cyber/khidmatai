import { boolean, check, index, integer, numeric, pgTable, text, timestamp, unique, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authenticationUsers } from "./authentication-schema.js";
import { providerProfiles } from "./provider-onboarding-schema.js";
import { customerProfiles } from "./customer-profile-schema.js";
export { serviceCategories } from "./service-category-schema.js";

export const countries = pgTable("countries", {
  id: uuid("id").defaultRandom().primaryKey(),
  isoAlpha2Code: text("iso_alpha_2_code").notNull().unique(),
  isoAlpha3Code: text("iso_alpha_3_code").notNull().unique(),
  name: text("name").notNull(),
  internationalCallingCode: text("international_calling_code"),
  defaultCurrencyCode: text("default_currency_code"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (country) => [
  check("countries_iso_alpha_2_format_check", sql`${country.isoAlpha2Code} ~ '^[A-Z]{2}$'`),
  check("countries_iso_alpha_3_format_check", sql`${country.isoAlpha3Code} ~ '^[A-Z]{3}$'`),
]);

export const countryAdministrativeAreas = pgTable("country_administrative_areas", {
  id: uuid("id").defaultRandom().primaryKey(),
  countryId: uuid("country_id").notNull().references(() => countries.id, { onDelete: "restrict" }),
  code: text("code"),
  name: text("name").notNull(),
  areaType: text("area_type").default("province").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
}, (area) => [
  unique("country_administrative_areas_country_name_unique").on(area.countryId, area.name),
  index("country_administrative_areas_country_index").on(area.countryId),
]);

export const cities = pgTable("cities", {
  id: uuid("id").defaultRandom().primaryKey(),
  countryId: uuid("country_id").notNull().references(() => countries.id, { onDelete: "restrict" }),
  administrativeAreaId: uuid("administrative_area_id").references(() => countryAdministrativeAreas.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  geoNamesIdentifier: integer("geonames_identifier").unique(),
  latitude: numeric("latitude", { precision: 9, scale: 6 }),
  longitude: numeric("longitude", { precision: 9, scale: 6 }),
  timeZoneIdentifier: text("time_zone_identifier"),
  isServiceable: boolean("is_serviceable").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (city) => [
  unique("cities_country_slug_unique").on(city.countryId, city.slug),
  index("cities_country_serviceability_index").on(city.countryId, city.isServiceable, city.isActive),
]);

export const providerProfileMediaAssets = pgTable("provider_profile_media_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerProfileId: uuid("provider_profile_id").notNull().references(() => providerProfiles.id, { onDelete: "cascade" }),
  ownerUserId: text("owner_user_id").notNull().references(() => authenticationUsers.id, { onDelete: "cascade" }),
  mediaPurpose: text("media_purpose").notNull(),
  documentSide: text("document_side"),
  cloudinaryPublicIdentifier: text("cloudinary_public_identifier").notNull().unique(),
  cloudinaryResourceType: text("cloudinary_resource_type").default("image").notNull(),
  cloudinaryDeliveryType: text("cloudinary_delivery_type").default("upload").notNull(),
  secureDeliveryUrl: text("secure_delivery_url").notNull(),
  originalFileName: text("original_file_name"),
  mimeType: text("mime_type").notNull(),
  byteSize: integer("byte_size").notNull(),
  width: integer("width"),
  height: integer("height"),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (media) => [
  index("provider_profile_media_assets_profile_purpose_index").on(media.providerProfileId, media.mediaPurpose, media.displayOrder),
  uniqueIndex("provider_identity_document_side_unique").on(media.providerProfileId, media.documentSide).where(sql`${media.mediaPurpose} = 'identity_document'`),
  check("provider_profile_media_assets_purpose_check", sql`${media.mediaPurpose} in ('profile_image','work_gallery','identity_document','professional_certificate')`),
  check("provider_profile_media_assets_byte_size_check", sql`${media.byteSize} > 0 and ${media.byteSize} <= 10485760`),
]);

export const customerProfileMediaAssets = pgTable("customer_profile_media_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerProfileId: uuid("customer_profile_id").notNull().references(() => customerProfiles.id, { onDelete: "cascade" }),
  ownerUserId: text("owner_user_id").notNull().references(() => authenticationUsers.id, { onDelete: "cascade" }),
  cloudinaryPublicIdentifier: text("cloudinary_public_identifier").notNull().unique(),
  secureDeliveryUrl: text("secure_delivery_url").notNull(),
  mimeType: text("mime_type").notNull(),
  byteSize: integer("byte_size").notNull(),
  width: integer("width"),
  height: integer("height"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (media) => [
  unique("customer_profile_media_assets_one_avatar_unique").on(media.customerProfileId),
  check("customer_profile_media_assets_byte_size_check", sql`${media.byteSize} > 0 and ${media.byteSize} <= 5242880`),
]);

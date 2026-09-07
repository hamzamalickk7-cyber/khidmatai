import { boolean, check, index, integer, pgTable, text, timestamp, unique, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authenticationUsers } from "./authentication-schema.js";
import { serviceCategories } from "./service-category-schema.js";

export const customerProfiles = pgTable("customer_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique().references(() => authenticationUsers.id, { onDelete: "cascade" }),
  phoneNumber: text("phone_number"),
  city: text("city"),
  // See the matching comment in provider-onboarding-schema.ts: no
  // `.references()` to avoid a circular import with platform-catalogue-schema.ts.
  cityId: uuid("city_id"),
  preferredContactMethod: text("preferred_contact_method").default("whatsapp").notNull(),
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (profile) => [
  check("customer_profiles_contact_method_check", sql`${profile.preferredContactMethod} in ('phone','whatsapp','email')`),
  check("customer_profiles_version_check", sql`${profile.version} > 0`),
  check("customer_profiles_phone_number_format_check", sql`${profile.phoneNumber} is null or ${profile.phoneNumber} ~ '^([+]92[ ]?|92[ ]?|0)3[0-9]{2}[- ]?[0-9]{7}$'`),
  check("customer_profiles_city_length_check", sql`${profile.city} is null or char_length(${profile.city}) between 2 and 100`),
]);

export const customerSavedAddresses = pgTable("customer_saved_addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerProfileId: uuid("customer_profile_id").notNull().references(() => customerProfiles.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  addressLine: text("address_line").notNull(),
  city: text("city").notNull(),
  cityId: uuid("city_id"),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (address) => [
  index("customer_saved_addresses_profile_index").on(address.customerProfileId),
  uniqueIndex("customer_saved_addresses_one_default_per_profile_unique").on(address.customerProfileId).where(sql`${address.isDefault} = true`),
  check("customer_saved_addresses_label_length_check", sql`char_length(${address.label}) between 2 and 80`),
  check("customer_saved_addresses_address_line_length_check", sql`char_length(${address.addressLine}) between 5 and 300`),
  check("customer_saved_addresses_city_length_check", sql`char_length(${address.city}) between 2 and 100`),
]);

export const customerServicePreferences = pgTable("customer_service_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerProfileId: uuid("customer_profile_id").notNull().references(() => customerProfiles.id, { onDelete: "cascade" }),
  categoryKey: text("category_key").notNull(),
  categoryId: uuid("category_id").references(() => serviceCategories.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (preference) => [
  unique("customer_service_preferences_profile_category_unique").on(preference.customerProfileId, preference.categoryKey),
  check("customer_service_preferences_category_key_length_check", sql`char_length(${preference.categoryKey}) between 2 and 80`),
]);

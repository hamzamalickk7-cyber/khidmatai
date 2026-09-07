import { boolean, check, index, integer, jsonb, pgTable, text, time, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authenticationUsers } from "./authentication-schema.js";
import { serviceCategories } from "./service-category-schema.js";

export const providerProfiles = pgTable("provider_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique().references(() => authenticationUsers.id, { onDelete: "restrict" }),
  status: text("status").default("draft").notNull(),
  phoneNumber: text("phone_number"),
  governmentIdentityNumber: text("government_identity_number"),
  addressLine: text("address_line"),
  city: text("city"),
  // No `.references()` here: `cities` lives in platform-catalogue-schema.ts,
  // which already imports this file, so importing `cities` back would be a
  // circular module dependency. The FK constraint itself is enforced at the
  // database level by migration 0008 regardless of whether Drizzle models it.
  cityId: uuid("city_id"),
  professionalTitle: text("professional_title"),
  yearsOfExperience: integer("years_of_experience"),
  professionalBio: text("professional_bio"),
  availabilitySummary: text("availability_summary"),
  isAvailableForNewJobs: boolean("is_available_for_new_jobs").default(true).notNull(),
  offersEmergencyService: boolean("offers_emergency_service").default(false).notNull(),
  maximumTravelDistanceKilometers: integer("maximum_travel_distance_kilometers"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (providerProfile) => [
  index("provider_profiles_status_index").on(providerProfile.status),
  check("provider_profiles_version_check", sql`${providerProfile.version} > 0`),
  check("provider_profiles_status_check", sql`${providerProfile.status} in ('draft', 'submitted', 'under_review', 'changes_required', 'active', 'suspended', 'rejected', 'removed')`),
  check("provider_profiles_years_of_experience_check", sql`${providerProfile.yearsOfExperience} is null or ${providerProfile.yearsOfExperience} between 0 and 80`),
  check("provider_profiles_professional_title_length_check", sql`${providerProfile.professionalTitle} is null or char_length(${providerProfile.professionalTitle}) between 2 and 120`),
  check("provider_profiles_phone_number_format_check", sql`${providerProfile.phoneNumber} is null or ${providerProfile.phoneNumber} ~ '^([+]92[ ]?|92[ ]?|0)3[0-9]{2}[- ]?[0-9]{7}$'`),
]);

export const providerSpokenLanguages = pgTable("provider_spoken_languages", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerProfileId: uuid("provider_profile_id").notNull().references(() => providerProfiles.id, { onDelete: "cascade" }),
  languageName: text("language_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (language) => [
  unique("provider_spoken_languages_profile_language_unique").on(language.providerProfileId, language.languageName),
  check("provider_spoken_languages_name_length_check", sql`char_length(${language.languageName}) between 2 and 50`),
]);

export const providerOfferedServices = pgTable("provider_offered_services", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerProfileId: uuid("provider_profile_id").notNull().references(() => providerProfiles.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => serviceCategories.id, { onDelete: "restrict" }),
  serviceName: text("service_name").notNull(),
  serviceDescription: text("service_description"),
  startingPriceAmount: integer("starting_price_amount").notNull(),
  currencyCode: text("currency_code").default("PKR").notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (service) => [
  index("provider_offered_services_profile_order_index").on(service.providerProfileId, service.displayOrder),
  check("provider_offered_services_name_length_check", sql`char_length(${service.serviceName}) between 2 and 100`),
  check("provider_offered_services_description_length_check", sql`${service.serviceDescription} is null or char_length(${service.serviceDescription}) between 10 and 500`),
  check("provider_offered_services_price_check", sql`${service.startingPriceAmount} between 0 and 100000000`),
  check("provider_offered_services_currency_check", sql`${service.currencyCode} ~ '^[A-Z]{3}$'`),
]);

export const providerWeeklyAvailabilityWindows = pgTable("provider_weekly_availability_windows", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerProfileId: uuid("provider_profile_id").notNull().references(() => providerProfiles.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (window) => [
  unique("provider_availability_window_unique").on(window.providerProfileId, window.dayOfWeek, window.startTime, window.endTime),
  check("provider_availability_day_check", sql`${window.dayOfWeek} between 0 and 6`),
  check("provider_availability_time_check", sql`${window.startTime} < ${window.endTime}`),
]);

export const providerServiceCategories = pgTable("provider_service_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerProfileId: uuid("provider_profile_id").notNull().references(() => providerProfiles.id, { onDelete: "cascade" }),
  categoryKey: text("category_key").notNull(),
  categoryId: uuid("category_id").references(() => serviceCategories.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (providerServiceCategory) => [unique("provider_service_categories_profile_category_unique").on(providerServiceCategory.providerProfileId, providerServiceCategory.categoryKey)]);

export const providerServiceAreas = pgTable("provider_service_areas", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerProfileId: uuid("provider_profile_id").notNull().references(() => providerProfiles.id, { onDelete: "cascade" }),
  areaName: text("area_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (providerServiceArea) => [unique("provider_service_areas_profile_area_unique").on(providerServiceArea.providerProfileId, providerServiceArea.areaName)]);

export const providerReferences = pgTable("provider_references", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerProfileId: uuid("provider_profile_id").notNull().references(() => providerProfiles.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(), relationship: text("relationship").notNull(), email: text("email"), phoneNumber: text("phone_number"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (providerReference) => [
  check("provider_references_contact_check", sql`${providerReference.email} is not null or ${providerReference.phoneNumber} is not null`),
  check("provider_references_phone_number_format_check", sql`${providerReference.phoneNumber} is null or ${providerReference.phoneNumber} ~ '^([+]92[ ]?|92[ ]?|0)3[0-9]{2}[- ]?[0-9]{7}$'`),
]);

export const providerReviewDecisions = pgTable("provider_review_decisions", {
  id: uuid("id").defaultRandom().primaryKey(), providerProfileId: uuid("provider_profile_id").notNull().references(() => providerProfiles.id, { onDelete: "restrict" }),
  actorUserId: text("actor_user_id").notNull().references(() => authenticationUsers.id, { onDelete: "restrict" }), action: text("action").notNull(),
  previousStatus: text("previous_status").notNull(), nextStatus: text("next_status").notNull(), reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (providerReviewDecision) => [index("provider_review_decisions_profile_index").on(providerReviewDecision.providerProfileId, providerReviewDecision.createdAt)]);

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").defaultRandom().primaryKey(), actorUserId: text("actor_user_id").references(() => authenticationUsers.id, { onDelete: "set null" }),
  actorRole: text("actor_role"), eventKey: text("event_key").notNull(), entityType: text("entity_type").notNull(), entityId: text("entity_id").notNull(), reason: text("reason"),
  metadata: jsonb("metadata").default({}).notNull(), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (auditEvent) => [index("audit_events_entity_index").on(auditEvent.entityType, auditEvent.entityId, auditEvent.createdAt)]);

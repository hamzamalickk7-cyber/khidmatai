import { check, index, integer, jsonb, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authenticationUsers } from "./authentication-schema.js";

export const providerProfiles = pgTable("provider_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique().references(() => authenticationUsers.id, { onDelete: "restrict" }),
  status: text("status").default("draft").notNull(),
  phoneNumber: text("phone_number"),
  governmentIdentityNumber: text("government_identity_number"),
  addressLine: text("address_line"),
  city: text("city"),
  yearsOfExperience: integer("years_of_experience"),
  professionalBio: text("professional_bio"),
  availabilitySummary: text("availability_summary"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (providerProfile) => [
  index("provider_profiles_status_index").on(providerProfile.status),
  check("provider_profiles_version_check", sql`${providerProfile.version} > 0`),
]);

export const providerServiceCategories = pgTable("provider_service_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerProfileId: uuid("provider_profile_id").notNull().references(() => providerProfiles.id, { onDelete: "cascade" }),
  categoryKey: text("category_key").notNull(),
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
}, (providerReference) => [check("provider_references_contact_check", sql`${providerReference.email} is not null or ${providerReference.phoneNumber} is not null`)]);

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

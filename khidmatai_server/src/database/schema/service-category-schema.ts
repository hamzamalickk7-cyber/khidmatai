import { boolean, check, index, integer, pgTable, text, timestamp, uuid, type AnyPgColumn } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const serviceCategories = pgTable("service_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentCategoryId: uuid("parent_category_id").references((): AnyPgColumn => serviceCategories.id, { onDelete: "restrict" }),
  slug: text("slug").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description").notNull(),
  iconIdentifier: text("icon_identifier").notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (category) => [
  index("service_categories_parent_display_order_index").on(category.parentCategoryId, category.displayOrder),
  check("service_categories_slug_format_check", sql`${category.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`),
  check("service_categories_display_order_check", sql`${category.displayOrder} >= 0`),
]);

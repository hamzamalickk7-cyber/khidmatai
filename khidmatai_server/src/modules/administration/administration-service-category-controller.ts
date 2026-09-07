import type { Request, Response } from "express";
import { asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { khidmatAiDatabase } from "../../database/database-connection.js";
import { serviceCategories } from "../../database/schema/platform-catalogue-schema.js";
import { auditEvents } from "../../database/schema/provider-onboarding-schema.js";
import { ApplicationError } from "../../shared/application-error.js";
import { sendSuccessfulApiResponse } from "../../shared/api-response.js";

const categoryFields = {
  displayName: z.string().trim().min(2).max(100), description: z.string().trim().min(10).max(500),
  iconIdentifier: z.string().trim().min(2).max(60), displayOrder: z.number().int().min(0).max(10_000), isActive: z.boolean(),
};
const createCategorySchema = z.object({ slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100), parentCategoryId: z.uuid().nullable(), ...categoryFields }).strict();
const updateCategorySchema = z.object({ ...categoryFields }).strict();
const categoryPathSchema = z.object({ categoryId: z.uuid() }).strict();

export async function listAdministrationServiceCategoriesController(_request: Request, response: Response) {
  return sendSuccessfulApiResponse(response, await khidmatAiDatabase.select().from(serviceCategories).orderBy(asc(serviceCategories.displayOrder), asc(serviceCategories.displayName)));
}
export async function createAdministrationServiceCategoryController(request: Request, response: Response) {
  const input = createCategorySchema.parse(request.body);
  try {
    const [created] = await khidmatAiDatabase.insert(serviceCategories).values(input).returning();
    if (!created) throw new ApplicationError(500, "SERVICE_CATEGORY_CREATE_FAILED", "The service category could not be created.");
    await khidmatAiDatabase.insert(auditEvents).values({ actorUserId: request.authenticatedSession!.user.id, actorRole: "admin", eventKey: "service_category.created", entityType: "service_category", entityId: created.id, metadata: { slug: created.slug } });
    return sendSuccessfulApiResponse(response, created, 201);
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") throw new ApplicationError(409, "SERVICE_CATEGORY_SLUG_EXISTS", "A category with that slug already exists.");
    throw error;
  }
}
export async function updateAdministrationServiceCategoryController(request: Request, response: Response) {
  const { categoryId } = categoryPathSchema.parse(request.params); const input = updateCategorySchema.parse(request.body);
  const [updated] = await khidmatAiDatabase.update(serviceCategories).set({ ...input, updatedAt: new Date() }).where(eq(serviceCategories.id, categoryId)).returning();
  if (!updated) throw new ApplicationError(404, "SERVICE_CATEGORY_NOT_FOUND", "The service category could not be found.");
  await khidmatAiDatabase.insert(auditEvents).values({ actorUserId: request.authenticatedSession!.user.id, actorRole: "admin", eventKey: "service_category.updated", entityType: "service_category", entityId: updated.id, metadata: { isActive: updated.isActive } });
  return sendSuccessfulApiResponse(response, updated);
}
export async function deleteAdministrationServiceCategoryController(request: Request, response: Response) {
  const { categoryId } = categoryPathSchema.parse(request.params);
  const usage = await khidmatAiDatabase.execute(sql`select
    (select count(*)::int from provider_service_categories where category_id = ${categoryId}) +
    (select count(*)::int from customer_service_preferences where category_id = ${categoryId}) +
    (select count(*)::int from provider_offered_services where category_id = ${categoryId}) +
    (select count(*)::int from service_categories where parent_category_id = ${categoryId}) as count`);
  if (Number(usage.rows[0]?.count ?? 0) > 0) throw new ApplicationError(409, "SERVICE_CATEGORY_IN_USE", "This category is in use. Deactivate it instead of deleting it.");
  const [deleted] = await khidmatAiDatabase.delete(serviceCategories).where(eq(serviceCategories.id, categoryId)).returning({ id: serviceCategories.id });
  if (!deleted) throw new ApplicationError(404, "SERVICE_CATEGORY_NOT_FOUND", "The service category could not be found.");
  await khidmatAiDatabase.insert(auditEvents).values({ actorUserId: request.authenticatedSession!.user.id, actorRole: "admin", eventKey: "service_category.deleted", entityType: "service_category", entityId: categoryId });
  return response.status(204).send();
}

import { Router } from "express";
import { requireAccountRoleMiddleware } from "../../middleware/require-account-role-middleware.js";
import { requireAuthenticatedSessionMiddleware } from "../../middleware/require-authenticated-session-middleware.js";
import { requireTrustedRequestOriginMiddleware } from "../../middleware/require-trusted-request-origin-middleware.js";
import { createAsyncRequestHandler } from "../../shared/async-request-handler.js";
import {
  applyProviderOnboardingReviewActionController,
  changeAdministrationUserAccountStatusController,
  changeAdministrationUserBanController,
  changeAdministrationUserRoleController,
  getAdministrationOverviewController,
  getAdministrationUserController,
  getProviderProfileForAdministrationController,
  listAdministrationAuditEventsController,
  listAdministrationUsersController,
  listProviderOnboardingProfilesController,
} from "./administration-controller.js";
import { createAdministrationServiceCategoryController, deleteAdministrationServiceCategoryController, listAdministrationServiceCategoriesController, updateAdministrationServiceCategoryController } from "./administration-service-category-controller.js";

export const administrationRoutes = Router();
administrationRoutes.use(createAsyncRequestHandler(requireAuthenticatedSessionMiddleware));
administrationRoutes.get(
  "/overview",
  requireAccountRoleMiddleware("admin", "support"),
  createAsyncRequestHandler(getAdministrationOverviewController),
);
administrationRoutes.get("/service-categories", requireAccountRoleMiddleware("admin", "support"), createAsyncRequestHandler(listAdministrationServiceCategoriesController));
administrationRoutes.post("/service-categories", requireTrustedRequestOriginMiddleware, requireAccountRoleMiddleware("admin"), createAsyncRequestHandler(createAdministrationServiceCategoryController));
administrationRoutes.patch("/service-categories/:categoryId", requireTrustedRequestOriginMiddleware, requireAccountRoleMiddleware("admin"), createAsyncRequestHandler(updateAdministrationServiceCategoryController));
administrationRoutes.delete("/service-categories/:categoryId", requireTrustedRequestOriginMiddleware, requireAccountRoleMiddleware("admin"), createAsyncRequestHandler(deleteAdministrationServiceCategoryController));
administrationRoutes.get(
  "/users",
  requireAccountRoleMiddleware("admin", "support"),
  createAsyncRequestHandler(listAdministrationUsersController),
);
administrationRoutes.get(
  "/users/:userId",
  requireAccountRoleMiddleware("admin", "support"),
  createAsyncRequestHandler(getAdministrationUserController),
);
administrationRoutes.post(
  "/users/:userId/role-changes",
  requireTrustedRequestOriginMiddleware,
  requireAccountRoleMiddleware("admin"),
  createAsyncRequestHandler(changeAdministrationUserRoleController),
);
administrationRoutes.post(
  "/users/:userId/ban-actions",
  requireTrustedRequestOriginMiddleware,
  requireAccountRoleMiddleware("admin"),
  createAsyncRequestHandler(changeAdministrationUserBanController),
);
administrationRoutes.post(
  "/users/:userId/account-status-actions",
  requireTrustedRequestOriginMiddleware,
  requireAccountRoleMiddleware("admin"),
  createAsyncRequestHandler(changeAdministrationUserAccountStatusController),
);
administrationRoutes.get(
  "/audit-events",
  requireAccountRoleMiddleware("admin", "support"),
  createAsyncRequestHandler(listAdministrationAuditEventsController),
);
administrationRoutes.get(
  "/provider-profiles",
  requireAccountRoleMiddleware("admin", "support"),
  createAsyncRequestHandler(listProviderOnboardingProfilesController),
);
administrationRoutes.get(
  "/provider-profiles/:providerProfileId",
  requireAccountRoleMiddleware("admin", "support"),
  createAsyncRequestHandler(getProviderProfileForAdministrationController),
);
administrationRoutes.post(
  "/provider-profiles/:providerProfileId/review-actions",
  requireTrustedRequestOriginMiddleware,
  requireAccountRoleMiddleware("admin"),
  createAsyncRequestHandler(applyProviderOnboardingReviewActionController),
);

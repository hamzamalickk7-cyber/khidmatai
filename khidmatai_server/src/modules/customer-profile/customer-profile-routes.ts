import { Router } from "express";
import { requireAccountRoleMiddleware } from "../../middleware/require-account-role-middleware.js";
import { requireAuthenticatedSessionMiddleware } from "../../middleware/require-authenticated-session-middleware.js";
import { requireTrustedRequestOriginMiddleware } from "../../middleware/require-trusted-request-origin-middleware.js";
import { createAsyncRequestHandler } from "../../shared/async-request-handler.js";
import {
  createCustomerSavedAddressController,
  deleteCustomerSavedAddressController,
  getCustomerProfileController,
  updateCustomerProfileController,
  updateCustomerSavedAddressController,
} from "./customer-profile-controller.js";

export const customerProfileRoutes = Router();
customerProfileRoutes.use(
  createAsyncRequestHandler(requireAuthenticatedSessionMiddleware),
  requireAccountRoleMiddleware("customer"),
);
customerProfileRoutes.get("/", createAsyncRequestHandler(getCustomerProfileController));
customerProfileRoutes.put(
  "/",
  requireTrustedRequestOriginMiddleware,
  createAsyncRequestHandler(updateCustomerProfileController),
);
customerProfileRoutes.post(
  "/addresses",
  requireTrustedRequestOriginMiddleware,
  createAsyncRequestHandler(createCustomerSavedAddressController),
);
customerProfileRoutes.put(
  "/addresses/:addressId",
  requireTrustedRequestOriginMiddleware,
  createAsyncRequestHandler(updateCustomerSavedAddressController),
);
customerProfileRoutes.delete(
  "/addresses/:addressId",
  requireTrustedRequestOriginMiddleware,
  createAsyncRequestHandler(deleteCustomerSavedAddressController),
);

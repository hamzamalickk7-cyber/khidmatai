import { Router } from "express";
import { createAsyncRequestHandler } from "../../shared/async-request-handler.js";
import { getApplicationHealthStatusController, getApplicationReadinessStatusController } from "./health-controller.js";

export const healthRoutes = Router();
healthRoutes.get("/", getApplicationHealthStatusController);
healthRoutes.get("/ready", createAsyncRequestHandler(getApplicationReadinessStatusController));

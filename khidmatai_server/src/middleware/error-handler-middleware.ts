import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { backendEnvironmentConfiguration } from "../config/environment-configuration.js";
import { ApplicationError } from "../shared/application-error.js";

export const errorHandlerMiddleware: ErrorRequestHandler = (unknownError, request, response, _nextFunction) => {
  if (unknownError instanceof ZodError) return response.status(400).json({ success: false, error: { code: "REQUEST_VALIDATION_FAILED", message: "Review the submitted fields.", details: unknownError.flatten() } });
  if (unknownError instanceof ApplicationError) return response.status(unknownError.httpStatusCode).json({ success: false, error: { code: unknownError.publicErrorCode, message: unknownError.publicMessage, ...(unknownError.validationDetails === undefined ? {} : { details: unknownError.validationDetails }) } });
  request.log.error({ err: unknownError }, "Unhandled request error.");
  return response.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "The request could not be completed.", ...(backendEnvironmentConfiguration.NODE_ENV === "development" ? { details: String(unknownError) } : {}) } });
};

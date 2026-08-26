import type { NextFunction, Request, Response } from "express";
import { backendEnvironmentConfiguration } from "../config/environment-configuration.js";
import { ApplicationError } from "../shared/application-error.js";

export function requireTrustedRequestOriginMiddleware(request: Request, _response: Response, nextFunction: NextFunction) {
  const requestOrigin = request.get("origin");
  if (requestOrigin !== backendEnvironmentConfiguration.FRONTEND_URL) {
    return nextFunction(new ApplicationError(403, "UNTRUSTED_REQUEST_ORIGIN", "The request origin is not trusted."));
  }
  nextFunction();
}

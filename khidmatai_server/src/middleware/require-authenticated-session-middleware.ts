import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";
import { authenticationConfiguration, type AuthenticatedSession } from "../config/authentication-configuration.js";
import { ApplicationError } from "../shared/application-error.js";

declare global {
  namespace Express {
    interface Request { authenticatedSession?: AuthenticatedSession; }
  }
}

export async function requireAuthenticatedSessionMiddleware(request: Request, _response: Response, nextFunction: NextFunction) {
  try {
    const authenticatedSession = await authenticationConfiguration.api.getSession({ headers: fromNodeHeaders(request.headers) });
    if (!authenticatedSession) return nextFunction(new ApplicationError(401, "AUTHENTICATION_REQUIRED", "Sign in to continue."));
    request.authenticatedSession = authenticatedSession;
    nextFunction();
  } catch (authenticationError) {
    nextFunction(authenticationError);
  }
}

import type { NextFunction, Request, Response } from "express";
import type { KhidmatAiAccountRole } from "../modules/authorization/account-role-catalog.js";
import { ApplicationError } from "../shared/application-error.js";

export function requireAccountRoleMiddleware(...permittedAccountRoles: KhidmatAiAccountRole[]) {
  return (request: Request, _response: Response, nextFunction: NextFunction) => {
    const authenticatedAccountRole = request.authenticatedSession?.user.role as KhidmatAiAccountRole | undefined;
    if (!authenticatedAccountRole || !permittedAccountRoles.includes(authenticatedAccountRole)) return nextFunction(new ApplicationError(403, "ACCOUNT_ROLE_REQUIRED", "You do not have access to this resource."));
    nextFunction();
  };
}

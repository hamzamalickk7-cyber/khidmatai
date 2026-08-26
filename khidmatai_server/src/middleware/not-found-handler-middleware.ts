import type { RequestHandler } from "express";
import { ApplicationError } from "../shared/application-error.js";

export const notFoundHandlerMiddleware: RequestHandler = (request, _response, nextFunction) => {
  nextFunction(new ApplicationError(404, "API_ROUTE_NOT_FOUND", `No API route exists for ${request.method} ${request.path}.`));
};

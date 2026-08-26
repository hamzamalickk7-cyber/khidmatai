import type { RequestHandler } from "express";

export const preventPrivateApiCachingMiddleware: RequestHandler = (_request, response, nextFunction) => {
  response.setHeader("Cache-Control", "no-store, private");
  response.setHeader("Pragma", "no-cache");
  nextFunction();
};

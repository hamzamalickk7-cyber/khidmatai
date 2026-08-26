import type { NextFunction, Request, RequestHandler, Response } from "express";

export function createAsyncRequestHandler(requestHandler: (request: Request, response: Response, nextFunction: NextFunction) => Promise<unknown>): RequestHandler {
  return (request, response, nextFunction) => void Promise.resolve(requestHandler(request, response, nextFunction)).catch(nextFunction);
}

import { randomUUID } from "node:crypto";
import { pinoHttp } from "pino-http";
import { applicationLogger } from "../config/logger-configuration.js";

export const requestContextMiddleware = pinoHttp({
  logger: applicationLogger,
  genReqId: (request, response) => {
    const existingRequestIdentifier = request.headers["x-request-id"];
    const requestIdentifier = typeof existingRequestIdentifier === "string" ? existingRequestIdentifier : randomUUID();
    response.setHeader("X-Request-ID", requestIdentifier);
    return requestIdentifier;
  },
});

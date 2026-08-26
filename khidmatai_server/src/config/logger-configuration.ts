import pino from "pino";
import { backendEnvironmentConfiguration } from "./environment-configuration.js";

export const applicationLogger = pino({
  level: backendEnvironmentConfiguration.NODE_ENV === "production" ? "info" : "debug",
  redact: ["req.headers.authorization", "req.headers.cookie", "password", "token", "governmentIdentityNumber"],
  transport: backendEnvironmentConfiguration.NODE_ENV === "production"
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
          ignore: "pid,hostname",
          singleLine: false,
        },
      },
});

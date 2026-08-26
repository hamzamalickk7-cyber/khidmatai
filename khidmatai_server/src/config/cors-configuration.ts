import type { CorsOptions } from "cors";
import { backendEnvironmentConfiguration } from "./environment-configuration.js";

export const applicationCorsConfiguration: CorsOptions = {
  origin: backendEnvironmentConfiguration.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept", "Authorization", "X-Request-ID"],
};

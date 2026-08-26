import "dotenv/config";
import { z } from "zod";

const backendEnvironmentConfigurationSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(8080),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must contain at least 32 characters."),
  BETTER_AUTH_URL: z.url(),
  FRONTEND_URL: z.url(),
});

export const backendEnvironmentConfiguration = backendEnvironmentConfigurationSchema.parse(process.env);

import "dotenv/config";
import { z } from "zod";

const backendEnvironmentConfigurationSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(8080),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must contain at least 32 characters."),
  BETTER_AUTH_URL: z.url(),
  FRONTEND_URL: z.url(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  GEONAMES_USERNAME: z.string().min(1).optional(),
});

export const backendEnvironmentConfiguration = backendEnvironmentConfigurationSchema.parse(process.env);

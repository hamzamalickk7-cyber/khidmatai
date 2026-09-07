import { z } from "zod";

export const publicProviderDirectoryQueryValidationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(24).default(12),
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
}).strict();

export const publicProviderUsernamePathValidationSchema = z.object({
  providerUsername: z.string().trim().toLowerCase().regex(/^[a-z0-9](?:[a-z0-9_]{1,28}[a-z0-9])?$/),
}).strict();

export const publicCityQueryValidationSchema = z.object({
  countryCode: z.string().trim().toUpperCase().length(2).default("PK"),
  search: z.string().trim().max(80).optional(),
  serviceableOnly: z.string().optional().transform((value) => value !== "false"),
}).strict();

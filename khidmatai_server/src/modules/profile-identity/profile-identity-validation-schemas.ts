import { z } from "zod";

export const usernameUpdateValidationSchema = z.object({
  username: z.string().trim().toLowerCase().min(3).max(30).regex(/^[a-z0-9](?:[a-z0-9_]{1,28}[a-z0-9])?$/, "Use lowercase letters, numbers, and underscores; do not start or end with an underscore."),
}).strict();

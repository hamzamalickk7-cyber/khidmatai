import { rateLimit } from "express-rate-limit";

export const generalApiRateLimitMiddleware = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: { code: "API_RATE_LIMIT_EXCEEDED", message: "Too many requests. Wait briefly and try again." } },
});

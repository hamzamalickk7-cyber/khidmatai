import cors from "cors";
import express from "express";
import helmet from "helmet";
import { applicationCorsConfiguration } from "./config/cors-configuration.js";
import { backendEnvironmentConfiguration } from "./config/environment-configuration.js";
import { errorHandlerMiddleware } from "./middleware/error-handler-middleware.js";
import { generalApiRateLimitMiddleware } from "./middleware/general-api-rate-limit-middleware.js";
import { notFoundHandlerMiddleware } from "./middleware/not-found-handler-middleware.js";
import { preventPrivateApiCachingMiddleware } from "./middleware/prevent-private-api-caching-middleware.js";
import { requestContextMiddleware } from "./middleware/request-context-middleware.js";
import { administrationRoutes } from "./modules/administration/administration-routes.js";
import { authenticationHttpHandler } from "./modules/authentication/authentication-http-handler.js";
import { customerProfileRoutes } from "./modules/customer-profile/customer-profile-routes.js";
import { healthRoutes } from "./modules/health/health-routes.js";
import { marketplaceCatalogueRoutes } from "./modules/marketplace-catalogue/marketplace-catalogue-routes.js";
import { providerOnboardingRoutes } from "./modules/provider-onboarding/provider-onboarding-routes.js";
import { profileIdentityRoutes } from "./modules/profile-identity/profile-identity-routes.js";
import { profileMediaRoutes } from "./modules/profile-media/profile-media-routes.js";
import { customerProfileMediaRoutes } from "./modules/profile-media/customer-profile-media-routes.js";
import { sendSuccessfulApiResponse } from "./shared/api-response.js";

export function createKhidmatAiExpressApplication() {
  const expressApplication = express();
  expressApplication.disable("x-powered-by");
  expressApplication.set("trust proxy", 1);
  expressApplication.use(requestContextMiddleware);
  expressApplication.use(helmet({
    // This is a pure JSON API: it never renders HTML, so scripts/frames/images
    // from anywhere are unnecessary. Only the configured frontend origin may
    // frame or fetch from this API.
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'none'"],
        formAction: ["'none'"],
        connectSrc: [backendEnvironmentConfiguration.FRONTEND_URL],
      },
    },
    referrerPolicy: { policy: "no-referrer" },
  }));
  expressApplication.use(cors(applicationCorsConfiguration));
  expressApplication.get("/", (_request, response) => sendSuccessfulApiResponse(response, { service: "khidmatai-server", message: "KhidmatAI backend server is running." }));
  expressApplication.use("/api/v1/health", healthRoutes);
  expressApplication.use("/api", generalApiRateLimitMiddleware);

  expressApplication.all("/api/auth/*splat", authenticationHttpHandler);
  expressApplication.use(express.json({ limit: "1mb" }));
  expressApplication.use("/api", preventPrivateApiCachingMiddleware);
  expressApplication.use("/api/v1/public", marketplaceCatalogueRoutes);
  expressApplication.use("/api/v1/customer-profile", customerProfileRoutes);
  expressApplication.use("/api/v1/provider-profile", providerOnboardingRoutes);
  expressApplication.use("/api/v1/profile", profileIdentityRoutes);
  expressApplication.use("/api/v1/provider-profile/media", profileMediaRoutes);
  expressApplication.use("/api/v1/customer-profile/media", customerProfileMediaRoutes);
  expressApplication.use("/api/v1/administration", administrationRoutes);
  expressApplication.use(notFoundHandlerMiddleware);
  expressApplication.use(errorHandlerMiddleware);
  return expressApplication;
}

import { toNodeHandler } from "better-auth/node";
import { authenticationConfiguration } from "../../config/authentication-configuration.js";

export const authenticationHttpHandler = toNodeHandler(authenticationConfiguration);

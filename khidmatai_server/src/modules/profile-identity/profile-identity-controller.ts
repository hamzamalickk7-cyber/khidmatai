import type { Request, Response } from "express";
import { eq, sql } from "drizzle-orm";
import { khidmatAiDatabase } from "../../database/database-connection.js";
import { authenticationUsers } from "../../database/schema/authentication-schema.js";
import { sendSuccessfulApiResponse } from "../../shared/api-response.js";
import { ApplicationError } from "../../shared/application-error.js";
import { usernameUpdateValidationSchema } from "./profile-identity-validation-schemas.js";

export async function updateAuthenticatedUsernameController(request: Request, response: Response) {
  const { username } = usernameUpdateValidationSchema.parse(request.body);
  const authenticationUserId = request.authenticatedSession!.user.id;
  try {
    const [updatedUser] = await khidmatAiDatabase.update(authenticationUsers)
      .set({ username, updatedAt: new Date() })
      .where(eq(authenticationUsers.id, authenticationUserId))
      .returning({ username: authenticationUsers.username });
    if (!updatedUser) throw new ApplicationError(404, "ACCOUNT_NOT_FOUND", "The account could not be found.");
    return sendSuccessfulApiResponse(response, updatedUser);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      throw new ApplicationError(409, "USERNAME_ALREADY_IN_USE", "That username is already in use.");
    }
    throw error;
  }
}

import { APIError } from "better-auth/api";
import { postgresqlConnectionPool } from "../../database/database-connection.js";

export const deactivatedAccountAuthenticationGuard = {
  id: "khidmatai-deactivated-account-guard",
  init() {
    return { options: { databaseHooks: { session: { create: { before: async (session: { userId: string }) => {
      const result = await postgresqlConnectionPool.query<{ deactivatedAt: Date | null }>('select "deactivatedAt" from "user" where id = $1 limit 1', [session.userId]);
      if (result.rows[0]?.deactivatedAt) throw new APIError("FORBIDDEN", { code: "DEACTIVATED_ACCOUNT", message: "This account has been deactivated. Contact KhidmatAI support if you need it restored." });
    } } } } } };
  },
};


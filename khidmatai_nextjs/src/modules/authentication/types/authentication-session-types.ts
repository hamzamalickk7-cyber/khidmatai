import type { AccountRole } from "./authentication-role";

export interface AuthenticationSession {
  session: { id: string; userId: string; expiresAt: string | Date; token: string; };
  user: { id: string; name: string; email: string; emailVerified: boolean; image?: string | null; role: AccountRole; accountType: string; };
}

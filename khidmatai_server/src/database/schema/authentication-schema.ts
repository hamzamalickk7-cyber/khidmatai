import { boolean, check, index, pgTable, text, timestamp, unique, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const authenticationUsers = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    username: text("username"),
    email: text("email").notNull().unique(),
    emailVerified: boolean("emailVerified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
    role: text("role").default("customer").notNull(),
    banned: boolean("banned").default(false).notNull(),
    banReason: text("banReason"),
    banExpires: timestamp("banExpires", { withTimezone: true }),
    accountType: text("accountType").notNull(),
    deactivatedAt: timestamp("deactivatedAt", { withTimezone: true }),
    deactivatedBy: text("deactivatedBy"),
    deactivationReason: text("deactivationReason"),
  },
  (authenticationUser) => [
    uniqueIndex("user_username_case_insensitive_unique").on(sql`lower(${authenticationUser.username})`).where(sql`${authenticationUser.username} is not null`),
    check("user_username_format_check", sql`${authenticationUser.username} is null or ${authenticationUser.username} ~ '^[a-z0-9](?:[a-z0-9_]{1,28}[a-z0-9])?$'`),
    index("user_role_status_index").on(
      authenticationUser.role,
      authenticationUser.deactivatedAt,
      authenticationUser.banned,
    ),
  ],
);

export const authenticationSessions = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => authenticationUsers.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonatedBy"),
  },
  (authenticationSession) => [index("session_user_id_index").on(authenticationSession.userId)],
);

export const authenticationAccounts = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    // Better Auth 1.7 scopes account identity by (issuer, accountId), not
    // (providerId, accountId) — see drizzle/0002_add_better_auth_account_issuer_column.sql.
    issuer: text("issuer").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => authenticationUsers.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  (authenticationAccount) => [
    unique("account_issuer_account_unique").on(authenticationAccount.issuer, authenticationAccount.accountId),
    index("account_user_id_index").on(authenticationAccount.userId),
  ],
);

export const authenticationVerifications = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  (authenticationVerification) => [index("verification_identifier_index").on(authenticationVerification.identifier)],
);

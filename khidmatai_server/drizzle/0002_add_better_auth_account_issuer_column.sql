-- Better Auth 1.7 scopes account identity by issuer, not just providerId:
-- https://better-auth.com/docs/guides/1-7-upgrade-guide#account-identity-is-scoped-by-issuer
-- The initial migration (0000) predates this and never added the column, so
-- every credential sign-up currently fails with:
--   column "issuer" of relation "account" does not exist
-- This app has no social/OAuth providers configured (see
-- authentication-configuration.ts), so every existing "account" row, if any,
-- was created by the built-in "credential" (email/password) provider and
-- backfills deterministically to Better Auth's own local-issuer convention
-- (createLocalAccountIssuer): `local:<providerId>`.

alter table account add column if not exists issuer text;

update account set issuer = 'local:' || "providerId" where issuer is null;

alter table account alter column issuer set not null;

-- Account identity used to be unique per (providerId, accountId); Better Auth
-- 1.7 requires it unique per (issuer, accountId) instead.
alter table account drop constraint if exists account_providerId_accountId_key;
alter table account add constraint account_issuer_accountId_key unique (issuer, "accountId");

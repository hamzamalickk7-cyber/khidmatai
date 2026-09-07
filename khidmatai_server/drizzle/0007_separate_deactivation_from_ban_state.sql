UPDATE "user" SET "banned" = false, "banReason" = NULL, "banExpires" = NULL
WHERE "deactivatedAt" IS NOT NULL;


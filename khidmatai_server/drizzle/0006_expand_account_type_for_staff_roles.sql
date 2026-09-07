ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "user_accountType_check";
ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "user_account_type_check";
ALTER TABLE "user" ADD CONSTRAINT "user_account_type_check" CHECK ("accountType" IN ('customer', 'provider', 'support', 'admin'));


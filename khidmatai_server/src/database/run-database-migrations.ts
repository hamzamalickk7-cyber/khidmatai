import path from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { applicationLogger } from "../config/logger-configuration.js";
import { khidmatAiDatabase } from "./database-connection.js";

export async function runPendingDatabaseMigrations() {
  const databaseMigrationsDirectory = path.resolve(process.cwd(), "drizzle");

  applicationLogger.info(
    { databaseMigrationsDirectory },
    "Applying pending database migrations.",
  );

  await migrate(khidmatAiDatabase, {
    migrationsFolder: databaseMigrationsDirectory,
  });

  applicationLogger.info("Database migrations applied successfully.");
}

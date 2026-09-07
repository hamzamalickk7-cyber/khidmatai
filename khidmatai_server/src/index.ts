import { createKhidmatAiExpressApplication } from "./app.js";
import { backendEnvironmentConfiguration } from "./config/environment-configuration.js";
import { applicationLogger } from "./config/logger-configuration.js";
import { postgresqlConnectionPool } from "./database/database-connection.js";
import { runPendingDatabaseMigrations } from "./database/run-database-migrations.js";

process.on("uncaughtException", (uncaughtError) => {
  applicationLogger.fatal({ err: uncaughtError }, "Uncaught exception. Exiting.");
  process.exit(1);
});

process.on("unhandledRejection", (unhandledRejectionReason) => {
  applicationLogger.fatal({ err: unhandledRejectionReason }, "Unhandled promise rejection. Exiting.");
  process.exit(1);
});

async function startKhidmatAiBackendServer() {
  try {
    await runPendingDatabaseMigrations();
    const khidmatAiExpressApplication = createKhidmatAiExpressApplication();
    const httpServer = khidmatAiExpressApplication.listen(
      backendEnvironmentConfiguration.PORT,
      () => {
        applicationLogger.info(
          { port: backendEnvironmentConfiguration.PORT },
          `Server is running on port ${backendEnvironmentConfiguration.PORT}.`,
        );
      },
    );

    async function shutDownKhidmatAiBackend(signalName: string) {
      applicationLogger.info({ signalName }, "Shutting down KhidmatAI backend.");
      httpServer.close(async () => {
        await postgresqlConnectionPool.end();
        process.exit(0);
      });
    }

    process.on("SIGINT", () => void shutDownKhidmatAiBackend("SIGINT"));
    process.on("SIGTERM", () => void shutDownKhidmatAiBackend("SIGTERM"));
  } catch (startupError) {
    applicationLogger.fatal({ err: startupError }, "KhidmatAI backend startup failed.");
    await postgresqlConnectionPool.end();
    process.exitCode = 1;
  }
}

void startKhidmatAiBackendServer();

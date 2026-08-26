import type { Request, Response } from "express";
import { postgresqlConnectionPool } from "../../database/database-connection.js";
import { sendSuccessfulApiResponse } from "../../shared/api-response.js";
import { ApplicationError } from "../../shared/application-error.js";

// Liveness: the process is up and able to respond. Does not touch the
// database, so it stays fast and cannot flap due to a slow/unavailable DB.
export function getApplicationHealthStatusController(_request: Request, response: Response) {
  return sendSuccessfulApiResponse(response, { service: "khidmatai-server", status: "healthy", checkedAt: new Date().toISOString() });
}

// Readiness: the process is up AND able to actually serve requests that need
// the database. Load balancers/orchestrators should use this before routing
// traffic to a new instance, and to pull an instance whose DB connection died.
export async function getApplicationReadinessStatusController(_request: Request, response: Response) {
  try {
    await postgresqlConnectionPool.query("select 1");
  } catch (databaseConnectivityError) {
    throw new ApplicationError(503, "DATABASE_UNAVAILABLE", "The database is not reachable.", { cause: databaseConnectivityError instanceof Error ? databaseConnectivityError.message : String(databaseConnectivityError) });
  }
  return sendSuccessfulApiResponse(response, { service: "khidmatai-server", status: "ready", checkedAt: new Date().toISOString() });
}

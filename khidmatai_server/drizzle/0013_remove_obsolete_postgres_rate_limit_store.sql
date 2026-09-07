-- PostgreSQL request counters were removed because writing to the application
-- database for every API request competes with real traffic. The current MVP
-- uses a process-local limiter until shared external infrastructure is needed.
DROP TABLE IF EXISTS "api_rate_limit_windows";

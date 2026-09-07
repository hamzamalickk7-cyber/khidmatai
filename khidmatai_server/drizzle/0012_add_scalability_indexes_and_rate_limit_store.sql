-- Scalability hardening: index the public provider-directory's actual
-- filter+sort shape, support its ILIKE search without a sequential scan,
-- and give the general API rate limiter a store shared across every Node
-- worker/instance instead of per-process memory.
--
-- See SYSTEM_HARDENING_AND_SCALABILITY_PLAN.md (§3, B1/B2/B6) for the
-- reasoning behind each piece.

-- B1: the public directory query filters on provider_profiles.status and
-- sorts by approved_at desc nulls last, updated_at desc. The existing
-- provider_profiles_status_index only covers the filter, not the sort, so
-- Postgres still needs a separate sort step once the filtered set is large.
-- A partial index scoped to status = 'active' (the only status Explore ever
-- queries) serves both the filter and the sort directly.
CREATE INDEX IF NOT EXISTS "provider_profiles_active_directory_index"
  ON "provider_profiles" ("approved_at" DESC NULLS LAST, "updated_at" DESC)
  WHERE "status" = 'active';

-- B2: users.name, provider_profiles.professional_title and cities.name are
-- all searched with a leading-wildcard ILIKE ('%term%'), which cannot use a
-- standard B-tree index. pg_trgm's GIN trigram index supports this pattern.
-- Requires the pg_trgm extension, standard on Railway-managed Postgres; if
-- this fails in a different hosting environment, the DB role needs
-- CREATE EXTENSION privilege (or an operator with superuser must run this
-- one statement once).
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "authentication_users_name_trigram_index"
  ON "user" USING gin ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "provider_profiles_professional_title_trigram_index"
  ON "provider_profiles" USING gin ("professional_title" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "cities_name_trigram_index"
  ON "cities" USING gin ("name" gin_trgm_ops);

-- B6: Postgres-backed store for the general API rate limiter
-- (src/middleware/general-api-rate-limit-middleware.ts), replacing
-- in-memory MemoryStore. One row per distinct rate-limit key (normally one
-- per client IP) — cardinality is bounded by unique clients, not by request
-- volume, since repeat requests update the same row via UPSERT.
CREATE TABLE IF NOT EXISTS "api_rate_limit_windows" (
  "rate_limit_key" text PRIMARY KEY,
  "request_count" integer NOT NULL DEFAULT 0,
  "window_reset_at" timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS "api_rate_limit_windows_reset_index"
  ON "api_rate_limit_windows" ("window_reset_at");

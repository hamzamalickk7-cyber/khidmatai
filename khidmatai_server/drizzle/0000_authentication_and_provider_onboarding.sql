create extension if not exists pgcrypto;

create table if not exists "user" (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text not null unique,
  "emailVerified" boolean not null default false,
  image text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  role text not null default 'customer' check (role in ('customer', 'provider', 'support', 'admin')),
  banned boolean not null default false,
  "banReason" text,
  "banExpires" timestamptz,
  "accountType" text not null check ("accountType" in ('customer', 'provider'))
);

create table if not exists session (
  id text primary key default gen_random_uuid()::text,
  "expiresAt" timestamptz not null,
  token text not null unique,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text not null references "user"(id) on delete cascade,
  "impersonatedBy" text
);
create index if not exists session_user_id_index on session ("userId");

create table if not exists account (
  id text primary key default gen_random_uuid()::text,
  "accountId" text not null,
  "providerId" text not null,
  "userId" text not null references "user"(id) on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("providerId", "accountId")
);
create index if not exists account_user_id_index on account ("userId");

create table if not exists verification (
  id text primary key default gen_random_uuid()::text,
  identifier text not null,
  value text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists verification_identifier_index on verification (identifier);

create table if not exists provider_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique references "user"(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft','submitted','under_review','changes_required','approved','active','paused','rejected','suspended','removed')),
  phone_number text,
  phone_verification_status text not null default 'deferred' check (phone_verification_status in ('deferred','pending','verified')),
  profile_photograph_key text,
  selfie_evidence_key text,
  government_identity_number text,
  government_identity_front_key text,
  government_identity_back_key text,
  address_line text,
  city text,
  years_of_experience integer check (years_of_experience between 0 and 80),
  professional_bio text,
  availability_summary text,
  submitted_at timestamptz,
  approved_at timestamptz,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists provider_profiles_status_index on provider_profiles(status);

create table if not exists provider_service_categories (
  id uuid primary key default gen_random_uuid(),
  provider_profile_id uuid not null references provider_profiles(id) on delete cascade,
  category_key text not null,
  created_at timestamptz not null default now(),
  unique(provider_profile_id, category_key)
);

create table if not exists provider_service_areas (
  id uuid primary key default gen_random_uuid(),
  provider_profile_id uuid not null references provider_profiles(id) on delete cascade,
  area_name text not null,
  created_at timestamptz not null default now(),
  unique(provider_profile_id, area_name)
);

create table if not exists provider_verification_documents (
  id uuid primary key default gen_random_uuid(),
  provider_profile_id uuid not null references provider_profiles(id) on delete cascade,
  document_type text not null check (document_type in ('trade_certificate','portfolio','reference','address_evidence','identity','selfie')),
  storage_key text not null,
  original_file_name text not null,
  content_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  review_status text not null default 'pending' check (review_status in ('pending','accepted','rejected')),
  review_note text,
  created_at timestamptz not null default now()
);

create table if not exists provider_references (
  id uuid primary key default gen_random_uuid(),
  provider_profile_id uuid not null references provider_profiles(id) on delete cascade,
  full_name text not null,
  relationship text not null,
  email text,
  phone_number text,
  created_at timestamptz not null default now(),
  check (email is not null or phone_number is not null)
);

create table if not exists provider_review_decisions (
  id uuid primary key default gen_random_uuid(),
  provider_profile_id uuid not null references provider_profiles(id) on delete restrict,
  actor_user_id text not null references "user"(id) on delete restrict,
  action text not null check (action in ('submit','start_review','approve','reject','request_changes','suspend','reinstate','remove')),
  previous_status text not null,
  next_status text not null,
  reason text not null check (length(trim(reason)) > 0),
  created_at timestamptz not null default now()
);
create index if not exists provider_review_decisions_profile_index on provider_review_decisions(provider_profile_id, created_at desc);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id text references "user"(id) on delete set null,
  actor_role text,
  event_key text not null,
  entity_type text not null,
  entity_id text not null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_events_entity_index on audit_events(entity_type, entity_id, created_at desc);

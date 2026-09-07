# KhidmatAI System Hardening & Scalability Plan

Written **before** any code changes in this pass, per instruction. Covers a
fresh review of the current tree (not a re-read of `AUDIT_FINDINGS.md`,
though findings that still apply are cross-referenced) across: architecture
and scalability (target: sustain 500–1,000 req/s), security, error handling,
loading/success/error UX, consistency, and the specific business-rule change
— **references must be optional for profile submission**. A "Resolution"
section will be appended after implementation, listing exactly what changed
and what was deliberately deferred.

- **Date:** 2026-09-07
- **Method:** two parallel deep-dive passes (backend architecture/security/
  scalability; frontend UX/error-handling/consistency) plus direct
  verification of the specific references-optional rule.
- **Scope:** full monorepo, both apps.

---

## 1. Architecture as it stands today

```
Browser → Next.js (Vercel) → /backend-api/* rewrite → Express (Railway, single instance)
                                                          → PostgreSQL (single instance, pool max 20)
                                                          → Cloudinary (media)
```

- One Node process, one CPU core (`src/index.ts` calls `app.listen()` directly
  — no `cluster`, no PM2, no Dockerfile/Procfile/railway.toml found anywhere
  in the repo).
- One Postgres connection pool, `max: 20` in production.
- Two independent **in-memory** rate limiters: `express-rate-limit`
  (120 req/min/IP, all of `/api`) and Better Auth's own internal limiter
  (100 req/60s). Neither has a shared/external store.
- No caching layer anywhere (no Redis, no CDN cache — every API response is
  explicitly `Cache-Control: no-store, private`).
- No composite index backs the public provider-directory's actual filter +
  sort shape; the `search` parameter on that same endpoint and the city
  lookup both do leading-wildcard `ILIKE`, which cannot use a standard
  B-tree index.

**Code quality of what's there is genuinely solid** — this is a scalability
and hardening problem, not a rewrite. Every route has consistent `.strict()`
Zod validation, correct session-derived ownership scoping, no SQL injection
surface (parameterized/Drizzle-builder throughout), and almost every
multi-step mutation is properly transactional. No critical security defect
was found in this pass.

---

## 2. Can this sustain 500–1,000 req/s today? — No, for three compounding, fixable reasons

Connection-pool math (`max: 20`, `idleTimeoutMillis: 30_000`):

| Query cost per request | Pool-alone ceiling | vs. 500–1,000 req/s target |
| --- | --- | --- |
| Indexed, ~5–20ms hold | `20 / 0.005s`–`20 / 0.02s` → **1,000–4,000 req/s** | Comfortably above |
| Unindexed/slow, ~50–200ms hold | `20 / 0.05s`–`20 / 0.2s` → **100–400 req/s** | Below target, and requests start queuing/timing out (`connectionTimeoutMillis: 5_000`) under sustained load |

The pool size itself is fine. What determines which row of that table you're
in is entirely index coverage on the actual public hot path
(`GET /api/v1/public/providers`, `/public/providers/:username`,
`/public/service-categories`, `/public/cities`) — and right now that path
lacks the indexes it needs (§3, B1–B2). Layered on top: a single CPU core is
a hard ceiling regardless of query speed once JSON parsing, Zod validation,
Helmet, CORS and Pino logging overhead on every request are counted (§3, B7),
and the in-memory rate limiters would silently stop being globally correct
the moment a second instance/worker is added to fix that (§3, B6).

**The three changes that matter most, in order:** (1) index the public
directory's real query shape, (2) give the server more than one core to run
on, (3) make rate limiting correct across however many workers/instances
result from (2). All three are addressed below without requiring a new
external service (no Redis) — see B1, B2, B6, B7.

---

## 3. Backend findings and planned fixes

| ID | Severity | Finding | Plan |
| --- | --- | --- | --- |
| B1 | High | No index backs `provider_profiles`' actual `(status, approved_at, updated_at)` filter+sort shape on the public directory query — degrades to filter+sort over a growing table. | New migration: partial composite index `ON provider_profiles (status, approved_at DESC NULLS LAST, updated_at DESC) WHERE status = 'active'`. |
| B2 | High | `search` on the public directory and city lookup uses leading-`%` `ILIKE`, which cannot use a B-tree index — forces a sequential-ish scan per request once used at any real scale. | New migration: `CREATE EXTENSION IF NOT EXISTS pg_trgm` + GIN trigram indexes on the searched columns (`users.name`, `provider_profiles.professional_title`, `cities.name`). *Caveat: requires the DB role to have privilege to create the extension — standard on Railway-managed Postgres, but noted here in case it isn't in this environment.* |
| B3 | Medium | `provider_profiles.city_id` exists in the live database (added by hand-written SQL in migration 0008) but is undeclared in `schema.ts` — used today only via raw pool queries, invisible to Drizzle's type checker and to any future `drizzle-kit generate` diff. | Add `cityId` to the Drizzle schema file to match the live column; no migration needed (column already exists), this is a type-layer correction only. |
| B4 | Medium | `profile-media-service.ts`'s multi-step mutations (delete-old-image → insert-new-asset → update-user.image; delete-asset → update-user.image) are three separate non-transactional calls, unlike every other multi-step mutation in the codebase. A failure mid-sequence leaves partial state (e.g. asset row deleted but `user.image` still pointing at it). | Wrap each local DB sequence in `khidmatAiDatabase.transaction(...)`. Cloudinary calls stay outside the transaction (can't be transactional across services), sequenced so the DB transaction only commits after Cloudinary confirms. |
| B5 | Medium | Every authenticated request pays a full DB round trip to resolve the session (no Better Auth `cookieCache`), adding avoidable pool pressure on the private routes. | Enable Better Auth's short-lived signed `cookieCache` in `authentication-configuration.ts`. |
| B6 | High | Both rate limiters (`express-rate-limit`, Better Auth's internal one) use in-memory storage with no shared-store seam — correctness breaks the moment a second process/instance is added. Adding a Redis dependency isn't possible from this environment (cannot `pnpm install` new packages from WSL per this project's constraint). | Implement a custom `express-rate-limit` `Store` backed by the **existing Postgres connection** (a new small table, atomic increment/window-reset via SQL, no new npm dependency) instead of Redis. Correct across any number of Node workers or Railway replicas without adding new infrastructure. |
| B7 | High | Single Node process, single CPU core — no `cluster`, no process manager, no container config found anywhere in the repo. | Enable Node's built-in `cluster` module in `index.ts`, opt-in via an env var (default: 1 worker in development, `os.cpus().length` workers in production), each worker sharing the same listening port. Deferred beyond this: actually running multiple *Railway replicas* is an infrastructure/deployment decision outside this repo's code — noted, not something a code change alone can do. |
| B8 | Info | The ~8-query authenticated provider-profile GET (`findProviderOnboardingByAuthenticationUserId`) is real per-request cost worth optimizing eventually, but confirmed to be authenticated/edit-flow/one-per-session traffic, not a candidate for the 500–1,000 req/s target. | Deferred — not fixed in this pass; flagged so it isn't mistaken for a hot-path problem later. |
| B9 | Info | Every paginated list (public directory, admin users/audit-log) runs a full `COUNT(*)` alongside the page query, doubling query cost per call. | Deferred — fixing this changes the API response contract (`meta.total`/`totalPages`, which the frontend pagination UI depends on today). Documented as a future change, not made silently in this pass. |

---

## 4. Frontend findings and planned fixes

### Bugs / correctness

| ID | Severity | Finding | Plan |
| --- | --- | --- | --- |
| F1 | High | `ProviderApplicationProgressCard` is always given `currentStageKey="draft"` — never the real `profile.status` — so the stepper never advances past "Draft" no matter the actual review state. | Pass the real `profile.status`. |
| F2 | High | `deleteProfileImage` in the shared header-banner shell has no `try/catch`, no loading state, and a failure is silently swallowed. | Wrap in try/catch, add an `isDeleting` state that disables the button and shows a spinner, toast on both outcomes. |
| F3 | Medium | `memberSinceLabel="September 2026"` is a hardcoded literal in `provider-profile-view.tsx`, shown identically to every provider. | Derive from the real account/profile creation date. |
| F4 | Medium | Customer header banner's initial `preferredContactLabel`/`savedAddressCount` are hardcoded (`"WhatsApp"`, `2`) and only corrected once child sections mount and report back. | Derive both directly from the already-loaded `profile` object instead of separate hardcoded local state. |
| F5 | Medium | Canceling an edit after a failed save doesn't clear the section's error/success state in About Me, Availability, References, and Services — a stale error banner can remain visible after the form is closed. | Clear the relevant error/success state in every `onCancel` handler, matching what `onBeginEditing` already does. |
| F6 | Medium | Both header banners await two sequential calls (username update, then profile update) under one `catch` — if the second fails after the first succeeds, the UI's local state and the server disagree, and the error message misleadingly blames the username. | Update local state to reflect the first call's success before attempting the second; adjust the error message to identify which step actually failed. |

### Admin panel

| ID | Severity | Finding | Plan |
| --- | --- | --- | --- |
| F7 | High | `AdministrationServiceCategoryManager`'s save button has no `isSubmitting` disable (double-submit risk); its delete action uses the browser-native `window.confirm(...)` instead of the app's own `Dialog` confirmation pattern used everywhere else in admin. | Disable the submit button while `form.formState.isSubmitting`; replace `window.confirm` with the shared `Dialog`. |
| F8 | High | The shared `DialogContent` has no `max-h-[90dvh]`/`overflow-y-auto`; the "request changes" review dialog (title + description + 8-item checklist + textarea) can extend off-screen on a short viewport with no way to reach the confirm button. | Add `max-h-[90dvh] overflow-y-auto` to the shared `DialogContent` — fixes every dialog in the app at once. |
| F9 | Medium | The "which sections need changes" checklist uses a raw styled `<input type="checkbox">` instead of the app's shared `Checkbox` component used everywhere else for the same kind of control. | Swap in the shared `Checkbox`. |
| F10 | Medium | Admin user-detail "Role profile" card is a raw `JSON.stringify(...)` debug dump with no framing. | Label it explicitly as raw/debug data rather than presenting it as a designed view (a full formatted rebuild is out of scope for this pass). |

### Other

| ID | Severity | Finding | Plan |
| --- | --- | --- | --- |
| F11 | Low | `/explore`'s hero "Find providers" button has no handler — filtering already happens live via the input, so the button visibly does nothing when clicked. | Wire it to a real action (scroll to / focus the results list). |

### Explicitly deferred (documented, not fixed this pass)

- **Mixed color-token systems** (`text-ink/NN` opacity utilities vs.
  shadcn-style `text-muted-foreground`/`border-border` — even the shared
  `dialog.tsx` mixes both). A full sweep is a large, purely cosmetic,
  app-wide change; doing it safely under this pass's scope risks touching
  far more files than the functional fixes above for comparatively low
  value. Documented as known consistency debt.
- **Border-radius drift** (`rounded-xl`/`2xl`/`3xl` used interchangeably for
  conceptually equivalent cards) — same reasoning, cosmetic-only, deferred.
- **`useFieldArray` migration** for the profile "repeater" sections
  (languages, service areas, references, addresses), which currently pair a
  hand-rolled `useState<T[]>` beside an RHF form used only for the
  single-item draft. This is a real architectural improvement (single
  source of truth) and is *why* F5's bug exists, but F5's direct fix
  resolves the reported symptom without the risk of a 4-component data-flow
  refactor. Documented as a future improvement.
- **Native `<select>` vs. custom dropdown vs. toggle-pill-row** — three
  different single-choice-picker patterns used across admin/profile for
  equivalent needs. Cosmetic/consistency only, deferred.

---

## 5. References must be optional for submission

Confirmed precisely, both by direct inspection and by the frontend review
pass, independently:

- **Backend already treats it as optional.** `provider-onboarding-validation-schemas.ts`
  has `references: z.array(providerReferenceValidationSchema).max(5)` — no
  `.min()`. The `canSubmitForReview` readiness computation in
  `provider-onboarding-repository.ts` never references `references.length`
  at all. Zero references has always been submittable server-side.
- **The frontend is the only place enforcing a minimum**, in
  `provider-references-section.tsx`:
  1. `saveReferences()` hard-blocks saving when `referenceList.length === 0`
     with an error toast demanding at least one — even though nothing
     downstream requires it.
  2. The section label reads "Professional references **\***" (required
     marker).
  3. The hint text reads "Add at least one and no more than five
     references."
  4. The profile-completeness checklist marks "References" incomplete
     whenever the list is empty, alongside sections that genuinely are
     required for submission (About Me, Services, Documents) — overstating
     what's actually blocking review.

**Plan:** remove the length-based save block; change the marker to
"(optional)"; update the hint text to "Add up to five references
(optional)"; and change the completeness checklist so References is no
longer presented as equally required — it will be marked complete
regardless of count (an empty, genuinely-optional section shouldn't read as
an outstanding task).

---

## 6. Verification plan

After implementation: `pnpm exec tsc --noEmit` on both apps, `pnpm lint` on
the frontend (backend has no lint script — documented, pre-existing), and a
manual read-through of every changed file. Vitest and the production build
cannot run from this WSL environment (native Rolldown bindings / a
Windows-vsock error block it, as already established this session) — those
must be run from Windows PowerShell, same as every prior pass.

---

## 7. Resolution

Implemented 2026-09-07, immediately after the plan above. Everything marked
"planned" in §3–§5 was built as described except where noted below as
deliberately changed or deferred.

### Backend

| ID | Status | Notes |
| --- | --- | --- |
| B1 | Done | `drizzle/0012_add_scalability_indexes_and_rate_limit_store.sql` — partial composite index on `provider_profiles (approved_at desc nulls last, updated_at desc) where status = 'active'`. |
| B2 | Done | Same migration — `pg_trgm` extension + GIN trigram indexes on `user.name`, `provider_profiles.professional_title`, `cities.name`. |
| B3 | Done | Added `cityId: uuid("city_id")` to `providerProfiles`, `customerProfiles`, and `customerSavedAddresses` in their Drizzle schema files — **without** `.references()`, to avoid a circular import between `platform-catalogue-schema.ts` (which already imports both files) and the two files that would need to import `cities` back. The FK constraint itself is already enforced at the database level by migration 0008 regardless. |
| B4 | Done | `profile-media-service.ts` — all four multi-step mutations (`confirmProviderMediaUpload`, `deleteProviderMediaAsset`, `confirmCustomerAvatarUpload`, `deleteCustomerAvatar`) now wrap their local DB writes in `khidmatAiDatabase.transaction(...)`. Cloudinary calls stay outside the transaction (sequenced before it) since they can't participate in one. |
| B5 | Done, revised | Enabled `session.cookieCache` but with `maxAge: 5` (seconds), not Better Auth's longer default. A longer cache would let a just-banned/deactivated account keep making authenticated requests until the cache expired — this app synchronously deletes session rows on ban/deactivation specifically to prevent that. 5 seconds absorbs request bursts while keeping that residual-access window small. |
| B6 | Revised for MVP | The PostgreSQL counter was removed because it added a write to every API request. The current single backend instance uses the package's process-local limiter. A shared external limiter is a documented prerequisite—not prematurely installed infrastructure—before adding Railway replicas. Forward-only migration 0013 removes the obsolete PostgreSQL counter table if migration 0012 created it. |
| B7 | Revised after review | In-process Node clustering was removed because every worker would create its own full PostgreSQL pool and Railway already owns process/container scaling. Scale with Railway replicas only after selecting a shared limiter and calculating the total database connection budget. |
| B8 | Deferred | Not fixed — confirmed not a hot-path endpoint, documented so it isn't mistaken for one later. |
| B9 | Deferred | Not fixed — would change the `meta.total`/`totalPages` API contract the frontend pagination UI depends on today. |

### Frontend

All of F1–F11 were implemented as planned. Specifics worth noting:

- **F1/F3** required adding `createdAt: string` to the `ProviderProfileData` frontend type — the backend was already returning this field (a full-row spread from `provider_profiles`, which has always had `created_at`), the frontend type simply hadn't declared it yet. No backend change was needed.
- **F4** removed the hardcoded initial `useState("WhatsApp")`/`useState(2)` in `customer-profile-view.tsx` in favor of deriving both values from the already-loaded `profile` object, with the existing local state repurposed as an override only a child section's save callback sets (so a just-saved edit still reflects instantly, ahead of the next query refetch). Exported `contactOptionList` from `customer-contact-section.tsx` so the view could reuse the same value→label mapping rather than re-declaring it.
- **F6** applied to both `provider-profile-header-banner.tsx` and `customer-profile-header-banner.tsx` — the username save and the profile-fields save are now two separate `try/catch` blocks with distinct error messages ("Could not save username" vs. "Username saved, but the rest of your profile could not be saved"), so a partial failure is never misattributed to the wrong field.
- **F5** — About Me and Services didn't clear their error/success state on cancel; fixed both. Availability already cleared its own state correctly (no change needed there). References' error state was removed entirely as part of the references-optional change (§5) rather than just cleared on cancel, since the block that produced it no longer exists.
- **F8** (`DialogContent` missing `max-h-[90dvh] overflow-y-auto`) was a single shared-component change, so it fixed every dialog in the app at once, including the ones named in F7/F9.

### References optional (§5)

The `referenceList.length === 0` save-block was removed, the section label now says `(optional)`, and the hint explains that references are not required for submission. References are excluded entirely from the required-profile completion calculation rather than being counted as automatically complete. No backend change was needed because it already allowed zero references.

### Verification

- `pnpm exec tsc --noEmit` — clean on both `khidmatai_server` and `khidmatai_nextjs`.
- `pnpm lint` (frontend) — 0 errors. One pre-existing-pattern warning fixed as a drive-by (an `AdministrationServiceCategoryManager` React Hook Form `watch()` call switched to `useWatch`, matching the pattern used everywhere else in the app); no warnings remain related to this pass's changes.
- `git diff --check` — clean (no whitespace/conflict-marker issues).
- Backend has no lint script (pre-existing, documented in `SECURITY.md`).
- **Not run from this environment:** `pnpm test` (Vitest) and `pnpm build` on either app — native Rolldown bindings and a Windows-vsock error block both from WSL, as established earlier this session. Run from Windows PowerShell before treating this as fully verified:
  ```powershell
  cd E:\KhidmatAI\khidmatai
  pnpm test
  pnpm build
  ```
- The new migration (`0012_add_scalability_indexes_and_rate_limit_store.sql`) has not run against the real database from this environment either — it applies automatically on next backend startup (`runPendingDatabaseMigrations()` in `index.ts`), same as every prior migration. Confirm it applies cleanly on first boot after deploying this change; the `pg_trgm` extension statement in particular depends on the DB role's privileges (see the migration file's own comment).

---

## 8. Post-review corrections

An independent review found that several original resolution claims were too
strong. The following corrections were implemented before release:

- The PostgreSQL-backed request counter was removed from the API hot path. It
  added a database write to every request and retained expired client keys.
  The MVP intentionally uses the package's in-memory store on its single
  backend instance. A shared external limiter must be chosen and configured
  before adding Railway replicas.
- Forward-only migration `0013_remove_obsolete_postgres_rate_limit_store.sql`
  removes the obsolete counter table in databases where migration 0012 had
  already run. The useful provider-directory and trigram indexes from 0012 are
  retained.
- `/api/v1/health` and `/api/v1/health/ready` are mounted before the general
  limiter. Liveness remains dependency-free; readiness performs its deliberate
  PostgreSQL check without first requiring a rate-limit write.
- In-process Node clustering was removed. Railway should own horizontal
  scaling, preventing each worker inside one container from independently
  creating a full PostgreSQL pool. Replica count must be planned alongside the
  database connection budget.
- Media replacement now verifies the new Cloudinary object, commits the local
  database replacement transaction, and only then cleans up superseded remote
  objects. A cleanup failure may leave a logged, recoverable Cloudinary orphan,
  but the database never points at an object deleted before its transaction
  commits. A failed local replacement also attempts to remove the new orphan.
- Duplicate avatar-deletion success toasts were removed. The shared profile
  banner is the single owner of deletion feedback.
- Optional references were removed from the required-completion denominator
  instead of being counted as automatically completed.

The 500–1,000 requests/second figure remains a **target, not a verified
capacity claim**. Before making that claim, run staging load tests and record
p50/p95/p99 latency, error rate, PostgreSQL pool wait/saturation, limiter latency,
CPU and memory, plus `EXPLAIN (ANALYZE, BUFFERS)` for public-directory queries
against representative data.

# Authentication and provider access

## Roles

| Role | Public signup | Access |
|---|---:|---|
| Customer | Yes | Customer dashboard and service requests |
| Provider | Yes | Onboarding; marketplace access only after approval |
| Support | No | Read-only provider review access |
| Administrator | No | Provider decisions and user administration |

## Routes

- `/register`, `/login` — no site header/footer (`(auth)` route group; see
  `PROJECT_TECH_STACK_AND_STRUCTURE.md`)
- `/dashboard` — shared path with server-authoritative role content
- `/profile` — profile completion for both roles; no separate `/onboarding`
  route (see `DECISIONS.md` DEC-002). Currently a visual-only mockup with no
  backend wiring.
- `/settings`, `/bookings`, `/bookings/[bookingId]` — shared authenticated paths
- `/explore`, `/explore/[providerId]` — shared marketplace discovery, also
  requires authentication
- `/administration/providers`

Email verification is disabled and there is no forgot-password/reset-password
or email-verified UI for the hackathon build — see "Email verification" below.
No frontend email workflow is exposed.

## Post-authentication redirect

- Sign-up succeeds -> `/profile` (to complete it), unless `?redirect=` is set.
- Sign-in succeeds -> role default: Customer `/explore`, Provider `/bookings`,
  Support/Admin `/administration`, unless `?redirect=` is set.
- Any protected page can send an unauthenticated visitor to
  `/login?redirect=<path>` by passing that path to
  `requireCurrentAuthenticationSession`/`requireAuthenticatedAccountRole`
  (`src/server/authentication/current-session.ts`); the auth form reads it
  back and honors it over the role default.
- `redirect` is validated as a same-origin relative path
  (`resolveSafeRedirectPath` in `authentication-form-view.tsx`) — never a
  full or protocol-relative URL, to close off an open-redirect vector.

## Provider states

```text
draft -> submitted -> under_review -> active
  ^                        |           |
  |                        -> rejected -> suspended -> active
  -> changes_required                  -> removed
```

All transitions are checked against the current state and optimistic version.
Administrative transitions require a reason and create `provider_review_decisions`
and `audit_events` records.

## Email verification

Disabled for the hackathon build (`requireEmailVerification: false`,
`emailVerification.sendOnSignUp: false` in
`authentication-configuration.ts`): sign-up signs the user in immediately, no
verification email is sent, and there is no `/email-verified` page. This must
be re-enabled — and a real transactional email provider configured — before
any public launch; see `SECURITY.md` §2.

## Security boundaries

- Better Auth owns password hashing, verification tokens and HttpOnly sessions.
- Server Components fetch sessions from Express; Express validates them against PostgreSQL.
- Public clients cannot assign Support or Administrator roles.
- Provider APIs independently enforce the Provider role.
- Administration mutation APIs independently enforce Administrator role.
- Support access is read-only.
- Provider onboarding writes are transactional and version checked.
- Provider discovery is shared, but only a Customer may create a booking. This
  must be repeated in Express authorization and protected by database constraints
  when booking persistence is introduced.

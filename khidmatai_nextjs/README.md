# KhidmatAI web application

Next.js 16 application for the KhidmatAI local-services marketplace.

## Requirements

- Windows development environment
- Node.js 20 or later
- pnpm 10.27.0
- PostgreSQL

## Setup

```powershell
Copy-Item .env.example .env.local
pnpm install --frozen-lockfile
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f database/migrations/0000_authentication_and_provider_onboarding.sql
pnpm dev
```

Set the values in `.env.local` before applying migrations. Email verification
is disabled for this hackathon build (no email provider is configured); see
`AUTHENTICATION.md`.

Create the first administrator after applying the migration:

```powershell
pnpm exec auth create-admin --config src/server/authentication/auth.ts --email admin@example.com --name "KhidmatAI Admin" --role admin
```

## Verification

```powershell
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

## Authentication behavior

- Public roles: Customer and Provider only.
- Protected roles: Support and Administrator.
- Email verification is disabled for now; sign-up signs the user in immediately.
- Password reset is not configured for now (no `/forgot-password` page or `sendResetPassword`).
- Provider accounts start with a resumable onboarding draft.
- Providers cannot access marketplace work until approved.
- Support can inspect provider review state but cannot make decisions.
- Administrator decisions require reasons and create immutable audit records.

## Current external dependency decision

Private provider evidence uploads are not enabled until an object-storage provider
is selected. CNIC, selfie, certificate, portfolio, address evidence and reference
files must use private storage and short-lived authorized URLs; they must not be
written to the application server's local disk.

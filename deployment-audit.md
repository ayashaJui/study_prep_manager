# Deployment Audit (May 31, 2026)

Status: Not ready for production deployment.

Progress update:

- Fixed: Unauthenticated GET to `/api/topics` now requires auth.
- Fixed: Proxy guard is now provided via `proxy.ts`; removed duplicate `middleware.ts` to satisfy Next.js requirements.
- Corrected: `.env.local.example` exists and provides a canonical env template.
- OAuth→JWT work: session-exchange endpoint, client callback page, and `AuthContext` updates implemented.
  - Cookie-only auth rollout: In progress — most client `localStorage` reads and Authorization headers removed; final cleanup remains.

## Issues (Ordered by Severity)

### Critical

1. OAuth sign-in uses NextAuth sessions, but the app's API auth previously relied on a custom JWT stored in `localStorage`. OAuth users would not receive the JWT used by `requireAuth`, causing API failures.
   - Status: Partially addressed
   - Files: `app/api/auth/[...nextauth]/route.ts`, `app/api/auth/exchange-session/route.ts`, `app/auth/oauth-callback/page.tsx`, `app/auth/login/page.tsx`, `contexts/AuthContext.tsx`

2. Unauthenticated GET to `/api/topics` could return all topics (no `userId` scoping).
   - Status: Fixed
   - Files: `app/api/topics/route.ts`, `controllers/topicController.ts`

### High

3. Duplicate middleware conflict (`middleware.ts` and `proxy.ts`) caused Next.js to error.
   - Status: Fixed (removed `middleware.ts`)
   - Files: `proxy.ts`

### Medium

4. Rate limiting uses an in-memory Map, which is per-instance in multi-node/serverless deployments and can be bypassed; needs Redis/Upstash.
   - File: `lib/rateLimit.ts`

5. Client previously stored JWT in `localStorage` and sent it via `Authorization` header, increasing XSS risk.
   - Status: In progress (client `localStorage` usage largely removed)
   - Files: `contexts/AuthContext.tsx`, `lib/api.ts`, various pages

### Low

6. Documentation: update production deployment steps and verify OAuth callback URLs in provider dashboards.
   - Files: `README.md`, `docs/OAUTH_SETUP.md`

## Suggested Next Steps

- Finalize cookie-only auth on the client (remove remaining `localStorage` usage and ensure all client requests rely on HttpOnly `auth_token` cookie).
  - Status: In progress
  - Remaining: Remove last cleanup call and audit all entry points.

- Replace in-memory rate limiting with a shared store (Redis/Upstash).
  - Status: Not started

- Add CI with lint/build/test.
  - Status: Not started

- Audit API endpoints for `userId` scoping and add automated checks.
  - Status: Not started

If you want, I can finish the cookie-only rollout (remove the final `localStorage` cleanup call) and audit remaining entry points. Which should I do next?

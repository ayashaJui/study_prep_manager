# Missing Implementation Summary

Generated: 2026-05-31

This file lists remaining features, risk items, and TODOs that are not yet implemented in the repository relative to the project plan and recent audit.

## Authentication / Session

- Status: In progress — removed most client `localStorage` reads and Authorization headers; remaining cleanup: remove final client-side cleanup call and add E2E tests.

## Rate Limiting & Security

## API & Authorization

## Tests & CI

- Add a CI workflow running `npm run lint`, `npm run build`, and `npm test` on PRs.

## Offline & Persistence

- Implement offline-first sync or local persistence if the product requirement is to work without internet.

## UI / UX

- Verify and implement the full set of UI components from the plan (disabled states, login prompts for protected actions, toast notifications) across pages.
- Ensure redirect-to-original-page behavior works consistently after auth.

## OAuth / Provider Config

- Confirm OAuth client IDs and secrets are configured for production and documented in deployment guides (ngrok usage for local testing is documented, but production callback URLs must be set).

## Documentation

- Update `README.md` and `deployment-audit.md` with instructions for production deployment (required env vars, secrets, SMTP setup for password reset).

## Observability & Ops

- Add centralized logging and error reporting (Sentry or similar) for production.
- Add health checks and readiness probes for deployments.

## Scaling & Performance

- Move session/rate-limiter to shared Redis store for scaling.
- Review database indexes and query patterns for high-cardinality usage.

---

If you want, I can start implementing any of these items. Suggest which to prioritize and I will add a focused plan and begin work.

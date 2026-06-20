# Project Assessment — StudyNest

> Last updated: 2026-06-19
> Scope: Does the current implementation meet the goal of "a tool to take & store notes, flashcards, quizzes, and other interview-prep material, with notes presented in a standard/Medium-style reading view (incl. images & GIFs)"?

## Tech Stack

- **Frontend:** Next.js 16.1.6, React 19.2.3, TypeScript 5, Tailwind CSS 4
- **Backend:** Next.js API routes (serverless functions)
- **Database:** MongoDB + Mongoose 9.1.5
- **Auth:** NextAuth.js, JWT + HttpOnly cookies, bcryptjs, OAuth (Google/GitHub)
- **Markdown:** `react-markdown` + GFM plugin
- **Email:** Nodemailer (password reset)
- **Testing:** Vitest

## Verdict: Does it meet the criteria?

Yes, on the core ask — Topics, Notes (Medium-style reading view), Flashcards, Quizzes, Auth, Search, and Public Sharing are all implemented and reasonably mature. Open items below are smaller gaps or unrelated incomplete features (AI generation, export, dashboard goal targets, infra hardening).

---

## Open Gaps


### Infra / Known Issues
- Rate limiting uses an in-memory `Map` (`lib/rateLimit.ts`) — breaks under multiple server instances / serverless scale-out (needs Redis/Upstash).
- OAuth JWT token issuance has edge cases — partially fixed via `/api/auth/exchange-session`.
- Cookie-only auth migration still has localStorage cleanup remaining.
- No centralized logging/observability (no Sentry, etc.).
- No E2E tests for the OAuth flow.


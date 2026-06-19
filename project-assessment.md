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

### Notes
- No WYSIWYG/formatting toolbar — still hand-written markdown (by design)
- **Known limitation:** image uploads (`app/api/upload/route.ts`) write to the local filesystem (`public/uploads`) — fine for a single dev/VM instance, but ephemeral and unsafe on serverless/multi-instance deployments. Needs migration to object storage (S3/Cloudinary/Vercel Blob) before such a deployment.

### Study Sessions / Streaks
- **Fixed (2026-06-19):** the Dashboard's "Study Streak" card was reading a crude binary 0/1 from `/api/dashboard/stats` ("studied in the last 7 days?") instead of the real consecutive-day streak already computed by `/api/study-sessions/streak` — that endpoint existed but was never called from the UI. Dashboard now calls it directly.
- **Fixed (2026-06-19):** streak day-bucketing was hardcoded to UTC, so a late-night session could land on the wrong calendar day for non-UTC users and break their streak. `/api/study-sessions/streak` now accepts `?tz=<IANA timezone>` (the Dashboard passes the browser's local timezone) and buckets days accordingly.
- **Fixed (2026-06-19):** added a manual "Start Studying" / "Stop & Log Session" timer on the Dashboard (`studySessionsAPI.create`), since flashcard review was previously the only thing that ever logged a `StudySession`.
- **Fixed (2026-06-19):** the "This Week" study-time stat was hardcoded to `0` ("not tracked at the moment") — now summed from real `StudySession` durations in the last 7 days.
- **Still open:** quiz attempts and note creation/edits don't log `StudySession`s the way flashcard review does — only flashcard review and manually-started sessions count toward the streak/weekly study time.

### AI-assisted generation — Stub only
- `components/views/GenerateFromFile.tsx` exists but isn't wired into the flashcard/quiz creation flow — the "Generate from File" buttons in `TopicFlashcards.tsx`/`TopicQuizzes.tsx` have no `onClick` handler at all.

### Import / Export — Partial
- CSV import works for flashcards and quizzes.
- No export functionality despite README implying it.

### Infra / Known Issues
- Rate limiting uses an in-memory `Map` (`lib/rateLimit.ts`) — breaks under multiple server instances / serverless scale-out (needs Redis/Upstash).
- OAuth JWT token issuance has edge cases — partially fixed via `/api/auth/exchange-session`.
- Cookie-only auth migration still has localStorage cleanup remaining.
- No centralized logging/observability (no Sentry, etc.).
- No E2E tests for the OAuth flow.

### Branding
- No logo / brand identity yet (text wordmark only).

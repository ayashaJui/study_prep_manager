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
- **Done (2026-06-19):** Pinning/favorites — `Note.pinned` field, pin/unpin button in both `NoteList.tsx` and `NoteArticle.tsx`, pinned notes sort to the top.
- **Scoped down (2026-06-19):** "Version history" reduced to a last-edited timestamp (no stored snapshots) — note list/article now show "Edited on X" instead of "Added on X" once a note has actually been edited. "Note-to-flashcard/quiz linking" dropped — already effectively covered by shared topic scoping, no separate link field added.
- **Known limitation:** image uploads (`app/api/upload/route.ts`) write to the local filesystem (`public/uploads`) — fine for a single dev/VM instance, but ephemeral and unsafe on serverless/multi-instance deployments. Needs migration to object storage (S3/Cloudinary/Vercel Blob) before such a deployment.

### Quizzes
- Schema supports `true-false`/`mixed` question types but the UI only builds multiple-choice.

### Study Sessions / Streaks — Partially implemented
- Sessions are logged and a streak endpoint exists, but there's no UI to start/stop sessions manually, and timezone handling for streaks is unverified.

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

# Project Assessment — StudyNest

> Generated: 2026-06-17
> Scope: Does the current implementation meet the goal of "a tool to take & store notes, flashcards, quizzes, and other interview-prep material, with notes presented in a standard/Medium-style reading view (incl. images & GIFs)"?

## Current Branding

| | |
|---|---|
| Package name (`package.json`) | `studynest` ✅ |
| README title | "StudyNest" ✅ |
| App metadata title (`app/layout.tsx`) | "StudyNest" ✅ |
| Logged-out header (`app/page.tsx`) | "StudyNest" ✅ |
| Logo / brand identity | None yet (text wordmark only) |

Rename is fully applied across `package.json`, `README.md`, `app/layout.tsx`, and `app/page.tsx`.

## Tech Stack

- **Frontend:** Next.js 16.1.6, React 19.2.3, TypeScript 5, Tailwind CSS 4
- **Backend:** Next.js API routes (serverless functions)
- **Database:** MongoDB + Mongoose 9.1.5
- **Auth:** NextAuth.js, JWT + HttpOnly cookies, bcryptjs, OAuth (Google/GitHub)
- **Markdown:** `react-markdown` + GFM plugin
- **Email:** Nodemailer (password reset)
- **Testing:** Vitest

## Verdict: Does it meet the criteria?

**Mostly, as of this update.** Topics, flashcards, quizzes, auth, search, and sharing are implemented and reasonably mature. **Notes now have a Medium-style reading view** — title, cover image, reading time, and inline image/GIF embedding were implemented (see below). Some smaller note gaps remain (no tag-filter UI, no WYSIWYG toolbar beyond markdown, no version history), and a few unrelated features are still incomplete or stubbed (see Flashcards, Dashboard, AI generation sections).

---

## Feature-by-Feature Breakdown

### ✅ Topics (hierarchical organization) — Mature

- Unlimited nested subtopics, auto-slugs, breadcrumb paths, status tracking, tags, favorites, public share links.
- Files: `models/Topic.ts`, `components/views/TopicContent.tsx`, `app/api/topics/*`

### ✅ Notes — Now meets the Medium-style reading view requirement

**What was implemented in this update:**
- New `app/api/upload/route.ts` — authenticated endpoint for uploading PNG/JPEG/GIF/WEBP (≤5MB), stores to `public/uploads/<uuid>.<ext>`, returns a public URL; wired into the client via `uploadAPI.uploadImage()` in `lib/api.ts`. Used for inline image/GIF embedding in note content.
- New `lib/noteUtils.ts` with three small helpers shared by the note views:
  - `deriveNoteTitle(content)` — title is **not a separate stored field**. It's derived from the first non-empty line of the note's markdown (heading markers stripped). No title input to fill in — write `# My Heading` as the first line and that becomes the title everywhere.
  - `stripLeadingHeading(content)` — when the first line was a markdown heading, the reading view renders the derived title once (as the page heading) and strips that same line from the body so it isn't shown twice. If the first line wasn't a heading, nothing is stripped (matches how apps like Bear/Notion show the first line as both the list label and the start of the body).
  - `estimateReadingMinutes(content)` — `words / 200`, rounded up.
- `components/views/NoteArticle.tsx` rebuilt as a reading view: title (derived) as a large heading, byline with date + reading time, content rendered in a centered `prose lg:prose-lg` column (using the `@tailwindcss/typography` plugin already registered in `app/globals.css`). Editing mode has an "Insert image / GIF" control (upload or paste a URL) that writes standard `![](url)` markdown into the content.
- `components/features/NoteList.tsx` preview cards show the derived title, the reading time, and the body preview (heading stripped, same as the article view).
- `components/views/TopicNotes.tsx` create form is back to a single content textarea — no title or cover-image inputs.

**Design decision — no cover image, no separate title field:** initially both were added to mirror Medium/ByteByteGo, but cover images make sense for standalone publishable articles competing for attention, not topic-scoped study notes — the topic already provides context, and the user pushed back on the unnecessary input. Cover image support was removed entirely (from the model, controller, and all note UI); the upload endpoint itself was kept since it's still used for inline image/GIF embedding in note content. Title was changed from a typed field to something derived from the content itself, removing typing friction while still giving notes a visible heading in lists and the reading view.

**Still open (smaller, not blocking the core requirement):**
- ❌ No WYSIWYG/formatting toolbar — still hand-written markdown (by design, per the markdown-vs-rich-text research below)
- ❌ No pinning/favorites, no version history, no note-to-flashcard/quiz linking

*(Correction 2026-06-19: this section previously claimed "no tag-based filtering UI" — that was stale. `TopicNotes.tsx` already has tag filtering via `selectedTags`/`toggleTag`/`filteredNotes`.)*

**Known limitation — image storage:** uploads are written to the local filesystem (`public/uploads`). This works for the current dev/single-instance setup but is **not safe for serverless/multi-instance production** (e.g. Vercel's filesystem is ephemeral per invocation) — see Known Issues below.

**Data model** (`models/Note.ts`): `topicId`, `content`, `tags[]`, `userId`, timestamps. No `title` or `coverImage` fields — title is computed client-side from `content`.

### ✅ Flashcards — Implemented, spaced repetition working

- Front/back cards, difficulty, tags, CSV import, study/flip mode, tag filtering, edit-in-place UI.
- SM-2 spaced repetition (`easeFactor`, `intervalDays`, `nextReview`, `confidence`) is fully implemented in `reviewFlashcard` (`controllers/flashcardController.ts`) and wired end-to-end from the study UI. *(Note: this section was stale as of 2026-06-17 — already fixed by 2026-06-18.)*
- Files: `models/Flashcard.ts`, `components/views/TopicFlashcards.tsx`, `app/api/flashcards/*`

### ✅ Quizzes — Most mature feature

- Multiple-choice with multi-answer support, explanations, time limits, shuffle options, scoring, full attempt history.
- CSV import supported.
- Edit-after-create flow exists (`handleEditQuiz`/`editingQuizId` in `TopicQuizzes.tsx` + `quizzesAPI.update`). *(Correction 2026-06-19: previously claimed missing — stale.)*
- Remaining gap: schema supports `true-false`/`mixed` types but the UI only builds multiple-choice.
- Files: `models/Quiz.ts`, `components/views/TakeQuiz.tsx`, `components/views/AddQuizForm.tsx`

### ✅ Auth — Mature, minor known issues

- Email/password + Google/GitHub OAuth, JWT + cookies, password reset via email, profile management.
- Known issues (from deleted `deployment-audit.md`): OAuth session-exchange edge cases, in-progress migration off localStorage, in-memory rate limiting won't scale across multiple server instances.

### ✅ Search — Implemented

- Global search across topics/notes/flashcards/quizzes with autocomplete dropdown.

### ✅ Public Sharing — Implemented

- Read-only public link per topic, exposes notes/flashcards/quizzes without auth.

### ✅ Dashboard / Analytics — Basic, data-isolation bug fixed, goals now user-editable

- Stats cards, recent activity, topic progress, study streak.
- **Fixed (2026-06-19):** `app/api/dashboard/stats/route.ts` and `app/api/dashboard/goals/route.ts` had no auth check and queried `Flashcard`/`Quiz`/`Note`/`Topic` without a `userId` filter — every user saw aggregate counts/scores across *all* users' data. Both routes now call `requireAuth` and scope every query by `userId`, matching the pattern used elsewhere (e.g. `app/api/flashcards/route.ts`).
- **Fixed (2026-06-19):** Weekly goal targets/labels were hardcoded literals with no way to change them. Added a `weeklyGoals` array field on `User` (`metric`/`label`/`target`), a `PUT /api/dashboard/goals` endpoint to save per-metric overrides, and an edit control (pencil icon) on the Dashboard's Weekly Goals card that opens a modal to edit each goal's label and target. `GET /api/dashboard/goals` now merges user overrides over sensible defaults (the flashcard target still defaults dynamically from total flashcard count if not overridden).

### ⚠️ Study Sessions / Streaks — Partially implemented

- Sessions are logged and a streak endpoint exists, but there's no UI to start/stop sessions manually, and timezone handling for streaks is unverified.

### ❌ AI-assisted generation — Stub only

- `components/views/GenerateFromFile.tsx` exists but isn't wired into the flashcard/quiz creation flow.

### ⚠️ Import / Export — Partial

- CSV import works for flashcards and quizzes.
- No export functionality despite README implying it.

---

## Known Issues (from deleted `deployment-audit.md` / `missing-implementation.md`)

These files were removed from the repo but their gaps still apply:

1. OAuth JWT token issuance had edge cases — partially fixed via `/api/auth/exchange-session`.
2. Cookie-only auth migration still has localStorage cleanup remaining.
3. Rate limiting uses an in-memory `Map` — breaks under multiple server instances / serverless scale-out (needs Redis/Upstash).
4. No centralized logging/observability (no Sentry, etc.).
5. No E2E tests for the OAuth flow.
6. **(New)** Note image/cover uploads (`app/api/upload/route.ts`) write to the local filesystem (`public/uploads`) — fine for a single dev/VM instance, but ephemeral and unsafe on serverless or multi-instance deployments. Needs migration to object storage (S3/Cloudinary/Vercel Blob) before any such deployment.

---

## Priority Gaps to Close (to meet the stated goal)

1. ~~**Notes reading/editing experience**~~ — ✅ Done. Title, cover image, inline image/GIF upload-and-embed, reading time, and a `prose`-styled centered reading column were added (see Notes section above). Remaining smaller items (version history, WYSIWYG) are tracked separately, not blocking.
2. ~~Tag-based filtering UI for notes~~ — ✅ Already done (stale claim, corrected 2026-06-19; flashcards have tag filtering too).
3. ~~Finish spaced-repetition scheduling logic for flashcards~~ — ✅ Already done (stale claim, corrected 2026-06-19).
4. ~~Add edit flows for quizzes and flashcards~~ — ✅ Already done (stale claim, corrected 2026-06-19).
5. Move rate limiting to a shared store before any real deployment. *(still open)*
6. Move note image uploads off the local filesystem to object storage before any serverless/multi-instance deployment. *(still open)*
7. Wire up "Generate from File" (AI-assisted flashcard/quiz generation) — currently a dead button with no `onClick` in `TopicFlashcards.tsx`/`TopicQuizzes.tsx`. *(still open)*
8. Add export functionality (CSV import exists; no export despite README implying it). *(still open)*

---

## Naming — Decided: StudyNest ✅ Applied

Considered alternatives: PrepNest, PrepVault, Recallify, PrepDeck. **StudyNest** chosen — nods to the nested/hierarchical topic structure and reads as a general-purpose study tool, not just interview-specific.

**Rename applied to:**
- `package.json` → `name: "studynest"`
- `README.md` title, tagline, clone path, project tree root, Mongo URI example db name, Notes feature bullet
- `app/layout.tsx` → metadata `title: "StudyNest"`
- `app/page.tsx` → logged-out header wordmark

No `.env`/config references needed changing (none hardcoded the old name).

---

## Notes Rendering — "Medium / ByteByteGo" style research

Investigated how ByteByteGo presents content to see if that style is achievable here, and whether markdown is still the right underlying format.

**Finding:** The polished look (ByteByteGo, Medium, Substack) is a **typography/rendering concern, not a different storage format**. Under the hood these platforms store essentially markdown-equivalent rich text (headings, bold, lists, images, code, blockquotes). What creates the "nice" reading feel:

- Large hero/cover image at the top of the post
- Narrow content column (~650–700px) with generous line-height, clean sans-serif type
- Inline images/diagrams with captions breaking up text every few paragraphs
- Bold lead-ins on list items, blockquote-style callouts, styled code blocks
- Consistent whitespace/spacing rhythm

**Conclusion: keep markdown as the storage format** (portable, diffable, already wired up via `react-markdown` + GFM). To get the ByteByteGo/Medium look, the gap is purely on the rendering + authoring side:

1. ~~Add `@tailwindcss/typography` and wrap the rendered note in a `prose` column~~ — ✅ done (the plugin was already registered in `app/globals.css`; `NoteArticle.tsx` now wraps the rendered content in `prose prose-invert lg:prose-lg max-w-2xl mx-auto`).
2. ~~Add an image/GIF upload-and-insert flow~~ — ✅ done via `app/api/upload/route.ts` + `uploadAPI.uploadImage()`, exposed in both the note editor's "Insert image / GIF" control (writes `![](url)` into the markdown content) and the cover-image field. No Giphy-style picker was added — users paste a GIF URL or upload a GIF file directly, which is sufficient since markdown image syntax renders animated GIFs natively.
3. ~~Add a `coverImage` field + computed reading-time estimate~~ — ✅ done on the Note model and in both `NoteArticle.tsx` and `NoteList.tsx`.

This was priority gap #1 above — now implemented.

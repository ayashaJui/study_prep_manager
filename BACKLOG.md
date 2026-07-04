# Backlog

---

## Broken

- **Shuffle button does nothing** — `components/views/TopicFlashcards.tsx`. The Shuffle button has no `onClick` handler.

- **Search doesn't find content inside subtopics** — `app/page.tsx`. `handleSearchNavigate` navigates to `/?topic=${item.topicId}` but only searches root-level topics, so subtopic content silently falls back to the Dashboard.

- **Level 3+ subtopics are navigable to but render the Dashboard** — `app/page.tsx` `fetchTopics()` hardwires `subtopics: []` on level-2 items. Sub-sub-subtopics can be created but the navigation tree can't reach them.

---

## Incomplete

- **Flashcard tags can't be set or edited in the UI** — `components/views/TopicFlashcards.tsx`. The model, API, and grid all support tags but neither the create nor edit modal exposes a tag field.

- **Topics and subtopics have no rename, delete, or status-change controls** — `PATCH /api/topics/[id]` and `DELETE /api/topics/[id]` are implemented; nothing in the UI calls them.

- **Dashboard "Review 5 topics" goal actually counts notes created** — `app/api/dashboard/goals/route.ts` line 63. The metric label is misleading.

- **Level field stored incorrectly for sub-subtopics** — `components/views/SubtopicContent.tsx` line 138 hardcodes `level: 2` regardless of actual depth.

---

## Dead code / orphans

- **`subtopicAPI` in `lib/api.ts` is never imported and calls routes that don't exist** — targets `/topics/${topicId}/subtopics/...` which has no route files. Safe to delete.

- **`GenerateFromFile.tsx` is never imported anywhere** — was deferred AI feature, now orphaned. Safe to delete.

---

## Minor

- **Explore page empty state copy is wrong** — `app/public/page.tsx`. Says "subtopic" but sharing works for both topics and subtopics.

- **Sidebar only shows 2 levels of nesting** — sub-subtopics have no sidebar entry or active-highlight.

- **N+1 API calls on page load** — `app/page.tsx`. Fires `1 + N + (N×M)` sequential requests to build the topic tree. Noticeable on larger accounts.

- **CSV flashcard import hardcodes difficulty to medium and tags to ["imported"]** — `components/views/TopicFlashcards.tsx`.

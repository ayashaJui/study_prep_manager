# Backlog

---

## Broken

---

## Incomplete


- **Topics and subtopics have no rename, delete, or status-change controls** — `PATCH /api/topics/[id]` and `DELETE /api/topics/[id]` are implemented; nothing in the UI calls them.

---

## Minor

- **N+1 API calls on page load** — `app/page.tsx`. Fires `1 + N + (N×M)` sequential requests to build the topic tree. Noticeable on larger accounts.

- **CSV flashcard import hardcodes difficulty to medium and tags to ["imported"]** — `components/views/TopicFlashcards.tsx`.

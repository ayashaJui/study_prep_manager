# Backlog

---

## Broken

---

## Incomplete


- **Topics and subtopics have no rename, delete, or status-change controls** — `PATCH /api/topics/[id]` and `DELETE /api/topics/[id]` are implemented; nothing in the UI calls them.

---

## Dead code / orphans

---

## Minor

- **Explore page empty state copy is wrong** — `app/public/page.tsx`. Says "subtopic" but sharing works for both topics and subtopics.

- **N+1 API calls on page load** — `app/page.tsx`. Fires `1 + N + (N×M)` sequential requests to build the topic tree. Noticeable on larger accounts.

- **CSV flashcard import hardcodes difficulty to medium and tags to ["imported"]** — `components/views/TopicFlashcards.tsx`.

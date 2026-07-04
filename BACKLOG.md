# Backlog

---

## Broken

---

---

## Minor

- **N+1 API calls on page load** — `app/page.tsx`. Fires `1 + N + (N×M)` sequential requests to build the topic tree. Noticeable on larger accounts.

- **CSV flashcard import hardcodes difficulty to medium and tags to ["imported"]** — `components/views/TopicFlashcards.tsx`.

# Missing Features — Prioritized Backlog

---

## Do Next (High value, low effort)

- **Aggregate flashcard view** — one API change to accept multiple topicIds + a "Study All" button on the topic overview
- **Sort topics** — add a sort param to the existing topics API; sidebar sort control (alphabetical / date)
- **Quiz analytics UI** — attempt data is already stored in the model; needs a score-over-time chart and per-quiz history view

---

## Do Later (Medium effort, good payoff)

- **Short answer quiz type** — add to schema enum and quiz builder UI
- **Keyboard shortcuts** — single global hook (Ctrl+N new topic, Ctrl+F focus search, Escape close modal)
- **Image file upload in notes** — backend route already exists; wire up Cloudinary or similar free-tier storage and uncomment the upload button
- **Tag autocomplete** — enhance existing tag input to suggest previously used tags

---

## Low Priority (Nice to have)

- **Filter by content type** — add difficulty/type dropdown alongside existing tag filter badges
- **Study / focus mode** — make flashcard study modal full-screen; add study mode for quizzes
- **Quiz analytics** — average scores, track incorrect answers, performance trends (extends "Do Next" item above)
- **Export to Markdown** — useful for sharing notes outside the app
- **Import from Markdown** — complements Markdown export

---

## Cut (Not worth building)

- **AI features** — not free; no plans to integrate
- **Anki import/export** — CSV covers the use case; .apkg format is complex
- **PDF export** — low demand, high complexity
- **Backup / restore system** — MongoDB Atlas handles this at the infra level
- **Related content / "see also" links** — rarely used, adds UI complexity
- **Light mode** — dark theme is intentional; low ROI
- **Templates** — adds complexity before core gaps are closed

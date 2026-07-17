# StudyNest

**Frontend:** https://studynest-z0r3.onrender.com
**Backend API:** https://study-prep-manager-api.onrender.com/api
**API Docs (Swagger):** https://study-prep-manager-api.onrender.com/api/docs

A hierarchical study management system built for interview preparation and continuous learning. Organize topics and subtopics with notes, flashcards, quizzes, and a coding problems tracker — all in one place.

## Features

### Authentication

- Email/password registration and login with bcryptjs hashing
- JWT stored in an HttpOnly cookie (no localStorage)
- Password reset via email link (requires SMTP config)
- Rate limiting on auth endpoints

### Topics & Organization

- **Unlimited nesting** — create topics and subtopics to any depth
- **Status tracking** — mark topics as Not Started / In Progress / Review / Mastered
- **Completion percentage** — automatically recalculated from subtopic statuses when any child is updated
- **Favorites** — star topics for quick access from the Favorites view
- **Recursive delete** — deleting a topic with subtopics gives the option to remove the entire tree (all notes, flashcards, quizzes, and nested subtopics) in one action
- **Public sharing** — publish a read-only link for any topic or subtopic

### Notes

- Write in Markdown with a styled reading view (headings, code blocks, tables, images via URL)
- **Pin notes** to surface them in the global Pinned Notes view across all topics
- Import notes from a `.md` file; export any note back to Markdown

### Flashcards

- Front/back format with tag and difficulty tracking
- **Study mode** — flip cards, rate confidence (Easy / Medium / Hard), and schedule the next review
- SM-2 style spaced repetition scheduling
- Study sessions are recorded automatically when you finish a deck
- Bulk import from CSV

### Quizzes

- Multiple-choice questions with optional multi-answer support
- Per-question explanations, point values, and tags
- Time limits and difficulty levels
- Score tracking with attempt history
- Study sessions recorded automatically on submit, including score and duration
- Bulk import from CSV

### Problems Tracker

- Track LeetCode and other platform problems linked to any topic or globally
- Fields: title, platform, problem number, URL, difficulty, status, tags, notes/approach/intuition, time & space complexity, language
- **Statuses**: Unsolved / Attempted / Solved — shown with color-coded icons
- **SRS review scheduling** — after solving a problem, schedule the next review:
  - Easy → +7 days, Medium → +3 days, Hard → +1 day, Again → now
- **Review Queue** — filtered view of all problems due for review today
- **Filters** — filter the full list by topic, difficulty, status, or platform
- Problems tab inside every topic and subtopic, pre-filtered to that scope

### Study Session History

- Sessions are logged automatically when you finish a flashcard deck, submit a quiz, or create a note
- Manual study sessions can be started from the Dashboard
- History view with pagination, showing activity type, duration, score, and date
- Streak tracking (daily)

### Global Search

- Searches across topics, notes, flashcards, and quizzes simultaneously
- Keyboard navigation (↑ ↓ Enter) in the results dropdown
- Ctrl+F to focus the search box from anywhere

### Dashboard

- Summary stats (topic count, notes, flashcards, quizzes)
- Recent activity feed
- Topic progress overview
- Weekly goals

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React 19, TypeScript |
| Backend | NestJS 10, TypeScript |
| Styling | Tailwind CSS v4 |
| Database | MongoDB with Mongoose |
| Auth | Custom JWT (HttpOnly cookie), bcryptjs |
| Email | Nodemailer (Gmail SMTP) |
| API Docs | Swagger UI (`@nestjs/swagger`) |
| Icons | Lucide React |
| Markdown | react-markdown with GFM |

## Architecture

The project is split into two services:

```
interview_prep/
├── app/                  # Next.js frontend (pages, components, contexts)
├── backend/              # NestJS API server (separate Node.js process)
│   └── src/
│       ├── auth/
│       ├── topics/
│       ├── notes/
│       ├── flashcards/
│       ├── quizzes/
│       ├── problems/
│       ├── study-sessions/
│       ├── dashboard/
│       ├── search/
│       ├── upload/
│       └── public/
└── scripts/              # Database utilities (seed, clear)
```

The frontend talks to the backend via `NEXT_PUBLIC_API_URL`. In development both run locally on different ports. In production they are deployed as two separate Render Web Services.

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
git clone <repository-url>
cd interview_prep

# Install frontend dependencies
npm install

# Install backend dependencies
npm install --prefix backend
```

### Environment variables

**Frontend** — create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Backend** — create `.env` inside `backend/`:

```env
MONGODB_URI=mongodb://localhost:27017/studynest
JWT_SECRET=your-jwt-secret-change-this

# Optional – password reset emails (Gmail SMTP)
EMAIL_USER=you@gmail.com
EMAIL_PASSWORD=your-app-password

# Optional – restrict CORS to your frontend URL
FRONTEND_URL=http://localhost:3000
```

### Run both servers

```bash
# Start frontend (port 3000) and backend (port 3001) together
npm run dev:all

# Or start separately
npm run dev          # frontend only
npm run dev:backend  # backend only
```

Open http://localhost:3000. The Swagger docs are at http://localhost:3001/api/docs.

### Seed Sample Data

The seed script connects directly to MongoDB and creates two demo accounts so you can test all features and verify data isolation between users.

```bash
node scripts/seed-sample-data.js
```

**User 1 — Sample User** (full DSA + System Design data)

```
Email:    sample.user@example.com
Password: SamplePass123!
```

| Data | Count | Notes |
|---|---|---|
| Root topics | 3 | DSA ⭐, System Design ⭐, Behavioral |
| Subtopics | 9 | Arrays, Two Pointers, Sliding Window, DP, Trees, Caching, Databases, STAR, Leadership |
| Notes | 11 | 2 pinned (visible in Pinned Notes view) |
| Flashcards | 12 | Mix of statuses and SRS intervals |
| Quizzes | 4 | 3 questions each with explanations |
| Problems | 16 | Easy/Medium/Hard, all statuses, 5 due for Review Queue |
| Study sessions | 19 | Last 14 days — all 4 activity types |

**User 2 — Alex Dev** (Frontend/Backend data)

```
Email:    alex.dev@example.com
Password: AlexPass123!
```

| Data | Count | Notes |
|---|---|---|
| Root topics | 2 | Frontend ⭐, Backend |
| Subtopics | 2 | React Hooks, Performance |
| Notes | 3 | 1 pinned |
| Flashcards | 3 | React hooks + performance |
| Quizzes | 1 | React Hooks quiz |
| Problems | 3 | 1 due for Review Queue |
| Study sessions | 6 | Last 5 days |

To clear all seed data:

```bash
node scripts/seed-sample-data.js --clear
```

The seed script reads `MONGODB_URI` from `.env.local` at the project root.

## Scripts

```bash
# Development
npm run dev          # start Next.js frontend (port 3000)
npm run dev:backend  # start NestJS backend (port 3001)
npm run dev:all      # start both concurrently

# Build & lint (frontend)
npm run build        # production build
npm run lint         # ESLint

# Tests
npm test             # run Vitest tests

# Database utilities
node scripts/seed-sample-data.js          # seed demo data
node scripts/seed-sample-data.js --clear  # clear demo data
```

## CSV Import Format

**Flashcards** (comma, pipe, or tab separated):
```
Front Question,Back Answer
What is React?,A JavaScript library for building UIs
```

**Quizzes**:
```
Question,Option1,Option2,Option3,Option4,CorrectAnswer(0-3)
What is React?,A library,A framework,A database,A server,0
```

## Deployment

The app is deployed as **two separate Render Web Services**.

### Frontend (Next.js)

| Setting | Value |
|---|---|
| Root directory | *(project root)* |
| Build command | `npm install && npm run build` |
| Start command | `npm start` |

Environment variables:
```
NEXT_PUBLIC_API_URL=https://<your-backend>.onrender.com/api
```

### Backend (NestJS)

| Setting | Value |
|---|---|
| Root directory | `backend` |
| Build command | `npm install && npm run build` |
| Start command | `node dist/main` |

Environment variables:
```
MONGODB_URI=<your Atlas connection string>
JWT_SECRET=<strong random secret>
NODE_ENV=production
FRONTEND_URL=https://<your-frontend>.onrender.com
EMAIL_USER=<gmail address>          # optional
EMAIL_PASSWORD=<gmail app password> # optional
```

## License

MIT

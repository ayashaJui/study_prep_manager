# StudyNest

**Live:** https://studynest-z0r3.onrender.com

A hierarchical study management system built for interview preparation and continuous learning. Organize topics and subtopics with notes, flashcards, quizzes, and a coding problems tracker — all in one place.

## Features

### Authentication

- Email/password registration and login with bcryptjs hashing
- Password reset via email link (requires SMTP config)
- OAuth support for Google/GitHub — implemented but disabled by default; see [docs/OAUTH_SETUP.md](./docs/OAUTH_SETUP.md) to enable
- JWT-protected API routes with rate limiting on auth endpoints

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
| Framework | Next.js (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Database | MongoDB with Mongoose |
| Auth | Custom JWT + NextAuth.js, bcryptjs |
| Email | Nodemailer (Gmail SMTP) |
| Icons | Lucide React |
| Markdown | react-markdown with GFM |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
git clone <repository-url>
cd interview_prep
npm install
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/studynest
JWT_SECRET=your-jwt-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional – password reset emails (Gmail SMTP)
EMAIL_USER=you@gmail.com
EMAIL_PASSWORD=your-app-password

# Optional – OAuth (disabled by default)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

```bash
npm run dev
# open http://localhost:3000
```

### Seed Sample Data

The seed script creates **two demo accounts**, each with independent data, so you can test all features and verify data isolation between users.

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

To clear all seed data (both users):

```bash
node scripts/seed-sample-data.js --clear
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/              # register, login, logout, profile, password reset
│   │   ├── topics/            # CRUD + share + recursive delete
│   │   ├── notes/             # CRUD + import/export markdown
│   │   ├── flashcards/        # CRUD + import CSV + SRS review
│   │   ├── quizzes/           # CRUD + import CSV
│   │   ├── problems/          # CRUD + SRS review scheduling
│   │   ├── study-sessions/    # history + streak
│   │   ├── search/            # global search
│   │   ├── dashboard/         # stats, activity, progress, goals
│   │   └── public/            # read-only shared topic pages
│   ├── auth/                  # login, register, password reset pages
│   ├── public/                # public shared topic viewer
│   └── page.tsx               # main app (SPA-style with URL state)
├── components/
│   ├── layout/                # Header, Sidebar, MainContent, Breadcrumb
│   ├── ui/                    # Button, Card, Input, Modal, Tabs, Badge, etc.
│   └── views/                 # ProblemsPage, TopicProblems, TopicNotes,
│                              # TopicFlashcards, TopicQuizzes, Dashboard,
│                              # StudySessionHistory, FavoriteTopics, etc.
├── controllers/               # Business logic (topicController, problemController, …)
├── models/                    # Mongoose schemas (Topic, Note, Flashcard, Quiz,
│                              # Problem, StudySession, User)
├── hooks/                     # useNavigation, useKeyboardShortcuts
├── contexts/                  # AuthContext, ToastContext
├── lib/                       # api.ts (client), db.ts (connection), auth helpers
└── scripts/
    └── seed-sample-data.js    # demo data for all features
```

## API Reference

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset with token |

### Topics
| Method | Path | Description |
|---|---|---|
| GET | `/api/topics` | All topics (pass `parentId` to filter children) |
| POST | `/api/topics` | Create topic |
| GET | `/api/topics/[id]` | Get by ID |
| PATCH | `/api/topics/[id]` | Update topic |
| DELETE | `/api/topics/[id]` | Delete topic (`?recursive=true` to delete with all children) |
| POST | `/api/topics/[id]/share` | Publish and get share link |
| DELETE | `/api/topics/[id]/share` | Unpublish |

### Notes
| Method | Path | Description |
|---|---|---|
| GET | `/api/notes?topicId=` | List notes |
| POST | `/api/notes` | Create note |
| PATCH | `/api/notes/[id]` | Update note |
| DELETE | `/api/notes/[id]` | Delete note |

### Flashcards
| Method | Path | Description |
|---|---|---|
| GET | `/api/flashcards?topicId=` | List flashcards |
| POST | `/api/flashcards` | Create flashcard |
| POST | `/api/flashcards/import` | Bulk import from CSV |
| PATCH | `/api/flashcards/[id]` | Update flashcard |
| DELETE | `/api/flashcards/[id]` | Delete flashcard |
| POST | `/api/flashcards/[id]/review` | Submit confidence rating and schedule next review |

### Quizzes
| Method | Path | Description |
|---|---|---|
| GET | `/api/quizzes?topicId=` | List quizzes |
| POST | `/api/quizzes` | Create quiz |
| POST | `/api/quizzes/import` | Bulk import from CSV |
| PATCH | `/api/quizzes/[id]` | Update quiz |
| DELETE | `/api/quizzes/[id]` | Delete quiz |

### Problems
| Method | Path | Description |
|---|---|---|
| GET | `/api/problems` | List problems (filters: `topicId`, `difficulty`, `status`, `platform`, `due=true`) |
| POST | `/api/problems` | Create problem |
| GET | `/api/problems/[id]` | Get by ID |
| PATCH | `/api/problems/[id]` | Update problem |
| DELETE | `/api/problems/[id]` | Delete problem |
| POST | `/api/problems/[id]/review` | Submit review confidence (easy/medium/hard/again) |

### Study Sessions
| Method | Path | Description |
|---|---|---|
| GET | `/api/study-sessions` | Paginated history |
| POST | `/api/study-sessions` | Log a session |
| GET | `/api/study-sessions/streak` | Current daily streak |

### Search & Dashboard
| Method | Path | Description |
|---|---|---|
| GET | `/api/search?query=` | Search topics, notes, flashcards, quizzes |
| GET | `/api/dashboard/stats` | Summary counts |
| GET | `/api/dashboard/activity` | Recent activity feed |
| GET | `/api/dashboard/progress` | Topic progress |

## Scripts

```bash
npm run dev          # start development server
npm run build        # production build
npm run lint         # lint
npm test             # run Vitest tests
npm run db:seed      # seed sample data
npm run db:clear     # clear seed data
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

Set these environment variables in production:

```
MONGODB_URI
JWT_SECRET
NEXTAUTH_SECRET
NEXTAUTH_URL
NEXT_PUBLIC_APP_URL
EMAIL_USER          # if using password reset
EMAIL_PASSWORD      # Gmail app password
```

## License

MIT

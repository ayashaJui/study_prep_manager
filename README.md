<div align="center">

# 🎯 StudyNest

**Your personal interview prep command center**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-studynest-667eea?style=for-the-badge&logo=render&logoColor=white)](https://studynest-z0r3.onrender.com)
[![API Docs](https://img.shields.io/badge/API%20Docs-Swagger-85ea2d?style=for-the-badge&logo=swagger&logoColor=black)](https://study-prep-manager-api.onrender.com/api/docs)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)

Organize topics and subtopics with notes, flashcards, quizzes, and a coding problems tracker — all in one place. Built for interview preparation and continuous learning.

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📚 Topics & Organization
- Unlimited nesting — topics and subtopics to any depth
- Status tracking: Not Started → In Progress → Review → Mastered
- Auto-calculated completion percentage from subtopics
- ⭐ Favorites for quick access
- Recursive delete (removes entire subtree in one click)
- Public sharing — publish a read-only link for any topic

</td>
<td width="50%">

### 📝 Notes
- Markdown editor with full GFM rendering
- Code blocks, tables, images via URL
- 📌 Pin notes to surface them across all topics
- Import from `.md` file, export back to Markdown

### 🃏 Flashcards
- Front/back format with tags and difficulty
- SM-2 spaced repetition scheduling
- Study mode with Easy / Medium / Hard confidence rating
- Bulk import from CSV

</td>
</tr>
<tr>
<td width="50%">

### 📊 Quizzes
- Multiple-choice with optional multi-answer support
- Per-question explanations, point values, and tags
- Time limits and difficulty levels
- Score history and study sessions recorded on submit
- Bulk import from CSV

### 💻 Problems Tracker
- Track LeetCode and other platform problems
- SRS review scheduling after solving (Easy/Medium/Hard/Again)
- Review Queue — all problems due today
- Filter by topic, difficulty, status, or platform

</td>
<td width="50%">

### 🔍 Global Search
- Searches topics, notes, flashcards, and quizzes simultaneously
- Keyboard navigation (↑ ↓ Enter) in the dropdown
- `Ctrl+F` to focus from anywhere

### 📈 Dashboard
- Summary stats, recent activity feed
- Topic progress overview and weekly goals
- Daily streak tracking
- Manual study session timer

</td>
</tr>
</table>

### 🔐 Authentication
Cookie-based JWT auth (HttpOnly) — no localStorage, no NextAuth. Rate-limited login/register, password reset via email link.

---

## 🛠 Tech Stack

| | Frontend | Backend |
|---|---|---|
| **Framework** | Next.js 16 (App Router) + React 19 | NestJS 10 |
| **Language** | TypeScript | TypeScript |
| **Styling** | Tailwind CSS v4 | — |
| **Database** | — | MongoDB + Mongoose |
| **Auth** | Cookie + fetch `credentials: include` | JWT (HttpOnly cookie) + bcryptjs |
| **Email** | — | Nodemailer (Gmail SMTP) |
| **API Docs** | — | Swagger (`@nestjs/swagger`) |
| **Icons** | Lucide React | — |
| **Markdown** | react-markdown + GFM | — |

---

## 🏗 Architecture

Two separate services — a Next.js frontend and a NestJS REST API:

```
interview_prep/
├── app/                    # Next.js pages and layouts
├── components/             # UI components (Button, Card, Modal, Tabs…)
├── contexts/               # AuthContext, ToastContext
├── hooks/                  # useNavigation, useKeyboardShortcuts
├── lib/                    # api.ts (all API calls), errorHandler.ts
├── backend/                # NestJS API (separate Node.js process)
│   └── src/
│       ├── auth/           # login, register, logout, password reset
│       ├── topics/         # CRUD + sharing + recursive delete
│       ├── notes/          # CRUD + import/export markdown
│       ├── flashcards/     # CRUD + CSV import + SRS review
│       ├── quizzes/        # CRUD + CSV import + scoring
│       ├── problems/       # CRUD + SRS review scheduling
│       ├── study-sessions/ # history + streak
│       ├── dashboard/      # stats, activity, progress, goals
│       ├── search/         # global full-text search
│       ├── upload/         # image upload
│       └── public/         # read-only shared topic pages
└── scripts/                # seed and clear database utilities
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))

### 1. Clone and install

```bash
git clone https://github.com/ayashaJui/study_prep_manager.git
cd study_prep_manager

npm install                       # frontend deps
npm install --prefix backend      # backend deps
```

### 2. Configure environment

**Frontend** — copy `.env.local.example` to `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
MONGODB_URI=mongodb://localhost:27017/studynest   # for seed scripts only
```

**Backend** — copy `backend/.env.example` to `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/studynest
JWT_SECRET=your-strong-secret-here
FRONTEND_URL=http://localhost:3000

# Optional — enables password reset emails
EMAIL_USER=you@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

### 3. Start both servers

```bash
npm run dev:all
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api |
| Swagger Docs | http://localhost:3001/api/docs |

> You can also start them separately: `npm run dev` and `npm run dev:backend`

---

## 🌱 Seed Sample Data

Load two pre-built demo accounts with a full dataset to explore every feature:

```bash
node scripts/seed-sample-data.js
```

<details>
<summary><strong>User 1 — Sample User</strong> (DSA + System Design)</summary>

```
Email:    sample.user@example.com
Password: SamplePass123!
```

| Data | Count |
|---|---|
| Root topics | 3 (DSA ⭐, System Design ⭐, Behavioral) |
| Subtopics | 9 |
| Notes | 11 (2 pinned) |
| Flashcards | 12 |
| Quizzes | 4 |
| Problems | 16 (5 due for Review Queue) |
| Study sessions | 19 (last 14 days) |

</details>

<details>
<summary><strong>User 2 — Alex Dev</strong> (Frontend + Backend)</summary>

```
Email:    alex.dev@example.com
Password: AlexPass123!
```

| Data | Count |
|---|---|
| Root topics | 2 (Frontend ⭐, Backend) |
| Notes | 3 (1 pinned) |
| Flashcards | 3 |
| Problems | 3 (1 due for Review Queue) |
| Study sessions | 6 (last 5 days) |

</details>

```bash
# Clear all seed data
node scripts/seed-sample-data.js --clear
```

---

## 📦 Scripts

```bash
npm run dev            # start frontend (port 3000)
npm run dev:backend    # start backend  (port 3001)
npm run dev:all        # start both concurrently

npm run build          # production build (frontend)
npm run lint           # ESLint
npm test               # Vitest

node scripts/seed-sample-data.js          # seed demo data
node scripts/seed-sample-data.js --clear  # clear demo data
```

---

## 📥 CSV Import Formats

<details>
<summary>Flashcards</summary>

Comma, pipe, or tab separated:
```
Front Question,Back Answer
What is a hash map?,A key-value data structure with O(1) average lookup
What is Big O notation?,A way to describe algorithm time/space complexity
```

</details>

<details>
<summary>Quizzes</summary>

```
Question,Option1,Option2,Option3,Option4,CorrectAnswer(0-3)
What is React?,A library,A framework,A database,A server,0
```

</details>

---

## ☁️ Deployment (Render)

The app runs as **two separate Render Web Services**.

### Frontend

| Setting | Value |
|---|---|
| Root directory | *(project root)* |
| Build command | `npm install && npm run build` |
| Start command | `npm start` |

```
NEXT_PUBLIC_API_URL = https://<your-backend>.onrender.com/api
```

### Backend

| Setting | Value |
|---|---|
| Root directory | `backend` |
| Build command | `npm install && npm run build` |
| Start command | `node dist/main` |

```
MONGODB_URI   = <Atlas connection string>
JWT_SECRET    = <strong random secret>
NODE_ENV      = production
FRONTEND_URL  = https://<your-frontend>.onrender.com
EMAIL_USER    = <optional>
EMAIL_PASSWORD= <optional>
```

> **Note:** `NEXT_PUBLIC_API_URL` is baked in at build time — after changing it, trigger a **Manual Deploy** (full rebuild) on the frontend service.

---

## 📄 License

MIT © [ayashaJui](https://github.com/ayashaJui)

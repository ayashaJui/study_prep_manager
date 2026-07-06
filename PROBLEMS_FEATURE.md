  # Problems Feature Plan

Track LeetCode and other coding problems linked to your study topics, with notes, approach, and a lightweight review queue.

---

## Data Model — `Problem`

```ts
{
  userId:          ObjectId,          // owner
  topicId:         ObjectId | null,   // links to any topic or subtopic
  title:           string,            // e.g. "Two Sum"
  platform:        string,            // free text: "LeetCode", "Codeforces", …
  problemNumber:   string?,           // e.g. "1", "42"
  url:             string?,           // link to the problem page
  difficulty:      "easy" | "medium" | "hard",
  status:          "unsolved" | "attempted" | "solved",
  tags:            string[],          // e.g. ["two pointers", "hash map"]
  notes:           string?,           // approach, intuition, observations
  timeComplexity:  string?,           // e.g. "O(n)"
  spaceComplexity: string?,           // e.g. "O(1)"
  language:        string?,           // e.g. "Python"
  // Review scheduling (simple interval-based)
  nextReview:      Date?,
  reviewInterval:  number?,           // days until next review
  reviewCount:     number,            // default 0
  lastReviewedAt:  Date?,
  createdAt:       Date,
  updatedAt:       Date,
}
```

---

## Decisions

- **Default status on add**: "unsolved" — but the form lets you set "solved" when logging a problem you've already done
- **Review queue eligibility**: problems with status "solved" OR "attempted"
- **Topic link**: optional — problems can exist without a topic (general backlog)
- **Detail layout**: right-side drawer panel; list stays visible on the left

---

## Review System

When a problem is marked for review, the user picks a confidence level:

| Button | Interval |
|--------|----------|
| Easy   | +7 days  |
| Medium | +3 days  |
| Hard   | +1 day   |
| Again  | due now  |

A **Review Queue** badge on the sidebar shows how many problems are due today (`nextReview <= now`).
Review is available on any problem with status **solved** or **attempted**.

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/problems` | List problems; supports `?topicId=`, `?status=`, `?difficulty=`, `?due=true` |
| POST | `/api/problems` | Create problem |
| GET | `/api/problems/:id` | Get single problem |
| PATCH | `/api/problems/:id` | Update problem |
| DELETE | `/api/problems/:id` | Delete problem |
| POST | `/api/problems/:id/review` | Submit review → updates `nextReview`, `reviewInterval`, `lastReviewedAt` |

---

## UI Entry Points

### 1. Global Problems Page (sidebar nav)
- Table/list with columns: title, platform, difficulty, status, topic, next review
- Filter bar: topic (dropdown tree), platform, difficulty, status, tags
- "Add Problem" button → modal form
- Review Queue sub-view: problems with `nextReview <= today`
- Click a row → opens detail panel (right side or full page)

### 2. Problems Tab (inside each topic/subtopic)
- New "Problems" tab added to `TopicContent` and `SubtopicContent`
- Shows only problems linked to that specific topic
- "Add Problem" pre-fills the `topicId`

### 3. Problem Detail Panel (right-side drawer)
- Slides in from the right when a problem row is clicked; list stays visible on the left
- Title, platform+number (with clickable URL link), difficulty badge, status dropdown
- Tags, language, time/space complexity
- Notes textarea (approach, intuition, edge cases)
- Review section: last reviewed, next due date, review count
- Review buttons: Easy / Medium / Hard / Again (shown when status = solved OR attempted)

---

## New Files

```
models/Problem.ts
controllers/problemController.ts
app/api/problems/route.ts
app/api/problems/[id]/route.ts
app/api/problems/[id]/review/route.ts
components/views/ProblemsPage.tsx        ← global problems list
components/views/ProblemDetail.tsx       ← detail panel / form
components/views/TopicProblems.tsx       ← problems tab in topic/subtopic
```

## Existing Files to Modify

```
lib/api.ts                   — add problemsAPI
app/page.tsx                 — add Problems sidebar link + route
components/views/TopicContent.tsx      — add Problems tab
components/views/SubtopicContent.tsx   — add Problems tab
```

---

## Implementation Order

1. `models/Problem.ts`
2. `controllers/problemController.ts`
3. API routes (`/api/problems`, `/api/problems/[id]`, `/api/problems/[id]/review`)
4. `lib/api.ts` — `problemsAPI`
5. `components/views/ProblemDetail.tsx` — add/edit form + detail view combined
6. `components/views/TopicProblems.tsx` — problems tab (add + list for one topic)
7. Wire Problems tab into `TopicContent` + `SubtopicContent`
8. `components/views/ProblemsPage.tsx` — global list with filters
9. Sidebar nav + routing in `app/page.tsx`

# Pre-Deployment Issues

## Critical

### 1. Quiz `correctAnswer` exposed to unauthenticated users
**File:** `app/api/public/topics/[shareId]/route.ts:62`

The public topic API returns `correctAnswer` for every quiz question in the response payload. The "login to take quiz" restriction is frontend-only — anyone can `curl` the endpoint and see all answers without logging in.

**Options:**
- Strip `correctAnswer` from the public response and add an authenticated POST endpoint for server-side grading.
- Short-term: only include `correctAnswer` in the response when the request is authenticated.

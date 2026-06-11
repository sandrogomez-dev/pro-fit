# AGENTS.md — Supabase backend

> Backend rules for the gym app. Read alongside the root `AGENTS.md`.
> Security rules in the root file are non-negotiable and apply here too.

## 1. Scope

Database schema, RLS policies, Auth, and Edge Functions. No business UI logic here.

## 2. Auth

- Supabase Auth. Providers: **email + Google**.
- On signup, a `profiles` row is created (DB trigger) keyed to `auth.users.id`.
- Never store passwords or tokens ourselves — that is Supabase's job.

## 3. Data model (MVP)

| Table          | Key fields                                                        |
|----------------|-------------------------------------------------------------------|
| `profiles`     | `id` (= auth.users.id), `display_name`, `is_premium`, `created_at`|
| `routines`     | `id`, `user_id`, `name`, `created_at`                             |
| `exercises`    | `id`, `routine_id`, `user_id`, `name`, `target_sets`, `target_reps`, `order` |
| `workout_logs` | `id`, `user_id`, `exercise_id`, `set_number`, `reps`, `weight`, `done`, `performed_at` |
| `prs`          | `id`, `user_id`, `exercise_name`, `value`, `unit`, `achieved_at` |
| `ai_usage`     | `id`, `user_id`, `usage_date`, `count`  ← server-side rate limiting |

Every table carries `user_id` so RLS can scope rows to their owner.

## 4. RLS — every table, no exceptions

- **Enable RLS on every table.** Default: no access.
- Standard policy for select / insert / update / delete:
  `user_id = auth.uid()`.
- `profiles`: a user can read/update only their own row (`id = auth.uid()`).
- Never write a policy that exposes another user's rows.
- Ship RLS policies **in the same migration** that creates the table.

## 5. Edge Functions

### `deepseek-substitute`
The only place the DeepSeek API key is ever used.

**Input:** `{ exercise: string, equipment?: string, reason?: string }` + the user's JWT.

**Flow:**
1. Verify the JWT → resolve `user_id`. Reject if missing/invalid.
2. Read `ai_usage` for `user_id` + today. If `count >= 5`, return **429** (limit reached).
3. Validate and sanitize inputs.
4. Call DeepSeek using `DEEPSEEK_API_KEY` from function secrets.
   - Prompt it to return **3 alternatives with the same movement pattern**.
5. Increment `ai_usage` for today (atomic upsert).
6. Return the 3 alternatives only. **Never** return the key, prompt internals, or errors verbatim.

The rate limit lives here, not in the app. The app showing "5 left" is cosmetic.

## 6. Migrations

- All schema changes via versioned SQL in `/supabase/migrations`.
- Each migration is idempotent where possible and includes its RLS policies.
- No manual changes in the dashboard that aren't captured as a migration.

## 7. Secrets

- `DEEPSEEK_API_KEY` (and any future keys) set via `supabase secrets set`.
- Never in the repo, never returned to the client, never logged.

## 8. Definition of done (backend)

- RLS enabled + per-user policy on every new table
- Edge function verifies JWT, enforces the rate limit, validates input
- No secret leaves the server
- Migration committed (no dashboard-only changes)

## 9. DeepSeek call contract (inside `deepseek-substitute`)

- **Model:** `deepseek-v4-flash` (cheap, non-thinking mode). OpenAI-compatible endpoint.
- **System prompt (fixed):**
  > You suggest substitute gym exercises. Given an exercise and optional available
  > equipment, return exactly 3 alternatives that train the same primary movement
  > pattern and the same main muscle groups. Respond with ONLY valid JSON, no markdown,
  > no commentary.
- **Required output shape (validate before returning):**
  ```json
  {
    "alternatives": [
      { "name": "string", "equipment": "string", "why": "short string" }
    ]
  }
  ```
  Must contain **exactly 3** items.
- **Parsing:** strip any ``` fences, `JSON.parse`, then validate the shape and the count.
  If parsing fails or count != 3, retry once; if it still fails, return a clean 502 to the
  app (never expose raw model output or errors).
- The key (`DEEPSEEK_API_KEY`) is read from function secrets and never returned.

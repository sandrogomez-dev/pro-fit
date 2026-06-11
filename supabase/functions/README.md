# /supabase/functions — Edge Functions

Server-side only. The DeepSeek API key lives here as a function secret and is the
**only** place it is ever used (`/supabase/AGENTS.md` §5, §9).

Planned:

- `deepseek-substitute` — JWT-verified, server-side rate limited (5/user/day),
  returns exactly 3 exercise alternatives. Never returns the key or raw model output.

Empty until the Supabase project exists (SETUP.md pending).

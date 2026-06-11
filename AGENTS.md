# AGENTS.md — Gym Training App (brand name TBD)

> Instructions for any AI coding agent working on this repo.
> Read this file fully before writing code. When in doubt, STOP and ask the human.

## 1. Project overview

A mobile app (iOS + Android) for tracking gym workouts.

**Core promise:** the cleanest, fastest way to log a workout, with a smart rest
timer and an AI that swaps an exercise when a machine is taken.

Solo developer, AI-assisted. Optimize for **simple, shippable, maintainable**.
Prefer boring, proven solutions over clever ones.

## 2. Tech stack (do NOT change without explicit human approval)

- **React Native + Expo** (managed workflow)
- **TypeScript** (strict mode)
- **Supabase**: Auth (email + Google), Postgres, Edge Functions
- **AI**: DeepSeek — accessed ONLY through a Supabase Edge Function, never from the client
- **State**: local-first store (Zustand) + on-device persistence (MMKV or AsyncStorage),
  with background sync to Supabase

## 3. MVP scope — build ONLY this

1. **Auth** — email + Google sign-in
2. **Routines & exercises** — free: up to 3 routines; premium: unlimited
3. **Workout logging** — series, reps, weight, a green "done" check per set
4. **Rest timer / interval** — auto-starts when a set is marked done; vibrates at
   zero **even when the screen is locked**
5. **PRs / progress** — record and view personal records and history
   (basic logging is free; **history + progress charts are premium**)
6. **AI exercise substitution** — premium feature (free users may unlock one via a
   rewarded ad). Hard cap **5 calls/user/day, enforced server-side**.

## 4. OUT of scope — do NOT build (even if it looks easy)

- Any **social** feature: feed, friends, profiles, comments, sharing → **Phase 2**
- **AI routine generation / coaching** → later
- Anything not listed in section 3

If a task starts drifting toward these, STOP and ask the human first.

## 5. Golden security rules (non-negotiable)

1. **No secret or API key ever in the client bundle.** The DeepSeek key exists only
   as a Supabase Edge Function secret.
2. **Row Level Security (RLS) is ENABLED on every table.** Default deny. A user can
   only read/write rows where `user_id = auth.uid()`.
3. **The AI rate limit (5/day) is enforced server-side** in the Edge Function. Never
   trust a limit computed on the client.
4. **Validate all inputs** inside Edge Functions before use.
5. **Secrets via environment variables only.** Never commit `.env`; it stays in
   `.gitignore`.
6. **GDPR:** collect minimal personal data; provide account + data deletion; ship a
   privacy policy. (We are in the EU.)

## 6. Offline-first (critical — this is a GYM app, signal is bad)

- The **timer** and **workout logging** MUST work with no connectivity.
- Writes go to the **local store first (optimistic)** and never block on the network.
- A **sync service** reconciles with Supabase when the connection returns.
- Treat the server as the source of truth on conflict, but never lose a logged set.

## 7. Folder structure

```
/src
  /features          # one folder per feature: timer, workouts, prs, ai-substitution
                     # a feature owns its screens, components, hooks, types
  /components        # shared, presentational UI (buttons, cards, inputs)
  /services          # supabase client, edge-function calls, sync service
  /hooks             # shared reusable logic
  /store             # global state (local-first, persisted)
  /types             # shared TypeScript types
  /theme             # design tokens: colors, spacing, typography
/supabase
  /migrations        # versioned SQL schema (see /supabase/AGENTS.md)
  /functions         # edge functions, incl. the DeepSeek proxy
```

## 8. Conventions

- TypeScript strict. No `any` without a written reason.
- **Components are presentational.** Business logic lives in hooks/services.
- **All Supabase access goes through `/services`.** No direct supabase calls in components.
- One feature per folder under `/features`.
- **No hardcoded colors, spacing or font sizes in components** — use tokens from `/theme`.
- Small files, clear names, no dead code.

## 9. Design rules

- **Dark mode by default.**
- **Large tap targets.** Must be usable sweaty, one-handed, mid-set, at a glance.
- Avant-garde but **functional** — never trade in-gym usability for aesthetics.
- Design tokens centralized in `/theme`.

## 10. Commands (wire up as configured)

- Install: `npm install`
- Run: `npx expo start`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`

## 11. Definition of done (per feature)

- Works offline where applicable (section 6)
- RLS verified for any new table (default deny + per-user policy)
- No secret in the client
- Typechecks and lints clean
- Manually tested on both iOS and Android

## 12. MVP implementation decisions (read before coding)

These resolve ambiguities so the agent does not improvise:

- **Navigation:** Expo Router (file-based). Do not hand-roll React Navigation.
- **Local persistence:** AsyncStorage for the MVP (no native build friction).
  MMKV can replace it later behind the same service interface.
- **Premium is STUBBED for now.** No in-app purchases / RevenueCat yet. Gate premium
  features off the `profiles.is_premium` boolean, which is toggled manually for testing.
  Real payments are a later phase — do NOT wire StoreKit / Play Billing now.
- **Ads are DEFERRED.** No AdMob / rewarded ads in the MVP. Ship free + (stubbed) premium
  first. Rewarded-ad unlock for AI comes later.
- **Auth:** email/password works out of the box. Google sign-in needs OAuth setup
  (see SETUP.md). If that setup is not done, ship **email-first** and add Google after.
- **Exercises:** free-text names in the MVP. No built-in exercise catalog.
- **PRs:** auto-derived from `workout_logs` (best weight per exercise), not hand-entered.
  A manual override can come later.
- **Units:** store a unit per record; default kg. Keep a user-level preference.
- **App identity:** use a provisional app name + bundle id (e.g. `com.placeholder.gymapp`)
  if the brand is not named yet. Renaming later is fine.

## 13. Rest timer — the tricky bit (don't get this wrong)

A plain JS `setInterval` does NOT run reliably when the app is backgrounded or the
screen is locked, so it cannot be trusted to vibrate at zero. Implement it as:

1. On set complete, **schedule a local notification** (`expo-notifications`) for
   `now + restSeconds`, with sound + vibration. This fires even when locked.
2. If the app is in the foreground at expiry, also fire a haptic + the visual countdown.
3. If the user starts the next set early, **cancel** the scheduled notification.

Treat the notification as the source of truth for "time's up", the on-screen countdown
as cosmetic.

## 14. Environment variables (contract)

App (Expo, public — safe to expose, protected by RLS):
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Edge Function secrets (server-side only, NEVER in the app):
- `DEEPSEEK_API_KEY`

Google sign-in (only if enabled): client IDs per platform, configured in Supabase Auth
and Google Cloud (see SETUP.md). Keep a `.env.example` listing every key with empty values;
never commit the real `.env`.

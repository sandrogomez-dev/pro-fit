# SETUP.md — do this BEFORE asking the agent to run the app

The coding agent can write all the code, but it **cannot create your accounts or fetch
your keys**. Do these first, or the app will not run. This file also tells the agent
what is blocked on you.

## 1. Accounts to create (only you can)

- [ ] **Supabase** — create a project. Copy the **Project URL** and **anon key**.
- [ ] **DeepSeek** — create an API account at platform.deepseek.com, generate an API key.
      (New accounts get free tokens to start.)
- [ ] **Expo** — free account, for development builds later.
- [ ] *(Only if you want Google sign-in now)* **Google Cloud** — create OAuth credentials
      and add the redirect URLs Supabase Auth gives you. This is fiddly; if you want to
      move fast, skip it and ship **email-first** (see root AGENTS.md §12).
- [ ] *(Later, at publish time only)* Apple Developer ($99/yr) and Google Play ($25 one-time).
      Not needed for development.

## 2. Keys to collect

| Where it goes                     | Value                          |
|-----------------------------------|--------------------------------|
| App `.env`                        | `EXPO_PUBLIC_SUPABASE_URL`      |
| App `.env`                        | `EXPO_PUBLIC_SUPABASE_ANON_KEY` |
| Supabase function secret          | `DEEPSEEK_API_KEY`              |
| Supabase Auth + Google Cloud      | Google OAuth client IDs (optional) |

Set the function secret with: `supabase secrets set DEEPSEEK_API_KEY=...`
Keep a committed `.env.example` (empty values); never commit the real `.env`.

## 3. App identity

- [ ] Pick a provisional **app name** and **bundle id** (e.g. `com.placeholder.gymapp`).
      The brand name can come later; renaming is annoying but doable.

## 4. Development build

Some native features (notifications reliably, MMKV, Google sign-in, ads, IAP later)
need an **EAS development build**, not Expo Go. For the MVP (email auth + AsyncStorage +
notifications), create a dev build early with `eas build --profile development` so you
are not surprised later.

## 5. Order of operations

1. Create Supabase project + DeepSeek key (§1).
2. Put values in `.env` and set the function secret (§2).
3. Pick app name + bundle id (§3).
4. THEN let the agent scaffold, run migrations, and start the app.

## 6. Current status (kept up to date by the agent)

- [x] DeepSeek API key obtained.
- [x] Supabase project created — project ref `egavonzmckgbhqdiuykw`, EU region.
      URL + publishable key live in `.env` (uncommitted). Connectivity verified.
- [ ] App name + bundle id — provisional in use, brand TBD.

Note: the project uses Supabase's **new publishable key** (`sb_publishable_...`) in
`EXPO_PUBLIC_SUPABASE_ANON_KEY`, not the legacy anon JWT. Both work; the new one is
Supabase's recommended format. The secret/`service_role` key is NEVER in the app.

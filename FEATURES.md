# Grammario — product features (implementation checklist)

This document lists **what the current web app and backend actually do**, to help port parity to a mobile client. It is scoped to user-facing behavior, APIs, data rules, and admin tooling. Repo layout: main learner product lives under `frontend/` (Next.js); NLP engine under `backend/` (FastAPI); database contract in `supabase/schema.sql`.

---

## Supported languages

- **Analyzer, Learn, Review, vocabulary**: Italian (`it`), Spanish (`es`), German (`de`), Russian (`ru`), Turkish (`tr`).
- **Language metadata** (name, native name, family, sample sentence): `GET /api/v1/languages` (proxies backend).

---

## Marketing and legal (public, unauthenticated)

- **Landing** (`/`): hero, stats, feature highlights, pricing section (marketing copy), FAQ, CTA, demo-style content.
- **Terms of Service** (`/terms`).
- **Privacy Policy** (`/privacy`).
- **Patch notes** (`/patch-notes`): changelog with Markdown and Mermaid diagram rendering.

---

## Authentication

- **Supabase Auth**: email + password sign-up and sign-in, sign-out, password reset request.
- **Google OAuth**: redirect flow with **`/auth/callback`** handling; **`/auth/error`** for failures.
- **Profile bootstrap**: on auth, app ensures a row in `public.users` (display name, avatar from provider where applicable).
- **Session usage**: JWT access token sent as `Authorization: Bearer …` on API calls from the browser client.

---

## Account, plan, and access rules

- **`is_pro`**: when true, user may use **any** supported language for Learn, Analyze (API), and Review; learning-language modal and single-language restrictions do not apply.
- **Free tier learning language**:
  - Must set **one** `learn_language` on `users` (modal on first app load, or **Settings**, or **`PATCH /api/v1/profile/learn-language`**).
  - **After the first choice**, switching language is allowed at most **once per 30 days** (rolling, enforced in client `setLearnLanguagePreference` and the PATCH route).
  - Analyze, saving analyses, saving vocabulary, and review are **gated** to that language for non‑Pro users (API returns `language_required` / `language_not_allowed` where applicable).
- **Daily analysis quota** (authenticated, enforced in **`POST /api/v1/analyze`**):
  - Default **3** analyses per calendar day (server-side day boundary used for counting) for non‑Pro.
  - Default **1000** per day for Pro.
  - **`users.daily_sentence_limit`** overrides both when set (admin/test tuning).
- **Account expiry**: if **`account_expires_at`** is in the past, analyze and usage endpoints respond with an **expired** / blocked state.
- **Settings UI**: shows **“Beta access / Active”** plan messaging (not a live paywall UI); **`is_pro`** is still honored everywhere gating is implemented.

---

## App shell and navigation

- **Routes** (authenticated learner flows): `/app` (home), `/app/analyze`, `/app/learn`, `/app/review`, `/app/settings`.
- **App navbar**: links to Analyze, Learn, Review, Settings; **Admin** entry when the signed-in user ID matches **`NEXT_PUBLIC_ADMIN_USER_ID`**.
- **Language pick modal**: blocks interaction until a free-tier user selects `learn_language` (not shown for Pro).

---

## App home (`/app`)

- **Guest**: explains workspace; **Sign in** opens auth modal; locked actions for Analyze / Learn / Review.
- **Signed-in**: welcome copy; shortcuts to **Open Analyzer**, **Open Learn**, **Open Review**; surfaces streak / daily goal / level-style stats from profile (per home page layout).

---

## Sentence analyzer (`/app/analyze`)

**Requires sign-in** (page redirects guests to `/app`).

### Input and analysis request

- Text input (default sample sentence), **language selector** (for Pro: any language; for free: synced to `learn_language`).
- **Run analysis** → `POST /api/v1/analyze` → Python backend returns token graph + enrichment (see [Backend output](#backend-nlp-and-analysis-output) below).
- **Loading / errors**: toast feedback; **403** handling for `language_required`, `language_not_allowed`; **429** for daily limit.

### Visualization (ReactFlow)

- **Linear layout**: tokens in sentence order with dependency edges.
- **Tree layout**: Dagre-ranked dependency tree (top–bottom).
- **Toggle draggable nodes** for manual rearrangement.
- **Word nodes** show: surface form, lemma, **UPOS** (click → Universal POS explanation), **morphological features** as chips (click → feature glossary where defined), optional **segments** (e.g. Turkish morphemes).
- **Rule-based grammar errors**: nodes can show error styling and message when backend supplies `grammar_errors` with `word_id`.

### Pedagogy panel (from LLM + rules)

When present in the response:

- **English translation** (respect **Settings → Show translations**).
- **Nuance** note.
- **Grammar concepts** (name, description, related words).
- **Tips** (“why this form?” style Q&A with optional rules and examples).
- **LLM-reported grammar issues** (`pedagogical_data.errors`).
- **CEFR difficulty**: level (A1–C2), score, optional feature breakdown.
- **Rule-based errors** list with severity and messages.

### Audio

- **Text-to-speech** for the input sentence via **`SpeechSynthesis`**, with BCP-47 locale per language (when **Settings → TTS** enabled).

### Persistence and side effects (after successful analyze, signed-in)

- **Insert row** in `analyses` (text, language, nodes JSON, pedagogical JSON, difficulty fields; embedding storage may be handled per schema—client saves via Supabase client).
- **`total_analyses`** incremented on profile.
- **XP**: **+10** per analysis (`XP_REWARDS.ANALYSIS`); **level** recalculated from total XP using fixed thresholds (10 levels max in table: 0, 100, 250, …, 32000).
- **Level-up toast** if level increases.
- **Daily goal**: today’s `daily_goals` row **completed** counter incremented; on first time reaching target, **+50 XP** and success toast.
- **History list** refreshed (last **20** analyses).
- **In-memory**: Zustand stores current analysis and up to **10** recent session analyses (persisted locally).

### History sidebar

- Lists recent analyses with relative time; **open** loads tokens + pedagogy into the canvas (difficulty / rule errors cleared for that replay path).
- **Favorite** toggle per row; **delete** analysis.
- Filters: **all** vs **favorites**.

### Vocabulary from analyzer

- Per-token **Save for review** (non-punctuation): inserts **`vocabulary`** if same **lemma + language** not already present; links optional **`analysis_id`**; sets **due today** so it appears in Review immediately.
- Duplicate → **Already saved** state.
- New save → **+5 XP** and profile refresh.

### Feedback on an analysis

- **Rate this analysis** form: **1–5 stars**, **category** (`accuracy`, `translation`, `grammar_tips`, `difficulty`, `other`), optional **comment**; writes **`sentence_feedback`** linked to `analysis_id`.

### UI chrome

- **Stats / History** side panel toggle; **mobile-style drawer** for insights; **feature detail** modal for POS / morph features.

---

## Guided learning (`/app/learn`)

- **Hub** (`/app/learn`): pick one of the five languages (access controlled: free users only see their `learn_language` unless Pro).
- **Per language** (`/app/learn/[lang]`): **CEFR bands A1–C2** as navigable levels.
- **Per level** (`/app/learn/[lang]/[level]`): list of **topics** (slugs).
- **Topic page** (`/app/learn/[lang]/[level]/[slug]`): title, summary, **body** with simple `**bold**` rendering and paragraphs.
- **Curriculum content**: generated **outline topics** per language/level (intro + practice ideas); not a full interactive course—copy states that deeper lessons/exercises are expected to grow.

---

## Vocabulary review (`/app/review`)

**Requires sign-in.**

- **Fetch due cards**: `GET /api/v1/vocabulary/review` — up to **20** items with `next_review <= today`, ordered by `next_review`; stats: **total** words, **due** count, **mastered** count ( **`mastery >= 80`** ), scoped to free-tier `learn_language` when applicable.
- **403 `language_required`**: empty state pointing to Settings / language modal.
- **Flashcard flow**: show word, lemma, POS, mastery %, optional **context** sentence; **Show answer** reveals optional **translation** (often null if never set), then rating controls.
- **Ratings**: primary shortcuts **Wrong (1)**, **Hard (3)**, **Good (4)**; expandable **0–5** scale (SM-2 quality).
- **POST** `/api/v1/vocabulary/review` with `{ vocab_id, quality }` updates scheduling (server uses SM-2 helper).
- **Session end**: counts correct (quality ≥ 3), accuracy %, **Again** (reload due), **Analyze more**.

---

## Settings (`/app/settings`)

**Requires sign-in.**

- **Profile**: avatar or initial, display name, email, totals (**analyses**, **streak**, **level**).
- **Plan**: beta messaging; Pro users see note that all languages are included.
- **Learning language** (free): dropdown to set/switch language subject to **30-day** cooldown rules; syncs **`defaultLanguage`** in local preferences when updated.
- **Preferences** (Zustand + `localStorage` under **`grammario-storage`**):
  - **Daily goal target**: 3, 5, 10, 15, or 20 analyses (drives **new** `daily_goals` row when initialized on Analyze load—not a live PATCH to today’s DB row on every change).
  - **Text-to-speech** toggle.
  - **Show translations** toggle.
- **Sign out**.

---

## Gamification (what is wired today)

- **Streak and longest streak**: updated on profile when user becomes active (see `auth-context` / profile update path); shown in Settings and stats panel.
- **XP and level**: updated on analyze (+10), vocabulary save (+5), daily goal complete (+50); level from cumulative XP thresholds.
- **Daily goal progress**: per-row in `daily_goals` for **today**; shown in **StatsPanel** next to streak/XP.
- **Toasts**: XP gain, level-up, daily goal complete.
- **Achievements**:
  - **Database**: `achievements` definitions + `user_achievements` junction, RLS, seeds in schema (milestones for analyses, streaks, vocab, levels, polyglot).
  - **Client**: `unlockAchievement`, `getAchievements`, `getUserAchievements` exist in `db.ts`; **AchievementToast** supports an `"achievement"` type.
  - **Not wired**: no automatic unlock or achievement list UI in the current Analyze/settings flow; `XP_REWARDS.FIRST_ANALYSIS_OF_DAY`, `STREAK_BONUS`, `ACHIEVEMENT_UNLOCK` are **defined but unused** in the analyze path.

---

## Client persistence and offline behavior

- **Zustand persist**: preferences, onboarding flag, recent analyses (partial state).
- **No offline analyzer**: all NLP runs on the backend; no local model in the web app.

---

## APIs the mobile app will likely mirror

| Endpoint | Role |
|----------|------|
| `POST /api/v1/analyze` | Authenticated quota + language gate; proxies NLP JSON to client. |
| `GET /api/v1/usage` | Today’s analysis count, limit, reset time, `is_pro`, expiry flag. |
| `GET /api/v1/languages` | Supported languages list. |
| `GET/POST /api/v1/vocabulary/review` | Due words + stats; submit SM-2 quality. |
| `PATCH /api/v1/profile/learn-language` | Set/switch free-tier `learn_language` with cooldown rules. |

**Direct Supabase (with user JWT)** is also used from the web for: saving analyses, vocabulary CRUD helpers, feedback insert, daily goals, profile reads, etc. Mobile can use the same tables and RLS policies with the Supabase client.

---

## Backend NLP and analysis output (FastAPI)

*(Parity for “what Analyze shows”.)*

- **Engines**: spaCy preferred, Stanza fallback; Turkish via Stanza.
- **Per sentence**: token IDs, text, lemma, UPOS/XPOS, feats, head, deprel, optional `segments`.
- **Parallel work**: NLP, LLM pedagogical JSON, sentence embedding; **Redis** cache (~24h) by hash of language + text; cached payload strips embedding to save space.
- **Post-processing**: **CEFR difficulty** heuristic; **rule-based** agreement / harmony checks → `grammar_errors`.
- **Lemma frequency bands** (1–5): implemented in backend services (used in scoring stack; not all fields may surface in the current web node UI—confirm against API types if you expose them on mobile).

Other backend routes (for ops, not learner UI): `POST /embed`, `GET /health`, cache stats/flush, model warmup, etc.

---

## Database capabilities relevant to product (not always exposed in UI)

- **`analyses`**: stores `nodes`, `pedagogical_data`, difficulty, **`embedding`** (pgvector), `is_favorite`, `notes`.
- **`match_analyses()`** SQL function: similarity over embeddings — **no learner-facing “similar sentences” screen** in the web app today.
- **Stripe columns** on `users` (`stripe_customer_id`, subscription fields): present in schema for future billing; **no in-app checkout** wired in this repo.

---

## Admin dashboard (`/admin`)

Restricted to **`NEXT_PUBLIC_ADMIN_USER_ID`**.

- **Overview**: KPI-style stats (users, analyses, vocabulary, feedback aggregates, language breakdown, recent activity).
- **Users**: search, filter by account type, edit fields (display name, type, limits, notes), create/delete; creating auth users may require **service role** in env.
- **Requests & data**: browse analyses, filter, view raw JSON, delete by id.
- **Vocabulary**: paginated cross-user vocabulary table.
- **Feedback**: filter, resolve, admin notes.
- **Backend health**: proxy to Python **`/health`** with service status JSON.

Admin API routes under `/api/v1/admin/*` (stats, users, analyses, vocabulary, feedback, health).

---

## Video asset pipeline (non-product)

- **`video/`** Remotion project: generates landscape/portrait promotional renders—not a user-facing app feature.

---

## Implementation gaps to be aware of (mobile parity)

1. **Achievements**: schema + helpers only; no end-to-end unlock UX on web.
2. **Extra XP constants** in `db.ts` unused in the hot path (first-of-day bonus, streak bonus per event, achievement XP).
3. **`enableSounds`** in Zustand defaults exists but **no UI or callers** located in the app.
4. **Vocabulary `translation`** column: not populated on save-from-analyze; Review often shows translation only if filled elsewhere.
5. **Similarity search**: DB-ready, **no UI**.

---

*Last reviewed against the `frontend` app routes, `frontend/src/lib/db.ts`, API route handlers under `frontend/src/app/api/v1/`, and `supabase/schema.sql`.*

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

### Semantic Memory ("You've seen this before") — added Apr 2026

After a successful analysis is saved (and the backend returns an `embedding`):

- **`getSimilarAnalyses()`** in `db.ts` calls the `match_analyses()` Supabase RPC with the new embedding, the user's ID, the same language, and a similarity threshold of **0.6**; returns up to **4** prior analyses ranked by cosine similarity.
- If matches exist, a **"You've seen this before"** strip appears below the pedagogy panel showing cards for each similar sentence with: sentence text (truncated), **similarity %**, difficulty level badge, relative date ("today", "3d ago", etc.).
- Clicking a similar-sentence card loads that historical analysis into the canvas (same as opening from history).
- Non-critical: failures are silently swallowed so they never block the main analysis flow.

### Feedback on an analysis

- **Rate this analysis** form: **1–5 stars**, **category** (`accuracy`, `translation`, `grammar_tips`, `difficulty`, `other`), optional **comment**; writes **`sentence_feedback`** linked to `analysis_id`.

### UI chrome

- **Stats / History** side panel toggle; **mobile-style drawer** for insights; **feature detail** modal for POS / morph features.

---

## Guided learning (`/app/learn`)

- **Hub** (`/app/learn`): pick one of the five languages (access controlled: free users only see their `learn_language` unless Pro).
- **Per language** (`/app/learn/[lang]`): **CEFR bands A1–C2** as navigable levels.
- **Per level** (`/app/learn/[lang]/[level]`): list of **topics** (slugs).
- **Topic page** (`/app/learn/[lang]/[level]/[slug]`): title, summary, **body** with `**bold**` Markdown rendering and paragraphs.
- **Italian curriculum — comprehensive hand-authored content** (added Apr 2026): full A1–C2 topic bodies for Italian. Each topic includes a multi-paragraph prose explanation, conjugation tables, worked examples, and usage rules. Topics span all major grammar areas (nouns & gender, articles, *essere/avere*, regular/irregular verbs, tenses, pronouns, subjunctive, passive, register, discourse). Other languages still use generated outline stubs.
- **"Add to Review" button on topic pages**: each Learn topic page now has a **Queue / Practice** button. Clicking it calls `POST /api/v1/grammar-reviews` with the `topic_id` and adds the concept to the user's grammar review queue. If already queued, the button shows "Already added" and links directly to Review.

---

## Grammar Concept Review (`/app/review` — overhauled Apr 2026)

The review flow was **completely rebuilt** from a vocabulary-word flashcard into a **grammar-concept flashcard** system backed by a new `grammar_concept_reviews` table.

### New data model
- **`grammar_concept_reviews`** table: `user_id`, `topic_id` (curriculum concept ID such as `"it-a2-pp-essere"`), `language`, SM-2 fields (`mastery`, `ease_factor`, `interval_days`, `next_review`, `last_reviewed`, `review_count`); unique on `(user_id, topic_id)`.
- Two concept sources: **curriculum concepts** (linked by `topic_id` to the learn curriculum) and **ad-hoc concepts** from analyses (stored with inline `concept_name`, `concept_description`, `concept_examples`, `level`, optionally `analysis_id`).

### API (`/api/v1/grammar-reviews`)
- **`GET`**: returns grammar concepts due today (SM-2 `next_review <= today`) enriched with curriculum body/examples; returns `{ items, stats: { total, due, mastered } }`.
- **`POST`**: queue a concept — accepts either `{ topic_id }` for a curriculum concept or `{ concept_name, concept_description, concept_examples, language, level?, analysis_id? }` for an ad-hoc concept from an analysis. Returns `{ already_added: true }` if already queued.
- **`PUT`**: submit a review rating — `{ id, quality }` (0–5 SM-2 scale); advances SM-2 scheduling, updates `mastery`, `ease_factor`, `interval_days`, `next_review`.

### Flashcard UI
- Card front: concept **title**, CEFR **level badge** (colour-coded A1–C2), language flag, mastery %, progress bar (card N / total).
- Card back (after "Show Answer"): full **explanation** body with Markdown rendering, up to 4 **example sentences**, optional rule list.
- **Ratings**: **Wrong (1)**, **Hard (3)**, **Good (4)** primary buttons; full **0–5** scale expandable.
- Session complete screen: correct count, accuracy %, **Again** / **Go to Learn** actions; "all caught up" empty state with prompts to analyze or open Learn.

### Queue from Analyzer
- Grammar concepts in the pedagogy panel now have a **"Queue for review"** button per concept. Clicking it calls `POST /api/v1/grammar-reviews` with the concept inline data (name, description, examples, language, analysis ID). Deduplication prevents double-adding.

---

## Italian Grammar Mastery Map (`/app/learn/mastery-map`)

New page added Apr 2026. Requires sign-in. **Italian only.**

- **Concept taxonomy** (`it-grammar-taxonomy.ts`): curated list of Italian grammar concepts mapped to CEFR levels (A1–C2), each with a unique `id`, `title`, and `slug` matching a learn-curriculum topic.
- **Mastery scoring from analyses**: on load, fetches all of the user's Italian `analyses` rows, extracts `pedagogical_data.concepts[].name` from each, fuzzy-matches concept names against the taxonomy, and increments per-concept encounter counts. Concepts are scored as **Not yet seen** (0), **Spotted** (1), **Familiar** (2–4), or **Well-practiced** (5+).
- **Stats bar**: concepts encountered / total, total Italian analyses, coverage %.
- **Two views** (toggle):
  - **List view** (default): CEFR level sections (collapsible, each with a progress bar), concept cards in a grid showing mastery status. Clicking a card opens a **detail panel** with the list of matching analyses (text, date, difficulty level) and a link to the Learn topic.
  - **Map view**: ReactFlow canvas with concept nodes positioned in CEFR-level rows, **prerequisite edges** (smoothstep lines) connecting related concepts (e.g. *passato prossimo* → *pp vs imperfetto*). Pan/zoom controls; clicking a node shows the same detail panel on the right.
- **Mobile support**: detail panel slides up as a bottom sheet on small screens.
- **Empty state**: prompt to start analyzing Italian sentences.
- **Navigation**: accessible via the Learn hub (`/app/learn`) and the app navbar.

---

## Vocabulary review (`/app/review` — legacy vocabulary flow)

**Note:** the Review page was rebuilt in Apr 2026 to use grammar concepts (see [Grammar Concept Review](#grammar-concept-review-appreview--overhauled-apr-2026) above). The vocabulary review endpoints remain in the API for backward-compat; the current Review UI uses the grammar-concept flow.

Original vocabulary review capability (still available via API):

- **`GET /api/v1/vocabulary/review`**: up to **20** vocabulary items with `next_review <= today`; stats: **total** words, **due** count, **mastered** count (**`mastery >= 80`**), scoped to free-tier `learn_language`.
- **`POST /api/v1/vocabulary/review`** with `{ vocab_id, quality }` updates SM-2 scheduling.
- **403 `language_required`**: when free-tier user has no `learn_language` set.

---

## Settings (`/app/settings`)

**Requires sign-in.**

- **Profile**: avatar or initial, display name, email, totals (**analyses**, **streak**, **level**).
- **Plan**: beta messaging; Pro users see note that all languages are included.
- **Learning language** (free): dropdown to set/switch language subject to **30-day** cooldown rules; syncs **`defaultLanguage`** in local preferences when updated.
- **Preferences** (Zustand + `localStorage` under **`grammario-storage`**):
  - **Daily goal target**: 3, 5, 10, 15, or 20 analyses (drives **new** `daily_goals` row when initialized on Analyze load—not a live PATCH to today’s DB row on every change).
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
| `GET/POST /api/v1/vocabulary/review` | Legacy vocabulary due words + stats; submit SM-2 quality. |
| `GET /api/v1/grammar-reviews` | Grammar concepts due today (enriched with curriculum content). |
| `POST /api/v1/grammar-reviews` | Queue a curriculum concept (`topic_id`) or ad-hoc concept from analysis for review. |
| `PUT /api/v1/grammar-reviews` | Submit SM-2 quality rating for a grammar concept review. |
| `PATCH /api/v1/profile/learn-language` | Set/switch free-tier `learn_language` with cooldown rules. |

**Direct Supabase (with user JWT)** is also used from the web for: saving analyses, vocabulary CRUD helpers, feedback insert, daily goals, profile reads, mastery-map concept stats (`analyses` table query), etc. Mobile can use the same tables and RLS policies with the Supabase client.

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
- **`match_analyses()`** SQL function: similarity search over embeddings — **now wired to the Analyzer UI** via `getSimilarAnalyses()` in `db.ts`; see the "You’ve seen this before" feature in the Analyzer section above.
- **`grammar_concept_reviews`**: new table (Apr 2026) — see Grammar Concept Review section above.
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
4. **Vocabulary `translation`** column: not populated on save-from-analyze; vocabulary review (legacy) often shows translation only if filled elsewhere.
5. **Similarity search**: now wired for Italian analyzer; threshold is 0.6 — mobile should call the same `match_analyses()` RPC after saving an analysis embedding.
6. **Grammar Concept Review — no language gate**: currently the review queue is not restricted by free-tier `learn_language`; all queued concepts are returned regardless of language. Mobile should replicate this behavior or add a language filter if desired.
7. **Mastery Map**: currently Italian-only; the taxonomy and hand-authored curriculum are only complete for `it`. Other language tabs in Learn still use generated stubs.

---

*Last reviewed against the `frontend` app routes, `frontend/src/lib/db.ts`, API route handlers under `frontend/src/app/api/v1/`, `supabase/schema.sql`, and git log since Apr 4 2026.*

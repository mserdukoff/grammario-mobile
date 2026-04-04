# Admin dashboard specification (web → mobile parity)

This document describes what the **web admin console** implements today (`frontend/src/app/admin/`). Use the same **APIs** on mobile; parity means the same data and actions, not identical layout.

## Shell (`admin/layout.tsx`)

- **Access**: Only if `isAdmin(currentUser)`; others are redirected away.
- **Navigation** (six sections): Overview, Users, Requests & Data, Vocabulary, Feedback, Backend.
- **Chrome**: Collapsible sidebar, “Back to App” (`/app`), Sign out.

---

## 1. Overview (`/admin`)

**Data**: `GET /api/v1/admin/stats`

### UI

- Header + **Refresh** (reloads stats).
- **Seven KPI cards**
  - Total users, Active this week, Total analyses, Analyses today, Analyses this week, Pro users, Vocabulary total (subtitle: “X mastered”).
- **Analyses by language**
  - Horizontal bars for `it`, `es`, `de`, `ru`, `tr` (flag + name + count + bar vs total). Empty state: “No data yet”.
- **Recent analyses**
  - List: flag, truncated sentence, date → links to `/admin/requests?id=<analysis_id>`. Link “View all” → Requests.
- **Recent sign-ups**
  - Avatar initial, display name (or email), email, join date. “View all” → Users.

---

## 2. Users (`/admin/users`)

### Data

- `GET /api/v1/admin/users?page=&limit=30`
  - Optional: `account_type=test|regular` (tabs **All / Test / Regular** reset page to 1).
- `PATCH /api/v1/admin/users` — `{ user_id, updates }`
- `DELETE /api/v1/admin/users` — `{ user_id }`
- `POST /api/v1/admin/users` — create account (see form below).

### UI

- Count: “X registered users”.
- **Search** (client-side on current page only): name, email, or full user id substring.
- **Create Account** toggles a panel titled **“Create Test Account”** with:
  - Email * , Temporary password * , Display name, Account type (`test` | `regular`), Daily sentence limit (optional), Expires on (date), Admin notes.
  - Create / Cancel; errors from API shown inline.

### Table columns (exact order)

1. **User** — avatar or initial; display name (editable inline); email; optional italic **admin notes** when not editing.
2. **ID** — first 8 characters of UUID; shield icon if admin user id.
3. **Type** — Regular / Test badge; editable in row edit mode.
4. **Limit** — daily sentence limit or “default”; editable.
5. **Expires** — date or em dash; expired rows **dimmed**; warning icon if expired; editable date.
6. **Level / XP** — `LvN (XP)`; editable two number fields.
7. **Analyses** — `total_analyses`.
8. **Status** — PRO (crown) vs Free; toggle in edit mode.
9. **Joined** — `created_at` as locale date.
10. **Actions** — Edit (pencil): save / cancel; Delete (trash) → **Confirm / Cancel** (admin user cannot be deleted).

### Pagination

Prev/next, “Page X of Y” when `total > 30`.

### API fields not shown in the table

The API / `UserRow` type may include `streak`, `longest_streak`, `stripe_customer_id`, `subscription_status`, `last_active_date`, but the **current web table does not display** these columns.

---

## 3. Requests & Data (`/admin/requests`)

### Data

- List: `GET /api/v1/admin/analyses?page=&limit=20` + optional `&language=it|es|de|ru|tr`.
- Single: `GET /api/v1/admin/analyses?id=<uuid>` (drives detail when `?id=` in URL).
- Delete: `DELETE /api/v1/admin/analyses` — `{ analysis_id }`.

### List view

- Language pills: **All**, IT, ES, DE, RU, TR.
- Each row: flag, sentence, subtitle (owner name/email or user id prefix · timestamp · optional italic translation).
- Actions: **Open full detail** (external-link), expand **nodes** / **ped** / **raw**, **copy** whole row JSON, **delete** → Yes/No.
- Expanded area: pretty-printed JSON + copy; section title by mode.

### Detail view (when `id` query or after load)

- Back clears `id` from URL (web uses `pushState` to `/admin/requests`).
- Title = sentence; meta: language, datetime, owner email or user id prefix; translation if present.
- Three collapsible sections (default open): **Full Raw Record**, **Nodes (Parse Tree)**, **Pedagogical Data (LLM Response)** — each with **Copy JSON** and expand/collapse.

### Pagination

20 per page, same prev/next pattern.

---

## 4. Vocabulary (`/admin/vocabulary`)

**Data**: `GET /api/v1/admin/vocabulary?page=&limit=30`

### UI

- “X saved words across all users”.
- Table: **Word, Lemma, Translation, Lang** (flag), **POS**, **Mastery** (bar + %; green ≥80%, amber ≥40%, red below), **Reviews**, **Next Review**, **Context** (truncated), **Created**.
- Empty: icon + “No vocabulary saved yet”.
- Pagination: 30 per page.

---

## 5. Feedback (`/admin/feedback`)

### Data

- `GET /api/v1/admin/feedback?` optional `category=accuracy|translation|grammar_tips|difficulty|other`, `resolved=true|false`.
- `PATCH /api/v1/admin/feedback` — `{ id, is_resolved? }` or `{ id, admin_notes }` (toggle resolved vs save notes).

### UI

- Title: **Sentence Feedback**; Refresh.
- **Three summary cards** (from `summary`): Total feedback, Unresolved count, Avg rating **/5**.
- Filters: category dropdown, resolved status dropdown (“All / Unresolved / Resolved”), result count.
- List rows (collapsible):
  - Resolved toggle (circle / check); 1–5 stars; category chip; flag; quoted sentence; user; date; chevron.
  - Expanded: full sentence, optional user comment, user email + full datetime; **Admin notes** textarea + **Save notes**.

### Category labels (UI)

| Value | Label |
|-------|--------|
| `accuracy` | Accuracy |
| `translation` | Translation |
| `grammar_tips` | Grammar Tips |
| `difficulty` | Difficulty |
| `other` | Other |

---

## 6. Backend (`/admin/backend`)

**Data**: `GET /api/v1/admin/health` (proxies Python backend `/health`).

### UI

- Refresh; loading/error handling.
- **Status banner**: healthy / unknown / unreachable; version line when present.
- **Services**: LLM, Redis cache, Embeddings — Active/Down dots; if cache available: **Hits, Misses, Hit rate %**.
- **NLP Engines**: preferred engine label; **spaCy** and **Stanza** with per-language badges (loaded vs not); Stanza shows `max_loaded`.
- **Features**: key/value list from `health.features` (booleans → check/x icons; arrays joined; other stringified).
- **Memory**: RSS and VMS MB; RSS bar vs **6144 MB** with color thresholds (>3500 warning, >5000 error).
- **Raw Health Response**: expandable pretty JSON.

---

## Mobile parity checklist

| Area | Must match |
|------|------------|
| Auth | Same admin user gate + authenticated requests to these routes |
| Overview | Same seven KPIs, language breakdown, recent lists + deep links to analyses/users |
| Users | Tabs, pagination, search behavior, create form fields, row edit fields, delete rules |
| Analyses | Filters, pagination, inline JSON + copy, delete, detail sections + `?id=` |
| Vocabulary | Columns and pagination |
| Feedback | Summary, filters, resolve toggle, notes save |
| Backend | All health sections + raw JSON |

---

## API index (quick reference)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/stats` | Platform overview stats |
| GET | `/api/v1/admin/users` | Paginated users (`account_type` optional) |
| POST | `/api/v1/admin/users` | Create user |
| PATCH | `/api/v1/admin/users` | Update user |
| DELETE | `/api/v1/admin/users` | Delete user |
| GET | `/api/v1/admin/analyses` | List or single (`id`) |
| DELETE | `/api/v1/admin/analyses` | Delete analysis |
| GET | `/api/v1/admin/vocabulary` | Paginated vocabulary |
| GET | `/api/v1/admin/feedback` | Feedback list + summary |
| PATCH | `/api/v1/admin/feedback` | Resolve / admin notes |
| GET | `/api/v1/admin/health` | Backend health |

For response shapes, see `frontend/src/app/api/v1/admin/*/route.ts`.

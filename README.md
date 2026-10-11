# Track Time — متتبع الوقت

A **personal time-tracking web application** designed for real daily use — not a timer gimmick, not a generic todo list.

You log where your hours went: by **exact time range** (from–to) or by **estimated duration**, then filter, review, and understand patterns over time. The UI is **Arabic-first (RTL)**, supports **dark / light / system** themes, and is **PWA-installable**.

Data lives in **Supabase** (Auth + Postgres + RLS). The client is **React 19 + Vite**, with **TanStack Query** for server state and **shadcn/ui** for the interface.

---

## Table of contents

- [Why this app](#why-this-app)
- [Core product flow](#core-product-flow)
- [Features (full list)](#features-full-list)
- [Tech stack](#tech-stack)
- [Architecture & data flow](#architecture--data-flow)
- [Database & security](#database--security)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Design decisions](#design-decisions)

---

## Why this app

Typical trackers force a running stopwatch or a single rigid form. Real days are messier:

- Sometimes you know **10:00 → 12:30**
- Sometimes you only know **“about 2 hours on X”**
- You still want **search, filters, bulk cleanup, and stats** later

Track Time supports both mental models in one product, with a list that stays usable as history grows (infinite scroll + server-side filters), and a dashboard that answers “where did the time go?” without opening a spreadsheet.

---

## Core product flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Sign up /  │────▶│   Home       │────▶│  Add activity   │
│  Sign in    │     │  (today +    │     │  (range OR      │
└─────────────┘     │   summary)   │     │   estimated)    │
                    └──────┬───────┘     └────────┬────────┘
                           │                      │
                           ▼                      ▼
                    ┌──────────────┐     ┌─────────────────┐
                    │  Activities  │◀────│  Activity       │
                    │  (infinite   │     │  details        │
                    │   list +     │     │  → Edit route   │
                    │   filters +  │     └─────────────────┘
                    │   bulk del.) │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Stats       │
                    │  (charts)    │
                    └──────────────┘
```

### 1. Authentication
- Email + password via **Supabase Auth**
- Signup can proceed **without email confirmation** (project setting)
- Session persisted; protected routes behind `RequireAuth`
- Navbar shows identity (avatar / email) with account actions

### 2. Home
- Today’s overview and recent context
- Quick links to stats and full activity list
- **Quote of the day** — rotating English motivational quotes from a local curated set (dynamic by day, styled for the theme)

### 3. Log an activity
Two modes on the same form:

| Mode | What you enter | What is stored |
|------|----------------|----------------|
| **Range** | Date + start time + end time | `start_time`, `end_time`, computed `duration_minutes` |
| **Estimated** | Date + hours + minutes | `duration_minutes` only (no clock range) |

Optional description/notes. On successful create → toast + navigate to **activity details**.

### 4. Activities list
- Infinite scroll (paginated Supabase `range` queries)
- Server-side filters (not client-only filtering of a full dump)
- Multi-select rows + **bulk delete** with confirmation dialog
- Loading skeletons limited to table rows (not the whole page chrome)
- Row actions: open details, edit, delete

### 5. Activity details & edit
- Full read view of one activity
- **Edit is its own route** (not only a modal) with the same calendar/time controls as create
- Delete with confirmation; success feedback via toast

### 6. Stats
- Aggregations and charts (**Recharts**) over the user’s activities
- Complements the list: trends and distribution, not only chronological rows

### 7. Theme & layout
- **ThemeProvider**: `light` | `dark` | `system` (follows OS when system)
- Mode toggle in the chrome; preference in `localStorage`
- Desktop nav + mobile **Sheet** (shadcn) burger menu
- Semantic tokens (`bg-background`, `bg-card`, `text-foreground`, …) so theme switches cleanly

---

## Features (full list)

### Tracking & forms
- [x] Create activity — **range** mode (date + start + end)
- [x] Create activity — **estimated** mode (date + duration)
- [x] Edit activity on a dedicated route
- [x] Delete single activity
- [x] Optional description / notes
- [x] shadcn **Calendar** + time inputs (Popover date picker)
- [x] Toast feedback on create / update / delete (Sonner)
- [x] Redirect to activity details after successful create/update

### List, scale & cleanup
- [x] Activities table / list with date grouping and duration emphasis
- [x] **Infinite scroll** (page size configured in the query hook)
- [x] **Server-side** search (title / description)
- [x] **Server-side** filters: date range, time mode, title, min/max duration
- [x] Debounced search input
- [x] Multi-select checkboxes (including select-all on loaded page)
- [x] **Bulk delete** selected activities
- [x] Row-level skeleton loading while fetching

### Insights
- [x] Home dashboard (today + recent)
- [x] Stats page with charts
- [x] Dynamic Quote of the Day (English, local data file)

### Account & security
- [x] Sign up / sign in (Supabase email provider)
- [x] Sign out
- [x] Protected routes
- [x] Per-user isolation via **RLS** on `time_activities`

### UI / UX
- [x] Full **RTL** Arabic UI (IBM Plex Sans Arabic)
- [x] Dark / light / system theme
- [x] Responsive layout
- [x] Mobile navigation as **Sheet**
- [x] Avatar / account popover in navbar
- [x] Consistent shadcn primitives (Button, Card, Input, Select, Dialog, Sheet, Checkbox, Popover, Calendar, …)
- [x] Subtle motion via Framer Motion (`AnimatedContainer`)

### Platform
- [x] Vite-based SPA
- [x] PWA configuration (vite-plugin-pwa) for install / offline-friendly static assets

---

## Tech stack

### Frontend
| Technology | Role |
|------------|------|
| **React 19** | UI library |
| **Vite** | Dev server, build, ESM toolchain |
| **React Router v7** | Client routing, nested layouts, protected routes |
| **TanStack Query (React Query)** | Server state: queries, infinite queries, mutations, cache invalidation |
| **Tailwind CSS v4** | Utility styling + design tokens |
| **shadcn/ui** | Accessible component primitives (Base UI / Radix-style patterns) |
| **class-variance-authority (cva)** | Button and variant APIs |
| **Framer Motion** | Page/section enter animations |
| **Recharts** | Stats charts |
| **Sonner** | Toast notifications |
| **date-fns** (where used) | Date helpers alongside native / calendar components |
| **lucide-react** | Icons |
| **IBM Plex Sans Arabic** | Primary typeface for Arabic RTL |

### Backend / data
| Technology | Role |
|------------|------|
| **Supabase Auth** | Email/password sessions, JWT |
| **Supabase Postgres** | Persistent activities store |
| **Row Level Security (RLS)** | Users only access their own rows |
| **Supabase JS client** | Browser SDK (`@supabase/supabase-js`) |

### Tooling & quality of life
| Technology | Role |
|------------|------|
| **vite-plugin-pwa** | Service worker, manifest, installability |
| **workbox-window** | PWA client helpers (when enabled) |
| **ESLint** | Lint (project scripts) |
| **pnpm / npm** | Package management |

---

## Architecture & data flow

### Client state vs server state
- **Auth session** — Supabase client + React context (`AuthProvider`)
- **Activities** — always loaded and mutated through **TanStack Query**
  - `useActivities` / list hooks for simple fetches (e.g. home summaries)
  - `useInfiniteActivities` for the main list (cursor/page via `range`)
  - Mutations invalidate relevant query keys so lists and details stay in sync

### Typical write path
1. User submits form (create/edit)
2. Mutation calls Supabase `insert` / `update` with `user_id` from session
3. On success: toast → invalidate queries → navigate to details
4. On error: toast with message

### Typical list path
1. Filters + search debounced in the UI
2. Query key includes filter params so cache is correct per filter set
3. First page loads; intersection observer / sentinel fetches next page
4. Bulk delete sends selected ids → `delete().in('id', ids)` → invalidate

### Auth path
1. Sign up / sign in → Supabase Auth
2. Session stored by Supabase client
3. `RequireAuth` gates private routes
4. RLS ensures even a forged client request cannot read another user’s rows

---

## Database & security

### Table: `time_activities` (conceptual)

| Column | Purpose |
|--------|---------|
| `id` | UUID primary key |
| `user_id` | Owner (`auth.users`) |
| `title` | Activity name |
| `description` | Optional notes |
| `activity_date` | Calendar day |
| `start_time` | Range mode start |
| `end_time` | Range mode end |
| `duration_minutes` | Canonical duration (always set) |
| `time_mode` | `range` \| `estimated` |
| `created_at` / `updated_at` | Audit timestamps |

Exact column names may match the SQL in `sql/`; run that migration on your project.

### RLS (intent)
- **SELECT / INSERT / UPDATE / DELETE** only when `auth.uid() = user_id`
- No public read of other users’ time data

### Auth project settings
- Email provider enabled
- **Confirm email** disabled if you want immediate login after signup (as used in this app’s setup)

---

## Project structure

```
track-time/
├── public/                 # Static assets, PWA icons if any
├── sql/                    # Schema + RLS for time_activities
├── src/
│   ├── components/
│   │   ├── ui/             # shadcn primitives (button, card, sheet, …)
│   │   ├── Layout.jsx
│   │   ├── ModeToggle.jsx
│   │   ├── QuoteOfTheDay.jsx
│   │   ├── AnimatedContainer.jsx
│   │   └── …
│   ├── context/
│   │   └── AuthProvider.jsx
│   ├── data/
│   │   └── quotes.js       # English daily quotes
│   ├── hooks/
│   │   └── useActivities.js  # queries, infinite query, mutations
│   ├── lib/
│   │   ├── supabase.js
│   │   └── activityHelpers.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Stats.jsx
│   │   ├── Activities.jsx
│   │   ├── Activity.jsx          # create
│   │   ├── ActivityDetails.jsx
│   │   ├── ActivityEdit.jsx      # dedicated edit route
│   │   ├── Login.jsx
│   │   └── …
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css             # Tailwind + theme tokens
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

Naming note: many app components use **PascalCase** filenames (e.g. `AnimatedContainer.jsx`), consistent with this codebase’s convention.

---

## Getting started

### Prerequisites
- Node.js 18+
- A Supabase project
- pnpm or npm

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment variables

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Database

In the Supabase SQL editor, run the scripts under `sql/` (creates `time_activities` and enables RLS policies).

### 4. Auth configuration

Supabase Dashboard → **Authentication** → **Providers** → Email:

- Enable Email
- Turn **off** “Confirm email” if you want signup without inbox verification

### 5. Development server

```bash
pnpm dev
```

Open the printed local URL (typically `http://localhost:5173`).

### 6. Production build

```bash
pnpm build
pnpm preview
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |

---

## Design decisions

| Decision | Rationale |
|----------|-----------|
| **Two time modes** | Matches how people actually remember work: clock bounds vs rough effort |
| **Server-side filters + infinite scroll** | Client-only filtering breaks at scale; pagination must stay correct under filter changes |
| **Dedicated edit route** | Clearer browser history, shareable URL, same form patterns as create |
| **TanStack Query** | Cache, deduping, invalidation after mutations — less manual `useEffect` fetch logic |
| **Supabase RLS** | Security at the database, not only in the UI |
| **Semantic theme tokens** | Dark/light switch without rewriting every gray utility |
| **Arabic RTL first** | Product language and direction are first-class, not an afterthought |
| **shadcn/ui** | Consistent accessible primitives without owning a full custom design system |

---

## License

Private / personal project unless stated otherwise in the repository settings.

---

Built as a practical daily tool: fast to log, honest about duration, and ready for a long activity history.

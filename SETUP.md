# Track Time → Supabase setup

## 1) Packages

```bash
pnpm add @supabase/supabase-js @tanstack/react-query
# or: npm i @supabase/supabase-js @tanstack/react-query
```

## 2) Env

Copy `.env.example` → `.env` and fill from the **same** Supabase project as Brick by Brick.

## 3) SQL (Supabase SQL Editor)

Run `sql/001_time_activities.sql` once.

Table name: `time_activities` (no collision with brick-by-brick tables).

## 4) Auth (no email confirmation)

Supabase Dashboard → Authentication → Providers → Email:

- Enable Email
- **Disable** "Confirm email" (or set Confirm email = off)

Then signup works without confirming the inbox.

## 5) Files to copy into your app

```
src/lib/supabase.js
src/lib/activityHelpers.js
src/context/AuthContext.jsx
src/hooks/useActivities.js
src/components/RequireAuth.jsx
src/components/Layout.jsx
src/pages/Login.jsx
src/pages/Activity.jsx
src/pages/Activities.jsx
src/App.jsx
src/main.jsx
```

Keep existing: `Toast`, `AnimatedContainer`, `formatters.js`, Home/Stats/ActivityDetails (still need localStorage → hooks migration next).

## 6) Removed

- `/backup` route and Backup page (data lives in Supabase per user)

## 7) New feature: estimated duration

On **إضافة نشاط**:
- **من وقت لوقت** → start + end (like before)
- **مدة تقديرية** → hours + minutes only (no clock range)

## 8) Next (optional)

Migrate `Home.jsx`, `Stats.jsx`, `ActivityDetails.jsx` off `localStorage` to `useActivities()` / `useActivity(id)` the same way as `Activities.jsx`.

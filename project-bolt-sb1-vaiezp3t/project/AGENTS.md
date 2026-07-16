# AGENTS.md — PicPromise

Wedding-photography marketplace SPA: Vite + React 18 + TypeScript + Tailwind v3 + Supabase (auth + Postgres).

## Commands
- `npm run dev` — Vite dev server
- `npm run build` — production build (`vite build`)
- `npm run lint` — ESLint (`eslint .`)
- `npm run typecheck` — `tsc --noEmit -p tsconfig.app.json` (uses tsconfig.app.json, NOT tsconfig.json)
- `npm run preview` — preview built output

No test runner is configured — there are no tests. Do not assume `npm test` exists.

## Environment
- App reads Supabase creds from `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). `.env` is gitignored; `src/lib/supabase.ts` throws at startup if either is missing.
- Only Vite-exposed `VITE_`-prefixed env vars reach the client.

## Architecture
- Entry: `src/main.tsx` → `src/App.tsx` (all routing lives here, react-router-dom v7).
- `src/lib/supabase.ts` — single Supabase client + shared domain types (Profile, Photographer, Package, Booking, Review, Message). Reuse these types; don't redefine.
- `src/lib/auth.tsx` — `AuthProvider` context + `useAuth()`. All auth/role logic flows through it. `useAuth()` throws if used outside the provider.
- Pages in `src/pages/`: Landing, Auth, CoupleDashboard, PhotographerDashboard, PhotographerSetup.
- Roles: `couple | photographer | admin`. Route guards (`PrivateRoute`, `AdminRoute`) enforce role-based access in `App.tsx`.

## Database
- Schema is in `supabase/migrations/20260707161448_001_initial_schema.sql` (profiles, photographers, bookings, reviews, messages). RLS enabled on all tables.
- Admin features in the UI are stubs ("coming soon"); manage data via the Supabase dashboard for now.

## Conventions
- Tailwind theme tokens are custom (e.g. `bg-parchment`, `text-sindoor`, `font-display`). Defined in `tailwind.config.js` — use these, don't invent colors.
- Icons: use `lucide-react` only. Per `.bolt/prompt`, don't add other UI/icon packages unless asked.
- `tsconfig.app.json` enables `noUnusedLocals`/`noUnusedParameters` — unused vars fail typecheck.
- `vite.config.ts` excludes `lucide-react` from dep optimization; leave that as-is.

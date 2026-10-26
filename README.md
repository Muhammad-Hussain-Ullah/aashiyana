# Aashiyana.pk

A polished React + Vite + TypeScript frontend for a student hostel and accommodation finder. Listings, accounts, favorites, reviews and enquiries are stored in Supabase (PostgreSQL + Auth + Row Level Security).

## Run locally

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

## Routes

- `/` — home, search hero, featured hostels, areas, and how it works
- `/hostels` — browse, search, filter, sort, and compare hostels
- `/hostels/:id` — photos, rooms, amenities, rules, reviews, and location placeholder
- `/compare` — compare up to three selected hostels
- `/favorites` — localStorage-backed saved hostels
- `/login`, `/signup` — frontend-only authentication UI
- `/dashboard` — mock user dashboard
- `/profile` — mock profile/preferences form
- `/write-review/:hostelId` — validated review form with demo confirmation

## Supabase setup (do this once)

1. Create a project at supabase.com (region: South Asia (Mumbai) is closest to Karachi).
2. **SQL Editor** → New query → paste `supabase/schema.sql` → Run. Then do the same with `supabase/seed.sql`.
3. **Authentication → Sign In / Providers → Email**: for local testing turn **Confirm email** off (otherwise users must click an email link before logging in). Under **URL Configuration** set Site URL to `http://localhost:5173`.
4. Copy `.env.example` to `.env` and fill in the Project URL and the **anon** public key (Project Settings → API). Never use the `service_role` key in this app.
5. `npm install` then `npm run dev` and open http://localhost:5173.
6. Sign up in the app, then make yourself admin in the SQL Editor:
   `update public.profiles set role = 'admin' where email = 'you@example.com';`
   (use `role = 'owner'` for hostel owners; only admins can approve/feature hostels and moderate reviews).

## Database

`supabase/schema.sql` creates 13 tables: `profiles`, `areas`, `universities`, `hostels`, `hostel_photos`, `rooms`, `amenities`, `hostel_amenities`, `hostel_rules`, `hostel_tags`, `reviews`, `favorites`, `enquiries`, plus the views `hostel_summary` (rent, rating and review count are computed live) and `area_summary`. It also contains the triggers (auto-profile on signup, review author from profile, admin-only hostel flags) and all RLS policies.

## Architecture

- `src/integrations/supabase/client.ts` — Supabase client (reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`)
- `src/services/hostelService.ts` — loads hostels once, maps rows to the `Hostel` type, filters/sorts in the browser
- `src/services/reviewService.ts`, `favoriteService.ts`, `enquiryService.ts`, `areaService.ts` — database operations
- `src/hooks/useAuth.tsx` — sign up / log in / log out / profile; `src/components/auth/RequireAuth.tsx` guards pages that need an account
- `src/hooks/useAppState.tsx` — shared hostels, favorites (per user, in the database) and compare list
- Routes use the hostel **slug** (e.g. `/hostels/greenview-gulshan`); database ids are UUIDs and stay inside the services.

## Known limits

- No admin/owner screens yet: approving hostels, adding listings and moderating reviews is done in the Supabase Table Editor / SQL Editor.
- Photos are Unsplash URLs; the `hostel-photos` and `avatars` Storage buckets exist but the UI doesn't upload yet.
- Password reset and Google sign-in are not enabled. "Move-in target" on the dashboard and the marketing numbers on the home page are static text.
- Supabase keeps the login session token in the browser (localStorage); passwords are never stored.

## Verification

`npm run build` passes with TypeScript checking and Vite production bundling. The services were also tested against a PostgREST instance running the same schema and seed (listing, filters, reviews, favorites, enquiries, profile updates and the security rules).

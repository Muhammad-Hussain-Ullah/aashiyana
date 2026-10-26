# Supabase integration

- `client.ts` creates the client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`).
- Database schema, seed data and RLS policies live in `/supabase/schema.sql` and `/supabase/seed.sql`.
- Only the public **anon** key belongs in the frontend. The `service_role` key bypasses Row Level Security and must never be used here.

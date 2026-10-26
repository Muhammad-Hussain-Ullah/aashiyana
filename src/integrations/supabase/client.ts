import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** False when .env is missing; App.tsx shows a setup screen instead of crashing. */
export const isSupabaseConfigured = Boolean(url && anonKey)

// Only the public anon key is ever used in the browser. Row Level Security protects the data.
export const supabase = createClient(url || 'http://localhost:54321', anonKey || 'missing-anon-key', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

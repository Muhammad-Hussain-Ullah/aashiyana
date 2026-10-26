import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppLayout } from './components/layout/AppLayout'
import { AppStateProvider } from './hooks/useAppState'
import { AuthProvider } from './hooks/useAuth'
import { RequireAuth } from './components/auth/RequireAuth'
import { isSupabaseConfigured } from './integrations/supabase/client'
import { Home } from './pages/Home'
import { Hostels } from './pages/Hostels'
import { HostelDetail } from './pages/HostelDetail'
import { Compare } from './pages/Compare'
import { Favorites } from './pages/Favorites'
import { Auth } from './pages/Auth'
import { Dashboard } from './pages/Dashboard'
import { Profile } from './pages/Profile'
import { WriteReview } from './pages/WriteReview'
import { NotFound } from './pages/NotFound'

function MissingConfig() { return <div className="mx-auto max-w-xl px-5 py-24"><h1 className="font-display text-3xl font-semibold">Supabase is not configured</h1><p className="mt-4 text-sm leading-6 text-slate-600">Copy <code>.env.example</code> to <code>.env</code>, fill in <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> (Supabase → Project Settings → API), then restart <code>npm run dev</code>.</p></div> }

export default function App() { if (!isSupabaseConfigured) return <MissingConfig />; return <BrowserRouter><AuthProvider><AppStateProvider><AppLayout><Routes><Route path="/" element={<Home />} /><Route path="/hostels" element={<Hostels />} /><Route path="/hostels/:id" element={<HostelDetail />} /><Route path="/compare" element={<Compare />} /><Route path="/favorites" element={<Favorites />} /><Route path="/login" element={<Auth mode="login" />} /><Route path="/signup" element={<Auth mode="signup" />} /><Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} /><Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} /><Route path="/write-review/:hostelId" element={<RequireAuth><WriteReview /></RequireAuth>} /><Route path="*" element={<NotFound />} /></Routes></AppLayout><Toaster position="bottom-right" toastOptions={{ className: 'font-sans' }} /></AppStateProvider></AuthProvider></BrowserRouter> }

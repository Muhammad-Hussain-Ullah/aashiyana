import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Heart, Menu, Search, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Logo } from '../ui/Logo'
import { useAppState } from '../../hooks/useAppState'
import { useAuth } from '../../hooks/useAuth'

const nav = [{ to: '/hostels', label: 'Find a hostel' }, { to: '/compare', label: 'Compare' }, { to: '/favorites', label: 'Favorites' }]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const { favorites, compareIds } = useAppState()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const firstName = (profile?.name || 'Account').split(' ')[0]
  const logout = async () => { setOpen(false); try { await signOut(); toast.success('Logged out'); navigate('/') } catch (error) { toast.error((error as Error).message) } }
  return <div className="min-h-screen bg-paper text-ink">
    <header className="sticky top-0 z-40 border-b border-[#e3e8de]/80 bg-paper/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `relative py-2 text-sm font-medium transition-colors ${isActive ? 'text-forest' : 'text-slate-600 hover:text-ink'}`}>
            {item.label}{item.to === '/favorites' && favorites.length > 0 && <span className="ml-1.5 rounded-full bg-lime px-1.5 py-0.5 text-[10px] font-bold text-ink">{favorites.length}</span>}{item.to === '/compare' && compareIds.length > 0 && <span className="ml-1.5 rounded-full bg-forest px-1.5 py-0.5 text-[10px] font-bold text-white">{compareIds.length}</span>}
          </NavLink>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {user ? <>
            <Link to="/dashboard" className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-700 transition hover:bg-white"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-[11px] font-bold text-lime">{profile?.avatar ?? '?'}</span>{firstName}</Link>
            <button onClick={logout} className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest">Log out</button>
          </> : <>
            <Link to="/login" className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-700 transition hover:bg-white"><UserRound className="h-4 w-4" /> Log in</Link>
            <Link to="/signup" className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest">Create account</Link>
          </>}
        </div>
        <button onClick={() => setOpen(!open)} className="rounded-lg p-2 text-ink md:hidden" aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && <div className="border-t border-[#e3e8de] bg-paper px-5 py-4 md:hidden">
        <nav className="flex flex-col gap-1">{nav.map((item) => <Link onClick={() => setOpen(false)} key={item.to} to={item.to} className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-ink hover:bg-white">{item.label}<span className="text-slate-400">→</span></Link>)}</nav>
        {user ? <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#e3e8de] pt-3"><Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-xl border border-[#d9e0d5] py-3 text-center text-sm font-semibold">{firstName}</Link><button onClick={logout} className="rounded-xl bg-ink py-3 text-center text-sm font-semibold text-white">Log out</button></div> : <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#e3e8de] pt-3"><Link to="/login" onClick={() => setOpen(false)} className="rounded-xl border border-[#d9e0d5] py-3 text-center text-sm font-semibold">Log in</Link><Link to="/signup" onClick={() => setOpen(false)} className="rounded-xl bg-ink py-3 text-center text-sm font-semibold text-white">Create account</Link></div>}
      </div>}
    </header>
    <main key={location.pathname} className="animate-fade-in">{children}</main>
    <footer className="border-t border-[#e0e6dc] bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div><Logo /><p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">A clearer way to find a place that feels right while you study.</p><p className="mt-6 text-xs text-slate-400">Listings and accounts powered by Supabase</p></div>
        <div><p className="mb-4 text-sm font-semibold text-ink">Explore</p><div className="space-y-3 text-sm text-slate-500"><Link className="block hover:text-forest" to="/hostels">Find a hostel</Link><Link className="block hover:text-forest" to="/compare">Compare stays</Link><Link className="block hover:text-forest" to="/favorites">Saved places</Link></div></div>
        <div><p className="mb-4 text-sm font-semibold text-ink">Your account</p><div className="space-y-3 text-sm text-slate-500"><Link className="block hover:text-forest" to="/dashboard">Dashboard</Link><Link className="block hover:text-forest" to="/profile">Profile</Link><Link className="block hover:text-forest" to="/login">Log in</Link></div></div>
        <div><p className="mb-4 text-sm font-semibold text-ink">Made for students</p><p className="text-sm leading-6 text-slate-500">Helping you spend less time searching and more time settling in.</p><div className="mt-5 flex gap-2"><span className="h-8 w-8 rounded-full bg-sand" /><span className="h-8 w-8 rounded-full bg-lime" /><span className="h-8 w-8 rounded-full bg-forest" /></div></div>
      </div>
      <div className="border-t border-[#e8ede5] py-4 text-center text-xs text-slate-400">© 2026 Aashiyana.pk · A university database systems project</div>
    </footer>
  </div>
}

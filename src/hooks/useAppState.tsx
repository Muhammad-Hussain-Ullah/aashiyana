import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { favoriteService } from '../services/favoriteService'
import { hostelService } from '../services/hostelService'
import { useAuth } from './useAuth'
import type { Hostel } from '../types'

interface AppState {
  hostels: Hostel[]
  hostelsLoading: boolean
  refreshHostels: () => Promise<void>
  favorites: string[]
  compareIds: string[]
  /** Resolves true when the favourite was actually changed (false if the user had to log in first). */
  toggleFavorite: (id: string) => Promise<boolean>
  toggleCompare: (id: string) => void
  isFavorite: (id: string) => boolean
}
const AppStateContext = createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [hostelsLoading, setHostelsLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [compareIds, setCompareIds] = useState<string[]>([])

  useEffect(() => {
    hostelService.all().then(setHostels).catch((error) => toast.error(`Could not load hostels: ${error.message ?? error}`)).finally(() => setHostelsLoading(false))
  }, [])

  const refreshHostels = useCallback(async () => {
    try { setHostels(await hostelService.refresh()) } catch (error) { toast.error(`Could not refresh hostels: ${(error as Error).message}`) }
  }, [])

  // Favourites live in the database now, so they follow the signed-in user.
  useEffect(() => {
    if (!user) { setFavorites([]); return }
    let active = true
    favoriteService.list().then((items) => { if (active) setFavorites(items.map((item) => item.hostelId)) }).catch((error) => toast.error(`Could not load favorites: ${error.message ?? error}`))
    return () => { active = false }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<AppState>(() => ({
    hostels,
    hostelsLoading,
    refreshHostels,
    favorites,
    compareIds,
    toggleFavorite: async (id: string) => {
      if (!user) {
        toast('Log in to save hostels', { action: { label: 'Log in', onClick: () => navigate('/login', { state: { from: location.pathname } }) } })
        return false
      }
      const wasSaved = favorites.includes(id)
      setFavorites((current) => (wasSaved ? current.filter((item) => item !== id) : [...current, id]))
      try { await favoriteService.set(id, !wasSaved); return true } catch (error) {
        setFavorites((current) => (wasSaved ? [...current, id] : current.filter((item) => item !== id)))
        toast.error(`Could not update favorites: ${(error as Error).message}`)
        return false
      }
    },
    toggleCompare: (id: string) => setCompareIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : ids.length < 3 ? [...ids, id] : ids),
    isFavorite: (id: string) => favorites.includes(id),
  }), [hostels, hostelsLoading, refreshHostels, favorites, compareIds, user, navigate, location.pathname])
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() { const value = useContext(AppStateContext); if (!value) throw new Error('useAppState must be used within AppStateProvider'); return value }

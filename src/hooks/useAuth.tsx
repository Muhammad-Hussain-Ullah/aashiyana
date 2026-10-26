import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../integrations/supabase/client'
import { initialsOf } from '../lib/format'
import type { UserProfile, UserRole } from '../types'

export interface ProfileUpdate { fullName: string; university: string; city: string }

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<{ needsConfirmation: boolean }>
  signOut: () => Promise<void>
  updateProfile: (patch: ProfileUpdate) => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

interface ProfileRow { full_name: string; email: string | null; university: string | null; city: string | null; phone: string | null; role: UserRole }

const toProfile = (row: ProfileRow, fallbackEmail: string): UserProfile => ({
  name: row.full_name,
  email: row.email ?? fallbackEmail,
  university: row.university ?? '',
  city: row.city ?? '',
  phone: row.phone ?? undefined,
  role: row.role,
  avatar: initialsOf(row.full_name),
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileReady, setProfileReady] = useState(false)
  const user = session?.user ?? null
  const userId = user?.id

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setSessionReady(true) })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  // Load the profile row whenever the signed-in user changes.
  useEffect(() => {
    if (!sessionReady) return
    if (!user) { setProfile(null); setProfileReady(true); return }
    let active = true
    setProfileReady(false)
    supabase.from('profiles').select('full_name, email, university, city, phone, role').eq('id', user.id).maybeSingle().then(({ data }) => {
      if (!active) return
      if (data) setProfile(toProfile(data as ProfileRow, user.email ?? ''))
      else {
        // Profile row missing (e.g. account created before the schema existed): fall back to auth metadata.
        const name = (user.user_metadata?.full_name as string | undefined) || (user.email ?? 'Student').split('@')[0]
        setProfile({ name, email: user.email ?? '', university: '', city: '', avatar: initialsOf(name), role: 'student' })
      }
      setProfileReady(true)
    })
    return () => { active = false }
  }, [sessionReady, userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<AuthState>(() => ({
    user,
    profile,
    loading: !sessionReady || !profileReady,
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) throw error
    },
    async signUp(email, password, fullName) {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: fullName.trim() } } })
      if (error) throw error
      if (data.user && data.user.identities?.length === 0) throw new Error('An account with this email already exists. Try logging in.')
      return { needsConfirmation: !data.session }
    },
    async signOut() {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    async updateProfile(patch) {
      if (!user) throw new Error('Please log in first')
      const { data, error } = await supabase.from('profiles').update({ full_name: patch.fullName.trim(), university: patch.university || null, city: patch.city.trim() || null }).eq('id', user.id).select('full_name, email, university, city, phone, role').single()
      if (error) throw error
      setProfile(toProfile(data as ProfileRow, user.email ?? ''))
    },
  }), [user, profile, sessionReady, profileReady])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used within AuthProvider'); return value }

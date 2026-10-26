import { supabase } from '../integrations/supabase/client'
import type { Favorite } from '../types'
import { hostelService } from './hostelService'

interface FavoriteRow { saved_at: string; hostel: { slug: string } | Array<{ slug: string }> | null }

export const favoriteService = {
  /** The signed-in user's saved hostels (RLS guarantees only their own rows come back). */
  async list(): Promise<Favorite[]> {
    const { data, error } = await supabase.from('favorites').select('saved_at, hostel:hostels(slug)').order('saved_at', { ascending: false })
    if (error) throw error
    return ((data ?? []) as unknown as FavoriteRow[]).flatMap((row) => {
      const hostel = Array.isArray(row.hostel) ? row.hostel[0] : row.hostel
      return hostel ? [{ hostelId: hostel.slug, savedAt: row.saved_at }] : []
    })
  },

  async set(slug: string, save: boolean): Promise<void> {
    const hostelId = await hostelService.dbIdFor(slug)
    if (save) {
      const { error } = await supabase.from('favorites').insert({ hostel_id: hostelId })
      if (error && error.code !== '23505') throw error // 23505 = already saved
    } else {
      const { error } = await supabase.from('favorites').delete().eq('hostel_id', hostelId)
      if (error) throw error
    }
  },
}

import { supabase } from '../integrations/supabase/client'

export interface PopularArea { name: string; count: string; image: string }

export const areaService = {
  async popular(): Promise<PopularArea[]> {
    const { data, error } = await supabase.from('area_summary').select('name, image_url, hostel_count').eq('is_popular', true).order('hostel_count', { ascending: false })
    if (error) throw error
    return (data ?? []).flatMap((row) => row.image_url ? [{ name: row.name as string, image: row.image_url as string, count: `${row.hostel_count} ${row.hostel_count === 1 ? 'stay' : 'stays'}` }] : [])
  },
}

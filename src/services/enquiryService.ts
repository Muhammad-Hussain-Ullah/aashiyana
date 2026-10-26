import { supabase } from '../integrations/supabase/client'
import { hostelService } from './hostelService'

export interface CreateEnquiryInput { hostelId: string; name: string; email: string; phone?: string; message: string }

export const enquiryService = {
  async create(input: CreateEnquiryInput): Promise<void> {
    const hostelDbId = await hostelService.dbIdFor(input.hostelId)
    const { error } = await supabase.from('enquiries').insert({ hostel_id: hostelDbId, name: input.name.trim(), email: input.email.trim(), phone: input.phone?.trim() || null, message: input.message.trim() })
    if (error) throw error
  },

  /** Number of this user's enquiries that are not closed yet. */
  async countOpenForUser(userId: string): Promise<number> {
    const { count, error } = await supabase.from('enquiries').select('id', { count: 'exact', head: true }).eq('user_id', userId).neq('status', 'closed')
    if (error) throw error
    return count ?? 0
  },
}

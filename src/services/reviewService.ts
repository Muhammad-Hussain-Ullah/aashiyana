import { supabase } from '../integrations/supabase/client'
import { initialsOf, timeAgo } from '../lib/format'
import type { Review } from '../types'
import { hostelService } from './hostelService'

export interface CreateReviewInput { hostelId: string; rating: number; title: string; body: string; stayType: string }

interface ReviewRow {
  id: string
  author_name: string
  rating: number
  title: string
  body: string
  stay_duration: string | null
  created_at: string
}

const toReview = (row: ReviewRow, hostelId: string): Review => ({
  id: row.id,
  hostelId,
  author: row.author_name,
  initials: initialsOf(row.author_name),
  rating: row.rating,
  title: row.title,
  body: row.body,
  date: timeAgo(row.created_at),
  stayType: row.stay_duration ?? '',
})

export const reviewService = {
  async listForHostel(hostelId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, author_name, rating, title, body, stay_duration, created_at, hostel:hostels!inner(slug)')
      .eq('hostel.slug', hostelId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    if (error) throw error
    return ((data ?? []) as unknown as ReviewRow[]).map((row) => toReview(row, hostelId))
  },

  /** Needs a signed-in user. The database fills in user_id and the author name. */
  async submit(input: CreateReviewInput, authorName: string): Promise<Review> {
    const hostelDbId = await hostelService.dbIdFor(input.hostelId)
    const { data, error } = await supabase
      .from('reviews')
      .insert({ hostel_id: hostelDbId, author_name: authorName, rating: input.rating, title: input.title.trim(), body: input.body.trim(), stay_duration: input.stayType, status: 'approved' })
      .select('id, author_name, rating, title, body, stay_duration, created_at')
      .single()
    if (error) {
      if (error.code === '23505') throw new Error('You have already reviewed this hostel.')
      throw error
    }
    return toReview(data as unknown as ReviewRow, input.hostelId)
  },
}

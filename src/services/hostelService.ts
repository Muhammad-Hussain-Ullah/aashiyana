import { supabase } from '../integrations/supabase/client'
import type { GenderEligibility, Hostel, RoomType } from '../types'

export interface HostelFilters {
  query?: string
  maxRent?: number
  minRent?: number
  gender?: string
  amenities?: string[]
  minRating?: number
  sort?: 'recommended' | 'rent-low' | 'rent-high' | 'rating'
}

// Shape of one row returned by the relational select below.
interface HostelRow {
  id: string
  slug: string
  name: string
  description: string
  gender: GenderEligibility
  address: string
  is_featured: boolean
  is_verified: boolean
  area: { name: string; city: string } | null
  university: { name: string } | null
  photos: Array<{ url: string; is_cover: boolean; sort_order: number }>
  rooms: Array<{ type: RoomType; rent: number; available: number; total: number; description: string }>
  amenities: Array<{ amenity: { name: string; icon: string } | null }>
  rules: Array<{ rule_text: string; sort_order: number }>
  tags: Array<{ tag: string }>
}

const HOSTEL_SELECT =
  'id, slug, name, description, gender, address, is_featured, is_verified, area:areas(name, city), university:universities(name), photos:hostel_photos(url, is_cover, sort_order), rooms(type, rent, available, total, description), amenities:hostel_amenities(amenity:amenities(name, icon)), rules:hostel_rules(rule_text, sort_order), tags:hostel_tags(tag)'

function toHostel(row: HostelRow, stats?: { rating: number; reviewCount: number }): Hostel {
  const photos = [...(row.photos ?? [])].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)
  const rooms = [...(row.rooms ?? [])].sort((a, b) => a.rent - b.rent)
  return {
    id: row.slug, // the frontend routes by slug; the database uuid never leaves the service layer
    name: row.name,
    slug: row.slug,
    location: { area: row.area?.name ?? '', city: row.area?.city ?? 'Karachi', address: row.address, university: row.university?.name ?? '' },
    coverImage: photos[0]?.url ?? '',
    gallery: photos.map((photo) => photo.url),
    startingRent: rooms.length ? Math.min(...rooms.map((room) => room.rent)) : 0,
    rating: stats?.rating ?? 0,
    reviewCount: stats?.reviewCount ?? 0,
    gender: row.gender,
    amenities: (row.amenities ?? []).flatMap((item) => (item.amenity ? [{ name: item.amenity.name, icon: item.amenity.icon }] : [])),
    rooms: rooms.map((room) => ({ type: room.type, rent: room.rent, available: room.available, total: room.total, description: room.description })),
    description: row.description,
    rules: [...(row.rules ?? [])].sort((a, b) => a.sort_order - b.sort_order).map((rule) => rule.rule_text),
    featured: row.is_featured,
    tags: (row.tags ?? []).map((item) => item.tag),
    verifiedDemo: row.is_verified,
  }
}

async function fetchAll(): Promise<Hostel[]> {
  const [details, summary] = await Promise.all([
    supabase.from('hostels').select(HOSTEL_SELECT).eq('status', 'approved'),
    supabase.from('hostel_summary').select('slug, rating, review_count').eq('status', 'approved'),
  ])
  if (details.error) throw details.error
  if (summary.error) throw summary.error
  const stats = new Map<string, { rating: number; reviewCount: number }>()
  for (const row of summary.data ?? []) stats.set(row.slug as string, { rating: Number(row.rating) || 0, reviewCount: Number(row.review_count) || 0 })
  return ((details.data ?? []) as unknown as HostelRow[]).map((row) => toHostel(row, stats.get(row.slug)))
}

// The catalogue is small, so it is loaded once and filtered in the browser.
let cache: Promise<Hostel[]> | null = null
function load(): Promise<Hostel[]> {
  if (!cache) cache = fetchAll().catch((error) => { cache = null; throw error })
  return cache
}

export const hostelService = {
  /** Re-read everything from the database (e.g. after a new review changes a rating). */
  async refresh(): Promise<Hostel[]> { cache = null; return load() },
  async all(): Promise<Hostel[]> { return load() },

  async list(filters: HostelFilters = {}): Promise<Hostel[]> {
    const query = filters.query?.toLowerCase().trim()
    const items = (await load()).filter((hostel) => {
      const searchable = [hostel.name, hostel.location.area, hostel.location.city, hostel.location.university].join(' ').toLowerCase()
      const matchesQuery = !query || searchable.includes(query)
      const matchesMax = !filters.maxRent || hostel.startingRent <= filters.maxRent
      const matchesMin = !filters.minRent || hostel.startingRent >= filters.minRent
      const matchesGender = !filters.gender || filters.gender === 'All' || hostel.gender === filters.gender || hostel.gender === 'All'
      const matchesRating = !filters.minRating || hostel.rating >= filters.minRating
      const matchesAmenities = !filters.amenities?.length || filters.amenities.every((amenity) => hostel.amenities.some((item) => item.name === amenity))
      return matchesQuery && matchesMax && matchesMin && matchesGender && matchesRating && matchesAmenities
    })
    return items.sort((a, b) => {
      if (filters.sort === 'rent-low') return a.startingRent - b.startingRent
      if (filters.sort === 'rent-high') return b.startingRent - a.startingRent
      if (filters.sort === 'rating') return b.rating - a.rating
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.rating - a.rating
    })
  },

  async getById(id: string): Promise<Hostel | undefined> { return (await load()).find((hostel) => hostel.id === id) },

  async getSimilar(hostel: Hostel): Promise<Hostel[]> {
    return (await load()).filter((item) => item.id !== hostel.id && (item.location.area === hostel.location.area || item.gender === hostel.gender)).slice(0, 3)
  },

  /** Frontend id (slug) -> database uuid. */
  async dbIdFor(slug: string): Promise<string> {
    const { data, error } = await supabase.from('hostels').select('id').eq('slug', slug).maybeSingle()
    if (error) throw error
    if (!data) throw new Error('Hostel not found')
    return data.id as string
  },
}

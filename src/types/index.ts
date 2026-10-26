export type GenderEligibility = 'Women' | 'Men' | 'All'
export type RoomType = 'Single' | 'Shared' | 'Studio'

export interface Location {
  area: string
  city: string
  address: string
  university: string
}

export interface Room {
  type: RoomType
  rent: number
  available: number
  total: number
  description: string
}

export interface Amenity {
  name: string
  icon: string
}

export interface Review {
  id: string
  hostelId: string
  author: string
  initials: string
  rating: number
  title: string
  body: string
  date: string
  stayType: string
}

export interface Hostel {
  id: string
  name: string
  slug: string
  location: Location
  coverImage: string
  gallery: string[]
  startingRent: number
  rating: number
  reviewCount: number
  gender: GenderEligibility
  amenities: Amenity[]
  rooms: Room[]
  description: string
  rules: string[]
  featured?: boolean
  tags: string[]
  verifiedDemo?: boolean
}

export type UserRole = 'student' | 'owner' | 'admin'

export interface UserProfile {
  name: string
  email: string
  university: string
  city: string
  avatar: string
  phone?: string
  role?: UserRole
}

export interface Favorite {
  hostelId: string
  savedAt: string
}

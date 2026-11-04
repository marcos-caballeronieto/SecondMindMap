export type PriceLevel = 'free' | '$' | '$$' | '$$$' | '$$$$'

export type SectionKey =
  | 'general_info'
  | 'history'
  | 'curiosities'
  | 'highlights'
  | 'art_pieces'
  | 'food_specialties'
  | 'practical_tips'
  | 'photo_spots'
  | 'personal_notes'

export interface SectionConfig {
  key: SectionKey
  title: string
  titleEs: string
  iconName: 'Info' | 'Landmark' | 'Sparkles' | 'Eye' | 'Palette' | 'UtensilsCrossed' | 'Lightbulb' | 'Camera' | 'BookOpen'
  emoji: string
  header: string
  placeholder: string
  description: string
}

export type SectionMap = Partial<Record<SectionKey, string>>

export interface Place {
  id: string
  user_id: string
  name: string
  latitude: number
  longitude: number
  is_visited: boolean
  price_level: PriceLevel
  notes_markdown: string
  metadata: Record<string, unknown>
  created_at: string
}

export type PlaceInsert = Omit<Place, 'id' | 'user_id' | 'created_at'>
export type PlaceUpdate = Partial<PlaceInsert>

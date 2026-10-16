export type PriceLevel = 'free' | '$' | '$$' | '$$$' | '$$$$'

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

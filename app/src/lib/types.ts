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
  collection_ids?: string[]
}

export type PlaceInsert = Omit<Place, 'id' | 'user_id' | 'created_at' | 'collection_ids'> & {
  collection_ids?: string[]
}
export type PlaceUpdate = Partial<PlaceInsert>

// ─── Collections & Tagging ───────────────────────────────────────────────────

export type CollectionIconKey =
  | 'Folder'
  | 'Coffee'
  | 'Castle'
  | 'Utensils'
  | 'Landmark'
  | 'Mountain'
  | 'Camera'
  | 'Wine'
  | 'BookOpen'
  | 'Bed'
  | 'Compass'
  | 'Bike'
  | 'Heart'
  | 'Trees'
  | 'Footprints'
  | 'Church'
  | 'ShoppingBag'

export interface Collection {
  id: string
  user_id: string
  name: string
  description: string
  color: string
  icon: CollectionIconKey
  created_at: string
}

export type CollectionInsert = Omit<Collection, 'id' | 'user_id' | 'created_at'>
export type CollectionUpdate = Partial<CollectionInsert>

export interface PlaceCollection {
  place_id: string
  collection_id: string
  created_at?: string
}

export interface CollectionPaletteOption {
  hex: string
  name: string
}

export const COLLECTION_PALETTE: CollectionPaletteOption[] = [
  { hex: '#8f3a2b', name: 'Sangre de Buey' },
  { hex: '#2f5d6b', name: 'Tinta Marina' },
  { hex: '#4d6b3a', name: 'Musgo Caligráfico' },
  { hex: '#b07a2a', name: 'Ocre Dorado' },
  { hex: '#6e3b5c', name: 'Ciruela Imperial' },
  { hex: '#434882', name: 'Añil Antiguo' },
  { hex: '#b35036', name: 'Terracota' },
  { hex: '#2b2118', name: 'Tinta Carbón' },
  { hex: '#59705a', name: 'Salvia Rústica' },
  { hex: '#b87828', name: 'Ámbar Pergamino' },
]

export interface CollectionIconOption {
  key: CollectionIconKey
  label: string
}

export const COLLECTION_ICONS: CollectionIconOption[] = [
  { key: 'Folder', label: 'Carpeta' },
  { key: 'Coffee', label: 'Café' },
  { key: 'Castle', label: 'Castillo' },
  { key: 'Utensils', label: 'Restaurante' },
  { key: 'Landmark', label: 'Monumento' },
  { key: 'Mountain', label: 'Naturaleza' },
  { key: 'Camera', label: 'Fotografía' },
  { key: 'Wine', label: 'Bodega / Bar' },
  { key: 'BookOpen', label: 'Lectura / Cultura' },
  { key: 'Bed', label: 'Alojamiento' },
  { key: 'Compass', label: 'Exploración' },
  { key: 'Bike', label: 'Ruta en Bici' },
  { key: 'Heart', label: 'Favorito' },
  { key: 'Trees', label: 'Parque / Bosque' },
  { key: 'Footprints', label: 'Paseo / Sendero' },
  { key: 'Church', label: 'Templo / Iglesia' },
  { key: 'ShoppingBag', label: 'Mercado / Tienda' },
]

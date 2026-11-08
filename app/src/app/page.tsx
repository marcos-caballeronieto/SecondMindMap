'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useEffect } from 'react'
import {
  Globe, Plus, Search, Download, LogOut, X, List, ChevronUp, Sparkles, Bookmark, BookOpen, ChevronRight, ChevronLeft
} from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { getPlaces, createPlace, updatePlace, deletePlace } from '@/lib/actions/places'
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  togglePlaceCollection,
} from '@/lib/actions/collections'
import type { Place, PlaceInsert, Collection, CollectionInsert } from '@/lib/types'
import PlaceDetail from '@/components/PlaceDetail'
import PlaceForm from '@/components/PlaceForm'
import JsonModal from '@/components/JsonModal'
import MarkdownModal from '@/components/MarkdownModal'
import AuthForm from '@/components/AuthForm'
import CollectionModal from '@/components/CollectionModal'
import CollectionFilterBar from '@/components/CollectionFilterBar'
import { CollectionIcon } from '@/components/notebook/CollectionIcon'

// MapView is client-only (no SSR) because MapLibre needs browser APIs
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

type PanelMode = 'closed' | 'list' | 'detail' | 'form'
type SheetHeight = 'peek' | 'half' | 'full'

// Price marks in the paper & ink palette (spec D4)
const PRICE_VARS: Record<string, string> = {
  free: 'var(--price-free)',
  '$': 'var(--price-1)',
  '$$': 'var(--price-2)',
  '$$$': 'var(--price-3)',
  '$$$$': 'var(--price-4)',
}

const INITIAL_DEMO_COLLECTIONS: Collection[] = [
  {
    id: 'demo-col-1',
    user_id: 'demo-user',
    name: 'Ruta de Cafés Históricos',
    description: 'Los cafés con más solera, tertulia literaria y buen café',
    color: '#8f3a2b',
    icon: 'Coffee',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'demo-col-2',
    user_id: 'demo-user',
    name: 'Patrimonio & Monumentos',
    description: 'Obras maestras de la arquitectura y la historia antigua',
    color: '#2f5d6b',
    icon: 'Landmark',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'demo-col-3',
    user_id: 'demo-user',
    name: 'Castillos & Fortalezas',
    description: 'Ciudadelas y recintos históricos medievales',
    color: '#b07a2a',
    icon: 'Castle',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

const INITIAL_DEMO_PLACES: Place[] = [
  {
    id: 'demo-1',
    user_id: 'demo-user',
    name: 'Coliseo Romano',
    latitude: 41.8902,
    longitude: 12.4922,
    is_visited: true,
    price_level: '$$',
    notes_markdown:
      '## Historia y Arquitectura\n\nEl **Anfiteatro Flavio**, conocido universalmente como el Coliseo, fue inaugurado en el año 80 d.C. bajo el mandato del emperador Tito.\n\n* **Capacidad estimada:** Más de 60.000 espectadores.\n* **Materiales:** Travertino, toba y hormigón romano.\n\n> Consejo viajero: Imprescindible reservar con antelación la entrada con acceso a los subterráneos (hipogeo).',
    metadata: {},
    created_at: new Date(Date.now() - 86400000).toISOString(),
    collection_ids: ['demo-col-2', 'demo-col-3'],
  },
  {
    id: 'demo-2',
    user_id: 'demo-user',
    name: 'Panteón de Agripa',
    latitude: 41.8986,
    longitude: 12.4769,
    is_visited: false,
    price_level: 'free',
    notes_markdown:
      '## La Cúpula y el Óculo\n\nEl edificio mejor conservado de la Antigua Roma.\n\n* Su cúpula de hormigón en masa no armado sigue siendo la mayor del mundo (43,3 m de diámetro).\n* El óculo de 9 metros en el cenit es la única fuente de luz natural.\n* Tumba de personalidades históricas como el pintor **Rafael**.',
    metadata: {},
    created_at: new Date(Date.now() - 43200000).toISOString(),
    collection_ids: ['demo-col-2'],
  },
  {
    id: 'demo-3',
    user_id: 'demo-user',
    name: 'Basílica de la Sagrada Familia',
    latitude: 41.4036,
    longitude: 2.1744,
    is_visited: true,
    price_level: '$$$',
    notes_markdown:
      '## Obra Cumbre del Modernismo Catalán\n\nDiseñada por Antoni Gaudí, su construcción comenzó en 1882 y continúa activa.\n\n* **Simbolismo lumínico:** Fachada del Nacimiento (amanecer, azules/verdes) vs Fachada de la Pasión (ocaso, rojos/ámbares).\n* **Columnas arborescentes:** El interior emula la estructura de un bosque de piedra.',
    metadata: {},
    created_at: new Date().toISOString(),
    collection_ids: ['demo-col-1', 'demo-col-2'],
  },
]

export default function SecondMindMapApp() {
  const supabase = createClient()
  const isConfigured = isSupabaseConfigured()

  // ─── Auth ────────────────────────────────────────────────────────────────
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    // Check local demo session first
    const demoStored =
      typeof window !== 'undefined'
        ? localStorage.getItem('secondmindmap_is_demo') || localStorage.getItem('geomind_is_demo')
        : null
    if (demoStored === 'true') {
      setIsDemoUser(true)
      setUser({ id: 'demo-user', email: 'invitado@secondmindmap.local' })
      setAuthLoading(false)
      return
    }

    if (!isConfigured) {
      setAuthLoading(false)
      return
    }

    supabase.auth
      .getUser()
      .then(({ data }) => {
        setUser(data.user)
        setAuthLoading(false)
      })
      .catch(() => {
        setAuthLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [isConfigured, supabase])

  // ─── Places State ────────────────────────────────────────────────────────
  const [places, setPlaces] = useState<Place[]>([])
  const [loadingPlaces, setLoadingPlaces] = useState(false)

  // ─── Collections State ───────────────────────────────────────────────────
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([])
  const [showCollectionModal, setShowCollectionModal] = useState(false)

  const saveLocalPlaces = (newPlaces: Place[]) => {
    setPlaces(newPlaces)
    if (typeof window !== 'undefined') {
      localStorage.setItem('secondmindmap_places', JSON.stringify(newPlaces))
    }
  }

  const saveLocalCollections = (newCols: Collection[]) => {
    setCollections(newCols)
    if (typeof window !== 'undefined') {
      localStorage.setItem('secondmindmap_collections', JSON.stringify(newCols))
    }
  }

  const fetchPlaces = useCallback(async () => {
    if (!user) return

    if (isDemoUser || !isConfigured) {
      if (typeof window !== 'undefined') {
        const cachedPlaces =
          localStorage.getItem('secondmindmap_places') || localStorage.getItem('geomind_places')
        if (cachedPlaces) {
          try {
            setPlaces(JSON.parse(cachedPlaces))
          } catch {
            setPlaces(INITIAL_DEMO_PLACES)
          }
        } else {
          setPlaces(INITIAL_DEMO_PLACES)
          localStorage.setItem('secondmindmap_places', JSON.stringify(INITIAL_DEMO_PLACES))
        }

        const cachedCols = localStorage.getItem('secondmindmap_collections')
        if (cachedCols) {
          try {
            setCollections(JSON.parse(cachedCols))
          } catch {
            setCollections(INITIAL_DEMO_COLLECTIONS)
          }
        } else {
          setCollections(INITIAL_DEMO_COLLECTIONS)
          localStorage.setItem('secondmindmap_collections', JSON.stringify(INITIAL_DEMO_COLLECTIONS))
        }
      }
      return
    }

    setLoadingPlaces(true)
    try {
      const [placesData, colsData] = await Promise.all([
        getPlaces(),
        getCollections(),
      ])
      setPlaces(placesData)
      setCollections(colsData)
    } catch {
      // Ignore network errors
    } finally {
      setLoadingPlaces(false)
    }
  }, [user, isDemoUser, isConfigured])

  useEffect(() => {
    fetchPlaces()
  }, [fetchPlaces])

  // ─── UI State ────────────────────────────────────────────────────────────
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [editingPlace, setEditingPlace] = useState<Place | null>(null)
  const [pendingMarker, setPendingMarker] = useState<{ lat: number; lng: number } | null>(null)
  const [panelMode, setPanelMode] = useState<PanelMode>('closed')
  const [sheetHeight, setSheetHeight] = useState<SheetHeight>('half')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isPickingLocation, setIsPickingLocation] = useState(false)
  const [showJsonModal, setShowJsonModal] = useState(false)
  const [markdownModal, setMarkdownModal] = useState<{ content: string; title: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // ─── Filtered places (Search + Match ALL / AND logic for Collections) ─────
  const filteredPlaces = places.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.notes_markdown && p.notes_markdown.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false

    if (selectedCollectionIds.length === 0) return true

    const placeCols = p.collection_ids ?? []
    return selectedCollectionIds.every((id) => placeCols.includes(id))
  })

  // ─── Map interactions ────────────────────────────────────────────────────
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (isPickingLocation) {
      setPendingMarker({ lat, lng })
      setIsPickingLocation(false)
      setSheetHeight('full')
      return
    }
    if (panelMode === 'form') return
    setPendingMarker({ lat, lng })
    setEditingPlace(null)
    setSelectedPlace(null)
    setPanelMode('form')
    setSheetHeight('full')
    setIsSidebarOpen(true)
  }, [isPickingLocation, panelMode])

  const handleSelectPlace = useCallback((place: Place) => {
    setSelectedPlace(place)
    setPanelMode('detail')
    setSheetHeight('half')
    setPendingMarker(null)
    setIsSidebarOpen(true)
  }, [])

  // ─── CRUD Places ─────────────────────────────────────────────────────────
  const handleCreatePlace = async (data: PlaceInsert) => {
    if (isDemoUser || !isConfigured) {
      const newPlace: Place = {
        ...data,
        id: 'place-' + Date.now(),
        user_id: user?.id ?? 'demo-user',
        created_at: new Date().toISOString(),
        collection_ids: data.collection_ids ?? [],
      }
      const updated = [newPlace, ...places]
      saveLocalPlaces(updated)
      setPendingMarker(null)
      setSelectedPlace(newPlace)
      setPanelMode('detail')
      setSheetHeight('half')
      return
    }

    const created = await createPlace(data)
    setPlaces((prev) => [created, ...prev])
    setPendingMarker(null)
    setSelectedPlace(created)
    setPanelMode('detail')
    setSheetHeight('half')
  }

  const handleUpdatePlace = async (data: PlaceInsert) => {
    if (!editingPlace) return

    if (isDemoUser || !isConfigured) {
      const updatedPlace: Place = {
        ...editingPlace,
        ...data,
        collection_ids: data.collection_ids ?? editingPlace.collection_ids ?? [],
      }
      const updated = places.map((p) => (p.id === updatedPlace.id ? updatedPlace : p))
      saveLocalPlaces(updated)
      setSelectedPlace(updatedPlace)
      setEditingPlace(null)
      setPanelMode('detail')
      setSheetHeight('half')
      return
    }

    const updated = await updatePlace(editingPlace.id, data)
    setPlaces((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setSelectedPlace(updated)
    setEditingPlace(null)
    setPanelMode('detail')
    setSheetHeight('half')
  }

  const handleDeletePlace = async (id: string) => {
    if (isDemoUser || !isConfigured) {
      const updated = places.filter((p) => p.id !== id)
      saveLocalPlaces(updated)
      setSelectedPlace(null)
      setPanelMode('list')
      setSheetHeight('half')
      return
    }

    await deletePlace(id)
    setPlaces((prev) => prev.filter((p) => p.id !== id))
    setSelectedPlace(null)
    setPanelMode('list')
    setSheetHeight('half')
  }

  const handleToggleVisited = async (id: string, current: boolean) => {
    if (isDemoUser || !isConfigured) {
      const updated = places.map((p) => (p.id === id ? { ...p, is_visited: !current } : p))
      saveLocalPlaces(updated)
      if (selectedPlace?.id === id) {
        setSelectedPlace({ ...selectedPlace, is_visited: !current })
      }
      return
    }

    const updated = await updatePlace(id, { is_visited: !current })
    setPlaces((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    if (selectedPlace?.id === id) setSelectedPlace(updated)
  }

  // ─── CRUD Collections ────────────────────────────────────────────────────
  const handleCreateCollection = async (data: CollectionInsert) => {
    if (isDemoUser || !isConfigured) {
      const newCol: Collection = {
        ...data,
        id: 'col-' + Date.now(),
        user_id: user?.id ?? 'demo-user',
        created_at: new Date().toISOString(),
      }
      saveLocalCollections([newCol, ...collections])
      return
    }

    const created = await createCollection(data)
    setCollections((prev) => [created, ...prev])
  }

  const handleUpdateCollection = async (id: string, data: CollectionInsert) => {
    if (isDemoUser || !isConfigured) {
      const updated = collections.map((c) => (c.id === id ? { ...c, ...data } : c))
      saveLocalCollections(updated)
      return
    }

    const updated = await updateCollection(id, data)
    setCollections((prev) => prev.map((c) => (c.id === id ? updated : c)))
  }

  const handleDeleteCollection = async (id: string) => {
    if (isDemoUser || !isConfigured) {
      const updatedCols = collections.filter((c) => c.id !== id)
      saveLocalCollections(updatedCols)
      const updatedPlaces = places.map((p) => ({
        ...p,
        collection_ids: (p.collection_ids ?? []).filter((cid) => cid !== id),
      }))
      saveLocalPlaces(updatedPlaces)
      setSelectedCollectionIds((prev) => prev.filter((cid) => cid !== id))
      return
    }

    await deleteCollection(id)
    setCollections((prev) => prev.filter((c) => c.id !== id))
    setPlaces((prev) =>
      prev.map((p) => ({
        ...p,
        collection_ids: (p.collection_ids ?? []).filter((cid) => cid !== id),
      }))
    )
    setSelectedCollectionIds((prev) => prev.filter((cid) => cid !== id))
  }

  const handleTogglePlaceCollection = async (
    placeId: string,
    collectionId: string,
    shouldAssign: boolean
  ) => {
    const updatePlaceCollectionIds = (targetPlaces: Place[]) =>
      targetPlaces.map((p) => {
        if (p.id !== placeId) return p
        const current = p.collection_ids ?? []
        const updatedIds = shouldAssign
          ? Array.from(new Set([...current, collectionId]))
          : current.filter((id) => id !== collectionId)
        return { ...p, collection_ids: updatedIds }
      })

    const updated = updatePlaceCollectionIds(places)
    if (isDemoUser || !isConfigured) {
      saveLocalPlaces(updated)
      if (selectedPlace?.id === placeId) {
        const found = updated.find((p) => p.id === placeId)
        if (found) setSelectedPlace(found)
      }
      return
    }

    setPlaces(updated)
    if (selectedPlace?.id === placeId) {
      const found = updated.find((p) => p.id === placeId)
      if (found) setSelectedPlace(found)
    }
    await togglePlaceCollection(placeId, collectionId, shouldAssign)
  }

  const handleToggleCollectionFilter = (id: string) => {
    setSelectedCollectionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleClearCollectionFilters = () => {
    setSelectedCollectionIds([])
  }

  // ─── JSON Import ──────────────────────────────────────────────────────────
  const handleImport = async (items: Partial<Place>[]) => {
    if (isDemoUser || !isConfigured) {
      const newItems: Place[] = items.map((item, index) => ({
        id: 'imported-' + Date.now() + '-' + index,
        user_id: user?.id ?? 'demo-user',
        name: item.name ?? 'Sin nombre',
        latitude: item.latitude ?? 0,
        longitude: item.longitude ?? 0,
        is_visited: item.is_visited ?? false,
        price_level: item.price_level ?? 'free',
        notes_markdown: item.notes_markdown ?? '',
        metadata: item.metadata ?? {},
        created_at: new Date().toISOString(),
        collection_ids: item.collection_ids ?? [],
      }))
      const updated = [...newItems, ...places]
      saveLocalPlaces(updated)
      return
    }

    for (const item of items) {
      const created = await createPlace({
        name: item.name ?? 'Sin nombre',
        latitude: item.latitude ?? 0,
        longitude: item.longitude ?? 0,
        is_visited: item.is_visited ?? false,
        price_level: item.price_level ?? 'free',
        notes_markdown: item.notes_markdown ?? '',
        metadata: item.metadata ?? {},
        collection_ids: item.collection_ids ?? [],
      })
      setPlaces((prev) => [created, ...prev])
    }
  }

  // ─── Guest / Demo Mode ────────────────────────────────────────────────────
  const handleContinueAsGuest = () => {
    setIsDemoUser(true)
    setUser({ id: 'demo-user', email: 'invitado@secondmindmap.local' })
    if (typeof window !== 'undefined') {
      localStorage.setItem('secondmindmap_is_demo', 'true')
    }
  }

  const handleLogout = async () => {
    if (isDemoUser) {
      setIsDemoUser(false)
      setUser(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('secondmindmap_is_demo')
        localStorage.removeItem('geomind_is_demo')
      }
      return
    }

    try {
      await supabase.auth.signOut()
    } catch {
      // Ignore network error on signout
    }
    setUser(null)
  }

  // ─── Close panel ─────────────────────────────────────────────────────────
  const closePanel = () => {
    setPanelMode('closed')
    setSelectedPlace(null)
    setEditingPlace(null)
    setPendingMarker(null)
    setIsPickingLocation(false)
    setSheetHeight('peek')
  }

  // Cancel picking location on Escape key
  useEffect(() => {
    if (!isPickingLocation) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPickingLocation(false)
        setSheetHeight('full')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPickingLocation])

  // ─── Auth loading ─────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <Globe size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    )
  }

  if (!user) return <AuthForm onContinueAsGuest={handleContinueAsGuest} />

  // ─── Sheet heights map ────────────────────────────────────────────────────
  const sheetTranslates: Record<SheetHeight, string> = {
    peek: 'translateY(calc(100% - 60px))',
    half: 'translateY(35%)',
    full: 'translateY(0)',
  }

  // Plain render function (not a component): avoids remounting the panel on every render
  const renderPanel = () => {
    if (panelMode === 'form') {
      return (
        <>
          <h3 className="text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
            {editingPlace ? 'Editar entrada' : 'Nueva entrada'}
          </h3>
          <PlaceForm
            key={editingPlace ? `edit-${editingPlace.id}` : 'new-place'}
            initialLat={pendingMarker?.lat}
            initialLng={pendingMarker?.lng}
            editingPlace={editingPlace}
            collections={collections}
            onOpenManageCollections={() => setShowCollectionModal(true)}
            onSubmit={editingPlace ? handleUpdatePlace : handleCreatePlace}
            onCancel={closePanel}
            onPickLocationOnMap={() => {
              setIsPickingLocation(true)
            }}
          />
        </>
      )
    }

    if (panelMode === 'detail' && selectedPlace) {
      return (
        <PlaceDetail
          place={selectedPlace}
          collections={collections}
          onClose={closePanel}
          onEdit={(place) => {
            setEditingPlace(place)
            setPanelMode('form')
            setSheetHeight('full')
          }}
          onDelete={handleDeletePlace}
          onToggleVisited={handleToggleVisited}
          onExpandNotes={(content, title) => setMarkdownModal({ content, title })}
          onToggleCollectionAssignment={handleTogglePlaceCollection}
        />
      )
    }

    // List mode (default)
    return (
      <div className="flex flex-col gap-1">
        {/* Inline collection filters in sidebar for fast access */}
        {collections.length > 0 && (
          <CollectionFilterBar
            collections={collections}
            places={places}
            selectedCollectionIds={selectedCollectionIds}
            onToggleCollectionFilter={handleToggleCollectionFilter}
            onClearFilters={handleClearCollectionFilters}
            onOpenManageModal={() => setShowCollectionModal(true)}
            inline={true}
          />
        )}
        {loadingPlaces ? (
          <div className="flex justify-center py-8">
            <Globe size={20} className="animate-spin text-muted" />
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="text-center py-8">
            <p className="empty-page">
              {searchQuery || selectedCollectionIds.length > 0
                ? 'Sin resultados para los filtros seleccionados'
                : 'Toca el mapa para añadir un lugar'}
            </p>
          </div>
        ) : (
          filteredPlaces.map((place) => {
            const placeCols = collections.filter((c) =>
              place.collection_ids?.includes(c.id)
            )

            return (
              <button
                key={place.id}
                className="index-row"
                data-active={selectedPlace?.id === place.id}
                onClick={() => handleSelectPlace(place)}
              >
                <span className="index-row-title">{place.name}</span>
                <span className="index-row-meta">
                  <span className="price-mark">
                    <span className="price-dot" style={{ color: PRICE_VARS[place.price_level] ?? 'var(--accent)' }} />
                    {place.price_level === 'free' ? 'Gratis' : place.price_level}
                  </span>
                  {place.is_visited && (
                    <span className="stamp" style={{ fontSize: '0.85rem' }}>Visitado</span>
                  )}
                </span>

                {/* Thematic collection tags on list card */}
                {placeCols.length > 0 && (
                  <span className="flex flex-wrap gap-1 mt-1">
                    {placeCols.map((c) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full text-white shadow-sm"
                        style={{ backgroundColor: c.color }}
                      >
                        <CollectionIcon name={c.icon} size={9} />
                        <span>{c.name}</span>
                      </span>
                    ))}
                  </span>
                )}

                {place.notes_markdown && (
                  <span className="index-row-snippet">
                    {place.notes_markdown.replace(/[#*`]/g, '').slice(0, 60)}...
                  </span>
                )}
              </button>
            )
          })
        )}
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-base)' }}>
      {/* ── Top Bar (Notebook cover strip across the top) ────────────────── */}
      <header
        className="topbar glass-strong"
        style={{
          right: isSidebarOpen ? 420 : 0,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-8 h-8 flex items-center justify-center border"
            style={{ borderColor: 'var(--border-bright)', borderRadius: 'var(--radius-sm)', color: 'var(--accent)' }}
          >
            <Globe size={16} />
          </div>
          <span className="hidden sm:block" style={{ fontFamily: 'var(--font-display-stack)', fontSize: '1.15rem', color: 'var(--text-primary)' }}>
            SecondMindMap
          </span>

          {/* Demo badge */}
          {isDemoUser && (
            <span
              className="badge hidden md:inline-flex items-center gap-1"
              title="Guardando datos localmente en tu navegador"
            >
              <Sparkles size={11} />
              Modo Demo (Local)
            </span>
          )}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-sm mx-auto">
          {showSearch ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                className="input"
                style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                placeholder="Buscar en el diario"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="btn-icon btn-ghost"
                onClick={() => { setShowSearch(false); setSearchQuery('') }}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-ghost btn-sm w-full"
              onClick={() => setShowSearch(true)}
              id="search-button"
              aria-label="Buscar en el diario"
            >
              <Search size={14} />
              <span className="hidden sm:inline">Buscar en el diario</span>
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Toggle sidebar button in topbar */}
          <button
            className="btn btn-ghost btn-sm hidden md:flex items-center gap-1.5 text-xs"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? 'Ocultar diario' : 'Ver diario'}
            aria-pressed={isSidebarOpen}
          >
            <BookOpen size={14} style={{ color: 'var(--color-oxblood)' }} />
            <span>{isSidebarOpen ? 'Ocultar diario' : 'Ver diario'}</span>
          </button>

          <button
            className="btn btn-ghost btn-sm flex items-center gap-1 text-xs"
            onClick={() => setShowCollectionModal(true)}
            title="Gestionar colecciones temáticas"
          >
            <Bookmark size={14} style={{ color: 'var(--color-oxblood)' }} />
            <span className="hidden md:inline">Listas</span>
          </button>
          <button
            id="json-modal-button"
            className="btn btn-ghost btn-sm btn-icon"
            onClick={() => setShowJsonModal(true)}
            title="Importar / Exportar JSON"
          >
            <Download size={15} />
          </button>
          <button
            id="add-place-button"
            className="btn btn-primary btn-sm btn-icon"
            onClick={() => {
              setPanelMode('form')
              setSheetHeight('full')
              setEditingPlace(null)
              setPendingMarker(null)
              setIsSidebarOpen(true)
            }}
            title="Añadir lugar"
          >
            <Plus size={15} />
          </button>
          <button
            className="btn btn-ghost btn-sm btn-icon"
            onClick={handleLogout}
            title={isDemoUser ? 'Salir del modo Demo' : 'Cerrar sesión'}
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* ── Collection Filter Bar (Thematic Tag Ribbon above map) ────────── */}
      <CollectionFilterBar
        collections={collections}
        places={places}
        selectedCollectionIds={selectedCollectionIds}
        onToggleCollectionFilter={handleToggleCollectionFilter}
        onClearFilters={handleClearCollectionFilters}
        onOpenManageModal={() => setShowCollectionModal(true)}
        style={{ right: isSidebarOpen ? 420 : 0 }}
      />

      {/* ── Map ─────────────────────────────────────────────────────────── */}
      <div
        className="map-wrapper"
        style={{
          position: 'absolute',
          inset: 0,
          top: 100,
          right: isSidebarOpen ? 420 : 0,
          transition: 'right 0.26s ease',
        }}
      >
        <MapView
          places={filteredPlaces}
          collections={collections}
          selectedCollectionIds={selectedCollectionIds}
          selectedPlaceId={selectedPlace?.id ?? null}
          onSelectPlace={handleSelectPlace}
          onMapClick={handleMapClick}
          pendingMarker={pendingMarker}
        />
      </div>

      {/* ── Map Location Picker Banner ──────────────────────────────────── */}
      {isPickingLocation && (
        <aside
          aria-label="Seleccionar ubicación en el mapa"
          className="fixed top-28 sm:top-32 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded shadow-lg border border-[var(--border-bright)] bg-[var(--bg-base)] animate-fadeIn max-w-[92vw]"
          style={{
            boxShadow: '0 4px 16px rgba(43, 33, 24, 0.2)',
          }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-ping flex-shrink-0" />
          <span
            className="text-xs sm:text-sm font-medium text-[var(--text-primary)] whitespace-nowrap"
            style={{ fontFamily: 'var(--font-body-stack)' }}
          >
            Toca el mapa para fijar la ubicación
          </span>
          <button
            type="button"
            onClick={() => {
              setIsPickingLocation(false)
              setSheetHeight('full')
            }}
            className="btn btn-ghost btn-sm text-xs py-1 px-2.5 h-auto min-h-[28px] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Cancelar
          </button>
        </aside>
      )}

      {/* ── Desktop Sidebar (Field Diary Spread) ─────────────────────────── */}
      <aside
        className="sidebar"
        style={{
          transform: isPickingLocation || !isSidebarOpen ? 'translateX(100%)' : 'translateX(0)',
        }}
      >
        {/* Sticky Sidebar Header: aligns with topbar (height 56px) */}
        <div className="sidebar-header">
          <div className="flex items-center gap-2 min-w-0">
            <Bookmark size={15} style={{ color: 'var(--color-oxblood)' }} />
            <h2
              className="font-normal text-base italic truncate"
              style={{
                fontFamily: 'var(--font-display-stack)',
                color: 'var(--color-ink)',
              }}
            >
              {panelMode === 'form'
                ? (editingPlace ? 'Editar entrada' : 'Nueva entrada')
                : panelMode === 'detail' && selectedPlace
                ? selectedPlace.name
                : `Índice (${filteredPlaces.length})`}
            </h2>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {panelMode !== 'form' && panelMode !== 'detail' && (
              <button
                className="btn btn-primary btn-sm flex items-center gap-1 text-xs"
                onClick={() => {
                  setPanelMode('form')
                  setEditingPlace(null)
                  setPendingMarker(null)
                }}
              >
                <Plus size={13} />
                <span>Nueva entrada</span>
              </button>
            )}

            {/* Collapse/Hide panel button */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="btn-icon btn-ghost ml-1"
              style={{ color: 'var(--color-ink-faded)' }}
              title="Ocultar cuaderno"
              aria-label="Ocultar cuaderno"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div key={panelMode} className="page-turn">{renderPanel()}</div>
        </div>
      </aside>

      {/* Floating Bookmark Tab when sidebar is closed */}
      {!isSidebarOpen && (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-1.5 py-3.5 px-2.5 rounded-l-md border-l border-y transition-all hover:pr-4 cursor-pointer group shadow-xl"
          style={{
            backgroundColor: '#e8d9b5',
            borderColor: 'var(--border-bright)',
            color: 'var(--color-ink)',
            boxShadow: '-4px 0 16px rgba(43, 33, 24, 0.18)',
          }}
          title="Abrir diario de viaje"
          aria-label="Abrir diario de viaje"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
            style={{ color: 'var(--color-oxblood)' }}
          />
          <span
            className="text-xs font-semibold tracking-wider uppercase [writing-mode:vertical-rl] rotate-180"
            style={{
              fontFamily: 'var(--font-body-stack)',
              fontVariant: 'small-caps',
              color: 'var(--color-ink)',
            }}
          >
            Diario ({filteredPlaces.length})
          </span>
        </button>
      )}

      {/* ── Mobile Bottom Sheet ──────────────────────────────────────────── */}
      <div
        className="bottom-sheet glass-strong"
        aria-label="Índice del diario"
        style={{
          transform: isPickingLocation
            ? 'translateY(100%)'
            : panelMode === 'closed'
            ? 'translateY(calc(100% - 60px))'
            : sheetTranslates[sheetHeight],
          height: '85vh',
        }}
      >
        {/* Handle + toggle */}
        <div
          className="bottom-sheet-handle"
          onClick={() => {
            if (panelMode === 'closed') {
              setPanelMode('list')
              setSheetHeight('half')
            } else {
              setSheetHeight((h) =>
                h === 'full' ? 'half' : h === 'half' ? 'peek' : 'full'
              )
            }
          }}
        />

        {/* Bottom peek bar (always visible) */}
        <div
          className="flex items-center justify-between px-4 py-2 cursor-pointer"
          onClick={() => {
            if (panelMode === 'closed' || sheetHeight === 'peek') {
              setPanelMode('list')
              setSheetHeight('half')
            }
          }}
        >
          <span className="text-sm" style={{ fontFamily: 'var(--font-display-stack)', color: 'var(--text-primary)' }}>
            {panelMode === 'detail' && selectedPlace
              ? selectedPlace.name
              : `${filteredPlaces.length} entradas`}
          </span>
          <div className="flex items-center gap-2">
            <button
              className="btn-icon btn-ghost"
              aria-label="Ver índice"
              onClick={(e) => {
                e.stopPropagation()
                setPanelMode('list')
                setSheetHeight('half')
              }}
            >
              <List size={14} />
            </button>
            <ChevronUp
              size={16}
              style={{
                color: 'var(--text-secondary)',
                transform: sheetHeight === 'full' ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          </div>
        </div>

        {/* Sheet content */}
        <div
          className="overflow-y-auto px-4 pb-8"
          style={{ height: 'calc(100% - 72px)', paddingBottom: 'calc(2rem + var(--safe-bottom))' }}
        >
          <div key={panelMode} className="page-turn">{renderPanel()}</div>
        </div>
      </div>

      {/* ── Collection Management Modal ──────────────────────────────────── */}
      <CollectionModal
        isOpen={showCollectionModal}
        collections={collections}
        places={places}
        onClose={() => setShowCollectionModal(false)}
        onCreateCollection={handleCreateCollection}
        onUpdateCollection={handleUpdateCollection}
        onDeleteCollection={handleDeleteCollection}
      />

      {/* ── JSON Modal ───────────────────────────────────────────────────── */}
      {showJsonModal && (
        <JsonModal
          places={places}
          onImport={handleImport}
          onClose={() => setShowJsonModal(false)}
        />
      )}

      {/* ── Markdown Modal ───────────────────────────────────────────────── */}
      {markdownModal && (
        <MarkdownModal
          isOpen={true}
          onClose={() => setMarkdownModal(null)}
          content={markdownModal.content}
          title={markdownModal.title}
        />
      )}
    </div>
  )
}

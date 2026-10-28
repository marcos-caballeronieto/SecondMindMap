'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useEffect } from 'react'
import {
  Globe, Plus, Search, Download, LogOut, X, MapPin, List, ChevronUp, Sparkles
} from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { createPlace, updatePlace, deletePlace } from '@/lib/actions/places'
import type { Place, PlaceInsert } from '@/lib/types'
import PlaceDetail from '@/components/PlaceDetail'
import PlaceForm from '@/components/PlaceForm'
import JsonModal from '@/components/JsonModal'
import AuthForm from '@/components/AuthForm'

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

  const saveLocalPlaces = (newPlaces: Place[]) => {
    setPlaces(newPlaces)
    if (typeof window !== 'undefined') {
      localStorage.setItem('secondmindmap_places', JSON.stringify(newPlaces))
    }
  }

  const fetchPlaces = useCallback(async () => {
    if (!user) return

    if (isDemoUser || !isConfigured) {
      if (typeof window !== 'undefined') {
        const cached =
          localStorage.getItem('secondmindmap_places') || localStorage.getItem('geomind_places')
        if (cached) {
          try {
            setPlaces(JSON.parse(cached))
            return
          } catch {
            // fallback
          }
        }
        setPlaces(INITIAL_DEMO_PLACES)
        localStorage.setItem('secondmindmap_places', JSON.stringify(INITIAL_DEMO_PLACES))
      }
      return
    }

    setLoadingPlaces(true)
    try {
      const { data } = await supabase
        .from('places')
        .select('*')
        .order('created_at', { ascending: false })
      setPlaces(data ?? [])
    } catch {
      // Ignore network errors
    } finally {
      setLoadingPlaces(false)
    }
  }, [user, isDemoUser, isConfigured, supabase])

  useEffect(() => {
    fetchPlaces()
  }, [fetchPlaces])

  // ─── UI State ────────────────────────────────────────────────────────────
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [editingPlace, setEditingPlace] = useState<Place | null>(null)
  const [pendingMarker, setPendingMarker] = useState<{ lat: number; lng: number } | null>(null)
  const [panelMode, setPanelMode] = useState<PanelMode>('closed')
  const [sheetHeight, setSheetHeight] = useState<SheetHeight>('half')
  const [showJsonModal, setShowJsonModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // ─── Filtered places for search ──────────────────────────────────────────
  const filteredPlaces = places.filter(
    (p) =>
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.notes_markdown && p.notes_markdown.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // ─── Map interactions ────────────────────────────────────────────────────
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (panelMode === 'form') return
    setPendingMarker({ lat, lng })
    setEditingPlace(null)
    setSelectedPlace(null)
    setPanelMode('form')
    setSheetHeight('full')
  }, [panelMode])

  const handleSelectPlace = useCallback((place: Place) => {
    setSelectedPlace(place)
    setPanelMode('detail')
    setSheetHeight('half')
    setPendingMarker(null)
  }, [])

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  const handleCreatePlace = async (data: PlaceInsert) => {
    if (isDemoUser || !isConfigured) {
      const newPlace: Place = {
        ...data,
        id: 'place-' + Date.now(),
        user_id: user?.id ?? 'demo-user',
        created_at: new Date().toISOString(),
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
    setSheetHeight('peek')
  }

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
            key={`${editingPlace?.id ?? 'new'}-${pendingMarker?.lat ?? ''}-${pendingMarker?.lng ?? ''}`}
            initialLat={pendingMarker?.lat}
            initialLng={pendingMarker?.lng}
            editingPlace={editingPlace}
            onSubmit={editingPlace ? handleUpdatePlace : handleCreatePlace}
            onCancel={closePanel}
          />
        </>
      )
    }

    if (panelMode === 'detail' && selectedPlace) {
      return (
        <PlaceDetail
          place={selectedPlace}
          onClose={closePanel}
          onEdit={(place) => {
            setEditingPlace(place)
            setPanelMode('form')
            setSheetHeight('full')
          }}
          onDelete={handleDeletePlace}
          onToggleVisited={handleToggleVisited}
        />
      )
    }

    // List mode (default)
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Índice ({filteredPlaces.length})
          </h3>
        </div>
        {loadingPlaces ? (
          <div className="flex justify-center py-8">
            <Globe size={20} className="animate-spin text-muted" />
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="text-center py-8">
            <p className="empty-page">
              {searchQuery ? 'Sin resultados' : 'Toca el mapa para añadir un lugar'}
            </p>
          </div>
        ) : (
          filteredPlaces.map((place) => (
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
              {place.notes_markdown && (
                <span className="index-row-snippet">
                  {place.notes_markdown.replace(/[#*`]/g, '').slice(0, 60)}...
                </span>
              )}
            </button>
          ))
        )}
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-base)' }}>
      {/* ── Map ─────────────────────────────────────────────────────────── */}
      <div
        className="map-wrapper"
        style={{ position: 'absolute', inset: 0, top: 56, transition: 'right 0.3s ease' }}
      >
        <MapView
          places={places}
          selectedPlaceId={selectedPlace?.id ?? null}
          onSelectPlace={handleSelectPlace}
          onMapClick={handleMapClick}
          pendingMarker={pendingMarker}
        />
      </div>

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <header className="topbar glass-strong">
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

      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside
        className="sidebar glass"
        style={{ top: 56 }}
      >
        <div className="p-4">
          {/* Sidebar list header */}
          {panelMode !== 'form' && panelMode !== 'detail' && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Índice ({filteredPlaces.length})
              </h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setPanelMode('form')
                  setEditingPlace(null)
                  setPendingMarker(null)
                }}
              >
                <Plus size={13} />
                Nueva entrada
              </button>
            </div>
          )}
          <div key={panelMode} className="page-turn">{renderPanel()}</div>
        </div>
      </aside>

      {/* ── Mobile Bottom Sheet ──────────────────────────────────────────── */}
      <div
        className="bottom-sheet glass-strong"
        aria-label="Índice del diario"
        style={{
          transform: panelMode === 'closed'
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
              : `${places.length} entradas`}
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

      {/* ── JSON Modal ───────────────────────────────────────────────────── */}
      {showJsonModal && (
        <JsonModal
          places={places}
          onImport={handleImport}
          onClose={() => setShowJsonModal(false)}
        />
      )}
    </div>
  )
}

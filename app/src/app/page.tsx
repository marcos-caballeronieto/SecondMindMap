'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Globe, Plus, Search, Download, Upload, LogOut, X, MapPin, List, ChevronUp
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
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

export default function GeoMindApp() {
  const supabase = createClient()

  // ─── Auth ────────────────────────────────────────────────────────────────
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // ─── Places State ────────────────────────────────────────────────────────
  const [places, setPlaces] = useState<Place[]>([])
  const [loadingPlaces, setLoadingPlaces] = useState(false)

  const fetchPlaces = useCallback(async () => {
    if (!user) return
    setLoadingPlaces(true)
    try {
      const { data } = await supabase
        .from('places')
        .select('*')
        .order('created_at', { ascending: false })
      setPlaces(data ?? [])
    } finally {
      setLoadingPlaces(false)
    }
  }, [user, supabase])

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
      p.notes_markdown.toLowerCase().includes(searchQuery.toLowerCase())
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
    const created = await createPlace(data)
    setPlaces((prev) => [created, ...prev])
    setPendingMarker(null)
    setSelectedPlace(created)
    setPanelMode('detail')
    setSheetHeight('half')
  }

  const handleUpdatePlace = async (data: PlaceInsert) => {
    if (!editingPlace) return
    const updated = await updatePlace(editingPlace.id, data)
    setPlaces((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setSelectedPlace(updated)
    setEditingPlace(null)
    setPanelMode('detail')
    setSheetHeight('half')
  }

  const handleDeletePlace = async (id: string) => {
    await deletePlace(id)
    setPlaces((prev) => prev.filter((p) => p.id !== id))
    setSelectedPlace(null)
    setPanelMode('list')
    setSheetHeight('half')
  }

  const handleToggleVisited = async (id: string, current: boolean) => {
    const updated = await updatePlace(id, { is_visited: !current })
    setPlaces((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    if (selectedPlace?.id === id) setSelectedPlace(updated)
  }

  // ─── JSON Import ──────────────────────────────────────────────────────────
  const handleImport = async (items: Partial<Place>[]) => {
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

  if (!user) return <AuthForm />

  // ─── Sheet heights map ────────────────────────────────────────────────────
  const sheetTranslates: Record<SheetHeight, string> = {
    peek: 'translateY(calc(100% - 60px))',
    half: 'translateY(35%)',
    full: 'translateY(0)',
  }

  const PanelContent = () => {
    if (panelMode === 'form') {
      return (
        <>
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
            {editingPlace ? 'Editar lugar' : 'Nuevo lugar'}
          </h3>
          <PlaceForm
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
            Mis lugares ({filteredPlaces.length})
          </h3>
        </div>
        {loadingPlaces ? (
          <div className="flex justify-center py-8">
            <Globe size={20} className="animate-spin text-muted" />
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="text-center py-8">
            <MapPin size={32} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm text-muted">
              {searchQuery ? 'Sin resultados' : 'Toca el mapa para añadir un lugar'}
            </p>
          </div>
        ) : (
          filteredPlaces.map((place) => (
            <button
              key={place.id}
              className="w-full text-left p-3 rounded-xl transition-all"
              style={{
                background: selectedPlace?.id === place.id ? 'var(--accent-subtle)' : 'transparent',
                border: `1px solid ${selectedPlace?.id === place.id ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
              }}
              onClick={() => handleSelectPlace(place)}
            >
              <div className="flex items-center gap-2">
                <MapPin size={13} style={{ color: place.is_visited ? 'var(--success)' : 'var(--accent-hover)', flexShrink: 0 }} />
                <span className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                  {place.name}
                </span>
                {place.is_visited && (
                  <span className="ml-auto badge badge-success text-xs" style={{ flexShrink: 0 }}>✓</span>
                )}
              </div>
              {place.notes_markdown && (
                <p className="text-xs mt-1 truncate text-muted ml-5">
                  {place.notes_markdown.replace(/[#*`]/g, '').slice(0, 60)}...
                </p>
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
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent)', boxShadow: '0 0 12px rgba(99,102,241,0.5)' }}
          >
            <Globe size={16} color="white" />
          </div>
          <span className="font-bold text-sm hidden sm:block" style={{ color: 'var(--text-primary)' }}>
            GeoMind
          </span>
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
                placeholder="Buscar lugares..."
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
            >
              <Search size={14} />
              <span className="hidden sm:inline">Buscar lugar...</span>
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
            onClick={() => supabase.auth.signOut()}
            title="Cerrar sesión"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside
        className="sidebar glass-strong"
        style={{ top: 56 }}
      >
        <div className="p-4">
          {/* Sidebar list header */}
          {panelMode !== 'form' && panelMode !== 'detail' && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Lugares ({filteredPlaces.length})
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
                Nuevo
              </button>
            </div>
          )}
          <PanelContent />
        </div>
      </aside>

      {/* ── Mobile Bottom Sheet ──────────────────────────────────────────── */}
      <div
        className="bottom-sheet glass-strong"
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
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {panelMode === 'detail' && selectedPlace
              ? selectedPlace.name
              : `${places.length} lugares`}
          </span>
          <div className="flex items-center gap-2">
            <button
              className="btn-icon btn-ghost"
              style={{ padding: '0.25rem' }}
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
                color: 'var(--text-muted)',
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
          <PanelContent />
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

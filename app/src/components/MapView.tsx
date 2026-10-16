'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import Map, { Marker, NavigationControl, type MapRef, type MapMouseEvent } from 'react-map-gl/maplibre'
import { MapPin, Plus } from 'lucide-react'
import type { Place } from '@/lib/types'

// Explicitly set worker URL for MapLibre GL v6+
if (typeof window !== 'undefined') {
  maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs')
}

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

interface MapViewProps {
  places: Place[]
  selectedPlaceId: string | null
  onSelectPlace: (place: Place) => void
  onMapClick: (lat: number, lng: number) => void
  pendingMarker: { lat: number; lng: number } | null
}

const PRICE_COLORS: Record<string, string> = {
  free: '#22c55e',
  '$': '#6366f1',
  '$$': '#f59e0b',
  '$$$': '#ef4444',
  '$$$$': '#ec4899',
}

export default function MapView({
  places,
  selectedPlaceId,
  onSelectPlace,
  onMapClick,
  pendingMarker,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null)
  const [cursor, setCursor] = useState<string>('grab')

  useEffect(() => {
    maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs')
  }, [])

  const handleClick = useCallback(
    (e: MapMouseEvent) => {
      // Only trigger if not clicking a marker
      if ((e.originalEvent.target as HTMLElement).closest('.maplibregl-marker')) return
      onMapClick(e.lngLat.lat, e.lngLat.lng)
    },
    [onMapClick]
  )

  // Fly to selected place
  useEffect(() => {
    if (!selectedPlaceId) return
    const place = places.find((p) => p.id === selectedPlaceId)
    if (place && mapRef.current) {
      mapRef.current.flyTo({
        center: [place.longitude, place.latitude],
        zoom: 15,
        duration: 600,
      })
    }
  }, [selectedPlaceId, places])

  return (
    <Map
      ref={mapRef}
      mapLib={maplibregl}
      initialViewState={{
        longitude: 12.4922,
        latitude: 41.8902,
        zoom: 4,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={MAP_STYLE}
      onClick={handleClick}
      cursor={cursor}
      onMouseEnter={() => setCursor('crosshair')}
      onMouseLeave={() => setCursor('grab')}
    >
      <NavigationControl position="bottom-right" showCompass={false} />

      {/* Existing places */}
      {places.map((place) => {
        const color = PRICE_COLORS[place.price_level] ?? '#6366f1'
        const isActive = place.id === selectedPlaceId
        return (
          <Marker
            key={place.id}
            longitude={place.longitude}
            latitude={place.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              onSelectPlace(place)
            }}
          >
            <div
              className="map-pin-marker"
              style={{
                background: color,
                opacity: place.is_visited ? 0.65 : 1,
              }}
              data-active={isActive}
            >
              <span className="pin-inner">
                <MapPin size={16} />
              </span>
            </div>
          </Marker>
        )
      })}

      {/* Pending (new) marker */}
      {pendingMarker && (
        <Marker
          longitude={pendingMarker.lng}
          latitude={pendingMarker.lat}
          anchor="bottom"
        >
          <div
            className="map-pin-marker"
            style={{ background: 'var(--accent)', animation: 'pulse 1s infinite' }}
          >
            <span className="pin-inner">
              <Plus size={16} />
            </span>
          </div>
        </Marker>
      )}
    </Map>
  )
}

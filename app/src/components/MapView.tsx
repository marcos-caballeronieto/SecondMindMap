'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import Map, { Marker, NavigationControl, type MapRef, type MapMouseEvent } from 'react-map-gl/maplibre'
import { Check, MapPin, Plus } from 'lucide-react'
import type { Place } from '@/lib/types'

// Explicitly set worker URL for MapLibre GL v6+
if (typeof window !== 'undefined') {
  maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs')
}

// Custom paper & ink style, hosted in app/public (spec D1). Built from the CARTO style.
const MAP_STYLE = '/map/paper-ink.json'

interface MapViewProps {
  places: Place[]
  selectedPlaceId: string | null
  onSelectPlace: (place: Place) => void
  onMapClick: (lat: number, lng: number) => void
  pendingMarker: { lat: number; lng: number } | null
}

// Price marks use the paper & ink tokens (spec D4), defined in globals.css
const PRICE_COLORS: Record<string, string> = {
  free: 'var(--price-free)',
  '$': 'var(--price-1)',
  '$$': 'var(--price-2)',
  '$$$': 'var(--price-3)',
  '$$$$': 'var(--price-4)',
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
        const color = PRICE_COLORS[place.price_level] ?? 'var(--accent)'
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
              style={{ background: color }}
              data-active={isActive}
              aria-label={`${place.name}${place.is_visited ? ', visitado' : ''}`}
            >
              <span className="pin-inner">
                <MapPin size={16} />
              </span>
              {place.is_visited && (
                <span className="map-pin-stamp" aria-hidden="true">
                  <Check size={11} strokeWidth={3} />
                </span>
              )}
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
            style={{ background: 'var(--accent)', outline: '2px dashed var(--accent)', outlineOffset: '3px' }}
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

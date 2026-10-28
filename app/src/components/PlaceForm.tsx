'use client'

import { useState } from 'react'
import { Loader2, Link2, MapPin } from 'lucide-react'
import { parseGoogleMapsUrl } from '@/lib/actions/parse-maps-url'
import type { Place, PlaceInsert, PriceLevel } from '@/lib/types'

interface PlaceFormProps {
  initialLat?: number
  initialLng?: number
  editingPlace?: Place | null
  onSubmit: (data: PlaceInsert) => Promise<void>
  onCancel: () => void
}

export default function PlaceForm({
  initialLat,
  initialLng,
  editingPlace,
  onSubmit,
  onCancel,
}: PlaceFormProps) {
  const [loading, setLoading] = useState(false)
  const [mapsUrl, setMapsUrl] = useState('')
  const [parsingUrl, setParsingUrl] = useState(false)
  const [parseError, setParseError] = useState('')

  const [form, setForm] = useState<PlaceInsert>({
    name: editingPlace?.name ?? '',
    latitude: editingPlace?.latitude ?? initialLat ?? 0,
    longitude: editingPlace?.longitude ?? initialLng ?? 0,
    is_visited: editingPlace?.is_visited ?? false,
    price_level: (editingPlace?.price_level as PriceLevel) ?? 'free',
    notes_markdown: editingPlace?.notes_markdown ?? '',
    metadata: editingPlace?.metadata ?? {},
  })

  const handleParseUrl = async () => {
    if (!mapsUrl.trim()) return
    setParsingUrl(true)
    setParseError('')
    try {
      const result = await parseGoogleMapsUrl(mapsUrl.trim())
      if (result) {
        setForm((prev) => ({
          ...prev,
          name: result.name,
          latitude: result.latitude,
          longitude: result.longitude,
        }))
        setMapsUrl('')
      } else {
        setParseError('No se pudieron extraer las coordenadas. Prueba con otro enlace.')
      }
    } catch {
      setParseError('Error al procesar el enlace.')
    } finally {
      setParsingUrl(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    try {
      await onSubmit(form)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Google Maps URL Parser */}
      <div className="form-group">
        <label className="label">Importar desde Google Maps</label>
        <div className="flex gap-2">
          <input
            type="url"
            className="input flex-1"
            placeholder="https://maps.app.goo.gl/..."
            value={mapsUrl}
            onChange={(e) => setMapsUrl(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-icon"
            aria-label="Importar desde Google Maps"
            onClick={handleParseUrl}
            disabled={parsingUrl || !mapsUrl.trim()}
          >
            {parsingUrl ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
          </button>
        </div>
        {parseError && <p className="text-xs" role="alert" style={{ color: 'var(--danger)' }}>{parseError}</p>}
      </div>

      <hr className="divider" />

      {/* Name */}
      <div className="form-group">
        <label className="label" htmlFor="place-name">
          Nombre del lugar <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <input
          id="place-name"
          type="text"
          className="input"
          placeholder="Ej: Panteón de Agripa"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      {/* Coordinates */}
      <div className="flex gap-3">
        <div className="form-group flex-1">
          <label className="label" htmlFor="place-lat">Latitud</label>
          <input
            id="place-lat"
            type="number"
            step="any"
            className="input"
            value={form.latitude}
            onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) })}
          />
        </div>
        <div className="form-group flex-1">
          <label className="label" htmlFor="place-lng">Longitud</label>
          <input
            id="place-lng"
            type="number"
            step="any"
            className="input"
            value={form.longitude}
            onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      {/* Price level & visited */}
      <div className="flex gap-3 items-end">
        <div className="form-group flex-1">
          <label className="label" htmlFor="price-level">Nivel de precio</label>
          <select
            id="price-level"
            className="input"
            value={form.price_level}
            onChange={(e) => setForm({ ...form, price_level: e.target.value as PriceLevel })}
          >
            <option value="free">Gratis</option>
            <option value="$">$ – Económico</option>
            <option value="$$">$$ – Moderado</option>
            <option value="$$$">$$$ – Caro</option>
            <option value="$$$$">$$$$ – Premium</option>
          </select>
        </div>
        <div className="form-group pb-1">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.is_visited}
              onChange={(e) => setForm({ ...form, is_visited: e.target.checked })}
            />
            Visitado
          </label>
        </div>
      </div>

      {/* Notes */}
      <div className="form-group">
        <label className="label" htmlFor="place-notes">Notas (Markdown)</label>
        <textarea
          id="place-notes"
          className="input textarea"
          placeholder="## Historia&#10;Descripción del lugar, curiosidades, guías paso a paso..."
          value={form.notes_markdown}
          onChange={(e) => setForm({ ...form, notes_markdown: e.target.value })}
          rows={6}
        />
      </div>

      {/* Coordinate hint */}
      {form.latitude !== 0 && form.longitude !== 0 && (
        <p className="text-xs text-muted flex items-center gap-1">
          <MapPin size={10} />
          {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          {editingPlace ? 'Guardar cambios' : 'Crear lugar'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

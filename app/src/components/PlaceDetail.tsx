'use client'

import { useState } from 'react'
import { Check, MapPin, Trash2, Edit3, X, DollarSign } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Place } from '@/lib/types'

const PRICE_LABELS: Record<string, string> = {
  free: 'Gratis',
  '$': '$',
  '$$': '$$',
  '$$$': '$$$',
  '$$$$': '$$$$',
}

// Price marks use the paper & ink tokens (spec D4), defined in globals.css
const PRICE_COLORS: Record<string, string> = {
  free: 'var(--price-free)',
  '$': 'var(--price-1)',
  '$$': 'var(--price-2)',
  '$$$': 'var(--price-3)',
  '$$$$': 'var(--price-4)',
}

interface PlaceDetailProps {
  place: Place
  onClose: () => void
  onEdit: (place: Place) => void
  onDelete: (id: string) => void
  onToggleVisited: (id: string, current: boolean) => void
}

export default function PlaceDetail({
  place,
  onClose,
  onEdit,
  onDelete,
  onToggleVisited,
}: PlaceDetailProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const priceColor = PRICE_COLORS[place.price_level] ?? 'var(--accent)'

  return (
    <div className="fade-in flex flex-col gap-4">
      {/* Header: entry title in the display serif */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="price-dot flex-shrink-0 mt-2" style={{ color: priceColor }} />
          <h2
            className="text-2xl leading-snug"
            style={{ color: 'var(--text-primary)' }}
          >
            {place.name}
          </h2>
        </div>
        <button
          className="btn-icon btn-ghost flex-shrink-0"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
      </div>

      {/* Visited stamp: toggling it stamps the page */}
      <div className="flex flex-wrap gap-2">
        <button
          className={place.is_visited ? 'stamp' : 'badge'}
          onClick={() => onToggleVisited(place.id, place.is_visited)}
          title="Marcar como visitado"
          aria-pressed={place.is_visited}
        >
          <Check size={11} />
          {place.is_visited ? 'Visitado' : 'Sin visitar'}
        </button>

        <span className="badge" style={{ color: priceColor, borderColor: priceColor }}>
          <DollarSign size={11} />
          {PRICE_LABELS[place.price_level] ?? place.price_level}
        </span>

        <span className="badge" style={{ color: 'var(--text-secondary)' }}>
          <MapPin size={10} />
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
          </span>
        </span>
      </div>

      <hr className="divider" />

      {/* Markdown notes */}
      {place.notes_markdown ? (
        <div className="markdown-body overflow-y-auto" style={{ maxHeight: '300px' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {place.notes_markdown}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="text-muted text-sm italic">Sin notas aún. Edita para añadir información.</p>
      )}

      <hr className="divider" />

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button className="btn btn-primary btn-sm flex-1" onClick={() => onEdit(place)}>
          <Edit3 size={14} />
          Editar
        </button>

        {confirmDelete ? (
          <div className="flex gap-2 flex-1">
            <button
              className="btn btn-danger btn-sm flex-1"
              onClick={() => onDelete(place.id)}
            >
              Confirmar
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setConfirmDelete(false)}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

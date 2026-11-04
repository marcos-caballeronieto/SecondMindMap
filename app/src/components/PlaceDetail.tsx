'use client'

import { useState, useMemo } from 'react'
import { Check, MapPin, Trash2, Edit3, X, DollarSign, Maximize2 } from 'lucide-react'
import type { Place } from '@/lib/types'
import { getPopulatedSections } from '@/lib/markdown-sections'
import SectionAccordion from './notebook/SectionAccordion'

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
  onExpandNotes: (notes: string, title: string) => void
}

export default function PlaceDetail({
  place,
  onClose,
  onEdit,
  onDelete,
  onToggleVisited,
  onExpandNotes,
}: PlaceDetailProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const priceColor = PRICE_COLORS[place.price_level] ?? 'var(--accent)'

  // Parse populated sections from the markdown
  const populatedSections = useMemo(
    () => getPopulatedSections(place.notes_markdown || ''),
    [place.notes_markdown]
  )

  // Track accordion open state per section key
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    const count = populatedSections.length
    populatedSections.forEach((sec, index) => {
      // 1 or 2 sections: expanded by default; 3+: first open, others collapsed
      initial[sec.key] = count <= 2 || index === 0
    })
    return initial
  })

  // Check if all are currently expanded
  const allExpanded =
    populatedSections.length > 0 &&
    populatedSections.every((s) => openSections[s.key] === true)

  const handleToggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleToggleAll = () => {
    const targetState = !allExpanded
    const next: Record<string, boolean> = {}
    populatedSections.forEach((s) => {
      next[s.key] = targetState
    })
    setOpenSections(next)
  }

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

      {/* Modular Diary Notes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="label mb-0">Notas de campo</h3>
            {populatedSections.length > 0 && (
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                ({populatedSections.length})
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {populatedSections.length > 1 && (
              <button
                type="button"
                onClick={handleToggleAll}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-1.5 py-0.5 rounded transition-colors"
                style={{ fontVariant: 'small-caps' }}
              >
                {allExpanded ? 'Colapsar todo' : 'Expandir todo'}
              </button>
            )}
            {populatedSections.length > 0 && (
              <button
                className="btn-icon btn-ghost min-w-[32px] min-h-[32px] p-1"
                onClick={() => onExpandNotes(place.notes_markdown, place.name)}
                aria-label="Expandir notas a pantalla completa"
                title="Ver en pantalla completa"
              >
                <Maximize2 size={13} />
              </button>
            )}
          </div>
        </div>

        {populatedSections.length > 0 ? (
          <div className="border-t border-[var(--border)] overflow-y-auto max-h-[360px] pr-1">
            {populatedSections.map((sec) => (
              <SectionAccordion
                key={sec.key}
                config={sec.config}
                content={sec.content}
                isOpen={!!openSections[sec.key]}
                onToggle={() => handleToggleSection(sec.key)}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted text-sm italic">
            Sin notas de campo aún. Edita la entrada para añadir información.
          </p>
        )}
      </div>

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
            aria-label="Eliminar lugar"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

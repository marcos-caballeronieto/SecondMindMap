'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Check,
  MapPin,
  Trash2,
  Edit3,
  X,
  DollarSign,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Bookmark,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Place, Collection } from '@/lib/types'
import { getPopulatedSections } from '@/lib/markdown-sections'
import { SectionIcon } from './notebook/SectionIcon'
import { CollectionIcon } from './notebook/CollectionIcon'

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
  collections?: Collection[]
  onClose: () => void
  onEdit: (place: Place) => void
  onDelete: (id: string) => void
  onToggleVisited: (id: string, current: boolean) => void
  onExpandNotes: (notes: string, title: string) => void
  onToggleCollectionAssignment?: (placeId: string, collectionId: string, shouldAssign: boolean) => void
}

export default function PlaceDetail({
  place,
  collections = [],
  onClose,
  onEdit,
  onDelete,
  onToggleVisited,
  onExpandNotes,
  onToggleCollectionAssignment,
}: PlaceDetailProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [activePageIndex, setActivePageIndex] = useState(0)
  const [showAddTagPopover, setShowAddTagPopover] = useState(false)
  const priceColor = PRICE_COLORS[place.price_level] ?? 'var(--accent)'

  const assignedCollections = collections.filter((c) =>
    place.collection_ids?.includes(c.id)
  )
  const unassignedCollections = collections.filter(
    (c) => !place.collection_ids?.includes(c.id)
  )

  // Parse populated sections from the markdown
  const populatedSections = useMemo(
    () => getPopulatedSections(place.notes_markdown || ''),
    [place.notes_markdown]
  )

  // Reset page when place changes
  useEffect(() => {
    setActivePageIndex(0)
  }, [place.id])

  const activeSection = populatedSections[activePageIndex] ?? populatedSections[0]
  const hasMultiplePages = populatedSections.length > 1

  return (
    <div className="fade-in flex flex-col gap-4">
      {/* Header: entry title in the display serif */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="price-dot flex-shrink-0 mt-2" style={{ color: priceColor }} />
          <h2
            className="text-2xl leading-snug truncate"
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

      {/* Thematic Collections tags & quick-add popover */}
      {(assignedCollections.length > 0 || (onToggleCollectionAssignment && collections.length > 0)) && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {assignedCollections.map((col) => (
            <span
              key={col.id}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs text-white shadow-sm"
              style={{
                backgroundColor: col.color,
                fontFamily: 'var(--font-book)',
              }}
            >
              <CollectionIcon name={col.icon} size={11} />
              <span>{col.name}</span>
              {onToggleCollectionAssignment && (
                <button
                  type="button"
                  onClick={() => onToggleCollectionAssignment(place.id, col.id, false)}
                  className="ml-0.5 hover:opacity-75 rounded-full p-0.5"
                  title={`Quitar de ${col.name}`}
                  aria-label={`Quitar de ${col.name}`}
                >
                  <X size={10} />
                </button>
              )}
            </span>
          ))}

          {/* Quick-add to collection */}
          {onToggleCollectionAssignment && unassignedCollections.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAddTagPopover(!showAddTagPopover)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-dashed transition-colors hover:bg-black/5"
                style={{
                  borderColor: 'rgba(107, 90, 68, 0.4)',
                  color: 'var(--color-ink-faded)',
                  fontFamily: 'var(--font-book)',
                }}
              >
                <Plus size={11} style={{ color: 'var(--color-oxblood)' }} />
                <span>Añadir a lista</span>
              </button>

              {showAddTagPopover && (
                <div
                  className="absolute left-0 mt-1 z-30 py-1.5 px-1 rounded shadow-xl border w-48 flex flex-col gap-1 max-h-48 overflow-y-auto"
                  style={{
                    backgroundColor: '#f3e9d2',
                    borderColor: 'var(--border-bright)',
                  }}
                >
                  <div
                    className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                      color: 'var(--color-ink-faded)',
                      fontFamily: 'var(--font-book)',
                      fontVariant: 'small-caps',
                    }}
                  >
                    Asignar a colección:
                  </div>
                  {unassignedCollections.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => {
                        onToggleCollectionAssignment(place.id, col.id, true)
                        setShowAddTagPopover(false)
                      }}
                      className="flex items-center gap-2 px-2 py-1 rounded text-xs hover:bg-black/5 text-left transition-colors"
                      style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-book)' }}
                    >
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: col.color }}
                      >
                        <CollectionIcon name={col.icon} size={10} />
                      </span>
                      <span className="truncate">{col.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <hr className="divider" />

      {/* Modular Diary Notes (Paged Notebook View) */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="label mb-0">Hojas del diario</h3>
            {populatedSections.length > 0 && (
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                ({populatedSections.length})
              </span>
            )}
          </div>
          {populatedSections.length > 0 && (
            <button
              className="btn-icon btn-ghost min-w-[28px] min-h-[28px] p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              onClick={() => onExpandNotes(place.notes_markdown, place.name)}
              aria-label="Expandir notas a pantalla completa"
              title="Ver en pantalla completa"
            >
              <Maximize2 size={13} />
            </button>
          )}
        </div>

        {populatedSections.length > 0 ? (
          <div className="flex flex-col border border-[var(--border)] rounded-sm bg-[var(--bg-base)] p-3">
            {/* Horizontal Tabs for multiple sections */}
            {hasMultiplePages && (
              <div className="flex items-center gap-1 overflow-x-auto mb-2.5 border-b border-[var(--border)] no-scrollbar">
                {populatedSections.map((sec, idx) => {
                  const isActive = idx === activePageIndex
                  return (
                    <button
                      key={sec.key}
                      type="button"
                      onClick={() => setActivePageIndex(idx)}
                      className={`
                        inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-t-sm whitespace-nowrap transition-all flex-shrink-0 cursor-pointer
                        ${
                          isActive
                            ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-b-0 border-[var(--border-bright)] font-semibold -mb-[1px]'
                            : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] border border-transparent'
                        }
                      `}
                      style={isActive ? { borderTop: '2px solid var(--accent)' } : undefined}
                    >
                      <SectionIcon
                        sectionKey={sec.key}
                        size={12}
                        className={isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}
                      />
                      <span>{sec.config.titleEs}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Active Page Header */}
            <div className="flex items-center justify-between pb-1 mb-2 border-b border-[var(--border)]">
              <div className="flex items-center gap-2 min-w-0">
                <SectionIcon
                  sectionKey={activeSection.key}
                  size={15}
                  className="text-[var(--accent)] flex-shrink-0"
                />
                <h4
                  className="text-base italic text-[var(--text-primary)] truncate"
                  style={{ fontFamily: 'var(--font-display-stack)' }}
                >
                  {activeSection.config.titleEs}
                </h4>
              </div>
              {hasMultiplePages && (
                <span className="text-[11px] text-[var(--text-muted)] font-mono flex-shrink-0 ml-2">
                  {activePageIndex + 1}/{populatedSections.length}
                </span>
              )}
            </div>

            {/* Active Page Body */}
            <div
              className="markdown-body overflow-y-auto max-h-[280px] min-h-[100px] pr-1"
              style={{
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {activeSection.content}
              </ReactMarkdown>
            </div>

            {/* Page Turn Controls */}
            {hasMultiplePages && (
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  disabled={activePageIndex === 0}
                  onClick={() => setActivePageIndex((p) => Math.max(0, p - 1))}
                  className="btn btn-ghost btn-sm text-xs py-1 px-2 h-auto min-h-[28px] gap-1 disabled:opacity-30"
                >
                  <ChevronLeft size={13} />
                  <span>Anterior</span>
                </button>

                <div className="flex items-center gap-1">
                  {populatedSections.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActivePageIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                        i === activePageIndex
                          ? 'bg-[var(--accent)] scale-125'
                          : 'bg-[var(--border-bright)]'
                      }`}
                      aria-label={`Ir a la página ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  disabled={activePageIndex === populatedSections.length - 1}
                  onClick={() =>
                    setActivePageIndex((p) =>
                      Math.min(populatedSections.length - 1, p + 1)
                    )
                  }
                  className="btn btn-ghost btn-sm text-xs py-1 px-2 h-auto min-h-[28px] gap-1 disabled:opacity-30"
                >
                  <span>Siguiente</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted text-sm italic py-2">
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

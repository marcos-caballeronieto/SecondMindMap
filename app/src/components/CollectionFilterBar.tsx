'use client'

import { Filter, Plus, X } from 'lucide-react'
import type { Collection, Place } from '@/lib/types'
import { CollectionIcon } from './notebook/CollectionIcon'

interface CollectionFilterBarProps {
  collections: Collection[]
  places: Place[]
  selectedCollectionIds: string[]
  onToggleCollectionFilter: (id: string) => void
  onClearFilters: () => void
  onOpenManageModal: () => void
  inline?: boolean
  style?: React.CSSProperties
}

export default function CollectionFilterBar({
  collections,
  places,
  selectedCollectionIds,
  onToggleCollectionFilter,
  onClearFilters,
  onOpenManageModal,
  inline = false,
  style,
}: CollectionFilterBarProps) {
  const hasActiveFilters = selectedCollectionIds.length > 0

  return (
    <div
      className={
        inline
          ? 'w-full py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b pb-2.5 mb-2'
          : 'collection-filter-bar no-scrollbar shadow-sm'
      }
      style={{
        backgroundColor: inline ? 'transparent' : '#e8d9b5',
        borderColor: 'var(--border-bright)',
        ...style,
      }}
    >
      <div
        className="flex items-center gap-1 shrink-0 text-xs font-semibold uppercase tracking-wider mr-1"
        style={{
          fontFamily: 'var(--font-body-stack)',
          fontVariant: 'small-caps',
          color: 'var(--color-ink-faded)',
        }}
      >
        <Filter size={12} style={{ color: 'var(--color-oxblood)' }} />
        <span className="hidden sm:inline">Listas:</span>
      </div>

      {/* "Todas" pill */}
      <button
        type="button"
        onClick={onClearFilters}
        className="px-2 py-0.5 text-xs rounded-full border transition-all shrink-0 flex items-center gap-1 shadow-sm"
        style={{
          fontFamily: 'var(--font-body-stack)',
          backgroundColor: !hasActiveFilters ? '#2b2118' : '#f3e9d2',
          color: !hasActiveFilters ? '#f3e9d2' : '#2b2118',
          borderColor: !hasActiveFilters ? '#2b2118' : 'var(--border-bright)',
          fontWeight: !hasActiveFilters ? 600 : 400,
        }}
      >
        <span>Todas ({places.length})</span>
      </button>

      {/* Collection pills */}
      {collections.map((col) => {
        const isSelected = selectedCollectionIds.includes(col.id)
        const count = places.filter((p) => p.collection_ids?.includes(col.id)).length

        return (
          <button
            key={col.id}
            type="button"
            onClick={() => onToggleCollectionFilter(col.id)}
            className="px-2.5 py-0.5 text-xs rounded-full border transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
            style={{
              fontFamily: 'var(--font-body-stack)',
              backgroundColor: isSelected ? col.color : '#f3e9d2',
              color: isSelected ? '#ffffff' : '#2b2118',
              borderColor: isSelected ? col.color : 'var(--border-bright)',
              fontWeight: isSelected ? 600 : 400,
            }}
            aria-pressed={isSelected}
            title={col.description || col.name}
          >
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
              style={{
                backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : col.color,
                color: '#ffffff',
              }}
            >
              <CollectionIcon name={col.icon} size={10} />
            </span>
            <span>{col.name}</span>
            <span
              className="text-[10px] px-1 rounded-full"
              style={{
                backgroundColor: isSelected ? 'rgba(0,0,0,0.2)' : 'rgba(43, 33, 24, 0.1)',
                color: isSelected ? '#ffffff' : 'var(--color-ink-faded)',
              }}
            >
              {count}
            </span>
            {isSelected && <X size={11} className="ml-0.5 opacity-80" />}
          </button>
        )
      })}

      {/* Manage collections button */}
      <button
        type="button"
        onClick={onOpenManageModal}
        className="px-2 py-0.5 text-xs rounded-full border border-dashed transition-colors shrink-0 flex items-center gap-1 hover:bg-black/5"
        style={{
          borderColor: 'var(--border-bright)',
          color: 'var(--color-ink-faded)',
          fontFamily: 'var(--font-body-stack)',
          backgroundColor: '#f3e9d2',
        }}
        title="Crear o gestionar colecciones"
      >
        <Plus size={12} style={{ color: 'var(--color-oxblood)' }} />
        <span>Nueva</span>
      </button>

      {/* Active filter indication badge (AND logic info) */}
      {hasActiveFilters && (
        <span
          className="ml-auto text-[10px] shrink-0 font-medium px-2 py-0.5 rounded shadow-sm"
          style={{
            fontFamily: 'var(--font-body-stack)',
            backgroundColor: '#f3e9d2',
            border: '1px solid var(--border-bright)',
            color: 'var(--color-oxblood)',
          }}
        >
          Filtrado simultáneo: {selectedCollectionIds.length}
        </span>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Plus, X, Edit2, Trash2, Check, Bookmark, Layers } from 'lucide-react'
import type {
  Collection,
  CollectionInsert,
  CollectionIconKey,
  Place,
} from '@/lib/types'
import { COLLECTION_PALETTE, COLLECTION_ICONS } from '@/lib/types'
import { CollectionIcon } from './notebook/CollectionIcon'

interface CollectionModalProps {
  collections: Collection[]
  places: Place[]
  isOpen: boolean
  onClose: () => void
  onCreateCollection: (data: CollectionInsert) => Promise<void>
  onUpdateCollection: (id: string, data: CollectionInsert) => Promise<void>
  onDeleteCollection: (id: string) => Promise<void>
}

export default function CollectionModal({
  collections,
  places,
  isOpen,
  onClose,
  onCreateCollection,
  onUpdateCollection,
  onDeleteCollection,
}: CollectionModalProps) {
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState(COLLECTION_PALETTE[0].hex)
  const [selectedIcon, setSelectedIcon] = useState<CollectionIconKey>('Folder')
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  if (!isOpen) return null

  const handleStartCreate = () => {
    setEditingCollection(null)
    setName('')
    setDescription('')
    setSelectedColor(COLLECTION_PALETTE[0].hex)
    setSelectedIcon('Folder')
    setIsCreating(true)
    setDeleteConfirmId(null)
  }

  const handleStartEdit = (col: Collection) => {
    setEditingCollection(col)
    setName(col.name)
    setDescription(col.description || '')
    setSelectedColor(col.color || COLLECTION_PALETTE[0].hex)
    setSelectedIcon(col.icon || 'Folder')
    setIsCreating(false)
    setDeleteConfirmId(null)
  }

  const handleCancelForm = () => {
    setIsCreating(false)
    setEditingCollection(null)
    setName('')
    setDescription('')
    setDeleteConfirmId(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    try {
      const payload: CollectionInsert = {
        name: name.trim(),
        description: description.trim(),
        color: selectedColor,
        icon: selectedIcon,
      }

      if (editingCollection) {
        await onUpdateCollection(editingCollection.id, payload)
      } else {
        await onCreateCollection(payload)
      }
      handleCancelForm()
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setSubmitting(true)
    try {
      await onDeleteCollection(id)
      setDeleteConfirmId(null)
      if (editingCollection?.id === id) {
        handleCancelForm()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const isFormActive = isCreating || editingCollection !== null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(43, 33, 24, 0.65)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Gestionar colecciones del diario"
    >
      <div
        className="w-full max-w-lg rounded shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border"
        style={{
          backgroundColor: '#f3e9d2',
          borderColor: 'var(--border-bright)',
        }}
      >
        {/* Header styled like a field diary folio */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{
            backgroundColor: '#e8d9b5',
            borderColor: 'var(--border-bright)',
          }}
        >
          <div className="flex items-center gap-2">
            <Bookmark size={18} style={{ color: 'var(--color-oxblood)' }} />
            <h2
              className="text-lg font-normal"
              style={{
                fontFamily: 'var(--font-display-stack)',
                color: 'var(--color-ink)',
                fontStyle: 'italic',
              }}
            >
              Colecciones y Cuadernos Temáticos
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:opacity-75 transition-opacity"
            style={{ color: 'var(--color-ink-faded)' }}
            aria-label="Cerrar ventana"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          className="p-5 overflow-y-auto flex-1 flex flex-col gap-5"
          style={{
            backgroundColor: '#f3e9d2',
          }}
        >
          {!isFormActive ? (
            <>
              <div className="flex items-center justify-between">
                <p
                  className="text-xs"
                  style={{
                    fontFamily: 'var(--font-body-stack)',
                    color: 'var(--color-ink-faded)',
                  }}
                >
                  Organiza tus lugares en listas temáticas (rutas de café, castillos, miradores...).
                </p>
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors text-white shadow-sm"
                  style={{
                    backgroundColor: 'var(--color-oxblood)',
                    fontFamily: 'var(--font-body-stack)',
                  }}
                >
                  <Plus size={14} />
                  <span>Nueva lista</span>
                </button>
              </div>

              {collections.length === 0 ? (
                <div
                  className="text-center py-10 px-4 border border-dashed rounded"
                  style={{
                    borderColor: 'var(--border-bright)',
                    backgroundColor: '#e8d9b5',
                  }}
                >
                  <Layers
                    size={32}
                    className="mx-auto mb-2 opacity-40"
                    style={{ color: 'var(--color-ink-faded)' }}
                  />
                  <p
                    className="text-sm italic"
                    style={{
                      fontFamily: 'var(--font-display-stack)',
                      color: 'var(--color-ink-faded)',
                    }}
                  >
                    No hay colecciones creadas todavía en este diario.
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{
                      fontFamily: 'var(--font-body-stack)',
                      color: 'var(--color-ink-faded)',
                    }}
                  >
                    Crea tu primera lista temática con un color e icono personalizados.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {collections.map((col) => {
                    const count = places.filter((p) =>
                      p.collection_ids?.includes(col.id)
                    ).length
                    return (
                      <div
                        key={col.id}
                        className="flex items-center justify-between p-3 rounded border transition-colors shadow-sm"
                        style={{
                          backgroundColor: '#e8d9b5',
                          borderColor: 'var(--border-bright)',
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Icon badge */}
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm"
                            style={{ backgroundColor: col.color }}
                          >
                            <CollectionIcon name={col.icon} size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4
                                className="text-sm font-semibold truncate"
                                style={{
                                  fontFamily: 'var(--font-body-stack)',
                                  color: 'var(--color-ink)',
                                }}
                              >
                                {col.name}
                              </h4>
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: 'rgba(43, 33, 24, 0.1)',
                                  color: 'var(--color-ink-faded)',
                                  fontFamily: 'var(--font-body-stack)',
                                }}
                              >
                                {count} {count === 1 ? 'lugar' : 'lugares'}
                              </span>
                            </div>
                            {col.description && (
                              <p
                                className="text-xs truncate"
                                style={{
                                  fontFamily: 'var(--font-body-stack)',
                                  color: 'var(--color-ink-faded)',
                                }}
                              >
                                {col.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(col)}
                            className="p-1.5 rounded hover:bg-black/5 text-xs transition-colors"
                            style={{ color: 'var(--color-ink-faded)' }}
                            title="Editar colección"
                            aria-label={`Editar ${col.name}`}
                          >
                            <Edit2 size={15} />
                          </button>

                          {deleteConfirmId === col.id ? (
                            <div className="flex items-center gap-1 bg-red-100 p-0.5 rounded border border-red-300">
                              <button
                                type="button"
                                onClick={() => handleDelete(col.id)}
                                disabled={submitting}
                                className="px-2 py-0.5 text-[11px] font-semibold text-white rounded bg-red-700 hover:bg-red-800"
                              >
                                Borrar
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1.5 py-0.5 text-[11px] text-gray-700 hover:bg-gray-200 rounded"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(col.id)}
                              className="p-1.5 rounded hover:bg-black/5 text-xs transition-colors"
                              style={{ color: 'var(--color-oxblood)' }}
                              title="Eliminar colección"
                              aria-label={`Eliminar ${col.name}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            /* Collection Form (Create / Edit) */
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b"
                style={{ borderColor: 'var(--border)' }}
              >
                <h3
                  className="text-sm font-semibold"
                  style={{
                    fontFamily: 'var(--font-display-stack)',
                    color: 'var(--color-ink)',
                    fontStyle: 'italic',
                  }}
                >
                  {editingCollection ? 'Editar colección' : 'Nueva colección temática'}
                </h3>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="text-xs hover:underline"
                  style={{
                    fontFamily: 'var(--font-body-stack)',
                    color: 'var(--color-ink-faded)',
                  }}
                >
                  Volver al listado
                </button>
              </div>

              {/* Preview chip */}
              <div
                className="flex items-center gap-3 p-3 rounded border shadow-sm"
                style={{
                  backgroundColor: '#e8d9b5',
                  borderColor: 'var(--border-bright)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: selectedColor }}
                >
                  <CollectionIcon name={selectedIcon} size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wider text-[10px] font-semibold opacity-60">
                    Vista previa de pin y etiqueta
                  </div>
                  <div
                    className="text-sm font-bold truncate"
                    style={{
                      fontFamily: 'var(--font-body-stack)',
                      color: 'var(--color-ink)',
                    }}
                  >
                    {name.trim() || 'Nombre de la lista'}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1">
                <label
                  className="text-xs font-semibold tracking-wide"
                  style={{
                    fontFamily: 'var(--font-body-stack)',
                    fontVariant: 'small-caps',
                    color: 'var(--color-ink)',
                  }}
                >
                  Nombre de la colección *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej. Ruta de Cafés Históricos, Castillos Medievales"
                  className="w-full px-3 py-1.5 text-sm rounded bg-transparent border-b-2 focus:outline-none transition-colors"
                  style={{
                    borderColor: 'var(--border-bright)',
                    color: 'var(--color-ink)',
                    fontFamily: 'var(--font-body-stack)',
                  }}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label
                  className="text-xs font-semibold tracking-wide"
                  style={{
                    fontFamily: 'var(--font-body-stack)',
                    fontVariant: 'small-caps',
                    color: 'var(--color-ink)',
                  }}
                >
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ej. Mis rincones favoritos para leer y degustar café de especialidad"
                  className="w-full px-3 py-1.5 text-sm rounded bg-transparent border-b-2 focus:outline-none transition-colors"
                  style={{
                    borderColor: 'var(--border-bright)',
                    color: 'var(--color-ink)',
                    fontFamily: 'var(--font-body-stack)',
                  }}
                />
              </div>

              {/* Curated Color Selector */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold tracking-wide"
                  style={{
                    fontFamily: 'var(--font-body-stack)',
                    fontVariant: 'small-caps',
                    color: 'var(--color-ink)',
                  }}
                >
                  Tinta de la Colección (Paleta Archival)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {COLLECTION_PALETTE.map((opt) => {
                    const isSelected = selectedColor === opt.hex
                    return (
                      <button
                        key={opt.hex}
                        type="button"
                        onClick={() => setSelectedColor(opt.hex)}
                        title={opt.name}
                        className="flex flex-col items-center gap-1 p-1.5 rounded border transition-all"
                        style={{
                          backgroundColor: isSelected
                            ? '#e8d9b5'
                            : '#f3e9d2',
                          borderColor: isSelected
                            ? 'var(--color-oxblood)'
                            : 'var(--border)',
                          boxShadow: isSelected ? '0 0 0 1px var(--color-oxblood)' : 'none',
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shadow-inner"
                          style={{ backgroundColor: opt.hex }}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span
                          className="text-[9px] truncate max-w-full text-center"
                          style={{
                            fontFamily: 'var(--font-body-stack)',
                            color: 'var(--color-ink-faded)',
                          }}
                        >
                          {opt.name.split(' ')[0]}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Curated Icon Selector */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold tracking-wide"
                  style={{
                    fontFamily: 'var(--font-body-stack)',
                    fontVariant: 'small-caps',
                    color: 'var(--color-ink)',
                  }}
                >
                  Sello / Icono Temático
                </label>
                <div
                  className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1.5 border rounded"
                  style={{
                    borderColor: 'var(--border-bright)',
                    backgroundColor: '#e8d9b5',
                  }}
                >
                  {COLLECTION_ICONS.map((opt) => {
                    const isSelected = selectedIcon === opt.key
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setSelectedIcon(opt.key)}
                        title={opt.label}
                        className="flex flex-col items-center gap-1 p-2 rounded transition-colors text-center"
                        style={{
                          backgroundColor: isSelected ? selectedColor : '#f3e9d2',
                          color: isSelected ? '#ffffff' : 'var(--color-ink)',
                          border: isSelected
                            ? '1px solid transparent'
                            : '1px solid var(--border)',
                        }}
                      >
                        <CollectionIcon name={opt.key} size={18} />
                        <span
                          className="text-[9px] truncate max-w-full leading-tight"
                          style={{
                            fontFamily: 'var(--font-body-stack)',
                            opacity: isSelected ? 0.95 : 0.8,
                          }}
                        >
                          {opt.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Form Actions */}
              <div
                className="flex items-center justify-end gap-2 pt-2 border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-3 py-1.5 text-xs rounded border transition-colors hover:bg-black/5"
                  style={{
                    borderColor: 'var(--border-bright)',
                    color: 'var(--color-ink)',
                    fontFamily: 'var(--font-body-stack)',
                    backgroundColor: '#f3e9d2',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !name.trim()}
                  className="px-4 py-1.5 text-xs font-semibold text-white rounded transition-colors disabled:opacity-50 shadow-sm"
                  style={{
                    backgroundColor: 'var(--color-oxblood)',
                    fontFamily: 'var(--font-body-stack)',
                  }}
                >
                  {submitting
                    ? 'Guardando...'
                    : editingCollection
                    ? 'Guardar cambios'
                    : 'Crear colección'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

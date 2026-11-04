'use client'

import { useState } from 'react'
import { Loader2, Link2, MapPin, X, Code2, Columns } from 'lucide-react'
import { parseGoogleMapsUrl } from '@/lib/actions/parse-maps-url'
import type { Place, PlaceInsert, PriceLevel, SectionKey, SectionMap } from '@/lib/types'
import {
  SECTION_CATALOG,
  SECTION_KEYS,
  SECTION_BY_KEY,
  parseMarkdownToSections,
  compileSectionsToMarkdown,
} from '@/lib/markdown-sections'
import SectionCheckbox from './notebook/SectionCheckbox'
import { SectionIcon } from './notebook/SectionIcon'

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

  // Raw mode toggle: allows switching between modular sections and raw markdown
  const [rawMarkdownMode, setRawMarkdownMode] = useState(false)

  // Initialize modular sections from existing markdown
  const initialParsed = parseMarkdownToSections(editingPlace?.notes_markdown ?? '')
  const [selectedKeys, setSelectedKeys] = useState<SectionKey[]>(() => {
    // If editing a place with existing sections, activate those sections
    if (initialParsed.activeKeys.length > 0) {
      return initialParsed.activeKeys
    }
    // Default for fresh places: empty, or user can toggle General Info with 1 click
    return []
  })
  const [sectionContents, setSectionContents] = useState<SectionMap>(
    initialParsed.sections
  )

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

  // Handle section checkbox toggle
  const handleToggleSection = (key: SectionKey, checked: boolean) => {
    if (checked) {
      // Add section in canonical order
      setSelectedKeys((prev) =>
        SECTION_KEYS.filter((k) => k === key || prev.includes(k))
      )
    } else {
      // Unchecking: if it has content, confirm deletion
      const currentText = sectionContents[key]?.trim()
      if (currentText) {
        const confirmed = window.confirm(
          `La sección "${SECTION_BY_KEY[key]?.titleEs}" contiene texto. ¿Deseas desactivarla y descartar su contenido?`
        )
        if (!confirmed) return
      }

      setSelectedKeys((prev) => prev.filter((k) => k !== key))
      setSectionContents((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const handleSectionTextChange = (key: SectionKey, text: string) => {
    setSectionContents((prev) => ({
      ...prev,
      [key]: text,
    }))
  }

  // Toggle between raw markdown and modular sections
  const handleToggleRawMode = () => {
    if (!rawMarkdownMode) {
      // Switching from modular to raw: compile current modular sections
      const compiled = compileSectionsToMarkdown(sectionContents, selectedKeys)
      setForm((prev) => ({ ...prev, notes_markdown: compiled }))
      setRawMarkdownMode(true)
    } else {
      // Switching from raw to modular: re-parse raw markdown
      const reParsed = parseMarkdownToSections(form.notes_markdown)
      setSelectedKeys(reParsed.activeKeys)
      setSectionContents(reParsed.sections)
      setRawMarkdownMode(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)

    // Determine final markdown to save
    let finalMarkdown = form.notes_markdown
    if (!rawMarkdownMode) {
      finalMarkdown = compileSectionsToMarkdown(sectionContents, selectedKeys)
    }

    try {
      await onSubmit({
        ...form,
        notes_markdown: finalMarkdown,
      })
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
            onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) || 0 })}
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
            onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) || 0 })}
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

      <hr className="divider" />

      {/* Modular Notes Section */}
      <div className="form-group">
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <label className="label mb-0">SECCIONES DEL CUADERNO (NOTAS)</label>
            <p className="text-[11px] text-[var(--text-secondary)] italic">
              Elige las secciones que correspondan a este lugar. Para lugares con poca información, usa solo &quot;Información general&quot;.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleRawMode}
            className="btn btn-ghost btn-sm text-xs gap-1 py-1 px-2 h-auto min-h-[30px]"
            title={rawMarkdownMode ? 'Volver a edición por secciones' : 'Ver y editar Markdown continuo'}
          >
            {rawMarkdownMode ? (
              <>
                <Columns size={12} />
                <span>Secciones</span>
              </>
            ) : (
              <>
                <Code2 size={12} />
                <span>Raw Markdown</span>
              </>
            )}
          </button>
        </div>

        {rawMarkdownMode ? (
          /* Raw Markdown Editor */
          <div className="mt-2">
            <textarea
              id="place-notes"
              className="input textarea w-full"
              placeholder="## ℹ️ General Information&#10;Resumen rápido..."
              value={form.notes_markdown}
              onChange={(e) => setForm({ ...form, notes_markdown: e.target.value })}
              rows={8}
            />
          </div>
        ) : (
          /* Modular Sections UI */
          <div className="flex flex-col gap-3 mt-1">
            {/* Checkbox Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 p-2 rounded-sm border border-[var(--border)] bg-[var(--bg-surface)]">
              {SECTION_CATALOG.map((config) => {
                const isChecked = selectedKeys.includes(config.key)
                const hasText = !!sectionContents[config.key]?.trim()
                return (
                  <SectionCheckbox
                    key={config.key}
                    config={config}
                    checked={isChecked}
                    hasContent={hasText}
                    onChange={(checked) => handleToggleSection(config.key, checked)}
                  />
                )
              })}
            </div>

            {/* Dynamic Input Fields for Active Sections */}
            {selectedKeys.length > 0 ? (
              <div className="flex flex-col gap-4 mt-2">
                {selectedKeys.map((key) => {
                  const config = SECTION_BY_KEY[key]
                  if (!config) return null
                  const content = sectionContents[key] ?? ''

                  return (
                    <div
                      key={key}
                      className="p-3 rounded-sm border border-[var(--border)] bg-[var(--bg-base)] flex flex-col gap-2 transition-all"
                    >
                      {/* Section Heading */}
                      <div className="flex items-center justify-between pb-1 border-b border-[var(--border)]">
                        <div className="flex items-center gap-2">
                          <SectionIcon
                            sectionKey={key}
                            size={16}
                            className="text-[var(--accent)] flex-shrink-0"
                          />
                          <h4
                            className="text-base italic leading-snug text-[var(--text-primary)]"
                            style={{ fontFamily: 'var(--font-display-stack)' }}
                          >
                            {config.titleEs}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleSection(key, false)}
                          className="btn-icon btn-ghost min-w-[28px] min-h-[28px] p-1 text-[var(--text-muted)] hover:text-[var(--danger)]"
                          title={`Desactivar sección ${config.titleEs}`}
                          aria-label={`Desactivar sección ${config.titleEs}`}
                        >
                          <X size={13} />
                        </button>
                      </div>

                      {/* Underlined Textarea styled with paper & ink lines */}
                      <textarea
                        className="input textarea w-full text-sm leading-relaxed"
                        placeholder={config.placeholder}
                        value={content}
                        onChange={(e) => handleSectionTextChange(key, e.target.value)}
                        rows={key === 'general_info' ? 4 : 3}
                      />
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-4 text-center rounded-sm border border-dashed border-[var(--border-bright)] bg-transparent">
                <p className="text-xs text-[var(--text-muted)] italic">
                  Selecciona una o más casillas arriba para redactar notas de este lugar.
                </p>
                <button
                  type="button"
                  onClick={() => handleToggleSection('general_info', true)}
                  className="btn btn-ghost btn-sm text-xs mt-2"
                >
                  <SectionIcon sectionKey="general_info" size={13} />
                  Añadir Información General
                </button>
              </div>
            )}
          </div>
        )}
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

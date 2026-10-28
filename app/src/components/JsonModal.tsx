'use client'

import { useState } from 'react'
import { Download, Upload, X, Check, AlertCircle } from 'lucide-react'
import type { Place } from '@/lib/types'

interface JsonModalProps {
  places: Place[]
  onImport: (places: Partial<Place>[]) => Promise<void>
  onClose: () => void
}

export default function JsonModal({ places, onImport, onClose }: JsonModalProps) {
  const [tab, setTab] = useState<'export' | 'import'>('export')
  const [jsonInput, setJsonInput] = useState('')
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const exportData = JSON.stringify(
    places.map(({ id, user_id, created_at, ...rest }) => rest),
    null,
    2
  )

  const handleDownload = () => {
    const blob = new Blob([exportData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `secondmindmap-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async () => {
    setMessage(null)
    try {
      const parsed = JSON.parse(jsonInput)
      const items = Array.isArray(parsed) ? parsed : [parsed]

      // Validate basic structure
      const valid = items.every(
        (item) =>
          typeof item.name === 'string' &&
          typeof item.latitude === 'number' &&
          typeof item.longitude === 'number'
      )

      if (!valid) {
        setMessage({ type: 'error', text: 'Estructura JSON inválida. Cada elemento debe tener name, latitude y longitude.' })
        return
      }

      setImporting(true)
      await onImport(items)
      setMessage({ type: 'success', text: `${items.length} lugar(es) importado(s) correctamente.` })
      setJsonInput('')
    } catch {
      setMessage({ type: 'error', text: 'JSON inválido. Verifica la sintaxis.' })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal glass-strong" role="dialog" aria-modal="true" aria-label="Copia del diario">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl" style={{ color: 'var(--text-primary)' }}>
            Copia del diario
          </h2>
          <button className="btn-icon btn-ghost" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b" style={{ borderColor: 'var(--border-bright)' }}>
          {(['export', 'import'] as const).map((t) => (
            <button
              key={t}
              className="flex-1 pb-2 text-sm"
              style={{
                fontFamily: 'var(--font-body-stack)',
                color: tab === t ? 'var(--accent)' : 'var(--text-secondary)',
                borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                background: 'transparent',
              }}
              aria-pressed={tab === t}
              onClick={() => setTab(t)}
            >
              {t === 'export' ? (
                <><Download size={13} className="inline mr-1" />Exportar</>
              ) : (
                <><Upload size={13} className="inline mr-1" />Importar</>
              )}
            </button>
          ))}
        </div>

        {tab === 'export' ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-secondary">
              Exporta todos tus lugares como GeoJSON-compatible para usar con IA o hacer backup.
            </p>
            <pre
              className="text-xs overflow-auto rounded-lg p-3"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                maxHeight: '300px',
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
              }}
            >
              {exportData.slice(0, 2000)}{exportData.length > 2000 ? '\n...' : ''}
            </pre>
            <div className="flex gap-2">
              <button className="btn btn-primary flex-1" onClick={handleDownload}>
                <Download size={14} />
                Descargar JSON ({places.length} lugares)
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => navigator.clipboard.writeText(exportData)}
              >
                Copiar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-secondary">
              Pega un JSON generado por IA o exportado previamente. Debe contener <code>name</code>, <code>latitude</code> y <code>longitude</code>.
            </p>
            <textarea
              className="input textarea"
              placeholder={'[\n  {\n    "name": "Coliseo Romano",\n    "latitude": 41.8902,\n    "longitude": 12.4922,\n    "notes_markdown": "## Historia\\n...",\n    "is_visited": false,\n    "price_level": "$"\n  }\n]'}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={10}
              style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
            />

            {message && (
              <div
                className="flex items-start gap-2 p-2 text-sm"
                style={{
                  color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
                  borderTop: '1px solid var(--border)',
                  borderBottom: '1px solid var(--border)',
                }}
                role={message.type === 'error' ? 'alert' : 'status'}
              >
                {message.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                {message.text}
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={handleImport}
              disabled={importing || !jsonInput.trim()}
            >
              <Upload size={14} />
              {importing ? 'Importando...' : 'Importar lugares'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useMemo, useState, useEffect } from 'react'
import { X, BookOpen, ChevronLeft, ChevronRight, FileText, Layers } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPopulatedSections } from '@/lib/markdown-sections'
import { SectionIcon } from './notebook/SectionIcon'

interface MarkdownModalProps {
  isOpen: boolean
  onClose: () => void
  content: string
  title: string
}

export default function MarkdownModal({
  isOpen,
  onClose,
  content,
  title,
}: MarkdownModalProps) {
  const [activePageIndex, setActivePageIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'paged' | 'continuous'>('paged')

  const populatedSections = useMemo(
    () => getPopulatedSections(content || ''),
    [content]
  )

  // Reset to first page when modal opens or content changes
  useEffect(() => {
    setActivePageIndex(0)
  }, [isOpen, content])

  // Keyboard navigation for page turning (Left/Right arrows)
  useEffect(() => {
    if (!isOpen || viewMode !== 'paged') return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActivePageIndex((prev) => Math.max(0, prev - 1))
      } else if (e.key === 'ArrowRight') {
        setActivePageIndex((prev) =>
          Math.min(populatedSections.length - 1, prev + 1)
        )
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, viewMode, populatedSections.length, onClose])

  if (!isOpen) return null

  const activeSection = populatedSections[activePageIndex] ?? populatedSections[0]
  const prevSection = activePageIndex > 0 ? populatedSections[activePageIndex - 1] : null
  const nextSection =
    activePageIndex < populatedSections.length - 1
      ? populatedSections[activePageIndex + 1]
      : null

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal glass-strong max-w-3xl w-full p-6 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          boxShadow: 'none',
          border: '2px solid var(--border-bright)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[var(--border-bright)] mb-3">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <BookOpen size={20} className="text-[var(--accent)] flex-shrink-0" />
            <div className="min-w-0">
              <h2
                className="text-2xl leading-tight text-[var(--text-primary)] truncate"
                style={{ fontFamily: 'var(--font-display-stack)' }}
              >
                {title}
              </h2>
              <span
                className="text-xs text-[var(--text-secondary)]"
                style={{ fontVariant: 'small-caps' }}
              >
                Cuaderno de campo • {populatedSections.length === 1 ? '1 sección' : `${populatedSections.length} secciones`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {populatedSections.length > 1 && (
              <div className="flex items-center gap-1 border border-[var(--border)] rounded-sm p-0.5 bg-[var(--bg-surface)]">
                <button
                  type="button"
                  onClick={() => setViewMode('paged')}
                  className={`btn-sm text-xs py-1 px-2 h-auto min-h-[28px] gap-1 rounded-sm border-0 ${viewMode === 'paged'
                      ? 'bg-[var(--accent)] text-[var(--ink-on-accent)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  title="Ver página por página"
                >
                  <Layers size={12} />
                  <span>Hojas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('continuous')}
                  className={`btn-sm text-xs py-1 px-2 h-auto min-h-[28px] gap-1 rounded-sm border-0 ${viewMode === 'continuous'
                      ? 'bg-[var(--accent)] text-[var(--ink-on-accent)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  title="Ver todo en una sola página continua"
                >
                  <FileText size={12} />
                  <span>Continuo</span>
                </button>
              </div>
            )}
            <button
              className="btn-icon btn-ghost min-w-[34px] min-h-[34px] p-1.5"
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Notebook Index Tabs (Horizontal Bookmark Tabs) */}
        {populatedSections.length > 1 && viewMode === 'paged' && (
          <div className="flex items-center gap-1 overflow-x-auto mb-3 border-b border-[var(--border-bright)] no-scrollbar">
            {populatedSections.map((sec, idx) => {
              const isActive = idx === activePageIndex
              return (
                <button
                  key={sec.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActivePageIndex(idx)}
                  className={`
                    inline-flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-t-sm whitespace-nowrap transition-all flex-shrink-0 cursor-pointer
                    ${isActive
                      ? 'bg-[var(--bg-base)] text-[var(--text-primary)] border border-b-0 border-[var(--border-bright)] font-semibold -mb-[1px]'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] border border-transparent'
                    }
                  `}
                  style={isActive ? { borderTop: '2px solid var(--accent)' } : undefined}
                >
                  <SectionIcon
                    sectionKey={sec.key}
                    size={13}
                    className={isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}
                  />
                  <span>{sec.config.titleEs}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Modal Page Content */}
        <div className="flex-1 overflow-y-auto pr-2 min-h-0">
          {populatedSections.length > 0 ? (
            viewMode === 'paged' ? (
              /* Single Dedicated Category Page */
              <div className="flex flex-col h-full min-h-[320px]">
                {/* Page Header */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <SectionIcon
                      sectionKey={activeSection.key}
                      size={18}
                      className="text-[var(--accent)] flex-shrink-0"
                    />
                    <h3
                      className="text-xl italic text-[var(--text-primary)]"
                      style={{ fontFamily: 'var(--font-display-stack)' }}
                    >
                      {activeSection.config.titleEs}
                    </h3>
                  </div>
                  {populatedSections.length > 1 && (
                    <span
                      className="text-xs text-[var(--text-muted)] font-mono"
                      style={{ fontVariant: 'small-caps' }}
                    >
                      Página {activePageIndex + 1} de {populatedSections.length}
                    </span>
                  )}
                </div>

                {/* Page Body with robust text wrapping */}
                <div
                  className="markdown-body flex-1 overflow-y-auto max-h-[52vh] pr-2"
                  style={{
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                  }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeSection.content}
                  </ReactMarkdown>
                </div>

                {/* Page Navigation Controls */}
                {populatedSections.length > 1 && (
                  <div className="flex items-center justify-between pt-3 mt-4 border-t border-[var(--border)]">
                    <button
                      type="button"
                      disabled={activePageIndex === 0}
                      onClick={() => setActivePageIndex((p) => Math.max(0, p - 1))}
                      className="btn btn-ghost btn-sm text-xs gap-1.5 min-w-[110px] justify-start disabled:opacity-30"
                    >
                      <ChevronLeft size={14} />
                      <span className="truncate">
                        {prevSection ? prevSection.config.titleEs : 'Inicio'}
                      </span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {populatedSections.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActivePageIndex(i)}
                          className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === activePageIndex
                              ? 'bg-[var(--accent)] scale-125'
                              : 'bg-[var(--border-bright)] hover:bg-[var(--text-secondary)]'
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
                      className="btn btn-ghost btn-sm text-xs gap-1.5 min-w-[110px] justify-end disabled:opacity-30"
                    >
                      <span className="truncate">
                        {nextSection ? nextSection.config.titleEs : 'Fin'}
                      </span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Continuous Journal Spread */
              <div
                className="flex flex-col gap-6 py-2"
                style={{
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                }}
              >
                {populatedSections.map((sec) => (
                  <section
                    key={sec.key}
                    id={`modal-section-${sec.key}`}
                    className="flex flex-col gap-2 pb-4 border-b border-[var(--border)] last:border-b-0"
                  >
                    <div className="flex items-center gap-2 pb-1">
                      <SectionIcon
                        sectionKey={sec.key}
                        size={16}
                        className="text-[var(--accent)] flex-shrink-0"
                      />
                      <h3
                        className="text-lg italic text-[var(--text-primary)]"
                        style={{ fontFamily: 'var(--font-display-stack)' }}
                      >
                        {sec.config.titleEs}
                      </h3>
                    </div>
                    <div className="markdown-body pl-1">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {sec.content}
                      </ReactMarkdown>
                    </div>
                  </section>
                ))}
              </div>
            )
          ) : (
            <p className="text-muted text-sm italic py-8 text-center">
              Sin notas de campo para mostrar.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useMemo, useState } from 'react'
import { X, BookOpen } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState<'continuous' | 'sections'>('sections')

  const populatedSections = useMemo(
    () => getPopulatedSections(content || ''),
    [content]
  )

  if (!isOpen) return null

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal glass-strong max-w-2xl w-full p-6"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          boxShadow: 'none',
          border: '2px solid var(--border-bright)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[var(--border-bright)] mb-4">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-[var(--accent)] flex-shrink-0" />
            <div>
              <h2
                className="text-2xl leading-tight text-[var(--text-primary)]"
                style={{ fontFamily: 'var(--font-display-stack)' }}
              >
                {title}
              </h2>
              <span
                className="text-xs text-[var(--text-secondary)]"
                style={{ fontVariant: 'small-caps' }}
              >
                Cuaderno de viaje • Notas completas
              </span>
            </div>
          </div>
          <button
            className="btn-icon btn-ghost"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Section Navigation Quick Chips (if multiple sections exist) */}
        {populatedSections.length > 1 && (
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4 pb-2 border-b border-[var(--border)]">
            <div className="flex flex-wrap gap-1.5 items-center">
              {populatedSections.map((sec) => (
                <a
                  key={sec.key}
                  href={`#modal-section-${sec.key}`}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                >
                  <SectionIcon sectionKey={sec.key} size={12} />
                  <span>{sec.config.titleEs}</span>
                </a>
              ))}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('sections')}
                className={`px-2 py-0.5 rounded ${
                  activeTab === 'sections'
                    ? 'bg-[var(--accent)] text-[var(--ink-on-accent)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                Por secciones
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('continuous')}
                className={`px-2 py-0.5 rounded ${
                  activeTab === 'continuous'
                    ? 'bg-[var(--accent)] text-[var(--ink-on-accent)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                Texto continuo
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="overflow-y-auto max-h-[65vh] pr-2">
          {populatedSections.length > 0 ? (
            activeTab === 'sections' ? (
              <div className="flex flex-col gap-6">
                {populatedSections.map((sec) => (
                  <section
                    key={sec.key}
                    id={`modal-section-${sec.key}`}
                    className="flex flex-col gap-2 scroll-mt-4"
                  >
                    <div className="flex items-center gap-2 pb-1 border-b border-[var(--border)]">
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
            ) : (
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            )
          ) : (
            <p className="text-muted text-sm italic">
              Sin notas de campo para mostrar.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

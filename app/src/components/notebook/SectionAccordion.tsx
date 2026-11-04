'use client'

import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { SectionConfig } from '@/lib/types'
import { SectionIcon } from './SectionIcon'

interface SectionAccordionProps {
  config: SectionConfig
  content: string
  isOpen: boolean
  onToggle: () => void
  id?: string
}

export default function SectionAccordion({
  config,
  content,
  isOpen,
  onToggle,
  id,
}: SectionAccordionProps) {
  const headingId = id ? `${id}-heading` : `section-${config.key}-heading`
  const regionId = id ? `${id}-region` : `section-${config.key}-region`

  return (
    <div className="border-b border-[var(--border)] last:border-b-0 transition-colors">
      <button
        type="button"
        id={headingId}
        aria-expanded={isOpen}
        aria-controls={regionId}
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2.5 px-1 min-h-[44px] text-left group cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-2 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <SectionIcon
            sectionKey={config.key}
            size={16}
            className="text-[var(--text-secondary)] flex-shrink-0 group-hover:text-[var(--accent)] transition-colors"
          />
          <span
            className="text-base italic leading-tight text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate"
            style={{ fontFamily: 'var(--font-display-stack)' }}
          >
            {config.titleEs}
          </span>
        </div>
        <span className="text-[var(--text-secondary)] flex-shrink-0 p-1 group-hover:text-[var(--text-primary)] transition-colors">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {isOpen && (
        <div
          id={regionId}
          role="region"
          aria-labelledby={headingId}
          className="pb-3 pt-1 px-1 text-sm animate-fadeIn"
          style={{ animationDuration: '220ms' }}
        >
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}


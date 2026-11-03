'use client'

import { X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownModalProps {
  isOpen: boolean
  onClose: () => void
  content: string
  title: string
}

export default function MarkdownModal({ isOpen, onClose, content, title }: MarkdownModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal glass-strong" role="dialog" aria-modal="true" aria-label={title}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h2>
          <button className="btn-icon btn-ghost" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Markdown content */}
        <div className="markdown-body overflow-y-auto max-h-[70vh]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
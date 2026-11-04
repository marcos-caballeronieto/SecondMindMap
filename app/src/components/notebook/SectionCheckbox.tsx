'use client'

import React from 'react'
import type { SectionConfig } from '@/lib/types'
import { SectionIcon } from './SectionIcon'

interface SectionCheckboxProps {
  config: SectionConfig
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  hasContent?: boolean
}

export default function SectionCheckbox({
  config,
  checked,
  onChange,
  disabled = false,
  hasContent = false,
}: SectionCheckboxProps) {
  return (
    <label
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-sm border cursor-pointer select-none
        transition-all duration-150 min-h-[44px] text-xs
        ${
          checked
            ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--text-primary)] font-medium'
            : 'border-[var(--border)] bg-transparent hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      title={config.description}
    >
      <input
        type="checkbox"
        className="w-4 h-4 accent-[var(--accent)] rounded cursor-pointer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <SectionIcon
        sectionKey={config.key}
        size={14}
        className={`flex-shrink-0 ${checked ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}
      />
      <span className="truncate">{config.titleEs}</span>
      {hasContent && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0 ml-auto"
          title="Contiene texto"
        />
      )}
    </label>
  )
}


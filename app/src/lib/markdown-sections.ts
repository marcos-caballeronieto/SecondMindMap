import type { SectionConfig, SectionKey, SectionMap } from './types'

export const SECTION_CATALOG: SectionConfig[] = [
  {
    key: 'general_info',
    title: 'General Information',
    titleEs: 'Información general',
    iconName: 'Info',
    emoji: 'ℹ️',
    header: '## ℹ️ General Information',
    placeholder: 'Resumen general, datos esenciales o notas breves para lugares con poca información...',
    description: 'Resumen o datos básicos sin necesidad de subsecciones',
  },
  {
    key: 'history',
    title: 'History & Context',
    titleEs: 'Historia y contexto',
    iconName: 'Landmark',
    emoji: '🏛️',
    header: '## 🏛️ History & Context',
    placeholder: 'Fechas de fundación, períodos históricos, constructores, hitos cronológicos...',
    description: 'Orígenes históricos y relevancia cultural',
  },
  {
    key: 'curiosities',
    title: 'Curiosities & Trivia',
    titleEs: 'Curiosidades y anécdotas',
    iconName: 'Sparkles',
    emoji: '✨',
    header: '## ✨ Curiosities & Trivia',
    placeholder: 'Leyendas urbanas, peculiaridades, récords, anécdotas insólitas...',
    description: 'Historias curiosas y datos sorprendentes',
  },
  {
    key: 'highlights',
    title: 'What to Look For',
    titleEs: 'Qué buscar y detalles',
    iconName: 'Eye',
    emoji: '👀',
    header: '## 👀 What to Look For',
    placeholder: 'Detalles arquitectónicos sutiles, patios ocultos, acústica, ángulos imperdibles...',
    description: 'Detalles sutiles y rincones singulares',
  },
  {
    key: 'art_pieces',
    title: 'Notable Art Pieces',
    titleEs: 'Obras de arte destacadas',
    iconName: 'Palette',
    emoji: '🎨',
    header: '## 🎨 Notable Art Pieces',
    placeholder: 'Pinturas, esculturas, frescos, reliquias y su ubicación exacta dentro del recinto...',
    description: 'Obras artísticas y piezas patrimoniales',
  },
  {
    key: 'food_specialties',
    title: 'Food & Specialties',
    titleEs: 'Gastronomía y especialidades',
    iconName: 'UtensilsCrossed',
    emoji: '🍴',
    header: '## 🍴 Food & Specialties',
    placeholder: 'Especialidades culinarias, platos de autor, bebidas locales, etiqueta de pedido...',
    description: 'Platos típicos y recomendaciones gastronómicas',
  },
  {
    key: 'practical_tips',
    title: 'Practical Tips & Logistics',
    titleEs: 'Consejos prácticos',
    iconName: 'Lightbulb',
    emoji: '💡',
    header: '## 💡 Practical Tips',
    placeholder: 'Horarios para evitar aglomeraciones, reserva de entradas, código de vestimenta, tarifas...',
    description: 'Horarios, reservas y logística de visita',
  },
  {
    key: 'photo_spots',
    title: 'Photography & Viewpoints',
    titleEs: 'Fotografía y miradores',
    iconName: 'Camera',
    emoji: '📸',
    header: '## 📸 Photography & Viewpoints',
    placeholder: 'Mejores perspectivas, luz de la mañana / hora dorada, encuadres recomendados...',
    description: 'Miradores y mejores perspectivas para fotos',
  },
  {
    key: 'personal_notes',
    title: 'Field Notes & Journal',
    titleEs: 'Diario y notas de campo',
    iconName: 'BookOpen',
    emoji: '📝',
    header: '## 📝 Field Notes & Journal',
    placeholder: 'Impresiones subjetivas, acompañantes, fecha de visita, citas, recuerdos...',
    description: 'Impresiones personales y recuerdos de viaje',
  },
]

export const SECTION_KEYS: SectionKey[] = SECTION_CATALOG.map((s) => s.key)

export const SECTION_BY_KEY: Record<SectionKey, SectionConfig> = SECTION_CATALOG.reduce(
  (acc, section) => {
    acc[section.key] = section
    return acc
  },
  {} as Record<SectionKey, SectionConfig>
)

// Aliases for header matching (normalized: lowercase, stripped accents, stripped non-alphanumeric)
const SECTION_ALIASES: Record<SectionKey, string[]> = {
  general_info: [
    'general information',
    'general info',
    'general',
    'informacion general',
    'informacion',
    'info general',
    'resumen',
    'overview',
    'info',
    'datos basicos',
  ],
  history: [
    'history & context',
    'history and context',
    'history',
    'context',
    'historia y contexto',
    'historia y arquitectura',
    'historia',
    'contexto historico',
    'cronologia',
  ],
  curiosities: [
    'curiosities & trivia',
    'curiosities and trivia',
    'curiosities',
    'trivia',
    'curiosidades y anecdotas',
    'curiosidades',
    'anecdotas',
    'leyendas',
  ],
  highlights: [
    'what to look for',
    'what to look',
    'highlights',
    'que buscar y detalles',
    'que buscar',
    'que ver',
    'detalles',
    'imprescindibles',
    'puntos clave',
  ],
  art_pieces: [
    'notable art pieces',
    'notable art',
    'art pieces',
    'art',
    'obras de arte destacadas',
    'obras de arte',
    'obras destacadas',
    'arte',
  ],
  food_specialties: [
    'food & specialties',
    'food and specialties',
    'food specialties',
    'food',
    'specialties',
    'gastronomia y especialidades',
    'gastronomia',
    'especialidades',
    'comida',
    'platos tipicos',
  ],
  practical_tips: [
    'practical tips & logistics',
    'practical tips and logistics',
    'practical tips',
    'tips & logistics',
    'tips',
    'consejos practicos',
    'consejos',
    'informacion practica',
    'logistica',
    'entradas y horarios',
  ],
  photo_spots: [
    'photography & viewpoints',
    'photography and viewpoints',
    'photography',
    'viewpoints',
    'photo spots',
    'fotografia y miradores',
    'fotografia',
    'miradores',
    'fotos',
    'perspectivas',
  ],
  personal_notes: [
    'field notes & journal',
    'field notes and journal',
    'field notes',
    'journal',
    'personal notes',
    'diario y notas de campo',
    'diario',
    'notas de campo',
    'notas personales',
    'mis notas',
  ],
}

/**
 * Normalizes text for lenient matching: removes diacritics, emojis, punctuation, and trims.
 */
function normalizeHeaderTitle(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent diacritics
    .replace(/[^\w\s&]/g, '') // remove emojis, symbols except & and word chars
    .toLowerCase()
    .trim()
}

/**
 * Matches a header string to a canonical SectionKey.
 */
export function matchHeaderToSectionKey(headerLine: string): SectionKey | null {
  // Strip leading ## and whitespace
  const cleaned = headerLine.replace(/^#+\s*/, '').trim()
  const normalized = normalizeHeaderTitle(cleaned)

  for (const [key, aliases] of Object.entries(SECTION_ALIASES) as [SectionKey, string[]][]) {
    for (const alias of aliases) {
      if (normalized === alias || normalized.startsWith(alias) || alias.startsWith(normalized)) {
        return key
      }
    }
  }

  return null
}

export interface ParsedMarkdownResult {
  sections: SectionMap
  activeKeys: SectionKey[]
}

/**
 * Parses a markdown string into modular diary sections.
 * 
 * Guarantees:
 * 1. Zero data loss: Unstructured text or text before any recognized heading is placed
 *    into `general_info` (the minimal / overview container).
 * 2. Lenient header recognition: Recognizes English, Spanish, with or without emojis.
 * 3. Canonical ordering preserved in activeKeys.
 */
export function parseMarkdownToSections(rawMarkdown: string): ParsedMarkdownResult {
  const sections: SectionMap = {}
  if (!rawMarkdown || !rawMarkdown.trim()) {
    return { sections, activeKeys: [] }
  }

  const lines = rawMarkdown.split(/\r?\n/)
  let currentKey: SectionKey | null = null
  let currentBuffer: string[] = []
  const unassignedLeadingLines: string[] = []

  // Check if there are any H2 markdown headings in the content
  const hasH2 = lines.some((l) => /^##\s+/.test(l.trim()))

  if (!hasH2) {
    // Completely unstructured note -> map everything to 'general_info'
    const trimmed = rawMarkdown.trim()
    return {
      sections: { general_info: trimmed },
      activeKeys: ['general_info'],
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (/^##\s+/.test(trimmed)) {
      const matchedKey = matchHeaderToSectionKey(trimmed)

      if (matchedKey) {
        // Save current section buffer if any
        if (currentKey) {
          const content = currentBuffer.join('\n').trim()
          if (content) {
            sections[currentKey] = sections[currentKey]
              ? `${sections[currentKey]}\n\n${content}`
              : content
          }
        }
        currentKey = matchedKey
        currentBuffer = []
      } else {
        // Unrecognized H2 heading -> treat as subsection content within current section,
        // or keep in buffer
        currentBuffer.push(line)
      }
    } else {
      if (currentKey) {
        currentBuffer.push(line)
      } else {
        unassignedLeadingLines.push(line)
      }
    }
  }

  // Flush remaining buffer
  if (currentKey && currentBuffer.length > 0) {
    const content = currentBuffer.join('\n').trim()
    if (content) {
      sections[currentKey] = sections[currentKey]
        ? `${sections[currentKey]}\n\n${content}`
        : content
    }
  }

  // If there was any leading text before the first recognized header,
  // preserve it in 'general_info'
  const leadingText = unassignedLeadingLines.join('\n').trim()
  if (leadingText) {
    sections.general_info = sections.general_info
      ? `${leadingText}\n\n${sections.general_info}`
      : leadingText
  }

  // Deduce active keys in canonical catalog order
  const activeKeys = SECTION_KEYS.filter((key) => {
    const content = sections[key]
    return content !== undefined && content.trim().length > 0
  })

  return { sections, activeKeys }
}

/**
 * Compiles modular sections back into a clean, standardized Markdown string.
 */
export function compileSectionsToMarkdown(
  sections: SectionMap,
  activeKeys?: SectionKey[]
): string {
  const keysToCompile = activeKeys || SECTION_KEYS

  const markdownBlocks: string[] = []

  for (const key of SECTION_KEYS) {
    if (!keysToCompile.includes(key)) continue
    const content = sections[key]?.trim()
    if (!content) continue

    const config = SECTION_BY_KEY[key]
    if (config) {
      markdownBlocks.push(`${config.header}\n\n${content}`)
    }
  }

  return markdownBlocks.join('\n\n')
}

export interface PopulatedSection {
  key: SectionKey
  config: SectionConfig
  content: string
}

/**
 * Returns populated sections with their configs for display in accordion views.
 */
export function getPopulatedSections(rawMarkdown: string): PopulatedSection[] {
  const { sections, activeKeys } = parseMarkdownToSections(rawMarkdown)
  return activeKeys.map((key) => ({
    key,
    config: SECTION_BY_KEY[key],
    content: sections[key] || '',
  }))
}

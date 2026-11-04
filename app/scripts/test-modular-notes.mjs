import assert from 'node:assert'
import {
  parseMarkdownToSections,
  compileSectionsToMarkdown,
  getPopulatedSections,
  SECTION_CATALOG,
  SECTION_KEYS,
} from '../src/lib/markdown-sections.ts'

console.log('--- Testing Modular Notes System ---')

// 1. Verify Catalog
console.log('1. Checking Section Catalog:')
assert.strictEqual(SECTION_CATALOG.length, 9, 'Should have 9 sections defined')
assert.strictEqual(SECTION_KEYS.length, 9, 'SECTION_KEYS should have 9 keys')
assert.strictEqual(SECTION_CATALOG[0].key, 'general_info', 'First section must be general_info')
assert.strictEqual(SECTION_CATALOG[0].header, '## ℹ️ General Information')
console.log('   Catalog validation passed.')

// 2. Test places with very little information (unstructured plain text)
console.log('2. Testing place with very little information (no headers):')
const minimalText = 'Panadería artesanal con excelente focaccia y café.'
const parsedMinimal = parseMarkdownToSections(minimalText)
assert.deepStrictEqual(parsedMinimal.activeKeys, ['general_info'], 'Should activate only general_info')
assert.strictEqual(parsedMinimal.sections.general_info, minimalText)
console.log('   Minimal note mapped cleanly to general_info.')

// 3. Test compilation of minimal place
console.log('3. Testing compilation of minimal place:')
const compiledMinimal = compileSectionsToMarkdown(parsedMinimal.sections, parsedMinimal.activeKeys)
assert.strictEqual(
  compiledMinimal,
  '## ℹ️ General Information\n\nPanadería artesanal con excelente focaccia y café.'
)
console.log('   Compiled minimal markdown matches expected H2 format.')

// 4. Test parsing canonical format with emojis and multiple sections
console.log('4. Testing parsing of multiple structured sections:')
const fullMarkdown = `## 🏛️ History & Context
Construido en el 126 d.C. bajo el mandato de Adriano.

## 👀 What to Look For
- El óculo de 9 metros abierto al cielo.
- La tumba de Rafael Sanzio.

## 💡 Practical Tips
Entrada gratuita los primeros domingos de mes.`

const parsedFull = parseMarkdownToSections(fullMarkdown)
assert.strictEqual(parsedFull.activeKeys.length, 3)
assert.deepStrictEqual(parsedFull.activeKeys, ['history', 'highlights', 'practical_tips'])
assert.ok(parsedFull.sections.history.includes('126 d.C.'))
assert.ok(parsedFull.sections.highlights.includes('Rafael Sanzio'))
assert.ok(parsedFull.sections.practical_tips.includes('Entrada gratuita'))
console.log('   Multi-section markdown parsed accurately in canonical order.')

// 5. Test parsing Spanish titles
console.log('5. Testing Spanish title recognition:')
const spanishMarkdown = `## Información General
Un rincón tranquilo con buenas vistas.

## Historia y Contexto
Fundado en el siglo XVIII por artesanos locales.`

const parsedSpanish = parseMarkdownToSections(spanishMarkdown)
assert.deepStrictEqual(parsedSpanish.activeKeys, ['general_info', 'history'])
assert.strictEqual(parsedSpanish.sections.general_info, 'Un rincón tranquilo con buenas vistas.')
assert.strictEqual(parsedSpanish.sections.history, 'Fundado en el siglo XVIII por artesanos locales.')
console.log('   Spanish titles recognized successfully.')

// 6. Test preservation of leading text (zero data loss guarantee)
console.log('6. Testing leading text preservation:')
const mixedMarkdown = `Anotación inicial antes de cualquier encabezado.

## 📸 Photography & Viewpoints
Mejor hora al atardecer frente a la fachada oeste.`

const parsedMixed = parseMarkdownToSections(mixedMarkdown)
assert.deepStrictEqual(parsedMixed.activeKeys, ['general_info', 'photo_spots'])
assert.strictEqual(parsedMixed.sections.general_info, 'Anotación inicial antes de cualquier encabezado.')
assert.strictEqual(parsedMixed.sections.photo_spots, 'Mejor hora al atardecer frente a la fachada oeste.')
console.log('   Leading text preserved without data loss in general_info.')

// 7. Test getPopulatedSections
console.log('7. Testing getPopulatedSections for UI rendering:')
const populated = getPopulatedSections(fullMarkdown)
assert.strictEqual(populated.length, 3)
assert.strictEqual(populated[0].key, 'history')
assert.strictEqual(populated[0].config.title, 'History & Context')
assert.strictEqual(populated[0].config.iconName, 'Landmark')
console.log('   getPopulatedSections returned populated sections with configs.')

console.log('All modular notes system tests PASSED successfully!')

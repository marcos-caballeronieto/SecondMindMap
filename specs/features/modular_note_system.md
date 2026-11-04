# Feature Specification: Modular Place Notes System (Markdown)

**Status:** Planned / Pending Implementation  
**Location:** `specs/features/SISTEMA_MODULAR_NOTAS.md`  
**Design Reference:** [`DESIGN_CONSTITUTION.md`] (House style: "Field Diary Map")  
**Affected Area:** Place Form (`PlaceForm.tsx`), Place Detail (`PlaceDetail.tsx`), Full-screen Notes Viewer (`MarkdownModal.tsx`), and Section Parsing Utilities.

---

## 1. Vision & Core Principles

Currently, each place stores all notes within a single freeform text field (`notes_markdown`). While flexible, different types of locations require completely different facets of information:
- A **restaurant** benefits from culinary specialties and reservation tips, but rarely needs an extensive architectural chronology.
- A **monument or archaeological site** calls for historical context, subtle details to look for, and key artworks, but not menu recommendations.
- A **scenic viewpoint or photo spot** thrives on golden-hour advice and vantage point directions.

### Key Objectives:
1. **Optional modularity without rigid presets:** The user (or an AI assistant) selects via checkboxes exactly which sections apply to each specific place.
2. **Dedicated, separate inputs in edit mode:** Checking a category dynamically unfolds an independent text area for comfortable writing.
3. **Collapsible accordion sections in detail view:** On the place card/header, sections render as collapsible accordions for clean, distraction-free reading without endless scrolling.
4. **Standard Markdown storage:** 100% backward-compatible with the existing database schema (`places.notes_markdown`), requiring zero database migrations.
5. **AI-Ready architecture:** Structured with standardized H2 headers, enabling LLMs to generate, enrich, or translate targeted sections with ease.
6. **Strict alignment with the Design Constitution:** Grounded in the "Field Diary" aesthetic (serif faces `--font-display`, `--font-book`, ruled lines, hand-underlined fields, no modern glassmorphism or floating drop shadows).

---

## 2. Official Section Catalog

Nine standard modules are defined. Each module includes a programmatic `key`, a `lucide-react` icon, a standardized Markdown header, and its intended scope:

> [!NOTE]
> **Emoji Placeholders vs. Future Thematic SVGs:**  
> The emojis in the headings below (ℹ️, 🏛️, ✨, 👀, 🎨, 🍴, 💡, 📸, 📝) serve **only as temporary placeholders** during early development. At a later stage, they should be replaced with dedicated, custom hand-inked SVG icons that match the "Paper & Ink" traveler's notebook aesthetic outlined in [`DESIGN_CONSTITUTION.md`](file:///c:/Marcos/programming/Smaller_projects/map_second_brain/SecondMindMap/specs/DESIGN_CONSTITUTION.md), avoiding generic or modern system emoji fonts in the final UI.

| Key | Diary Section Title | Lucide Icon | Markdown Header | Purpose & Typical Content |
| :--- | :--- | :--- | :--- | :--- |
| `general_info` | General Information | `Info` | `## ℹ️ General Information` | Quick overview, basic details, and consolidated notes for locations with minimal information. |
| `history` | History & Context | `Landmark` | `## 🏛️ History & Context` | Founding dates, historical periods, architects/builders, social significance, and chronology. |
| `curiosities` | Curiosities & Trivia | `Sparkles` | `## ✨ Curiosities & Trivia` | Urban legends, oddities, records, quirky stories, and lesser-known historical anecdotes. |
| `highlights` | What to Look For | `Eye` | `## 👀 What to Look For` | Subtle architectural details, hidden courtyards, acoustics, specific angles, or overlooked carvings. |
| `art_pieces` | Notable Art Pieces | `Palette` | `## 🎨 Notable Art Pieces` | Paintings, sculptures, frescoes, relics, and murals, along with artist, era, and location within the venue. |
| `food_specialties` | Food & Specialties | `UtensilsCrossed` | `## 🍴 Food & Specialties` | Signature dishes, seasonal specialties, local drinks, ordering etiquette, and menu recommendations. |
| `practical_tips` | Practical Tips & Logistics | `Lightbulb` | `## 💡 Practical Tips` | Optimal visiting times to avoid crowds, ticket reservations, dress codes, fees, photography rules, and accessibility. |
| `photo_spots` | Photography & Viewpoints | `Camera` | `## 📸 Photography & Viewpoints` | Best vantage points, natural lighting directions (sunrise/golden hour), and framing tips. |
| `personal_notes` | Field Notes & Journal | `BookOpen` | `## 📝 Field Notes & Journal` | Subjective impressions, companions, visit dates, personal ratings, quotes, or travel diary memories. |

### 2.1 The "General Information" Option for Minimal Entries
For places where the user or AI possesses very little information (e.g. a small neighborhood cafe, a scenic bench, or a newly pinned spot with only a quick description or single observation), forcing a multi-category breakdown into specialized categories (History, Art, Food, etc.) creates unwanted friction and visual clutter.
Selecting **"General Information"** (`general_info`) provides a lightweight, focused single-section note. It serves three primary functions:
1. **Places with very little information:** Enables saving a clean, single-paragraph note without empty or forced categories.
2. **Backward-compatible fallback:** Legacy notes without structured H2 headings automatically map to `general_info`, guaranteeing zero data loss.
3. **Quick capture / Drafts:** Allows rapid recording on mobile before detailed field research is conducted.

---

## 3. Data Architecture & Bidirectional Parsing

To maximize portability, database simplicity, and interoperability with tools like Obsidian, Logseq, and Notion:
- The database continues storing a single string in `notes_markdown`.
- No modifications to the Supabase `places` schema are necessary.
- Plain text export/import remains transparent and robust.

### 3.1 Saved Markdown Structure Example
```markdown
## 🏛️ History & Context
Commissioned by Marcus Vipsanius Agrippa during the reign of Augustus. Rebuilt by Emperor Hadrian circa 126 AD.

## 👀 What to Look For
- The 9-meter central oculus open to the sky.
- The tomb of painter Raphael Sanzio on the left side.

## 💡 Practical Tips
Free admission on the first Sunday of each month. Advance online reservations mandatory on weekends.
```

### 3.2 Bidirectional Parser (`lib/markdown-sections.ts`)

A pure TypeScript utility module with comprehensive unit tests:

1. **`parseMarkdownToSections(rawMarkdown: string): Record<SectionKey, string>`**
   - Matches standard `## <Emoji>? <Title>` headings using regular expressions.
   - Extracts clean text content for each recognized section.
   - Any leading text preceding known headers or notes completely lacking H2 headers is preserved by mapping to `general_info` to guarantee zero data loss for legacy notes.

2. **`compileSectionsToMarkdown(sections: Partial<Record<SectionKey, string>>, activeKeys: SectionKey[]): string`**
   - Iterates through `activeKeys` in the canonical catalog order.
   - Formats non-empty sections with their standardized `## [Emoji] [Title]` heading.
   - Joins sections with double line breaks (`\n\n`).

### 3.3 AI Agent & LLM Ingestion Protocol

This section details how to generate and ingest place information from external or integrated LLMs (e.g., ChatGPT, Claude, Gemini, or an in-app AI assistant).

#### 3.3.1 Structured Prompt Template
To ensure the LLM outputs markdown that maps 1:1 to the modular section architecture without conversational clutter or malformed markdown, use the following prompt pattern:

```markdown
You are a travel researcher contributing field notes to a traveler's notebook.
Generate field notes for the following place: "{{PLACE_NAME}}" (located in "{{LOCATION}}").

STRICT STRUCTURAL RULES:
1. Include ONLY the requested sections listed below. Do NOT add conversational preambles ("Here is the info...", "Sure!"), disclaimers, or unrequested sections.
2. Use EXACTLY the specified Level 2 Markdown headings (`## [Emoji] [Title]`).
3. Write concise, high-value field notes in clear bullet points or short paragraphs.

REQUESTED SECTIONS:
{{#EACH_SELECTED_SECTION}}
- {{HEADER_TITLE}}
{{/EACH_SELECTED_SECTION}}

EXAMPLE OUTPUT FORMAT:
## 🏛️ History & Context
[Concise historical timeline, founder, and significance...]

## 👀 What to Look For
- [Specific detail or architectural feature 1]
- [Specific detail or architectural feature 2]

## 💡 Practical Tips
[Best hours, ticketing details, dress code or logistics...]
```

#### 3.3.2 Ingestion & Format Validation (Planned Implementation)
In a subsequent iteration, the app will incorporate a direct LLM Ingestion workflow (via an in-app prompt modal or server action):
- **Format Checking & Linting:** Before populating fields, the parser validates that:
  - Every H2 heading matches one of the canonical section keys in `SECTION_CATALOG`.
  - Malformed or unrecognized headings produce friendly warnings rather than breaking the parser.
  - Unexpected conversational preamble or epilogue text is isolated or placed into `personal_notes` rather than polluting core fields.
- **Form Auto-Population:** Verified sections automatically activate their corresponding checkboxes and fill their separate text inputs in `PlaceForm.tsx`, allowing the user to review and tweak before saving.

---

## 4. UI/UX Specifications (Adhering to `DESIGN_CONSTITUTION.md`)

In strict accordance with the immutable rules of the Design Constitution:
- **Surfaces & Tokens:** Grounded on `--color-paper` (`#f3e9d2`) and `--color-parchment` (`#e8d9b5`), with text in `--color-ink` (`#2b2118`) and `--color-ink-faded` (`#6b5a44`).
- **Typography:**
  - Section headers: `--font-display` (*IM Fell English*, 400 italic).
  - Metadata labels & small tags: `--font-book` (*Libre Baskerville*) with `font-variant: small-caps`.
  - Body markdown text: `--font-book`.
  - Margin notes / timestamps: `--font-hand` (*Caveat*).
- **Prohibitions:** No glowing buttons, no glassmorphism, no drop shadows, no saturated modern card badges. 1px rule lines at 20% opacity for surface separation.

---

### 4.1 In the Form (`PlaceForm.tsx`)

#### A. Section Selector (Diary Checkbox Grid)
- Positioned above the content fields under the small-caps label: `DIARY SECTIONS`.
- Clean layout of checkboxes:
  - Checkbox controls styled with `--color-ink-faded` border at 20%, checked accent in `--color-oxblood`.
  - Section names set in `--font-book` accompanied by their subtle monochrome `lucide-react` icon.
  - No intrusive quick-template buttons or automatic presets — full granular control.

#### B. Dynamic Input Fields
- Checking a category smoothly reveals its dedicated input container:
  - Section header: Icon + Title in `--font-display` (italic, 18px).
  - Input field: **Underlined field** (`border-b: 1px solid var(--color-ink-faded)` at 30%), no rectangular box borders, styled in `--font-book`.
  - Contextual placeholder (e.g., in Art Pieces: *"Notable works, artists, location within the venue..."*).
- If the user unchecks a section that already contains text, a gentle confirmation prompt prevents accidental deletion.

---

### 4.2 In Entry Detail (`PlaceDetail.tsx`)

#### A. Collapsible Section Accordions
- If a place has no notes, display honest empty state (§3.4): *"No field notes recorded yet. Edit entry to add notes."*
- If sections are present, each renders as an artisanal notebook accordion:
  - **Accordion Header:**
    - Clickable row with accessible touch target (height ≥ 44px, accessibility rule §5).
    - Left side: Monochrome ink stroke icon + Title in `--font-display` (italic).
    - Right side: Subtle ink chevron indicator (`ChevronDown` / `ChevronUp` in `--color-ink-faded`).
    - Separated by a 1px ruled ink line at 20% opacity.
  - **Accordion Body:**
    - Smooth expansion/collapse transition (`--motion-duration: 220ms`, disabled when `prefers-reduced-motion` is active).
    - Rendered via `ReactMarkdown` + `remark-gfm` in `--font-book`.
- **Default Expansion State:**
  - 1 or 2 sections: expanded by default.
  - 3+ sections: first section open, subsequent sections collapsed to prevent mobile scroll fatigue.
  - Subtle utility control: *"Expand all / Collapse all"*.

#### B. Full-Screen Viewer (`MarkdownModal.tsx`)
- Provides an expanded spread retaining the accordion navigation or presenting an elegant continuous journal page with an anchor index for quick section jumping.

---

## 5. Component Architecture

```
app/src/
├── lib/
│   ├── types.ts                   <-- Section types (SectionKey, PlaceSection, etc.)
│   └── markdown-sections.ts       <-- Official catalog & bidirectional parsers
├── components/
│   ├── PlaceForm.tsx              <-- Updated: checkbox selectors + dynamic underlined inputs
│   ├── PlaceDetail.tsx            <-- Updated: collapsible accordion renderer
│   ├── MarkdownModal.tsx          <-- Updated: full-spread notebook reader
│   └── notebook/
│       ├── SectionAccordion.tsx   <-- Accessible diary-style accordion component
│       └── SectionCheckbox.tsx    <-- Diary-styled checkbox control
```

---

## 6. Implementation Checklist

- [x] **Step 1: Data Model & Parser Utilities (`lib/markdown-sections.ts`)**
  - [x] Define types and constants: `SECTION_KEYS`, `SECTION_CATALOG`, `SECTION_BY_KEY`.
  - [x] Implement `parseMarkdownToSections` and `compileSectionsToMarkdown`.
  - [x] Support `general_info` for places with minimal notes, mapping unstructured legacy notes with zero data loss.
  - [x] Add automated unit tests (`scripts/test-modular-notes.mjs`) verifying section parsing, compilation, and legacy preservation.
- [x] **Step 2: Accordion Component (`SectionAccordion.tsx`)**
  - [x] Build accordion matching paper/ink tokens and typography.
  - [x] Include ARIA attributes (`aria-expanded`, keyboard focus).
- [x] **Step 3: Update `PlaceDetail.tsx`**
  - [x] Replace monolithic Markdown preview with dynamic accordions.
  - [x] Add "Expand all / Collapse all" toggle.
  - [x] Expand by default if 1 or 2 sections; collapse from 3rd onwards.
- [x] **Step 4: Update `PlaceForm.tsx`**
  - [x] Replace single textarea with checkbox selection grid for all 9 categories.
  - [x] Dynamically render underlined textareas with contextual placeholders for active sections.
  - [x] Provide raw Markdown toggle for power users.
  - [x] Serialize sections back into `notes_markdown` on submission.
- [x] **Step 5: Refine `MarkdownModal.tsx`**
  - [x] Style full-screen view as a traveler's notebook page spread with quick section chips and tabs.
- [x] **Step 6: Quality Assurance & Verification**
  - [x] Run `npm run build && npm run lint` in `app/` (passed with 0 errors).
  - [x] Add and run `npm test` verifying all parser and serialization scenarios.
- [ ] **Step 7: Thematic Icon Upgrade (Future Phase)**
  - [ ] Design or curate custom monochrome / hand-inked SVG icons for each category.
  - [ ] Replace emoji placeholders across UI components and header parsers with the thematic SVG asset suite.
- [ ] **Step 8: LLM Ingestion & Format Checking (Future Phase)**
  - [ ] Implement format validator and heading linter to verify structured LLM outputs.
  - [ ] Add direct prompt ingestion workflow to auto-populate form checkboxes and sections.

# SecondMindMap 🗺️📖

> **A personal geographic second brain designed around the "Field Diary Map" metaphor.**  
> *Every saved place becomes a dated entry in a traveller's notebook, pinned onto a hand-inked cartographic chart.*

[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-6.14.0-blue?logo=maplibre)](https://maplibre.org/)
[![Supabase](https://img.shields.io/badge/Supabase-SSR_&_Postgres-3ecf8e?logo=supabase)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Android_Ready-purple?logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

---

## 🌟 Vision & Design Metaphor

Unlike conventional navigation applications (such as Google Maps or Apple Maps) that prioritize real-time traffic and commercial reviews, **SecondMindMap** is an intimate, long-term personal knowledge repository for places worldwide.

It combines the spatial intuition of an interactive map with the rich, narrative depth of a classical traveler's journal:

- **The Field Diary Metaphor:** The notebook motif is visible across every screen — from ruled lines and aged parchment tones to ink stamps and handwritten field annotations.
- **Passport-Style Stamp of Discovery:** Marking a place as visited (*"Visitado"*) stamps the notebook page with an oxblood ink seal, completing a tactile reward loop.
- **Mobile-First for Field Exploration:** Designed specifically for on-the-ground travel on mobile devices (Android PWA with draggable bottom sheets) while offering a dual-spread notebook interface on desktop screens.
- **Deep Context over Generic Ratings:** Emphasizes architectural chronology, historical curiosities, hidden details, and connected landmarks over simple star ratings.

---

## 🗺️ Key Features

### 1. Cartographic Interface (MapLibre GL)
- **High-Performance Vector Map:** Smooth touch gestures (pinch-to-zoom, pan, rotate) powered by `maplibre-gl` and `react-map-gl`, rendered with dynamic client loading (`ssr: false`).
- **Carto Base Map:** Free from commercial API quotas, styled to match the cartographic paper aesthetic.
- **Ink-Drop Markers & Color Hierarchy:** Pins color-coded by price tier:
  - `free`: Forest Moss (`#4d6b3a`)
  - `$`: Indigo (`#6366f1`)
  - `$$`: Warm Ochre (`#b07a2a`)
  - `$$$`: Terracotta / Oxblood (`#8f3a2b`)
  - `$$$$`: Deep Plum (`#6e3b5c`)
- **Visual State Transitions:** Visited stamp badges, animated active focus rings (`--color-sea-ink`), and smooth *fly-to* camera centering when selecting locations.
- **Direct Tap-to-Pin:** Place pins precisely by tapping or clicking anywhere on the map canvas.

### 2. Adaptive "Field Diary" Layout
- **Mobile Mode (Android / Smartphones):**
  - Full-screen edge-to-edge cartographic view.
  - Multi-state draggable **Bottom Sheet** (`peek`, `half`, `full`) with smooth touch gestures.
- **Desktop Mode:**
  - Fixed 420px notebook sidebar layout with ruled lines, page margins, and parchment textures.
  - Generous map canvas with floating, paper-styled control chips.
- **Traveler's Voice (Spanish UI):** UI copy strictly adopts classical travel journal vocabulary (*"Buscar en el diario"*, *"Nueva entrada"*, *"Cuaderno de viaje"*, *"Lugar visitado"*).

### 3. Modular Markdown Notes System
Rather than forcing all notes into an unstructured block of text, SecondMindMap features an **expandable 9-module structured note engine**:
1. **General Information (`general_info`):** Quick overview or lightweight note for minimal entries.
2. **History & Context (`history`):** Founding dates, architectural periods, historical background.
3. **Curiosities & Trivia (`curiosities`):** Urban legends, oddities, quirks, and anecdotes.
4. **What to Look For (`highlights`):** Overlooked carvings, hidden courtyards, secret vantage points.
5. **Notable Art Pieces (`art_pieces`):** Paintings, sculptures, frescoes, relics, and artists.
6. **Food & Specialties (`food_specialties`):** Signature dishes, drinks, local dining etiquette.
7. **Practical Tips & Logistics (`practical_tips`):** Timetables, queue shortcuts, dress codes.
8. **Photography & Viewpoints (`photo_spots`):** Ideal lighting directions, golden hour angles.
9. **Field Notes & Journal (`personal_notes`):** Personal impressions, companion notes, trip dates.

> **Key Architectural Win:** Notes are compiled into a unified Markdown document with standardized H2 headers and stored in a single string (`notes_markdown`). This achieves complete backward compatibility with zero database schema churn while remaining 100% portable with tools like Obsidian, Logseq, and Notion.

### 4. Curated Collections & Thematic Lists
- Create customized collections (e.g., *"Rome Coffee Tour"*, *"Gothic Cathedrals"*, *"Secret Viewpoints"*).
- Personalize each list with custom colors and Lucide icons.
- Instant, multi-select filter bar with place count counters to slice map markers dynamically.
- Relational pivot schema (`place_collections`) protected by PostgreSQL Row Level Security.

### 5. Connected Locations & Spatial Relations (`place_relations`)
Places rarely exist in total isolation. SecondMindMap provides a rich relational model:
- **Relation Types:**
  - `contains` (*Dentro de / Contiene*): Hierarchical structures, e.g. a historic piazza containing monuments, fountains, and palazzos.
  - `nearby` (*En las inmediaciones*): Venues within immediate walking distance.
  - `related` (*Relacionado / Ver también*): Contextual or stylistic associations.
- **Breadcrumb Travel Stack:** Interactive navigation history ("← Volver a [Lugar anterior]") with automatic camera fly-to centering.
- **Bi-directional Linking Controls:** Form and detail view controls to link and unlink locations effortlessly.

### 6. Seamless Import & Export Ecosystem
- **Google Maps URL Parser:** Server Action that follows redirects on standard and shortened links (`maps.app.goo.gl/...`), resolving the coordinates and place title automatically.
- **JSON & GeoJSON Exporters:** Generate one-click backup downloads suitable for spatial analysis (GIS) or external backup.
- **Structured JSON Importer:** Modal for pasting structured datasets produced by AI assistants (LLMs) with strict schema validation.

### 7. Dual Operation: Zero-Config Demo Mode & Supabase Cloud
- **Local Demo Mode:** Instant zero-setup trial running purely in-browser using `localStorage`. No database credentials required.
- **Supabase Cloud Sync:** Full multi-device persistence with email/password authentication, PostgreSQL Row Level Security (RLS), and geospatial query indexes.

---

## 🎨 Design Constitution ("Field Diary Map")

The visual grammar of SecondMindMap is governed by the [Design Constitution](specs/DESIGN_CONSTITUTION.md):

### Color Tokens ("Paper & Ink")
```css
--color-paper:       #f3e9d2; /* Primary application background */
--color-parchment:   #e8d9b5; /* Sidebar, bottom sheets, cards */
--color-ink:         #2b2118; /* Headings and primary body copy */
--color-ink-faded:   #6b5a44; /* Captions, subtle borders, metadata */
--color-oxblood:     #8f3a2b; /* Primary actions, visited ink stamp */
--color-sea-ink:     #2f5d6b; /* Interactive accents, focus rings */
```

### Typography Hierarchy
1. **Display & Headings:** `IM Fell English` (Serif, italic, classical cartographic style).
2. **Body & Markdown:** `Libre Baskerville` (Refined book face, 1.6 line height).
3. **Handwritten Accents:** `Caveat` (Stamps, dates, margin notes, field logs).

### Core Rules
- **No modern glassmorphism or floating drop shadows:** Surfaces are completely opaque paper and parchment.
- **Ruled separation:** Panels and sections are delineated with 1px ink rule lines (`--color-ink-faded` at 20% opacity) or subtle parchment tone steps.
- **Color belongs to data, not chrome:** Navigation chrome remains neutral; colors are reserved for price tiers, visited stamps, and collection markers.

---

## 🚀 Future Plans & Roadmap

SecondMindMap's evolution is tracked in [ROADMAP.md](ROADMAP.md). Upcoming milestone initiatives include:

### ⏳ 1. The Timeline Engine (Spatiotemporal Second Brain)
*Specification: [`specs/features/time_line_expansion.md`](specs/features/time_line_expansion.md)*

Transforms the application from a geographic map into a **spatiotemporal second brain**, charting how places evolve over centuries.

```
[ NOTRE-DAME CATHEDRAL ]
────────────────────────────────────────────────────────────────
 1163 ── [Construction] Laying of the first stone by Pope Alexander III
   │
 1250 ── [Construction] Completion of the western facade towers
   │
 1844 ── [Renovation] Restoration by Viollet-le-Duc
   │
 2019 ── [Destruction] Major fire destroying the roof and spire
```

- **Place Milestones (`place_events` table):**
  - Record chronological milestones per place: `construction` (Foundation), `renovation` (Expansions/Restorations), `destruction` (Fires, Demolitions), and `historical_event` (Battles, Treaties, Coronations).
  - Native support for negative integer years for Antiquity (BCE / BC, e.g. `-44` for the Ides of March).
  - Vertical chronological axis integrated inside each place's detail panel.
- **Macro-Context Layers (`global_historical_contexts` table):**
  - Global temporal layers independent of coordinates: Historical Epochs (e.g. *Middle Ages*, *Belle Époque*), Architectural Styles (*Romanesque*, *Baroque*, *Art Nouveau*), and Dynasties / Reigns (*Roman Empire*, *Reign of Philip II*).
- **Global Interactive Timeline View:**
  - Dedicated full-view timeline (`/timeline` or Map/Timeline toggle) rendering all recorded events along a synchronized chronological scale.
  - Interactive event nodes that center the map (*fly-to*) on the corresponding location.
  - Category toggles to filter between building milestones, epochs, and architectural movements.
- **AI Agent Spatiotemporal Ingestion:**
  - JSON import/export schema enabling LLMs to generate complete historical timelines and macro-contexts in a single payload.

### 🖼️ 2. Multimedia Module (`place_media`)
- **Rich Media & External Sources:** Attach Wikipedia articles, specialized architectural blogs, and YouTube documentaries.
- **URL Image Previews:** Embed image URLs with interactive horizontal carousel galleries in the place sheet.
- **Supabase Storage Integration:** Direct photo uploads from smartphone cameras with client-side image compression to conserve mobile bandwidth.

### 📱 3. Native Android Capabilities & True Offline Mode
- **Web Share Target API:** Register SecondMindMap as a native Android share destination (`"Share via..."`). Sharing a location directly from Google Maps pre-fills a new pin entry.
- **IndexedDB & Service Worker Cache:** Offline storage using Dexie.js / Supabase local cache to allow browsing and writing field notes in remote areas without an active internet connection.
- **Background Synchronization:** Automatic two-way sync with Supabase once network connectivity is restored.

### 🌐 4. Geospatial Intelligence, Itineraries & Social
- **Route & Day-Trip Planner:** Group places into multi-day itineraries with walking distance estimation and optimal route visualization.
- **Map Layer Switcher:** Toggle between Carto Dark Matter, satellite imagery, and topographic/contour layers.
- **SecondMindMap AI Agent:** In-app synthesis assistant generating personalized travel guides and suggesting nearby hidden gems based on previous notes.
- **Collaborative Diaries:** Public read-only web maps via shareable links and shared multi-user collections.

---

## 🏗️ Architecture & Directory Structure

```text
SecondMindMap/
├── app/                                # Next.js web application
│   ├── public/                         # Icons, PWA manifest, static assets
│   ├── scripts/                        # Node test and migration runners
│   │   └── test-modular-notes.mjs      # Unit tests for the modular markdown parser
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css             # Design Tokens & Paper/Ink styling rules
│   │   │   ├── layout.tsx              # Root layout & Google Fonts integration
│   │   │   └── page.tsx                # Main application coordinator (Map + Sheet)
│   │   ├── components/
│   │   │   ├── AuthForm.tsx            # Supabase authentication modal
│   │   │   ├── CollectionFilterBar.tsx # Filter bar with count badges
│   │   │   ├── CollectionModal.tsx     # Collection creation/editing modal
│   │   │   ├── JsonModal.tsx           # JSON/GeoJSON import & export interface
│   │   │   ├── MapView.tsx             # Dynamic MapLibre GL map component
│   │   │   ├── MarkdownModal.tsx       # Expanded reading modal for long notes
│   │   │   ├── PlaceDetail.tsx         # Notebook detail sheet (accordions, stamps)
│   │   │   ├── PlaceForm.tsx           # Place editor with modular category inputs
│   │   │   └── notebook/               # Atomic journal components (icons, accordions)
│   │   └── lib/
│   │       ├── actions/                # Server Actions (places, collections, relations)
│   │       ├── markdown-sections.ts    # Bidirectional parser for modular notes
│   │       ├── relations-helper.ts     # Spatial relation resolution helpers
│   │       ├── types.ts                # TypeScript domain models
│   │       └── supabase/               # Client, Server, and SSR Supabase adapters
│   ├── supabase/
│   │   ├── migration.sql               # Core schema (places, collections, relations)
│   │   └── migration_collections.sql   # Standalone collections migration
│   ├── DEPENDENCIES.md                 # Strict dependency version truth table
│   └── package.json                    # Project metadata & npm scripts
├── specs/                              # Technical specifications & PRDs
│   ├── DESIGN_CONSTITUTION.md          # Visual grammar & immutable design rules
│   ├── DEPENDENCIES.md                 # Root dependency reference
│   ├── geomind_prd_and_specifications_mvp.md # Initial PRD specification
│   └── features/                       # Feature specs (Timeline, Modular Notes, UI/UX)
├── AGENTS.md                           # Rules for AI engineering assistants
├── ROADMAP.md                          # Implementation roadmap and phase tracking
└── README.md                           # Project documentation
```

### Tech Stack Summary
| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.4.2 (App Router) | React 19.3.0, Server Actions, Dynamic SSR imports |
| **Language** | TypeScript 5 | Strict typing across data models and props |
| **Styling** | Tailwind CSS v4 | CSS variables via `@theme`, custom design tokens |
| **Cartography** | MapLibre GL 6.14.0 + React Map GL 8.1.3 | Vector map engine, touch support, CARTO tiles |
| **Database & Auth** | Supabase (@supabase/ssr 0.12.7) | PostgreSQL, Row Level Security, async cookies API |
| **Rich Text** | React Markdown 10.1.0 + Remark GFM | Markdown rendering with GitHub Flavored Markdown |
| **Icons** | Lucide React 1.58.0 | Clean, accessible iconography |

---

## 🛠️ Getting Started & Setup Guide

### Prerequisites
- **Node.js:** v20.x or higher
- **npm** or **pnpm** installed on your system

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/SecondMindMap.git
cd SecondMindMap/app
```

### 2. Install Dependencies
```bash
npm install
```
*(Refer to [`app/DEPENDENCIES.md`](app/DEPENDENCIES.md) for strict compatibility guidelines).*

### 3. Environment Configuration
Create a `.env.local` file inside the `app/` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Note:** If you run the app without valid Supabase keys, SecondMindMap automatically switches to **Demo Mode**, safely storing all your pins, collections, and relations in local storage.

### 4. Database Setup (Supabase)
To enable cloud sync and authentication:
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase project dashboard.
3. Paste and run the contents of [`app/supabase/migration.sql`](app/supabase/migration.sql).
4. Update `.env.local` with your project URL and public anon key.

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Run Tests & Validation
```bash
# Run modular note parser unit tests
npm test

# Run ESLint validation
npm run lint

# Verify production build
npm run build
```

---

## 🤝 Contributing & Code Guidelines

All contributions must respect the project's foundational guidelines:

1. **Design Integrity:** UI changes must strictly adhere to the [Design Constitution](specs/DESIGN_CONSTITUTION.md). Never introduce unapproved fonts, arbitrary hex values, or drop shadows.
2. **Commit Style:** Use [Conventional Commits](https://www.conventionalcommits.org/) in English (e.g., `feat: add timeline milestone axis`, `fix: handle edge case in gmaps parser`).
3. **Language Rules:**
   - Code, documentation, commit messages, and issues: **English**.
   - User-facing UI copy: **Spanish** (traveler's journal voice).
4. **Git Commits:** Automated AI agents must **never** commit or push changes without explicit user approval (as outlined in [`AGENTS.md`](AGENTS.md)).

---

## 📜 License

This project is licensed under the [MIT License](LICENSE) — see the LICENSE file for details.


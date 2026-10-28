# UI/UX Overhaul: "Field Diary Map" (DRAFT v0.1)

**Status:** v0.2, decisions D1 to D8 recorded. No implementation until the owner gives the final OK.
**Owner decisions:** see section 9. Each item gets a recorded answer here before build starts.

---

## 1. Goal

Re-style and re-lay-out SecondMindMap so it feels like an old travel diary with a hand-inked map in it:
a paper notebook where each saved place is an entry, pinned to a chart of the world.

Functionality stays the same: auth (Supabase + demo mode), CRUD, Google Maps URL parser, JSON import/export,
mobile bottom sheet (peek / half / full), desktop sidebar, Markdown notes.

---

## 2. Current state (findings from the code)

| Area | What exists today | Where |
| :--- | :--- | :--- |
| Stack | Next.js 16 (App Router), React 19, Tailwind CSS v4, MapLibre GL 6, react-map-gl 8, lucide-react, react-markdown + remark-gfm | `app/package.json`, `specs/DEPENDENCIES.md` |
| Palette | Dark slate (`#0f172a`, `#1e293b`), indigo accent (`#6366f1`), status colours | `app/src/app/globals.css` (`:root` tokens) |
| Surfaces | Glassmorphism (`.glass`, `.glass-strong` with `backdrop-filter`), drop shadows, glowing buttons | `globals.css` |
| Type | Inter via `next/font/google`, Fira Code for code blocks | `layout.tsx`, `globals.css` |
| Map | CARTO **Dark Matter** basemap; pins are rounded-rect "drops" coloured by price level | `components/MapView.tsx` |
| Desktop | Fixed 380px right sidebar, top bar offset by 380px | `app/src/app/page.tsx`, `globals.css` (`.sidebar`, `.topbar`) |
| Mobile | Full-screen map, bottom sheet with handle and peek bar | `page.tsx`, `globals.css` (`.bottom-sheet`) |
| Detail | Badges, Markdown notes, edit / delete | `components/PlaceDetail.tsx` |
| Forms | Place form with Maps URL import | `components/PlaceForm.tsx` |
| Modals | JSON export / import | `components/JsonModal.tsx` |
| Auth | Login / signup card with a coloured icon tile and glow | `components/AuthForm.tsx` |
| Meta | `themeColor: '#0f172a'`, manifest theme colours | `layout.tsx`, `app/public/manifest.json` |
| UI copy | Spanish | all components |

Notes:
- Many components use inline `style={{ color: 'var(--text-primary)' }}`. Changing the tokens in `globals.css`
  cascades to most of the UI, but inline colours need a manual pass.
- `globals.css` opens with `@tailwind base/components/utilities` (Tailwind v3 syntax) while Tailwind v4 is installed.
  This must be checked during implementation. It is not a visual change, but it affects how utilities resolve.
- Price colours (`free` green, `$` indigo, `$$` amber, `$$$` red, `$$$$` pink) carry meaning on pins and badges.
  They are kept, re-expressed in the new palette.

---

## 3. Taste skill constraints

Source: `specs/features/.agents/skills/design-taste-frontend/` (tasteskill v2).

This is a **web app screen**, not a marketing page, so `references/app-screens.md` applies. Its house rules:
- Colour goes on data, not on chrome.
- Surfaces are flat. Separation comes from a 1px line or a tone step.
- Navigation recedes.
- Data states are honest (zero prints as zero, missing as a dash, empty sections keep their frame).
- The product has a face: its name, its scope, and the one question the screen answers.

**Conflicts with the requested direction.** The skill bans several things a diary/map look naturally uses:

| Requested look | Skill rule | Needs owner decision |
| :--- | :--- | :--- |
| Ruled lines, route dashes, notebook lines | Thin rules and dashed guides banned | D3 |
| Coordinates, dates, small caps labels | Micro-meta and tiny tracked caps banned | D3 |
| Serif / handwriting type, possibly mono for "typed" entries | Monospace banned | D3 |
| Paper texture, ink stamps, seal motifs | Not banned, but ornament is judged by the inspector | D5 |
| Map grid, compass, index-style numbering | Index numbering and crosshairs banned | D3 |

Decision: the diary/map look is adopted as an explicit house style for this project (owner choice). The overrides
below are accepted (D3, D5) and are the reason any inspector FAIL on these items is expected, not a defect.

| Accepted override | Why |
| :--- | :--- |
| Ruled lines and dashed route guides | Notebook and map feel (D3) |
| Coordinates, dates, small caps labels | Field-notebook metadata (D3) |
| Serif and handwriting faces, monospace where it reads as "typed" | Typed and hand-written entries (D2, D3) |
| Index numbering and grid references | Map and index feel (D3) |
| Visible paper edges, fold lines, aged corners | Paper feel (D5) |


---

## 4. Concept (taste skill step 4)

> On this app, **every saved place becomes a dated entry in a traveller's notebook, pinned onto a hand-inked chart**.

- **Competitor test:** "a map with notes" also describes Google Maps with saved lists. The notebook is what
  separates this app from it, so the notebook must be visible on every screen.
- **Live thing:** a **visited** place is shown as a **passport-style ink stamp** on its pin and on its entry.
  Ticking "Visitado" stamps the page. This is the device that rewards using the app.

---

## 5. Visual direction (proposal, to be confirmed)

### 5.1 Palette: "paper & ink"

| Role | Proposed value | Use |
| :--- | :--- | :--- |
| Paper (ground) | `#f3e9d2` | App background, pages |
| Parchment (field) | `#e8d9b5` | Sidebar, sheets, cards (one tone step) |
| Ink (text) | `#2b2118` | Headings, body text |
| Faded ink (secondary) | `#6b5a44` | Captions, metadata |
| Oxblood (accent) | `#8f3a2b` | Primary actions, active states, stamps |
| Sea ink (route / water / focus) | `#2f5d6b` | Links, focus ring, future route lines |
| Moss ink (`free`) | `#4d6b3a` | `free` price marker |
| Ochre (`$$`) | `#b07a2a` | `$$` price marker |
| Plum (`$$$$`) | `#6e3b5c` | `$$$$` price marker |

Contrast target: body text at least 4.5:1 against paper. Values are a starting point and must be checked.

### 5.2 Typography

- **Headings and place names:** a display serif with an old-print feel.
- **Body and Markdown:** a readable book serif.
- **Hand accent (sparingly):** a handwriting face for stamps, dates and margin notes only.
- Loaded with `next/font/google`, as the project already does for Inter.
- Faces decided (D2, Cartographic): `IM Fell English` (display), `Libre Baskerville` (book), `Caveat` (hand accent). Inter is removed from the UI.

### 5.3 Surfaces

- Opaque paper and parchment. No glass, no `backdrop-filter`, no drop shadows, no glowing buttons.
- Visible paper edges, fold lines and aged corners (D5), built in CSS. This is a skill override, recorded in section 3.
- Inputs styled as underlined fields, as in a handwritten form.

### 5.4 Map

- **Current:** CARTO Dark Matter. `DEPENDENCIES.md` rule 4 pins this style, so changing it means updating that rule.
- **Decided (D1): custom MapLibre style** with paper and ink colours. Its JSON style is hosted in the project (for example `app/public/`), not on CARTO. `DEPENDENCIES.md` rule 4 must be updated to match.
- Pins: ink-shaped markers (drop or seal) coloured by price level in the new palette.
  Visited pins carry the stamp mark.
- The active pin gets a ring of ink. The HTML marker and its touch target stay as they are now.

### 5.5 Iconography and motion

- Keep `lucide-react`. Icons are drawn as ink strokes, with no coloured tiles behind them (remove the AuthForm icon tile).
- Motion stays minimal: a gentle "page turn" (opacity and small translate) when a panel opens, replacing the current
  slide-up. Respect `prefers-reduced-motion`.



---

## 6. Layout and UX

### 6.1 Mobile (primary)

- Full-screen map. The bottom sheet becomes a **page sheet**: paper, with a ribbon-bookmark handle.
- Keep the peek / half / full states.
- The top bar becomes a **notebook cover strip**: app name, search labelled "Buscar en el diario", and the add action.
- Touch targets at least 44px.

### 6.2 Desktop

- The sidebar becomes a **notebook spread**: an index of entries on the left, the open entry on the right.
  Width is 420px (D6).
- The top bar keeps search and the import/export entry point.

### 6.3 Screens and states

| Screen | Change |
| :--- | :--- |
| Empty state (no places) | Blank page with one line of prompt copy, no illustration |
| List / index | Entries as index rows: name, visited stamp, price mark, no cards |
| Detail (entry) | Title in the display serif, badges as ink labels, Markdown in the book serif |
| Form ("Nueva entrada") | Same fields and logic, styled as a handwritten form |
| JSON modal | Titled "Copia del diario" (export / import), same behaviour |
| Auth | Diary cover page: name, tagline, sign-in form, demo mode link |
| Error / warning states | Ink-red text on paper, no coloured boxes |

Copy stays in Spanish. Only visual copy changes (headings), and only where it helps the concept.

---

## 7. Scope

**In scope**
- Design tokens and fonts (`app/src/app/globals.css`, `app/src/app/layout.tsx`).
- All components listed in section 2.
- Basemap and marker styles (`MapView.tsx`), and the basemap choice in D1.
- Meta: `themeColor` in `layout.tsx`, theme colours in `app/public/manifest.json`.
- Update `specs/DEPENDENCIES.md` if the basemap or fonts change.
- Accessibility: visible focus ring in sea ink, contrast, reduced motion.

**Out of scope**
- New features (collections, filters, media, geocoding, offline).
- Changes to the data model, server actions, Supabase, or auth logic.
- PWA features beyond theme colour.

---

## 8. Implementation phases (after approval)

| Phase | Work | Files |
| :--- | :--- | :--- |
| P0 | Tokens, fonts, global surfaces, Tailwind directive check | `globals.css`, `layout.tsx` |
| P1 | Basemap and marker styles, visited stamp | `MapView.tsx`, `globals.css` |
| P2 | Desktop spread: sidebar, top bar, index rows | `page.tsx`, `globals.css` |
| P3 | Mobile page sheet and handle | `page.tsx`, `globals.css` |
| P4 | Detail, form, JSON modal, auth cover | `PlaceDetail.tsx`, `PlaceForm.tsx`, `JsonModal.tsx`, `AuthForm.tsx` |
| P5 | Verification (below) and doc updates | `DEPENDENCIES.md`, `manifest.json` |

**Verification**
- `npm run build` and `npm run lint` inside `app/` (no new errors).
- Manual check of every screen at 390px (phone) and 1440px (desktop), in the browser.
- Click-through: login, demo mode, create, edit, toggle visited, delete, Maps URL import, JSON export and import.
- Taste inspector at 390 / 768 / 1440 (`scripts/inspect.mjs`) if Chrome is available. Each FAIL is either fixed
  or listed in section 3 as an accepted override.

---

## 9. Open decisions (owner)

| ID | Question | Options | Recommendation | Owner answer |
| :--- | :--- | :--- | :--- | :--- |
| D1 | Basemap | (a) CARTO Positron / Voyager + sepia CSS filter; (b) custom MapLibre style with paper colours; (c) keep dark | (a) for speed, (b) for the full look | **B (decided):** custom MapLibre style with paper/ink colours |
| D2 | Fonts | Display serif, book serif, hand accent (exact faces) | 2 to 3 faces from Google Fonts | **Decided, Cartographic:** display `IM Fell English`, book `Libre Baskerville`, hand accent `Caveat` (loaded with `next/font/google`) |
| D3 | Skill overrides | Allow ruled lines, coordinates, small caps, mono as house motifs? | Allow, recorded in section 3 | **Decided: allow all** (ruled lines, coordinates, small caps, mono, index numbering as house motifs). Recorded as overrides in section 3 |
| D4 | Price colours | Re-map to ink colours (section 5.1) or keep current hues | Re-map, keep the meaning | **Decided:** re-map to ink colours from section 5.1 (moss, ochre, oxblood, plum); meaning unchanged |
| D5 | Paper texture | None / subtle grain / visible paper edges | Visible paper edges, fold lines and aged corners | **Decided:** visible paper edges, fold lines and aged corners (owner choice, not the recommendation). Note: this is an ornament, so it is recorded as a skill override in section 3 |
| D6 | Desktop width | Keep 380px / wider spread (e.g. 480px) | **Decided: 420px** |
| D7 | Visited marker | Ink stamp on pin and entry / plain colour change | Ink stamp | **Decided:** ink stamp on the pin and the entry |
| D8 | Motion | Page-turn on open / none | Page-turn, reduced-motion safe | **Decided:** page-turn when a panel opens, reduced-motion safe |

---

## 10. Change log

- **v0.1:** Draft written from code review and the taste skill's app-screen rules.
- **v0.2:** Owner answered D1 to D8 (section 9). Decisions applied to sections 3, 5, and 6. Still awaiting the owner's final OK before implementation.

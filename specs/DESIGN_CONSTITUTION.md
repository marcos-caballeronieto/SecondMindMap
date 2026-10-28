# Design Constitution: "Field Diary Map" (SecondMindMap)

**Version:** 1.0 (based on UI/UX Overhaul v0.2)  
**Status:** Ratified — all owner decisions D1–D8 recorded. This document is the single source of truth for any future UI change.  
**Scope:** Applies to every pixel, token, component, and motion in the SecondMindMap web app.

---

## 1. Founding Concept (Immutable)

> **Every saved place becomes a dated entry in a traveller's notebook, pinned onto a hand-inked chart.**

- The **notebook metaphor** is visible on *every* screen — not a theme toggle, the product identity.
- A **visited place = passport-style ink stamp** on its pin and in its entry. Ticking "Visitado" stamps the page. This is the core reward loop.

---

## 2. Design Tokens (Single Source of Truth)

All tokens live in `app/src/app/globals.css` under `:root`. Changing UI *always* starts here.

### 2.1 Colour Palette — "Paper & Ink"

| Token | Hex | Role | Usage Rules |
| :--- | :--- | :--- | :--- |
| `--color-paper` | `#f3e9d2` | App background, pages | Ground surface everywhere |
| `--color-parchment` | `#e8d9b5` | Sidebar, sheets, cards | One tone step above paper |
| `--color-ink` | `#2b2118` | Headings, body text | Primary text, ≥ 4.5:1 on paper |
| `--color-ink-faded` | `#6b5a44` | Captions, metadata | Secondary text, ≥ 3:1 on paper |
| `--color-oxblood` | `#8f3a2b` | Primary actions, active states, stamps | Buttons, links, focus ring, visited stamp |
| `--color-sea-ink` | `#2f5d6b` | Links, focus ring, future route lines | Interactive accents |
| `--color-moss` | `#4d6b3a` | Price level `free` | Pins, badges |
| `--color-ochre` | `#b07a2a` | Price level `$$` | Pins, badges |
| `--color-plum` | `#6e3b5c` | Price level `$$$$` | Pins, badges |
| `--color-indigo` | `#6366f1` | Price level `$` (legacy) | Kept for `$` only; do not introduce elsewhere |

**Contrast rule:** Every text token must pass WCAG AA (4.5:1 body, 3:1 large) against its background token. Verify with `npm run lint` + manual check.

### 2.2 Typography — Three Faces Only

Loaded via `next/font/google` in `app/src/app/layout.tsx`. **Inter is removed.**

| Role | Font | CSS Variable | Weight/Style | Use |
| :--- | :--- | :--- | :--- | :--- |
| Display / Place names | `IM Fell English` | `--font-display` | 400, italic | Page titles, place names, headings |
| Book / Body / Markdown | `Libre Baskerville` | `--font-book` | 400, 400i, 700 | All body copy, Markdown rendering, UI labels |
| Hand accent | `Caveat` | `--font-hand` | 400, 700 | Stamps, dates, margin notes, "typed" snippets only |

**Typographic rules**
- No other font families anywhere.
- Monospace (`Fira Code`) remains **only** inside code blocks rendered by `react-markdown`.
- Small-caps (`font-variant: small-caps`) allowed for metadata labels (override D3).
- Line-height: 1.6 for book, 1.3 for display, 1.4 for hand.

### 2.3 Spacing & Sizing Scale

| Token | Value | Purpose |
| :--- | :--- | :--- |
| `--space-unit` | `4px` | Base unit; all spacing multiples of this |
| `--radius-sm` | `4px` | Inputs, badges |
| `--radius-md` | `8px` | Cards, sheets |
| `--radius-lg` | `16px` | Modal, full-screen sheets |
| `--sheet-handle-h` | `44px` | Touch target minimum (mobile) |
| `--sidebar-w` | `420px` | Desktop notebook spread (D6) |
| `--topbar-h` | `56px` | Notebook cover strip height |

### 2.4 Motion Tokens

| Token | Value | Rule |
| :--- | :--- | :--- |
| `--motion-duration` | `220ms` | Page-turn panel open/close |
| `--motion-easing` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Gentle ease |
| `--motion-reduced` | `0ms` | `prefers-reduced-motion: reduce` disables all transforms/opacity animations |

---

## 3. Visual Grammar (Hard Constraints)

### 3.1 Surfaces
- **Opaque only.** No glassmorphism, no `backdrop-filter`, no drop shadows, no glowing buttons.
- **Paper edges, fold lines, aged corners** are drawn in CSS (D5 override). These are *ornament*, not chrome.
- Separation between surfaces: **1px rule line** in `--color-ink-faded` at 20 % opacity, or a tone step (paper → parchment).

### 3.2 Colour on Data, Not Chrome
- Colour appears **only** on meaningful data: price badges, visited stamps, route lines, focus rings.
- Navigation chrome (top bar, sidebar frame, sheet handle) stays paper/parchment/ink.

### 3.3 Navigation Recedes
---

## 4. Component-Level Rules

### 4.1 Map (`MapView.tsx`)
- **Basemap:** Custom MapLibre style (paper/ink colours), hosted locally in `app/public/` (D1). `DEPENDENCIES.md` rule 4 updated accordingly.
- **Pins:** Ink-shaped markers (drop or seal) coloured by price level using palette tokens.
- **Visited stamp:** Overlay on pin + entry (D7).
- **Active pin ring:** 2 px `--color-sea-ink`.
- HTML markers retain current touch target size (≥ 44 px).

### 4.2 Desktop Spread (`page.tsx` + CSS)
- Fixed **420 px** right sidebar (D6).
- Left = map, right = notebook spread: **index of entries** (left page) + **open entry** (right page).
- Top bar height `--topbar-h`, spans full width.

### 4.3 Mobile Page Sheet (`page.tsx` + CSS)
- Full-screen map.
- Bottom sheet = **page sheet**: paper surface, ribbon-bookmark handle.
- States: **peek** (handle only), **half**, **full**.
- Top bar = notebook cover strip (app name, search, add).

### 4.4 Entry Detail (`PlaceDetail.tsx`)
- Title in display serif (`--font-display`).
- Badges as **ink labels** (rounded rect, `--color-ink-faded` bg, `--color-ink` text).
- Markdown rendered in book serif (`--font-book`).
- Visited stamp rendered with hand font (`--font-hand`, `--color-oxblood`).

### 4.5 Forms (`PlaceForm.tsx`, `AuthForm.tsx`)
- **Underlined fields** only (no boxed inputs), like a handwritten form.
- Labels in small-caps book serif.
- Primary action: `--color-oxblood` fill, ink text.
- Auth = diary cover page: name, tagline, sign-in form, demo link. No icon tile.

### 4.6 Modals (`JsonModal.tsx`)
- Title: "Copia del diario".
- Paper surface, parchment header, ink text.
- Same behaviour, new skin.

### 4.7 Empty / Error States
- Blank page with **one line of prompt copy** in faded ink.
- Error text: `--color-oxblood` on paper, no coloured boxes.
- No coloured icon tiles (AuthForm tile removed).
- Icons are single-colour ink strokes from `lucide-react`.

### 3.4 Honest Data States
- Zero = "0", missing = "—", empty sections keep their frame with a prompt line.
- No skeleton loaders; show the frame, fill when ready.

### 3.5 The Product Has a Face
- Top bar shows: **App name** (display serif), **search** labelled "Buscar en el diario", **add action** (ink plus icon).
- No generic "Dashboard" or "Home" labels.
---

## 5. Layout & Breakpoints

| Breakpoint | Layout |
| :--- | :--- |
| `< 768px` | Mobile: full-screen map + page sheet |
| `≥ 768px` | Desktop: map + 420 px sidebar spread |
| `≥ 1200px` | Same, map gets more breathing room |

**Touch targets:** Minimum 44 × 44 px everywhere (handles, buttons, pins, form controls).

---

## 6. Accessibility (Non-Negotiable)

- **Focus ring:** 2 px solid `--color-sea-ink`, offset 2 px.
- **Contrast:** All text tokens verified against backgrounds (see 2.1).
- **Reduced motion:** `prefers-reduced-motion: reduce` → `--motion-reduced` (0 ms).
- **Semantic HTML:** `main`, `nav`, `article`, `section`, `button`, `dialog` used correctly.
- **ARIA:** Sheet `role="dialog"`, `aria-modal="true"`, labelled by heading.

---

## 7. Accepted Skill Overrides (Recorded from D3, D5)

The taste skill (`design-taste-frontend`) bans several things the diary/map look requires. These overrides are **permanent house style** and any inspector FAIL on them is **expected, not a defect**.

| Override | Skill Rule | Reason |
| :--- | :--- | :--- |
| Ruled lines, dashed route guides | Thin rules / dashed guides banned | Notebook & map feel |
| Coordinates, dates, small-caps labels | Micro-meta & tiny tracked caps banned | Field-notebook metadata |
| Serif / handwriting faces, monospace as "typed" | Monospace banned | Typed & hand-written entries |
| Visible paper edges, fold lines, aged corners | Ornament judged by inspector | Paper feel (owner choice D5) |
| Index numbering, grid references | Index numbering & crosshairs banned | Map & index feel |

---

## 8. Owner Decisions (Final, Immutable Unless Re-Ratified)

| ID | Decision | Value |
| :--- | :--- | :--- |
| **D1** | Basemap | Custom MapLibre style (paper/ink), hosted locally |
| **D2** | Fonts | Display: `IM Fell English`; Book: `Libre Baskerville`; Hand: `Caveat` |
| **D3** | Skill overrides | All allowed (see §7) |
| **D4** | Price colours | Re-mapped to ink palette: free→moss, $→indigo, $$→ochre, $$$→oxblood, $$$$→plum |
| **D5** | Paper texture | Visible edges, fold lines, aged corners |
| **D6** | Desktop sidebar width | 420 px |
| **D7** | Visited marker | Ink stamp on pin and entry |
| **D8** | Motion | Page-turn (220 ms) on panel open, reduced-motion safe |

---

## 9. Change Control Process

Any UI change **must** follow:

1. **Token first** — Edit `globals.css` tokens. No inline styles, no arbitrary hex values in components.
2. **Component pass** — Update affected components to use the new tokens (remove any remaining inline `style={{ color: '...' }}`).
3. **Verify** — Run `npm run build && npm run lint` in `app/`. Zero new errors.
4. **Manual QA** — Click-through at 390 px and 1440 px:
   - Login → demo mode → create → edit → toggle visited → delete → Maps URL import → JSON export/import.
5. **Taste inspection** (if Chrome available) — `node scripts/inspect.mjs` at 390 / 768 / 1440.  
   FAILs on overridden rules (§7) are documented, not fixed.
6. **Doc sync** — Update `DEPENDENCIES.md` if basemap or fonts change. Update `manifest.json` `theme_color` if palette ground changes.

---

## 10. Out of Bounds (Explicitly Not in This Constitution)

- New features (collections, filters, media, geocoding, offline).
- Data model, server actions, Supabase, auth logic changes.
- PWA features beyond `theme_color` in manifest.

---

## 11. Quick Reference for Contributors

| File | What to Touch | What to Never Touch |
| :--- | :--- | :--- |
| `globals.css` | Tokens, global surfaces, paper CSS, font `@import` | Tailwind v3 directives (`@tailwind base...`) — v4 uses `@import "tailwindcss"` |
| `layout.tsx` | Font loading (`next/font/google`), `themeColor`, metadata | Server component logic |
| `MapView.tsx` | Marker SVG/HTML, basemap style URL, visited stamp overlay | MapLibre init logic, touch handlers |
| `page.tsx` | Layout CSS classes, sheet states, sidebar width | Auth logic, data fetching |
| `PlaceDetail.tsx`, `PlaceForm.tsx`, `JsonModal.tsx`, `AuthForm.tsx` | Visual markup, class names, token usage | Form validation, Supabase mutations |

---

## 12. Appendix: Source Documents

- Primary: `specs/features/UI_UX_overhaul.md` (v0.2, decisions D1–D8)
- Dependencies: `specs/DEPENDENCIES.md` (stack, basemap rule 4)
- PRD/MVP: `specs/geomind_prd_y_especificaciones_mvp.md` (functional scope)

---

*End of Design Constitution. Any deviation requires a new owner decision (Dx) and an entry in the change log.*
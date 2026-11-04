# Technical Specification Document: GeoMind (PRD & MVP)

---

# PART 1: Product Requirement Document (Full PRD)

## 1. Product Overview

**GeoMind** is a "geographic second brain" dedicated to saving, organizing, and browsing rich information about places worldwide. Unlike conventional navigation tools (Google Maps, Apple Maps), GeoMind prioritizes personalized content (historical notes, curiosities, step-by-step guides, photos, and custom attributes) while maintaining an interactive map-based visual interface.

Since capturing and querying places frequently happens "on the ground" while traveling, the application follows a **Mobile-First** approach, optimized for Android smartphone displays and built as a Progressive Web App (PWA).

---

## 2. Tech Stack

| Layer | Technology | Function |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14+ (App Router) + TypeScript | Core application structure, Server Actions, and SSR/SSG. |
| **Styling / Components** | Tailwind CSS + Shadcn UI + Lucide Icons | Responsive design (Desktop/Mobile), accessible components, and clean iconography. |
| **Mobile Experience** | PWA (next-pwa / Web Manifest) | Allows installing the app on the Android home screen and running in standalone full-screen mode. |
| **Mapping Library** | MapLibre GL JS + React Map GL | High-performance vector map rendering optimized for touch gestures. |
| **Map Tile Provider** | Carto DB / MapTiler / OpenStreetMap | Clean base map styles free from commercial API fees. |
| **Database & Auth** | Supabase (PostgreSQL + Storage) | Relational persistence, authentication, image storage, and geospatial queries. |
| **Deployment** | Vercel | Hosting, GitHub-integrated CI/CD, and Serverless Functions. |

---

## 3. Architecture & Data Model (PostgreSQL on Supabase)

### Table: `places` (Places)
Stores the core entity for a point on the map.

```sql
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  google_maps_url TEXT,
  is_visited BOOLEAN DEFAULT false,
  is_must_see BOOLEAN DEFAULT false, -- Landmark / Must-See vs Hidden Gem
  price_level VARCHAR(10) CHECK (price_level IN ('free', '$', '$$', '$$$', '$$$$')),
  historical_era VARCHAR(100), -- e.g., "Ancient Rome", "19th Century"
  metadata JSONB DEFAULT '{}'::jsonb, -- Stores flexible optional fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table: `collections` (Collections / Lists)
```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT '#3B82F6',
  icon VARCHAR(50) DEFAULT 'map-pin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table: `place_collections` (Many-to-Many Relationship)
```sql
CREATE TABLE place_collections (
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (place_id, collection_id)
);
```

### Table: `place_media` (Attachments & Links)
```sql
CREATE TABLE place_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('image', 'link')),
  url TEXT NOT NULL,
  title VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 4. Detailed Feature Specifications

### Module A: Pin Management & Importing
1. **Manual Creation:** Direct coordinate selection via touch or mouse click on the map.
2. **Geographical Search (Geocoding):** Integration with search APIs to locate pins by address or name.
3. **Google Maps URL Importer:**
   * The user pastes or shares a Google Maps URL from Android (`https://maps.app.goo.gl/...`).
   * A Server Action processes the URL, follows the HTTP redirect, and extracts coordinates and place name.
4. **Customizable Visual Symbology:** Pins color-coded or iconography-coded for touch usability.

### Module B: Place Detail Editor (Rich Content)
1. **Markdown Editor / Viewer:** Optimized for reading and typing with mobile touch keyboards.
2. **Dynamic / JSONB Schema (Optional Fields):** Collapses empty fields to maximize usable screen real estate.
3. **Multimedia Module:** Support for displaying attached images and external links formatted as vertical cards.

### Module C: Organization, Filters & Adaptive UX (Android / Desktop)
1. **Responsive Hybrid Layout:**
   * **Mobile (Android):** Full-screen map with a draggable bottom panel (*Bottom Sheet / Drawer*) to browse places or inspect details.
   * **Desktop:** Fixed sidebar to the right or left of the map.
2. **Touch Gestures:** Fluid support for pinch-to-zoom, rotation, and dragging the bottom sheet.
3. **PWA (Progressive Web App):** Web manifest configured for native-like Android installability, hiding browser chrome (`display: standalone`).

### Module D: Interoperability & AI Integration
1. **GeoJSON / JSON Export:** Download datasets directly into device local storage.
2. **JSON Import Modal:** Modal interface to paste structured JSON generated by AI agents.

---
---

# PART 2: MVP Specification Document (Minimum Viable Product)

## 1. MVP Scope: Included vs Deferred

### Included in the MVP
* [x] Interactive base map supporting Android touch gestures.
* [x] Adaptive layouts: Draggable *Bottom Sheet* on mobile and fixed *Sidebar* on desktop.
* [x] Form to create pins by tapping the map or searching by name.
* [x] Basic Google Maps URL parser (copy/paste link).
* [x] Place detail card supporting optional fields and Markdown editor/viewer.
* [x] Manual JSON Import / Export modal.
* [x] Simple authentication (Supabase Auth).
* [x] Core PWA setup (Manifest + home screen icon for Android).

### Deferred to Future Iterations (V2)
* [ ] Native Android *"Share via..."* menu integration (Web Share Target API).
* [ ] Direct image uploads from phone camera/gallery.
* [ ] Offline mode with persistent local storage (IndexedDB).
* [ ] Advanced routes and topographic elevation layers.

---

## 2. Simplified Data Model (MVP)

```sql
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  is_visited BOOLEAN DEFAULT false,
  price_level VARCHAR(10) DEFAULT 'free',
  notes_markdown TEXT DEFAULT '',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 3. UI Layout Wireframes

### Mobile / Android View (Mobile-First)

```text
+------------------------------------+
| [=] GeoMind          [Search]  [+] |  <- Compact top bar
+------------------------------------+
|                                    |
|                                    |
|          INTERACTIVE MAP           |
|             (MapLibre)             |
|                                    |
|               (Pin)                |
|                 *                  |
|                                    |
+------------------------------------+
| ================================== |  <- Draggable handle (Bottom Sheet)
|  Pantheon of Agrippa               |
|  [x] Visited   |   Price: Free     |
|  --------------------------------  |
|  ## Notes & History                |
|  The building features its oculus..|
|  [Edit]                   [Close]  |
+------------------------------------+
```

### Desktop View

```text
+-------------------------------------------------------------------------+
| [Logo: GeoMind]            [Search place...]         [Import JSON]  (U) |
+------------------------------+------------------------------------------+
|                              |  PLACE DETAILS                           |
|                              |  ------------------                      |
|                              |  # Pantheon of Agrippa                   |
|       INTERACTIVE MAP        |  [x] Visited  |  Price: Free             |
|          (MapLibre)          |                                          |
|                              |  ## Notes & History                      |
|         (Active Pin)         |  The building features its vast oculus...|
|               *              |                                          |
|                              |  [Edit Place]  [Delete]                  |
+------------------------------+------------------------------------------+
```

---

## 4. Step-by-Step Vibecoding Development Plan

1. **Step 1: Mobile-Ready Setup & Infrastructure**
   * Scaffold Next.js project (`npx create-next-app@latest`).
   * Install `tailwindcss`, `shadcn-ui`, `maplibre-gl`, and `@supabase/supabase-js`.
   * Add `manifest.json` and viewport meta tags (`viewport-fit=cover`) for Android PWA support.

2. **Step 2: Map Component & Responsive Panels**
   * Build the base map with touch gesture support.
   * Implement a draggable bottom drawer (*Bottom Sheet* via Shadcn UI) on mobile and a sidebar on large screens.

3. **Step 3: Data Capture & Google Maps Parser**
   * Implement Server Action to parse links copied from Google Maps Android.
   * Connect pin creation/edit form to Supabase.

4. **Step 4: Markdown Rendering & AI Integration**
   * Render legible Markdown notes on small displays.
   * Responsive modal to import/export JSON structures for AI agents.

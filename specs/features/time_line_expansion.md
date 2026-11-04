# Feature Specification: Timeline Engine

**Status:** Planned / Pending Implementation

## 1. Feature Overview

The **Historical and Cultural Timeline** transforms GeoMind from a static map into a **chronological and geographic second brain**. It allows recording the temporal evolution of each building or place (construction, renovations, destruction, significant events) and browsing these milestones both at an individual place level and across a unified chronological timeline.

In addition, it allows overlaying macro-context layers (historical epochs, architectural styles, reigns and empires) with dynamic filters to isolate or combine categories depending on the focus of study or travel.

---

## 2. Data Model (PostgreSQL / Supabase)

### Table: `place_events` (Place Milestones & Timeline Events)
Relates multiple dates or time periods to a specific place.

```sql
CREATE TABLE place_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,            -- e.g., "Start of construction", "Major Baroque renovation"
  description TEXT,                       -- Details about the milestone
  year_start INTEGER NOT NULL,            -- Supports negative years for BCE / BC (e.g., -44)
  year_end INTEGER,                      -- Optional if it spans a period (e.g., 1220 to 1250)
  event_category VARCHAR(50) NOT NULL CHECK (
    event_category IN (
      'construction',    -- Original construction / Foundation
      'renovation',      -- Renovations / Expansions
      'destruction',     -- Fires / Sacks / Demolitions
      'historical_event' -- Coronations, battles, treaties
    )
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table: `global_historical_contexts` (Macro Context Layers)
Global events and periods that do not belong to a single coordinate but provide chronological context.

```sql
CREATE TABLE global_historical_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL, -- e.g., "Roman Empire", "Late Gothic", "Reign of Philip II"
  category VARCHAR(50) NOT NULL CHECK (
    category IN ('epoch', 'architectural_style', 'monarch_empire', 'cultural_movement')
  ),
  year_start INTEGER NOT NULL,
  year_end INTEGER,
  color VARCHAR(20) DEFAULT '#8B5CF6',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 3. Component & UI Specification

### A. Place Timeline (Place Detail Sheet / Card)
* **Location:** Integrated within each place's details panel (*Sidebar* on desktop / *Bottom Sheet* on Android).
* **Behavior:**
  * If the place has 1 or more records in `place_events`, a vertical chronological axis is displayed.
  * Each axis node displays: **Year/Period + Category Tag + Title + Optional Description**.
  * Allows quickly adding new milestones from the place form.

```text
[ NOTRE-DAME CATHEDRAL ]
--------------------------------------------------
PLACE TIMELINE:

 1163 ── [Construction] Laying of the first stone by Pope Alexander III
   │
 1250 ── [Construction] Completion of the western facade towers
   │
 1844 ── [Renovation] Restoration by Viollet-le-Duc
   │
 2019 ── [Destruction] Major fire destroying the roof and spire
```

---

### B. Global Timeline
* **Location:** Dedicated tab or view mode (`/timeline` or *Map / Timeline* toggle).
* **Behavior:**
  * Renders all events from all registered places in the database along a single continuous timeline scale.
  * Clicking any event in the global timeline centers the map view on that location or navigates to the corresponding place card.

```text
================================================================================
 GLOBAL TIMELINE VIEW
================================================================================
 CATEGORY FILTERS:
 [x] Construction/Renovation   [x] Epochs   [ ] Architectural Styles   [x] Monarchs/Empires
--------------------------------------------------------------------------------

 -27 ─────── [Roman Empire] Beginning of the Roman Empire under Augustus
               │
 80 ──────── [Place: Roman Colosseum] Inauguration under the rule of Titus
               │
 1163 ────── [Place: Notre-Dame] Laying of the first stone
               │
 1506 ────── [Place: St. Peter's Basilica] Start of Renaissance reconstruction
               │
 1556-1598 ─ [Reign] Spanish Empire under Philip II
```

---

### C. Filter & Visibility Controls
Users can enable or disable layers via toggle checkboxes to keep the view clean:

| Category | Example Content | Color / Indicator |
| :--- | :--- | :--- |
| **Building Milestones** | Constructions, renovations, fires | Blue (`#3B82F6`) |
| **Epochs / Eras** | Middle Ages, Renaissance, Belle Époque | Green (`#10B981`) |
| **Architectural Styles** | Romanesque, Gothic, Baroque, Neoclassical | Orange (`#F97316`) |
| **Monarchs / Empires** | Tudor Dynasty, Byzantine Empire | Purple (`#8B5CF6`) |

---

## 4. JSON Structure for AI Agent Import/Export

Full support for an AI assistant to generate a place along with its historical data and full timeline in a single payload:

```json
{
  "places": [
    {
      "name": "Pantheon of Agrippa",
      "latitude": 41.8986,
      "longitude": 12.4769,
      "architectural_style": "Imperial Roman Architecture",
      "events": [
        {
          "title": "Original construction by Marcus Vipsanius Agrippa",
          "year_start": -27,
          "event_category": "construction",
          "description": "Later destroyed by a fire in 80 CE."
        },
        {
          "title": "Complete rebuilding by Emperor Hadrian",
          "year_start": 118,
          "year_end": 125,
          "event_category": "construction",
          "description": "Features the world's largest unreinforced concrete dome."
        },
        {
          "title": "Consecration as Christian Church (Santa Maria Rotonda)",
          "year_start": 609,
          "event_category": "historical_event",
          "description": "Donated by Emperor Phocas to Pope Boniface IV."
        }
      ]
    }
  ],
  "global_contexts": [
    {
      "title": "High Roman Empire",
      "category": "epoch",
      "year_start": -27,
      "year_end": 192,
      "color": "#8B5CF6"
    }
  ]
}
```

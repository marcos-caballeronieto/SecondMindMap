# Especificación de Funcionalidad: Motor de Línea del Tiempo (Timeline Engine)

## 1. Visión General de la Funcionalidad

La **Línea del Tiempo Histórica y Cultural** transforma GeoMind de un mapa estático a un **segundo cerebro cronológico y geográfico**. Permite registrar la evolución temporal de cada edificio o lugar (construcción, reformas, destrucción, eventos relevantes) y consultar estos hitos tanto a nivel individual como en un eje cronológico unificado.

Además, permite superponer capas de contexto macro (épocas históricas, estilos arquitectónicos, reinados e imperios) con filtros dinámicos para aislar o combinar categorías según el enfoque de estudio o viaje.

---

## 2. Modelo de Datos (PostgreSQL / Supabase)

### Tabla: `place_events` (Hitos Temporales por Lugar)
Relaciona múltiples fechas o periodos temporales con un lugar específico.

```sql
CREATE TABLE place_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,            -- Ej: "Inicio de construcción", "Gran reforma barroca"
  description TEXT,                       -- Detalles sobre el hito
  year_start INTEGER NOT NULL,            -- Permite años negativos para A.C. (ej. -44)
  year_end INTEGER,                      -- Opcional si es un periodo (ej. 1220 a 1250)
  event_category VARCHAR(50) NOT NULL CHECK (
    event_category IN (
      'construction',    -- Construcción original / Fundación
      'renovation',      -- Reformas / Ampliaciones
      'destruction',     -- Incendios / Saqueos / Demoliciones
      'historical_event' -- Coronaciones, batallas, tratados
    )
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabla: `global_historical_contexts` (Capas de Contexto Macro)
Eventos y periodos globales que no pertenecen a una única coordenada pero contextualizan el tiempo.

```sql
CREATE TABLE global_historical_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL, -- Ej: "Imperio Romano", "Gótico Tardío", "Reinado de Felipe II"
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

## 3. Especificación de Componentes e Interfaz

### A. Línea del Tiempo por Lugar (Ficha del Edificio)
* **Ubicación:** Integrada dentro del panel o ficha de detalles de cada lugar (*Sidebar* en desktop / *Bottom Sheet* en Android).
* **Comportamiento:**
  * Si el lugar tiene 1 o más registros en `place_events`, se despliega un eje cronológico vertical.
  * Cada nodo del eje muestra: **Año/Periodo + Etiqueta de Categoría + Título + Descripción opcional**.
  * Permite añadir nuevos hitos rápidamente desde el formulario del lugar.

```text
[ CATEDRAL DE NOTRE DAME ]
--------------------------------------------------
LÍNEA DEL TIEMPO DEL LUGAR:

 1163 ── [Construcción] Colocación de la primera piedra por el Papa Alejandro III
   │
 1250 ── [Construcción] Finalización de las torres de la fachada occidental
   │
 1844 ── [Reforma] Restauración por Viollet-le-Duc
   │
 2019 ── [Destrucción] Gran incendio del techo y la aguja
```

---

### B. Línea del Tiempo General (Global Timeline)
* **Ubicación:** Pestaña o modo de vista dedicado (`/timeline` o conmutador *Mapa / Cronograma*).
* **Comportamiento:**
  * Renderiza todos los eventos de todos los lugares registrados en la base de datos en una sola escala temporal continua.
  * Al hacer clic en cualquier evento de la línea del tiempo global, el sistema centra la pantalla en el mapa o navega a la ficha del lugar correspondiente.

```text
================================================================================
 VISTA GLOBAL DE LÍNEA DEL TIEMPO
================================================================================
 FILTROS DE CATEGORÍA:
 [x] Construcción/Reformas   [x] Épocas   [ ] Estilos Arquitectónicos   [x] Reyes/Imperios
--------------------------------------------------------------------------------

 -27 ─────── [Imperio Romano] Inicio del Imperio Romano con Augusto
               │
 80 ──────── [Lugar: Coliseo Romano] Inauguración bajo el mandato de Tito
               │
 1163 ────── [Lugar: Notre Dame] Colocación de la primera piedra
               │
 1506 ────── [Lugar: Basílica de San Pedro] Inicio de la reconstrucción renacentista
               │
 1556-1598 ─ [Reinado] Imperio Español bajo Felipe II
```

---

### C. Panel de Filtros y Visibilidad
El usuario puede activar o desactivar capas mediante selectores de casilla (toggles) para no saturar la vista:

| Categoría | Ejemplo de Contenido | Color / Indicador |
| :--- | :--- | :--- |
| **Hitos de Edificios** | Construcciones, reformas, incendios | Azul (`#3B82F6`) |
| **Épocas / Eras** | Edad Media, Renacimiento, Belle Époque | Verde (`#10B981`) |
| **Estilos Arquitectónicos**| Románico, Gótico, Barroco, Neoclásico | Naranja (`#F97316`) |
| **Reyes / Imperios** | Dinastía Tudor, Imperio Bizantino | Violeta (`#8B5CF6`) |

---

## 4. Estructura JSON para Importación/Exportación con Agentes de IA

Soporte completo para que una IA genere un lugar con sus datos históricos y su cronología completa de una sola vez:

```json
{
  "places": [
    {
      "name": "Panteón de Agripa",
      "latitude": 41.8986,
      "longitude": 12.4769,
      "architectural_style": "Arquitectura Romana Imperial",
      "events": [
        {
          "title": "Construcción original por Marco Vipsanio Agripa",
          "year_start": -27,
          "event_category": "construction",
          "description": "Destruido posteriormente por un incendio en el año 80 d.C."
        },
        {
          "title": "Reconstrucción total por el Emperador Adriano",
          "year_start": 118,
          "year_end": 125,
          "event_category": "construction",
          "description": "Diseño con la cúpula de hormigón no armado más grande del mundo."
        },
        {
          "title": "Consagración como Iglesia Cristiana (Santa María rotunda)",
          "year_start": 609,
          "event_category": "historical_event",
          "description": "Donado por el emperador Focas al Papa Bonifacio IV."
        }
      ]
    }
  ],
  "global_contexts": [
    {
      "title": "Alto Imperio Romano",
      "category": "epoch",
      "year_start": -27,
      "year_end": 192,
      "color": "#8B5CF6"
    }
  ]
}
```
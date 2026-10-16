# Roadmap del Proyecto: GeoMind (Segundo Cerebro Geográfico)

Este documento centraliza el estado de desarrollo de GeoMind, dividiendo las funcionalidades entre lo completado en el **MVP (Fase 1)** y las siguientes etapas de evolución (**Fase 2: Colecciones y Multimedia**, **Fase 3: Capacidades Nativas y Offline**, y **Fase 4: IA y Rutas Avanzadas**).

---

## 📊 Resumen General de Progreso

| Fase | Estado | Cobertura Estimada |
| :--- | :--- | :--- |
| **Fase 1: MVP Core (Mobile-First & Supabase)** | **Completado (Listo para producción/uso)** | 100% |
| **Fase 2: Organización, Colecciones y Multimedia** | **Pendiente / Planificado** | 0% |
| **Fase 3: Experiencia Móvil Nativa & Modo Offline** | **Pendiente / Planificado** | 0% |
| **Fase 4: Inteligencia Geoespacial, Rutas y Social** | **Futuro / Exploración** | 0% |

---

## 🟢 Fase 1: MVP Core (Completado)

*Objetivo: Tener un segundo cerebro geográfico funcional, accesible en móvil/escritorio con autenticación, persistencia y visualización ágil.*

- [x] **Configuración Base y Runtime**
  - [x] Inicialización de Next.js 16 (App Router) + TypeScript + Tailwind CSS v4.
  - [x] Documento de control de dependencias ([`DEPENDENCIES.md`](file:///c:/Marcos/programming/Smaller_projects/map_second_brain/specs/DEPENDENCIES.md)).
  - [x] Configuración de control de versiones `.gitignore` protegiendo credenciales y secretos.
- [x] **Motor Cartográfico (MapLibre GL)**
  - [x] Mapa base interactivo con soporte táctil (pinch-to-zoom, pan) usando CARTO Dark Matter sin coste de API comercial.
  - [x] Integración de `react-map-gl/maplibre` con importación dinámica (`ssr: false`).
  - [x] Creación manual de pines al tocar o hacer clic directamente en el mapa.
  - [x] Marcadores personalizados codificados por color según nivel de precio (`free`, `$`, `$$`, `$$$`, `$$$$`).
  - [x] Efecto visual de lugar visitado (opacidad/distintivo) y pin activo destacado con animación.
  - [x] Auto-centrado suave (*fly-to*) al seleccionar un lugar.
- [x] **Diseño Adaptativo (Mobile-First & Desktop)**
  - [x] **Modo Móvil (Android):** Mapa a pantalla completa con *Bottom Sheet* deslizable (manija táctil y estados: *peek*, *half*, *full*).
  - [x] **Modo Escritorio:** Sidebar lateral fijo de 380px con lista, ficha detallada y formularios.
  - [x] Barra superior compacta con buscador y accesos directos rápidos.
  - [x] Sistema de diseño dark con estética glassmorphism (`globals.css`).
- [x] **Gestión de Lugares (CRUD & Contenido Enriquecido)**
  - [x] Formulario completo de creación y edición de lugares.
  - [x] Visualizador y editor de notas con soporte **Markdown** (`react-markdown` + `remark-gfm`).
  - [x] Toggle rápido de estado "Visitado / Sin visitar".
  - [x] Búsqueda instantánea de lugares por nombre o contenido de notas.
  - [x] Eliminación de lugares con confirmación preventiva.
- [x] **Integraciones de Entrada y Salida**
  - [x] **Parser de URLs de Google Maps:** Server Action que resuelve enlaces estándar y cortos (`maps.app.goo.gl/...`), extrayendo coordenadas y nombre del lugar.
  - [x] **Exportador JSON / GeoJSON:** Descarga local de los datos para backup o ingesta por IA.
  - [x] **Importador JSON:** Modal para pegar datasets estructurados generados por LLMs/agentes con validación.
- [x] **Backend & Seguridad (Supabase)**
  - [x] Autenticación de usuarios por email/password (Login y Registro).
  - [x] Esquema SQL de la tabla `places` con metadatos JSONB ([`migration.sql`](file:///c:/Marcos/programming/Smaller_projects/map_second_brain/app/supabase/migration.sql)).
  - [x] Políticas estrictas de Row Level Security (RLS): cada usuario solo lee y modifica sus propios lugares.
- [x] **Soporte PWA Base**
  - [x] `manifest.json` configurado para instalación en Android en modo `standalone`.
  - [x] Iconos de aplicación (192px y 512px) generados y configurados.
  - [x] Configuración de viewport móvil `viewport-fit=cover` para aprovechar pantallas sin bordes.

---

## 🟡 Fase 2: Organización, Colecciones y Multimedia (Siguiente Iteración)

*Objetivo: Dotar a los lugares de mayor profundidad de contenido, categorización por listas temáticas y soporte para fotos.*

- [ ] **Sistema de Colecciones y Etiquetas**
  - [ ] Implementar tabla `collections` y tabla pivote `place_collections`.
  - [ ] Interfaz para crear listas temáticas (ej: *"Ruta de Cafés en Roma"*, *"Castillos de Escocia"*).
  - [ ] Selector de color e icono representativo por colección.
  - [ ] Filtrado en el mapa por una o varias colecciones simultáneas.
- [ ] **Campos Avanzados del PRD**
  - [ ] Campo `is_must_see` (Imperdible / Muy conocido vs Gema oculta).
  - [ ] Atributo `historical_era` (ej: *"Antigua Roma"*, *"Siglo XIX"*, *"Renacimiento"*).
  - [ ] Filtro cronológico / temporal en la interfaz.
- [ ] **Módulo Multimedia (`place_media`)**
  - [ ] Adjuntar enlaces web de interés (blogs, vídeos de YouTube, Wikipedia).
  - [ ] Soporte para enlazar imágenes por URL con previsualización tipo tarjeta.
  - [ ] Galería horizontal deslizable en la ficha del lugar.
- [ ] **Geocoding Directo (Búsqueda Geográfica de Direcciones)**
  - [ ] Integración con Nominatim (OpenStreetMap) o MapTiler Geocoding para autocompletar nombres de ciudades y calles sin depender de Google Maps.

---

## 🟠 Fase 3: Experiencia Móvil Nativa & Modo Offline

*Objetivo: Maximizar la usabilidad en viajes reales y sobre el terreno sin conexión.*

- [ ] **Integración Nativa Android (Web Share Target API)**
  - [ ] Registrar la PWA como destino del menú nativo *"Compartir en..."* de Android.
  - [ ] Al compartir un enlace de Google Maps desde el móvil, abrir directamente GeoMind rellenando el formulario de nuevo pin.
- [ ] **Subida de Archivos a Supabase Storage**
  - [ ] Subida de fotos directamente desde la cámara o galería del teléfono.
  - [ ] Compresión de imágenes en el cliente antes de la subida para ahorrar datos móviles.
- [ ] **Modo Offline & Caché Persistente**
  - [ ] Almacenamiento local con IndexedDB (ej: Dexie.js o Supabase Local Cache).
  - [ ] Service Worker para servir la app sin internet.
  - [ ] Sincronización en segundo plano (Background Sync) cuando se recupere la conexión.

---

## 🔵 Fase 4: Inteligencia Geoespacial, Rutas y Social

*Objetivo: Capacidades analíticas, planificación de itinerarios y colaboración.*

- [ ] **Planificador de Rutas e Itinerarios**
  - [ ] Agrupación de lugares por días de viaje.
  - [ ] Cálculo de distancias y visualización de rutas óptimas a pie o en transporte.
- [ ] **Capas Topográficas y Estilos de Mapa Alternativos**
  - [ ] Selector de capas (Satélite, Relieve/Topográfico, Claro, Oscuro).
- [ ] **Agente IA GeoMind Integrado**
  - [ ] Asistente en la app para generar guías automáticas de un lugar a partir de sus notas.
  - [ ] Recomendación de gemas ocultas cercanas según gustos previos del usuario.
- [ ] **Compartir y Colaboración**
  - [ ] Exportar colección como mapa web público de solo lectura (link compartible).
  - [ ] Colecciones colaborativas entre usuarios.

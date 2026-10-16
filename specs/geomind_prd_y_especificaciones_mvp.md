# Documento de Especificación Técnica: GeoMind (PRD & MVP)

---

# PARTE 1: Product Requirement Document (PRD Completo)

## 1. Visión General del Producto

**GeoMind** es un "segundo cerebro geográfico" enfocado en guardar, organizar y consultar información enriquecida sobre lugares del mundo. A diferencia de las herramientas tradicionales de navegación (Google Maps, Apple Maps), GeoMind prioriza el contenido personalizado (notas de historia, datos curiosos, guías paso a paso, fotos y atributos personalizados) manteniendo una interfaz visual basada en mapas interactivos.

Dado que la captura y consulta de lugares se realiza frecuentemente "sobre el terreno", la aplicación prioriza un enfoque **Mobile-First**, optimizado para pantallas de smartphones Android y preparado como Progressive Web App (PWA).

---

## 2. Stack Tecnológico

| Capa | Tecnología | Función |
| :--- | :--- | :--- |
| **Framework Frontend** | Next.js 14+ (App Router) + TypeScript | Estructura de la aplicación, Server Actions y SSR/SSG. |
| **Estilos / Componentes** | Tailwind CSS + Shadcn UI + Lucide Icons | Diseño adaptativo (Desktop/Mobile), componentes accesibles e iconos limpios. |
| **Experiencia Móvil** | PWA (next-pwa / Web Manifest) | Permite instalar la app en la pantalla de inicio de Android y funcionar en pantalla completa. |
| **Librería de Mapas** | MapLibre GL JS + React Map GL | Renderizado vectorizado de mapas de alto rendimiento optimizado para gestos táctiles. |
| **Proveedor de Map Tile** | Carto DB / MapTiler / OpenStreetMap | Estilos de mapa base limpios y sin coste directo de API comercial. |
| **Base de Datos & Auth** | Supabase (PostgreSQL + Storage) | Persistencia relacional, autenticación, storage de imágenes y consultas geoespaciales. |
| **Despliegue** | Vercel | Hosting, CI/CD integrado con GitHub y Serverless Functions. |

---

## 3. Arquitectura y Modelo de Datos (PostgreSQL en Supabase)

### Tabla: `places` (Lugares)
Guarda la entidad principal de un punto en el mapa.

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
  is_must_see BOOLEAN DEFAULT false, -- Famoso / Imperdible vs Gema oculta
  price_level VARCHAR(10) CHECK (price_level IN ('free', '$', '$$', '$$$', '$$$$')),
  historical_era VARCHAR(100), -- Ej: "Antigua Roma", "Siglo XIX"
  metadata JSONB DEFAULT '{}'::jsonb, -- Almacena campos flexibles opcionales
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabla: `collections` (Colecciones / Listas)
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

### Tabla: `place_collections` (Relación Muchos a Muchos)
```sql
CREATE TABLE place_collections (
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (place_id, collection_id)
);
```

### Tabla: `place_media` (Archivos y Enlaces Adjuntos)
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

## 4. Especificación Detallada de Funcionalidades

### Módulo A: Gestión de Pines e Importación
1. **Creación Manual:** Selección directa de coordenadas mediante pulsación o toque en pantalla.
2. **Búsqueda Geográfica (Geocoding):** Integración con API de búsqueda para posicionar pines por dirección o nombre.
3. **Importador de URLs de Google Maps:**
   * El usuario pega o comparte un enlace de Google Maps desde Android (`https://maps.app.goo.gl/...`).
   * Un Server Action procesa la URL, sigue la redirección HTTP y extrae coordenadas y nombre.
4. **Simbología Visual Personalizable:** Pines codificados por color o icono accesible para interacción táctil.

### Módulo B: Editor de Ficha de Lugar (Contenido Enriquecido)
1. **Editor / Visor Markdown:** Optimizado para lectura e interacción en teclados táctiles de smartphones.
2. **Esquema Dynamic/JSONB (Campos Opcionales):** Oculta áreas sin información para maximizar el espacio útil en pantalla.
3. **Módulo Multimedia:** Soporte para visualizar imágenes y enlaces adjuntos formateados en tarjetas verticales.

### Módulo C: Organización, Filtros y UX Adaptativa (Android / Desktop)
1. **Layout Híbrido Responsive:**
   * **Móvil (Android):** Mapa a pantalla completa con un panel inferior desizable (*Bottom Sheet / Drawer*) para explorar lugares o ver el detalle.
   * **Escritorio:** Panel lateral fijo (Sidebar) a la derecha/izquierda del mapa.
2. **Gestos Táctiles:** Soporte fluido para gestos de zoom (pinch-to-zoom), rotación y arrastre del panel inferior.
3. **PWA (Progressive Web App):** Manifest configurado para instalabilidad nativa en Android, ocultando la barra del navegador (standalone).

### Módulo D: Interoperabilidad & Integración con IA
1. **Exportación GeoJSON / JSON:** Descarga del dataset en el almacenamiento local del dispositivo.
2. **Modal de Importación JSON:** Interfaz para pegar estructuras JSON generadas por agentes de IA.

---
---

# PARTE 2: Documento de Especificación del MVP (Producto Mínimo Viable)

## 1. Alcance del MVP: Qué entra vs Qué se pospone

### Incluido en el MVP
* [x] Mapa base interactivo compatible con gestos táctiles en Android.
* [x] Diseños adaptativos: *Bottom Sheet* desplegable en móviles y *Sidebar* en escritorio.
* [x] Formulario para crear un pin tocando en el mapa o buscando por nombre.
* [x] Parser básico de URLs de Google Maps (copiar/pegar enlace).
* [x] Ficha del lugar con soporte de campos opcionales y editor/visor de Markdown.
* [x] Importador / Exportador manual en JSON.
* [x] Autenticación simple (Supabase Auth).
* [x] Configuración PWA básica (Manifest + icono para añadir a pantalla de inicio en Android).

### Postpuesto para Versiones Posteriores (V2)
* [ ] Integración nativa del menú "Compartir en..." de Android (Web Share Target API).
* [ ] Subida directa de imágenes locales desde la cámara/galería del teléfono.
* [ ] Modo offline con almacenamiento local persistente (IndexedDB).
* [ ] Rutas y capas topográficas avanzadas.

---

## 2. Modelo de Datos Simplificado (MVP)

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

## 3. Disposición de la Interfaz de Usuario (UI Layout)

### Vista Móvil / Android (Mobile First)

```text
+------------------------------------+
| [=] GeoMind          [Buscar] [+]  |  <- Barra superior compacta
+------------------------------------+
|                                    |
|                                    |
|          MAPA INTERACTIVO          |
|             (MapLibre)             |
|                                    |
|               (Pin)                |
|                 *                  |
|                                    |
+------------------------------------+
| ================================== |  <- Tirador deslizable (Bottom Sheet)
|  Panteón de Agripa                 |
|  [x] Visitado  |  Precio: Gratis   |
|  --------------------------------  |
|  ## Notas & Historia               |
|  El edificio destaca por su óculo..|
|  [Editar]             [Cerrar]     |
+------------------------------------+
```

### Vista Escritorio (Desktop)

```text
+-------------------------------------------------------------------------+
| [Logo: GeoMind]            [Buscar lugar...]         [Importar JSON] (U)|
+------------------------------+------------------------------------------+
|                              |  DETALLES DEL LUGAR                      |
|                              |  ------------------                      |
|                              |  # Panteón de Agripa                     |
|          MAPA INTERACTIVO    |  [x] Visitado | Precio: Gratis           |
|             (MapLibre)       |                                          |
|                              |  ## Notas & Historia                     |
|        (Pin Activo)          |  El edificio destaca por su gran óculo...|
|               *              |                                          |
|                              |  [Editar Lugar] [Eliminar]               |
+------------------------------+------------------------------------------+
```

---

## 4. Plan de Desarrollo Paso a Paso para Vibecoding

1. **Paso 1: Configuración e Infraestructura Mobile-Ready**
   * Crear el proyecto Next.js (`npx create-next-app@latest`).
   * Instalar `tailwindcss`, `shadcn-ui`, `maplibre-gl` y `@supabase/supabase-js`.
   * Añadir `manifest.json` y meta tags de viewport (`viewport-fit=cover`) para soporte PWA en Android.

2. **Paso 2: Componente Mapa y Paneles Adaptativos**
   * Crear el mapa base con soporte para gestos táctiles.
   * Implementar un panel inferior deslizable (*Drawer/Bottom Sheet* mediante Shadcn UI) para móviles y barra lateral para pantallas grandes.

3. **Paso 3: Captura de Datos y Parser de Google Maps**
   * Implementar Server Action para parsear enlaces copiados desde Google Maps Android.
   * Conectar el formulario de creación/edición de pines a Supabase.

4. **Paso 4: Visualización Markdown e Integración con IA**
   * Renderizar notas Markdown legibles en pantallas pequeñas.
   * Modal responsivo para importar/exportar estructuras JSON de agentes de IA.
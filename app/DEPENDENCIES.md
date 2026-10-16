# Especificación de Versiones y Stack Tecnológico (Guía para Agentes AI)

> **PROPÓSITO:** Este documento define el stack exacto, versiones de dependencias, runtime y directrices técnicas del proyecto para que cualquier agente o desarrollador trabaje de forma consistente evitando incompatibilidades de versión.

---

## 1. Entorno de Ejecución (Runtime & Tooling)

| Herramienta | Versión Instalada / Utilizada | Notas clave |
| :--- | :--- | :--- |
| **Node.js** | `v20.20.2` (LTS) | Mantenerse en compatibilidad Node >= 20. |
| **npm** | `10.8.2` | Gestor de paquetes oficial del workspace. |
| **Sistema Operativo** | Windows | Usar comandos PowerShell válidos (evitar encadenar con `&&`, usar `;`). |

---

## 2. Dependencias de Producción (`dependencies`)

| Paquete | Versión Exacta | Rol / Propósito | Reglas y Consideraciones para Agentes |
| :--- | :--- | :--- | :--- |
| **`next`** | `16.4.2` | Framework principal (App Router) | Usa Next 16+ con soporte Turbopack, Cache Components y Server Actions. **Importante:** en Client Components (`'use client'`) no exportar `export const dynamic = ...` (eso es solo para Server Components / Route Handlers). `cookies()` en Server Actions / Server Components debe ser invocado de forma asíncrona (`await cookies()`). |
| **`react`** | `19.3.0` | Biblioteca de UI | **React 19**. Usar hooks estándar (`useState`, `useEffect`, `useCallback`, `useRef`). |
| **`react-dom`** | `19.3.0` | Renderizado DOM | Compatible con React 19. |
| **`@supabase/supabase-js`** | `2.109.0` | Cliente Supabase | SDK oficial para Auth, base de datos y Storage. |
| **`@supabase/ssr`** | `0.12.7` | Adaptador SSR para Supabase | Usar `createBrowserClient` en el cliente y `createServerClient` con `cookies()` en el servidor (`@/lib/supabase/client.ts` y `@/lib/supabase/server.ts`). |
| **`maplibre-gl`** | `6.14.0` | Motor de mapas vectoriales WebGL | Renderizado de mapas de alto rendimiento. En `next.config.ts` hay un alias `mapbox-gl -> maplibre-gl`. Requiere ejecutarse solo en cliente (usar dynamic import con `ssr: false`). |
| **`react-map-gl`** | `8.1.3` | Wrapper React para MapLibre | Usar import `react-map-gl/maplibre`. **Nota de tipos:** `attributionControl` no acepta booleano `true`; omitirlo para activar por defecto o pasar `AttributionControlOptions` o `false`. |
| **`lucide-react`** | `1.58.0` | Iconografía | Iconos limpios e integrados en la UI. |
| **`react-markdown`** | `10.1.0` | Visor Markdown | Parser moderno para renderizar notas y contenido enriquecido. |
| **`remark-gfm`** | `4.0.1` | Plugin Markdown GFM | Tablas, checklists, URLs automáticas en Markdown. |

---

## 3. Dependencias de Desarrollo (`devDependencies`)

| Paquete | Versión Exacta | Rol / Propósito |
| :--- | :--- | :--- |
| **`typescript`** | `5.9.3` | Tipado estático estricto. |
| **`tailwindcss`** | `4.3.3` | Tailwind CSS v4. |
| **`@tailwindcss/turbopack`** | `4.3.3` | Integración de Turbopack con Tailwind CSS v4. |
| **`eslint`** | `9.39.5` | Linter con soporte para configuración flat (`eslint.config.mjs`). |
| **`eslint-config-next`** | `16.4.2` | Reglas recomendadas de ESLint para Next.js 16. |
| **`@types/react`** | `19.3.0` | Definiciones de tipos para React 19. |
| **`@types/react-dom`** | `19.3.0` | Definiciones de tipos para ReactDOM 19. |
| **`@types/node`** | `20.19.43` | Definiciones de tipos para Node.js v20. |

---

## 4. Arquitectura y Reglas de Implementación para Agentes

1. **Client vs Server Components:**
   - Componentes que usen MapLibre o interactividad del mapa deben usar `'use client'` y cargarse con `dynamic(() => import(...), { ssr: false })`.
   - Mutaciones a la base de datos se manejan mediante Server Actions en `src/lib/actions/`.
2. **Next.js 16 + React 19:**
   - La API de cookies en `@supabase/ssr` debe respetar que `cookies()` retorna una promesa (`const cookieStore = await cookies()`).
   - Evitar patrones obsoletos de Next.js Pages Router; el proyecto usa exclusivamente **App Router** (`src/app/`).
3. **Tailwind CSS v4:**
   - La configuración y tokens de diseño principales residen en `src/app/globals.css`.
4. **MapLibre GL v6 & react-map-gl v8:**
   - Utilizar el proveedor de mapas vectoriales CARTO Dark Matter (`https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`).
   - Todos los marcadores interactivos usan HTML Marker accesible con soporte táctil.
5. **Persistencia & RLS:**
   - Todas las consultas a `places` están protegidas por Row Level Security (`auth.uid() = user_id`).

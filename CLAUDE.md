# lozcam-web-oficial — Contexto del proyecto

## ¿Qué es esto?
Sistema de gestión web para **LOZCAM** (empresa constructora/inmobiliaria). Incluye un dashboard administrativo, un portal para clientes y una landing page pública.

## Stack
- **Framework**: Next.js (App Router) con TypeScript
- **Base de datos / Auth**: Supabase (PostgreSQL + Auth + Row Level Security)
- **Estilos**: Tailwind CSS + `clsx` + `tailwind-merge`
- **Formularios**: `react-hook-form` + `zod`
- **Iconos**: `lucide-react`
- **Fechas**: `date-fns`
- **Exportación**: `exceljs` (Excel/XLSX)

## Estructura de rutas (App Router)

```
app/
  (auth)/          → Login y autenticación
  (dashboard)/     → Panel administrativo
    clientes/      → Gestión de clientes
    obras/         → Gestión de obras y proyectos
    personal/      → Gestión de personal
    documentos/    → Gestión de documentos
    pagos/         → Gestión de pagos
    presupuestos/  → Presupuestos
    reportes/      → Reportes + exportación a Excel
    solicitudes/   → Solicitudes internas
  (portal)/        → Portal del cliente (acceso externo)
    portal/        → Vista de obras, pagos, solicitudes del cliente
  (public)/        → Landing page pública
  api/
    reportes/      → Endpoint de exportación Excel
    solicitudes/   → Endpoint de solicitudes
```

## Módulos principales

### Dashboard (admin)
- **Clientes**: CRUD de clientes
- **Obras**: proyectos con fases, avance (anillo de progreso), timeline, fechas de entrega
- **Pagos**: registro de pagos con comprobantes fiscales (IGV desglosado)
- **Presupuestos**: presupuestos por obra/cliente
- **Reportes**: KPIs + exportación a Excel con 5 hojas (Resumen, Obras, Pagos, Clientes, Solicitudes)
- **Solicitudes**: solicitudes internas con Server Actions

### Portal del cliente
- Vista responsiva (mobile-first)
- Resumen con anillo de avance y estado de cuenta
- Detalle de obra: anillo de avance + timeline de fases
- Mis Pagos: comprobantes con modal de desglose IGV
- Solicitudes: crear desde modal (Server Action + RLS escritura)
- Cierre de sesión

## Convenciones clave
- Routing por rol desde home (`/`) → redirige a `/dashboard` o `/portal` según rol
- **Server Components** por defecto; usar `"use client"` solo cuando necesario
- **RLS en Supabase** controla acceso a datos por rol (admin vs. cliente)
- Labels y formateo de estados centralizados en `lib/labels.ts`
- Helpers de Supabase en `lib/supabase/` (`client.ts` para cliente, `server.ts` para servidor)
- Tipos TypeScript en `lib/types/` (uno por módulo)
- Queries de Supabase en `lib/supabase/queries/`

## Patrones a respetar
- No usar `onClick` en Server Components — usar `<a href>` o Server Actions
- Formularios con `react-hook-form` + `zod` para validación
- Estilos con Tailwind; no CSS custom salvo en `globals.css`
- Íconos solo de `lucide-react`
- Datos demo en `lib/reportes/datos-demo.ts`; los datos reales vienen de Supabase

## Trabajo reciente (últimos commits)
- Routing directo por rol desde home
- Responsive móvil completo en portal cliente
- Comprobantes fiscales con modal desglose IGV en "Mis Pagos"
- Helper de labels + formateo de estados en todo el portal
- Rediseño del resumen del portal (anillo, estado cuenta, accesos rápidos)
- Crear solicitudes desde el portal (modal + Server Action + RLS)
- Detalle de obra con avance (anillo + timeline de fases)
- Exportación a Excel desde Reportes (`/api/reportes/export`)

## Archivos importantes
| Archivo | Propósito |
|---|---|
| `lib/labels.ts` | Labels y formateo centralizado de estados |
| `lib/supabase/client.ts` | Cliente Supabase para componentes cliente |
| `lib/supabase/server.ts` | Cliente Supabase para Server Components |
| `lib/types/database.types.ts` | Tipos generados de la DB |
| `app/(dashboard)/dashboard-shell.tsx` | Shell del dashboard admin |
| `components/shared/Sidebar.tsx` | Sidebar del dashboard |
| `components/portal/PortalShell.tsx` | Shell del portal cliente |

## Docker
El proyecto tiene `Dockerfile` y `.dockerignore` para despliegue containerizado.

# ROADMAP — Portal del Cliente · GRUPO LOZCAM S.A.C

Sistema de gestión interno (Next.js 16 + Supabase). Este documento cubre **solo el Portal del Cliente web**.

Base Supabase: `lozcam_gestion_db` (ref `zprhhnqtwhemswfnjrjm`, URL `https://zprhhnqtwhemswfnjrjm.supabase.co`).
Usuario de prueba: `cliente.demo@lozcam.pe` · uuid `78c194ef-1852-4fba-837b-cad5a8d63a9a` · rol `cliente` · `cliente_id = 4` (Constructora del Sur S.A.C., obra de S/ 5,200,000).

---

## HECHO Y VERIFICADO

### Cimiento de base de datos
- Columna `profiles.cliente_id` (bigint, FK a `clientes.id`) — enlace usuario ↔ cliente. (OJO: `clientes.id` es `bigint`, no uuid; `profiles.id` es uuid de auth.)
- Usuario `cliente` de prueba creado y enlazado a `cliente_id = 4`, `activo = true`.
- Enum de roles vive en el esquema `constructora` (`constructora.rol_sistema`), no en `public`.

### RLS — aislamiento por rol (verificado end-to-end)
- Política de lectura del cliente en las 3 tablas que consume el portal:
  - `obras` → filtra por `cliente_id` directo.
  - `pagos_clientes` → vía `obra_id → obras.cliente_id` (NO por `pagos_clientes.cliente_id`, que no es fiable).
  - `solicitudes` → por `cliente_id` directo (es NOT NULL, sí es fiable).
- **Blindaje general**: se cerraron 8 políticas "abre-todo para autenticados" (`qual = true`) que dejaban ver datos ajenos. Tablas afectadas: `obras`, `pagos_clientes`, `solicitudes`, `citas`, `comprobantes`, `incidencias`, `materiales_usados`, `reportes_diarios`.
- Por cada una se creó su política `staff_gestiona_*` (los 11 roles internos, admin incluido) para que el staff no perdiera acceso.
- Auditoría final: 0 políticas con `qual = true` en `public`. Cliente ve solo lo suyo; staff ve todo. Admin confirmado OK en dashboard.

### Portal web (Next.js, grupo `app/(portal)/`)
- Layout server-side con validación de rol (`!== 'cliente'` → redirect a `/dashboard`).
- 4 páginas con datos reales (Server Components, fetch con `@/lib/supabase/server`, RLS filtra solo):
  - **Resumen** (`/portal`): KPI cards (obras, en ejecución, deuda pendiente, solicitudes) + barras de progreso de pagos.
  - **Mis Obras** (`/portal/obras`): tabla con código, nombre, tipo, distrito, estado, monto.
  - **Mis Pagos** (`/portal/pagos`): 2 KPI (pagado/pendiente) + tabla de pagos.
  - **Mis Solicitudes** (`/portal/solicitudes`): tabla de solicitudes.
- Componentes en `components/portal/`: `PortalShell`, `PortalSidebar`, `PortalNavbar`.
- Diseño profesional (referencia Falcon, paleta navy `#0b1727` / amber `#f59e0b`), legible en modo claro y oscuro (usa CSS vars `--text-primary`, `--text-secondary`, `--card-bg`, etc.).
- Navbar con saludo, toggle de tema y cerrar sesión. Sin buscador ni notificaciones de gestión.

### Routing por rol
- `app/(portal)/layout.tsx`: si NO es cliente → `/dashboard`.
- `app/(dashboard)/layout.tsx`: si es cliente → `/portal`.
- Endpoint temporal `app/api/debug-rls` eliminado.

---

## PENDIENTE — fases ordenadas por riesgo

### Fase 1 — Pulido visual (frontend puro, sin riesgo)
- Sidebar colapsable (como el del dashboard).
- Estados de carga (skeletons) mientras cargan los datos.
- Responsive / versión móvil decente (el cliente probablemente entra desde el celular).
- Quitar el saludo duplicado si quedó (navbar + título de página).

### Fase 2 — Detalle de obra + avance (BD + frontend; mayor valor para el cliente)
- **Requiere primero BD**: resolver la tabla `avance_obra` (necesita `fase_id NOT NULL`) y crear su política RLS de lectura para el rol cliente.
- Página de detalle de obra: click en una obra → su info completa + % de avance / fases.
- (Opcional, depende de la app móvil) galería de fotos del avance.

### Fase 3 — Crear solicitudes (BD + frontend; la más delicada en seguridad)
- **Requiere BD**: política RLS de **INSERT** para el rol cliente (hasta ahora todo su RLS es de solo lectura).
  - Cuidado: el cliente solo debe poder crear solicitudes con SU `cliente_id`, no a nombre de otro.
- Formulario "Nueva solicitud" en el portal.

### Fase 4 — Comprobantes descargables
- Botón para ver/descargar el comprobante de cada pago "pagado" (tabla `comprobantes`).
- Depende de cómo esté la tabla y si hay archivos reales o solo registros.

### Mejoras menores (cuando haya tiempo)
- Notificaciones reales en el navbar (nuevo pago, avance actualizado).
- Página de perfil / datos de contacto del cliente y su asesor.
- Login: routing directo por rol tras autenticar (hoy hay rebote vía layout; funciona pero no es elegante). Editar `app/(auth)/login/page.tsx`.

---

## NOTAS TÉCNICAS PARA RETOMAR
- Patrón de fetch del portal: Server Component + `const supabase = await createClient()` (de `@/lib/supabase/server`). El RLS filtra solo; NO agregar filtros de cliente manuales.
- Para pagos, resolver la obra vía join `obra:obra_id(nombre)`, nunca por `pagos_clientes.cliente_id`.
- Toda política nueva de staff usa el array de 11 roles cast a `::constructora.rol_sistema[]`.
- Al añadir features que escriben en BD, recordar que el cliente NO debe poder falsear su `cliente_id`.
- El warning de Next "middleware deprecado (use proxy)" es conocido y no urge.
- Existe otra base con esquema viejo que NO se usa. Confirmar siempre que se trabaja en `lozcam_gestion_db` (ref `zprhhnqtwhemswfnjrjm`).
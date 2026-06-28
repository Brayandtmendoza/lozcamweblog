# SCAN DE DIAGNÓSTICO — lozcam-web-oficial
Fecha: 2026-06-12

---

## 1. CONSISTENCIA DE TEMA (colores hardcodeados)

### ✅ Archivos YA limpios (usan variables del tema correctamente)
- `app/(dashboard)/clientes/[id]/page.tsx`
- `app/(dashboard)/clientes/[id]/editar/page.tsx`
- `app/(dashboard)/obras/[id]/page.tsx` *(ver nota)*
- `app/(dashboard)/obras/[id]/editar/page.tsx`
- `app/(dashboard)/solicitudes/[id]/page.tsx`
- `app/(dashboard)/solicitudes/[id]/editar/page.tsx`
- `app/(dashboard)/pagos/[id]/page.tsx`
- `app/(dashboard)/pagos/[id]/editar/page.tsx`
- `app/(dashboard)/personal/[id]/page.tsx`
- `app/(dashboard)/personal/[id]/editar/page.tsx`
- `app/(dashboard)/documentos/[id]/page.tsx`
- `app/(dashboard)/documentos/[id]/editar/page.tsx`
- `app/(dashboard)/presupuestos/[id]/page.tsx`
- `app/(dashboard)/presupuestos/[id]/editar/page.tsx`
- `app/(dashboard)/reportes/page.tsx`
- `app/(dashboard)/reportes/[id]/page.tsx`
- `app/(dashboard)/reportes/[id]/incidencia/page.tsx`
- `app/(dashboard)/reportes/nuevo/page.tsx`
- `app/(dashboard)/dashboard/page.tsx` *(ver nota)*

### ⚠️ Archivos con colores hardcodeados pendientes

#### `app/(dashboard)/documentos/nuevo/page.tsx` — **TOTALMENTE hardcodeado**
- L97: `text-gray-900` (título header)
- L98: `text-gray-500` (subtítulo)
- L101: `bg-white rounded-xl border border-gray-200` (tarjeta form)
- L103,114,128,145,153,163,172: `text-gray-700` (todos los labels)
- L107,118,131,148,156,167: `border-gray-300 text-gray-900 focus:ring-blue-500` (todos los inputs/selects)
- L173: `border-dashed border-gray-300 hover:border-blue-400` (zona upload)
- L184: `text-blue-600` (nombre archivo seleccionado)
- L185,190,191: `text-gray-400`, `text-gray-500` (textos zona upload)
- L203: `border-gray-300 text-gray-700 hover:bg-gray-50` (botón Cancelar)
- L210: `bg-blue-600 text-white hover:bg-blue-700` (botón Subir)

#### `app/(dashboard)/documentos/[id]/nueva-version/page.tsx` — **TOTALMENTE hardcodeado**
- L89: `text-gray-900` (título)
- L90: `text-gray-500` (subtítulo)
- L97: `bg-white rounded-xl border border-gray-200` (tarjeta)
- L100: `text-gray-700` (label Archivo)
- L103: `border-dashed border-gray-300 hover:border-blue-400`
- L114: `text-blue-600` (nombre archivo)
- L115,121,122: `text-gray-400`, `text-gray-500`
- L130: `text-gray-700` (label Notas)
- L137: `border-gray-300 text-gray-900 focus:ring-blue-500` (textarea)
- L147: `border-gray-300 text-gray-700 hover:bg-gray-50` (botón Cancelar)
- L154: `bg-blue-600 text-white hover:bg-blue-700` (botón Subir)

#### `app/(dashboard)/solicitudes/[id]/cita/page.tsx` — **TOTALMENTE hardcodeado**
- L71: `text-gray-900` (título)
- L72: `text-gray-500` (subtítulo)
- L77: `bg-white rounded-xl border border-gray-200` (tarjeta)
- L81,85,92,100,106,118,123: `text-gray-700` (labels)
- L82,86,93,101,107,119,124: `border-gray-300 text-gray-900 focus:ring-blue-500`
- L131: `border-gray-300 text-gray-700 hover:bg-gray-50` (Cancelar)
- L135: `bg-blue-600 text-white hover:bg-blue-700` (Agendar)

#### `app/(dashboard)/obras/[id]/fases/nueva/page.tsx` — **TOTALMENTE hardcodeado**
- L49: `text-gray-900` (título)
- L50: `text-gray-500` (subtítulo)
- L53: `bg-white rounded-xl border border-gray-200`
- L55,65,75,85,93: `text-gray-700` (labels)
- L59,69,81,88,96: `border-gray-300 text-gray-900 focus:ring-blue-500`
- L108: `border-gray-300 text-gray-700 hover:bg-gray-50` (Cancelar)
- L115: `bg-blue-600 text-white hover:bg-blue-700` (Guardar)

#### `app/(dashboard)/personal/nuevo/page.tsx` — **TOTALMENTE hardcodeado**
- L73: `text-gray-900` (título)
- L74: `text-gray-500` (subtítulo)
- L79: `bg-white rounded-xl border border-gray-200`
- L82,90,100,116,124,133,144: `text-gray-700` (labels)
- L86,93,104,120,127,138,150: `border-gray-300 text-gray-900 focus:ring-blue-500`
- L161: `border-gray-300 text-gray-700 hover:bg-gray-50` (Cancelar)
- L168: `bg-blue-600 text-white hover:bg-blue-700` (Crear usuario)

#### `app/(dashboard)/dashboard/page.tsx` — colores semánticos, **mayormente OK pero con 2 notas**
- L93–94: `bg-blue-500/10` + `text-blue-500` en el ícono de Clientes (único acento azul en dashboard; podría cambiarse a amber/cyan para uniformidad, pero es baja prioridad)
- L196,236: `bg-gray-500/20 text-gray-500` para prioridad "baja/normal" en badges — es un color de estado "sin clasificar", aceptable pero técnicamente hardcodeado

#### `app/(dashboard)/obras/[id]/page.tsx` — **1 badge hardcodeado**
- L220: `bg-blue-100 text-blue-700` para fase estado `en_progreso`
- L223: `bg-gray-100 text-gray-600` para fase estado por defecto (pendiente)

---

## 2. CONSISTENCIA CRUD

| Módulo | Lista | Detalle | Nuevo | Editar | Notas |
|---|---|---|---|---|---|
| **Clientes** | ✅ `/clientes` | ✅ `/clientes/[id]` | ✅ `/clientes/nuevo` | ✅ `/clientes/[id]/editar` | Completo |
| **Obras** | ✅ `/obras` | ✅ `/obras/[id]` | ✅ `/obras/nueva` | ✅ `/obras/[id]/editar` | Tiene sub-ruta `/fases/nueva` |
| **Solicitudes** | ✅ `/solicitudes` | ✅ `/solicitudes/[id]` | ✅ `/solicitudes/nueva` | ✅ `/solicitudes/[id]/editar` | Tiene sub-ruta `/cita` |
| **Pagos** | ✅ `/pagos` | ✅ `/pagos/[id]` | ✅ `/pagos/nuevo` | ✅ `/pagos/[id]/editar` | Completo |
| **Personal** | ✅ `/personal` | ✅ `/personal/[id]` | ✅ `/personal/nuevo` | ✅ `/personal/[id]/editar` | Completo |
| **Documentos** | ✅ `/documentos` | ✅ `/documentos/[id]` | ✅ `/documentos/nuevo` | ✅ `/documentos/[id]/editar` | Tiene sub-ruta `/nueva-version` |
| **Presupuestos** | ✅ `/presupuestos` | ✅ `/presupuestos/[id]` | ✅ `/presupuestos/nuevo` | ✅ `/presupuestos/[id]/editar` | Completo |
| **Reportes** | ✅ `/reportes` | ✅ `/reportes/[id]` | ✅ `/reportes/nuevo` | ❌ **FALTA** `/reportes/[id]/editar` | Sub-ruta `/incidencia` existe |

### Inconsistencias CRUD identificadas

1. **Reportes sin página Editar**: Es el único módulo sin `/[id]/editar`. Si un reporte se crea con datos incorrectos no hay forma de corregirlos desde la UI.

2. **Fases de obra sin CRUD completo**: Solo existe `/fases/nueva`. No hay lista de fases independiente, ni `/fases/[id]/editar` ni `/fases/[id]`. Las fases se muestran dentro del detalle de la obra, lo cual puede ser intencional, pero editar/borrar una fase individual no es posible.

3. **Incidencias sin CRUD completo**: Solo existe `/reportes/[id]/incidencia` (crear). No hay editar ni detalle de incidencia individual.

4. **Citas sin CRUD**: Solo `/solicitudes/[id]/cita` (crear). Sin lista independiente, editar, ni detalle.

5. **personal/nuevo usa `signUp` de Auth**: La creación de personal combina `supabase.auth.signUp` + `profiles.upsert`. Si el Auth falla, el profile no se crea. No hay manejo de rollback. Diferente a todos los otros módulos que solo escriben en tablas.

---

## 3. SUPABASE / TABLAS

### Mapa completo de tablas referenciadas en el código TS/TSX

| Tabla | Archivos que la usan |
|---|---|
| `profiles` | `layout.tsx`, `page.tsx` (root), `dashboard/page.tsx`, `personal/page.tsx`, `personal/[id]/page.tsx`, `personal/[id]/editar`, `personal/nuevo`, `solicitudes/[id]/cita` |
| `clientes` | `clientes/*`, `obras/nueva`, `obras/[id]/editar`, `solicitudes/[id]/editar`, `solicitudes/nueva`, `pagos/nuevo`, `dashboard/page.tsx` |
| `obras` | `obras/*`, `presupuestos/*`, `documentos/*`, `pagos/*`, `reportes/*`, `dashboard/page.tsx` |
| `solicitudes` | `solicitudes/*`, `api/solicitudes/route.ts`, `dashboard/page.tsx` |
| `pagos_clientes` | `pagos/*`, `dashboard/page.tsx` |
| `documentos` | `documentos/*`, `pagos/[id]/editar` (storage bucket llamado `documentos`) |
| `versiones_documento` | `documentos/[id]/page.tsx`, `documentos/nuevo`, `documentos/[id]/nueva-version` |
| `presupuestos` | `presupuestos/*` |
| `partidas` | `presupuestos/[id]/page.tsx`, `presupuestos/nuevo`, `presupuestos/[id]/editar` |
| `reportes_diarios` | `reportes/*` |
| `materiales_usados` | `reportes/[id]/page.tsx`, `reportes/nuevo` |
| `incidencias` | `reportes/[id]/page.tsx`, `reportes/page.tsx`, `reportes/[id]/incidencia` |
| `fases_obra` | `obras/[id]/fases/nueva` (INSERT); leída en `obras/[id]/page.tsx` vía query de obras (`getFasesObra`) |
| `asignaciones` | `personal/[id]/page.tsx` |
| `citas` | `solicitudes/[id]/page.tsx`, `solicitudes/[id]/cita` |

### Sin referencias problemáticas
- ✅ **No hay ninguna referencia a `personal`** (tabla que no existe). Todo el código apunta a `profiles`.
- ✅ **No hay referencias a `constructora.*`** en el código TypeScript. El schema `constructora` solo contiene tipos/enums, no tablas de datos.
- ✅ No hay referencias a tablas en schema diferente a `public` (las llamadas `.from('...')` no especifican schema, lo que implica el schema por defecto `public`).

### Notas sobre storage
- El bucket de Supabase Storage llamado `documentos` se usa en `pagos/[id]/editar`, `documentos/nuevo` y `documentos/[id]/nueva-version`. Este bucket debe existir en Supabase con acceso público (se usa `getPublicUrl`).

### Posible riesgo
- `pagos/[id]/editar` hace `.from('documentos')` para subir vouchers al storage con `storage.from('documentos')`. Mezcla la tabla `documentos` (técnicos) con el bucket de vouchers. Si el bucket `documentos` agrupa tanto planos técnicos como vouchers de pago puede generar confusión de archivos (baja urgencia pero naming inconsistente).

---

## 4. ERRORES / TIPOS (npm run build)

```
✓ Compiled successfully in 5.4s
✓ TypeScript: sin errores
✓ 31 páginas generadas correctamente
```

**Solo 1 warning persistente (no es error):**
```
⚠ The "middleware" file convention is deprecated. 
  Please use "proxy" instead.
```
→ Existe un archivo `middleware.ts` (o similar) en la raíz que usa la convención antigua. Next.js 16 lo renombró a `proxy`. No bloquea el build pero debería corregirse.

**Hints del IDE (no afectan build):**
- `'FormEvent' is deprecated` en `reportes/nuevo/page.tsx` — falso positivo del servidor de lenguaje; `React.FormEvent` sigue siendo válido.
- `'formatFechaHora' is declared but never read` fue corregido al migrar `reportes/[id]/page.tsx`.

---

## 5. RIESGOS Y RECOMENDACIONES (priorizados)

### 🔴 Alta prioridad

| # | Problema | Recomendación |
|---|---|---|
| 1 | **5 páginas "nuevo/crear" con colores hardcodeados y botón azul** (`documentos/nuevo`, `documentos/nueva-version`, `solicitudes/cita`, `obras/fases/nueva`, `personal/nuevo`). En modo oscuro salen con fondo blanco, texto ilegible y botón azul. | Aplicar mismo molde que `reportes/nuevo`: `cardStyle`/`tp`/`ts`/`inputStyle`/`inputClass`, botón amber. Prioridad alta porque el usuario ve estas pantallas al crear contenido. |
| 2 | **`middleware.ts` usa convención deprecated** → warning en cada build. | Renombrar a `proxy.ts` o ajustar según la nueva convención de Next.js 16. |

### 🟡 Media prioridad

| # | Problema | Recomendación |
|---|---|---|
| 3 | **Reportes sin página Editar**. Si un reporte tiene un error de datos no hay forma de corregirlo. | Crear `reportes/[id]/editar/page.tsx` con el mismo patrón que `reportes/nuevo`. |
| 4 | **Fases de obra sin editar/borrar**. Las fases se crean pero no se pueden modificar. | Añadir `obras/[id]/fases/[faseId]/editar`. Considerar botón "borrar fase" en el detalle de obra. |
| 5 | **Incidencias sin editar**. Una incidencia registrada con datos incorrectos queda congelada. | Añadir `reportes/[id]/incidencias/[incId]/editar` o un modal inline. |
| 6 | **Badge `bg-blue-100 text-blue-700` para fase "en_progreso"** en `obras/[id]/page.tsx` L220. Ese azul no está en el sistema de variables. | Cambiar a `bg-blue-500/10 text-blue-500` (semi-transparente, resistente al tema) o a amber si se prefiere alineación total. |

### 🟢 Baja prioridad

| # | Problema | Recomendación |
|---|---|---|
| 7 | **`personal/nuevo` mezcla Auth + profiles sin rollback**. Si `signUp` tiene éxito pero `upsert` falla, queda un usuario de Auth sin perfil. | Investigar si hay un trigger en Supabase que cree el profile automáticamente al hacer signUp. Si no, añadir manejo de error con limpieza. |
| 8 | **Bucket Storage `documentos` mezcla planos técnicos y vouchers de pago**. | Considerar separar en dos buckets: `documentos-tecnicos` y `vouchers-pagos` para evitar colisiones de nombres y simplificar las RLS policies. |
| 9 | **Ícono "Clientes" en dashboard usa `bg-blue-500/10 text-blue-500`** (único acento azul en dashboard; el resto son amber/yellow/green). | Cambiar a otro color acorde (cyan, indigo, o simplemente amber) para uniformidad visual. |
| 10 | **`bg-gray-500/20 text-gray-500`** para prioridad "baja" en badges del dashboard. | Técnicamente hardcodeado pero es un color de "sin estado definido" que funciona bien en ambos temas. Puede dejarse como está. |
| 11 | **Citas sin CRUD**. Solo se pueden crear. | Evaluar si el caso de uso requiere editar citas (cambiar fecha/hora) o es suficiente cancelar y crear nuevas. |

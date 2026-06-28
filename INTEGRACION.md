# Exportar a Excel — Integración

Función "Exportar a Excel" para el módulo de Reportes. Genera un .xlsx con 5 hojas
(Resumen con KPIs + Obras, Pagos, Clientes, Solicitudes) usando datos de ejemplo
que ya calzan con tu esquema. Cambiar a datos reales de Supabase es trivial (ver más abajo).

## 1) Instalar dependencia (en la raíz del proyecto)

```powershell
npm install exceljs
```

## 2) Copiar archivos (respetando rutas)

- `lib/reportes/datos-demo.ts`
- `app/api/reportes/export/route.ts`

## 3) Agregar el botón en la página de Reportes

Archivo: `app/(dashboard)/reportes/page.tsx`

Es un Server Component, así que usamos un enlace `<a>` (NO un onClick, para no caer en
"Event handlers cannot be passed to Client Component props"). Agrega este enlace en la
cabecera, junto al botón "+ Nuevo reporte":

```tsx
<a
  href="/api/reportes/export"
  className="bg-amber-500 hover:bg-amber-400 text-gray-950 px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
>
  Exportar a Excel
</a>
```

(El navegador descarga el archivo solo, porque la ruta responde con
`Content-Disposition: attachment`.)

## 4) Probar

```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

Abre `/reportes`, clic en "Exportar a Excel" → descarga `reporte-lozcam-AAAA-MM-DD.xlsx`.
También puedes probar la ruta directo en el navegador: `http://localhost:3000/api/reportes/export`

## 5) (Después) Usar datos REALES de Supabase

Abre `lib/reportes/datos-demo.ts` y reemplaza `getDatosReporte()` por la versión
comentada al final del archivo (consulta Supabase y mapea cada fila). El resto no cambia.

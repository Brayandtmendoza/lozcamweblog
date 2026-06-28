import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatFecha } from '@/lib/utils/formatters'

export default async function ReporteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (isNaN(id)) notFound()

  const supabase = await createClient()

  const { data: reporte, error } = await supabase
    .from('reportes_diarios')
    .select('*, obras(nombre, estado)')
    .eq('id', id)
    .single()

  if (error || !reporte) notFound()

  const { data: materiales } = await supabase
    .from('materiales_usados')
    .select('*')
    .eq('reporte_id', id)

  const { data: incidencias } = await supabase
    .from('incidencias')
    .select('*')
    .eq('reporte_id', id)

  const climaEmoji: Record<string, string> = {
    soleado: '☀️',
    nublado: '☁️',
    lluvia: '🌧️',
    tormenta: '⛈️',
    viento: '💨',
  }

  const cardStyle = { background: 'var(--card-bg)', border: '1px solid var(--card-border)' }
  const tp = { color: 'var(--text-primary)' }
  const ts = { color: 'var(--text-secondary)' }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={tp}>Reporte — {formatFecha(reporte.fecha)}</h1>
          <p className="text-sm mt-0.5" style={ts}>{reporte.obras?.nombre}</p>
        </div>
        <Link href="/reportes" className="text-sm hover:opacity-70 transition-opacity" style={ts}>
          ← Volver
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="rounded-xl p-4 text-center" style={cardStyle}>
          <p className="text-2xl mb-1">
            {reporte.clima ? climaEmoji[reporte.clima] ?? '🌡️' : '—'}
          </p>
          <p className="text-xs" style={ts}>{reporte.clima ?? 'Sin registrar'}</p>
          {reporte.temp_celsius && (
            <p className="text-sm font-medium mt-0.5" style={tp}>{reporte.temp_celsius}°C</p>
          )}
        </div>
        <div className="rounded-xl p-4 text-center" style={cardStyle}>
          <p className="text-3xl font-bold mb-1" style={tp}>{reporte.personal_count ?? '—'}</p>
          <p className="text-xs" style={ts}>Personal en obra</p>
        </div>
        <div className="rounded-xl p-4 text-center" style={cardStyle}>
          <p className="text-3xl font-bold mb-1 text-amber-500">{incidencias?.length ?? 0}</p>
          <p className="text-xs" style={ts}>Incidencias</p>
        </div>
      </div>

      {/* Actividades + Avance + Problemas */}
      <div className="rounded-xl p-6 mb-4 space-y-4" style={cardStyle}>
        <div>
          <h2 className="text-sm font-semibold mb-2" style={tp}>Actividades del día</h2>
          <p className="text-sm" style={ts}>{reporte.descripcion}</p>
        </div>
        {reporte.avance_descripcion && (
          <div className="pt-3" style={{ borderTop: '1px solid var(--card-border)' }}>
            <h2 className="text-sm font-semibold mb-2" style={tp}>Avance</h2>
            <p className="text-sm" style={ts}>{reporte.avance_descripcion}</p>
          </div>
        )}
        {reporte.problemas && (
          <div className="pt-3" style={{ borderTop: '1px solid var(--card-border)' }}>
            <h2 className="text-sm font-semibold mb-2 text-orange-500">⚠️ Problemas / Observaciones</h2>
            <p className="text-sm" style={ts}>{reporte.problemas}</p>
          </div>
        )}
      </div>

      {/* Materiales usados */}
      {materiales && materiales.length > 0 && (
        <div className="rounded-xl overflow-hidden mb-4" style={cardStyle}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <h2 className="text-sm font-semibold" style={tp}>Materiales usados ({materiales.length})</h2>
          </div>
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--table-header-bg)', borderBottom: '2px solid var(--table-border)' }}>
              <tr>
                <th className="text-left px-4 py-2 text-xs font-medium" style={ts}>Material</th>
                <th className="text-left px-4 py-2 text-xs font-medium" style={ts}>Cantidad</th>
                <th className="text-left px-4 py-2 text-xs font-medium" style={ts}>Unidad</th>
                <th className="text-left px-4 py-2 text-xs font-medium" style={ts}>Proveedor</th>
              </tr>
            </thead>
            <tbody>
              {materiales.map((m: any) => (
                <tr
                  key={m.id}
                  className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  style={{ borderTop: '1px solid var(--table-border)' }}
                >
                  <td className="px-4 py-2" style={tp}>{m.material}</td>
                  <td className="px-4 py-2" style={ts}>{m.cantidad}</td>
                  <td className="px-4 py-2" style={ts}>{m.unidad}</td>
                  <td className="px-4 py-2" style={ts}>{m.proveedor ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Incidencias */}
      <div className="rounded-xl p-5" style={cardStyle}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={tp}>Incidencias ({incidencias?.length ?? 0})</h2>
          <Link
            href={`/reportes/${id}/incidencia`}
            className="text-sm text-red-500 hover:text-red-400 font-medium"
          >
            + Registrar incidencia
          </Link>
        </div>
        {!incidencias || incidencias.length === 0 ? (
          <p className="text-sm text-center py-4" style={ts}>Sin incidencias registradas ✅</p>
        ) : (
          <div className="space-y-3">
            {incidencias.map((inc: any) => (
              <div
                key={inc.id}
                className={`p-3 rounded-lg border ${
                  inc.gravedad === 'grave' || inc.gravedad === 'critica'
                    ? 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20'
                    : inc.gravedad === 'moderada'
                    ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900/40 dark:bg-yellow-950/20'
                    : 'border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium uppercase" style={tp}>{inc.tipo}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        inc.gravedad === 'critica'
                          ? 'bg-red-100 text-red-700'
                          : inc.gravedad === 'grave'
                          ? 'bg-orange-100 text-orange-700'
                          : inc.gravedad === 'moderada'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {inc.gravedad.charAt(0).toUpperCase() + inc.gravedad.slice(1)}
                    </span>
                    {inc.resuelto && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Resuelto</span>
                    )}
                  </div>
                </div>
                <p className="text-sm" style={ts}>{inc.descripcion}</p>
                {inc.afecta_plazo && (
                  <p className="text-xs text-red-500 mt-1">
                    ⏱️ Afecta plazo · {inc.dias_retraso} día{inc.dias_retraso !== 1 ? 's' : ''} de retraso
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatFecha, formatFechaHora } from '@/lib/utils/formatters'

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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reporte — {formatFecha(reporte.fecha)}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{reporte.obras?.nombre}</p>
        </div>
        <Link href="/reportes" className="text-sm text-gray-500 hover:text-gray-700">
          ← Volver
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl mb-1">
            {reporte.clima ? climaEmoji[reporte.clima] ?? '🌡️' : '—'}
          </p>
          <p className="text-xs text-gray-500">{reporte.clima ?? 'Sin registrar'}</p>
          {reporte.temp_celsius && <p className="text-sm font-medium text-gray-900 mt-0.5">{reporte.temp_celsius}°C</p>}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-gray-900 mb-1">{reporte.personal_count ?? '—'}</p>
          <p className="text-xs text-gray-500">Personal en obra</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-orange-500 mb-1">{incidencias?.length ?? 0}</p>
          <p className="text-xs text-gray-500">Incidencias</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Actividades del día</h2>
          <p className="text-sm text-gray-600">{reporte.descripcion}</p>
        </div>
        {reporte.avance_descripcion && (
          <div className="pt-3 border-t border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Avance</h2>
            <p className="text-sm text-gray-600">{reporte.avance_descripcion}</p>
          </div>
        )}
        {reporte.problemas && (
          <div className="pt-3 border-t border-gray-100">
            <h2 className="text-sm font-semibold text-orange-600 mb-2">⚠️ Problemas / Observaciones</h2>
            <p className="text-sm text-gray-600">{reporte.problemas}</p>
          </div>
        )}
      </div>

      {materiales && materiales.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Materiales usados ({materiales.length})</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Material</th>
                <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Cantidad</th>
                <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Unidad</th>
                <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Proveedor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {materiales.map((m: any) => (
                <tr key={m.id}>
                  <td className="px-4 py-2 text-gray-900">{m.material}</td>
                  <td className="px-4 py-2 text-gray-600">{m.cantidad}</td>
                  <td className="px-4 py-2 text-gray-600">{m.unidad}</td>
                  <td className="px-4 py-2 text-gray-500">{m.proveedor ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Incidencias ({incidencias?.length ?? 0})</h2>
          <Link href={`/reportes/${id}/incidencia`} className="text-sm text-red-600 hover:text-red-800 font-medium">
            + Registrar incidencia
          </Link>
        </div>
        {!incidencias || incidencias.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Sin incidencias registradas ✅</p>
        ) : (
          <div className="space-y-3">
            {incidencias.map((inc: any) => (
              <div
                key={inc.id}
                className={`p-3 rounded-lg border ${
                  inc.gravedad === 'grave' || inc.gravedad === 'critica'
                    ? 'border-red-200 bg-red-50'
                    : inc.gravedad === 'moderada'
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700 uppercase">{inc.tipo}</span>
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
                    {inc.resuelto && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Resuelto</span>}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{inc.descripcion}</p>
                {inc.afecta_plazo && (
                  <p className="text-xs text-red-600 mt-1">
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


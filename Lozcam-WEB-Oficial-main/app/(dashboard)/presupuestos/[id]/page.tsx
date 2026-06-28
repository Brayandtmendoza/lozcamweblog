import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatFecha, formatPEN } from '@/lib/utils/formatters'
import { ESTADO_PRESUPUESTO_COLOR, TIPO_COSTO_LABEL } from '@/lib/types/presupuestos'

export default async function PresupuestoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (isNaN(id)) notFound()

  const supabase = await createClient()

  const { data: pres, error } = await supabase
    .from('presupuestos')
    .select('*, obras(nombre)')
    .eq('id', id)
    .single()

  if (error || !pres) notFound()

  const { data: partidas } = await supabase
    .from('partidas')
    .select('id, presupuesto_id, codigo, descripcion, unidad, metrado, precio_unitario, parcial, tipo_costo, orden')
    .eq('presupuesto_id', id)
    .order('orden', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{pres.nombre}</h1>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                ESTADO_PRESUPUESTO_COLOR[pres.estado] ?? 'bg-gray-100 text-gray-700'
              }`}
            >
              {pres.estado.charAt(0).toUpperCase() + pres.estado.slice(1)}
            </span>
            {pres.es_vigente && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">Vigente</span>
            )}
          </div>
          <p className="text-gray-500 text-sm">
            {pres.obras?.nombre} · {formatFecha(pres.created_at)}
          </p>
        </div>
        <Link href="/presupuestos" className="text-sm text-gray-500 hover:text-gray-700">
          ← Volver
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Costo directo</p>
          <p className="text-lg font-bold text-gray-900">{formatPEN(pres.total_directo)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Gastos generales</p>
          <p className="text-lg font-bold text-gray-900">{formatPEN(pres.gastos_generales)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">IGV</p>
          <p className="text-lg font-bold text-gray-900">{formatPEN(pres.igv)}</p>
        </div>
        <div className="bg-blue-600 rounded-xl p-4">
          <p className="text-xs text-blue-100 mb-1">TOTAL</p>
          <p className="text-lg font-bold text-white">{formatPEN(pres.total)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Partidas ({partidas?.length ?? 0})</h2>
        </div>

        {!partidas || partidas.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No hay partidas registradas</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Código</th>
                <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Descripción</th>
                <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Unidad</th>
                <th className="text-right px-4 py-2 text-xs text-gray-500 font-medium">Metrado</th>
                <th className="text-right px-4 py-2 text-xs text-gray-500 font-medium">P. Unit</th>
                <th className="text-right px-4 py-2 text-xs text-gray-500 font-medium">Parcial</th>
                <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {partidas.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-xs font-mono text-gray-500">{p.codigo ?? '—'}</td>
                  <td className="px-4 py-2 text-gray-900">{p.descripcion}</td>
                  <td className="px-4 py-2 text-gray-500">{p.unidad ?? '—'}</td>
                  <td className="px-4 py-2 text-gray-700 text-right">{p.metrado}</td>
                  <td className="px-4 py-2 text-gray-700 text-right">{formatPEN(p.precio_unitario ?? 0)}</td>
                  <td className="px-4 py-2 font-medium text-gray-900 text-right">{formatPEN(p.parcial ?? 0)}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{TIPO_COSTO_LABEL[p.tipo_costo] ?? p.tipo_costo}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-gray-200 bg-gray-50">
              <tr>
                <td colSpan={5} className="px-4 py-2 text-sm font-bold text-gray-900 text-right">
                  TOTAL DIRECTO
                </td>
                <td className="px-4 py-2 text-sm font-bold text-blue-600 text-right">{formatPEN(pres.total_directo)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}


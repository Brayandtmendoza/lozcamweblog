import { getObraById, getFasesObra } from '@/lib/supabase/queries/obras'
import { formatFecha, formatPEN } from '@/lib/utils/formatters'
import { ESTADO_OBRA_COLOR, ESTADO_OBRA_LABEL, TIPO_SERVICIO_LABEL } from '@/lib/utils/constants'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ObraDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (isNaN(id)) notFound()


  const [obra, fases] = await Promise.all([
    getObraById(id),
    getFasesObra(id),
  ])

  if (!obra) notFound()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{obra.nombre}</h1>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${ESTADO_OBRA_COLOR[obra.estado]}`}
            >
              {ESTADO_OBRA_LABEL[obra.estado]}
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            {TIPO_SERVICIO_LABEL[obra.tipo_servicio]} · {obra.direccion}
            {obra.distrito && `, ${obra.distrito}`}
          </p>
        </div>
        <Link href="/obras" className="text-sm text-gray-500 hover:text-gray-700">
          ← Volver
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Monto contrato</p>
          <p className="text-xl font-bold text-gray-900">{formatPEN(obra.monto_contrato)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Fecha inicio</p>
          <p className="text-sm font-semibold text-gray-900">
            {obra.fecha_inicio_planificada ? formatFecha(obra.fecha_inicio_planificada) : '—'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Fecha fin</p>
          <p className="text-sm font-semibold text-gray-900">
            {obra.fecha_fin_planificada ? formatFecha(obra.fecha_fin_planificada) : '—'}
          </p>
        </div>
      </div>

      {obra.clientes && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Cliente</h2>
          <p className="text-gray-900">
            {obra.clientes.razon_social ?? `${obra.clientes.nombres} ${obra.clientes.apellidos}`}
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Fases de obra ({fases.length})</h2>
          <Link
            href={`/obras/${obra.id}/fases/nueva`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Agregar fase
          </Link>
        </div>

        {fases.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm mb-3">No hay fases registradas</p>
            <Link
              href={`/obras/${obra.id}/fases/nueva`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Agregar primera fase
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {fases.map((fase, index) => (
              <div
                key={fase.id}
                className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{fase.nombre}</p>
                  {fase.descripcion && (
                    <p className="text-xs text-gray-400 mt-0.5">{fase.descripcion}</p>
                  )}
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      fase.estado === 'completada'
                        ? 'bg-green-100 text-green-700'
                        : fase.estado === 'en_progreso'
                          ? 'bg-blue-100 text-blue-700'
                          : fase.estado === 'bloqueada'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {fase.estado === 'completada'
                      ? 'Completada'
                      : fase.estado === 'en_progreso'
                        ? 'En progreso'
                        : fase.estado === 'bloqueada'
                          ? 'Bloqueada'
                          : 'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {obra.descripcion && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mt-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Descripción</h2>
          <p className="text-sm text-gray-600">{obra.descripcion}</p>
        </div>
      )}
    </div>
  )
}


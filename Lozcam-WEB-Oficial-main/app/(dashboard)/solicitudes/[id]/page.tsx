import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatFecha, formatPEN } from '@/lib/utils/formatters'
import {
  ESTADO_SOLICITUD_COLOR,
  ESTADO_SOLICITUD_LABEL,
  PRIORIDAD_COLOR,
} from '@/lib/types/solicitudes'
import { TIPO_SERVICIO_LABEL } from '@/lib/utils/constants'

export default async function SolicitudDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (isNaN(id)) notFound()

  const supabase = await createClient()

  const { data: sol, error } = await supabase
    .from('solicitudes')
    .select(`*, clientes (nombres, apellidos, razon_social, telefono, email)`)
    .eq('id', id)
    .single()

  if (error || !sol) notFound()

  const { data: citas } = await supabase
    .from('citas')
    .select('*')
    .eq('solicitud_id', id)
    .order('fecha', { ascending: true })

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{sol.titulo}</h1>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${ESTADO_SOLICITUD_COLOR[sol.estado]}`}
            >
              {ESTADO_SOLICITUD_LABEL[sol.estado]}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${PRIORIDAD_COLOR[sol.prioridad]}`}
            >
              {sol.prioridad.charAt(0).toUpperCase() + sol.prioridad.slice(1)}
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            {TIPO_SERVICIO_LABEL[sol.tipo_servicio]} · {formatFecha(sol.created_at)}
          </p>
        </div>
        <Link href="/solicitudes" className="text-sm text-gray-500 hover:text-gray-700">
          ← Volver
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Cliente</h2>
          <p className="text-sm font-medium text-gray-900">
            {sol.clientes?.razon_social ?? `${sol.clientes?.nombres} ${sol.clientes?.apellidos}`}
          </p>
          {sol.clientes?.telefono && <p className="text-xs text-gray-500 mt-1">{sol.clientes.telefono}</p>}
          {sol.clientes?.email && <p className="text-xs text-gray-500">{sol.clientes.email}</p>}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Datos del proyecto</h2>
          {sol.direccion_obra && <p className="text-xs text-gray-600 mb-1">{sol.direccion_obra}</p>}
          {sol.distrito && (
            <p className="text-xs text-gray-500">
              {sol.distrito}
              {sol.provincia ? `, ${sol.provincia}` : ''}
            </p>
          )}
          {sol.area_m2 && <p className="text-xs text-gray-500 mt-1">Área: {sol.area_m2} m²</p>}
          {sol.presupuesto_ref && (
            <p className="text-xs text-gray-500">Presupuesto ref: {formatPEN(sol.presupuesto_ref)}</p>
          )}
          <div className="flex gap-3 mt-2">
            {sol.tiene_planos && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Tiene planos</span>
            )}
            {sol.tiene_terreno && (
              <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded">Tiene terreno</span>
            )}
          </div>
        </div>
      </div>

      {sol.descripcion && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Descripción</h2>
          <p className="text-sm text-gray-600">{sol.descripcion}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">
            Citas ({citas?.length ?? 0})
          </h2>
          <Link href={`/solicitudes/${id}/cita`} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            + Agendar cita
          </Link>
        </div>
        {!citas || citas.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No hay citas agendadas</p>
        ) : (
          <div className="space-y-2">
            {citas.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatFecha(c.fecha)} a las {c.hora.slice(0, 5)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {c.tipo_cita} · {c.estado}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    c.estado === 'completada'
                      ? 'bg-green-100 text-green-700'
                      : c.estado === 'cancelada'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {c.estado.charAt(0).toUpperCase() + c.estado.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Acciones</h2>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/solicitudes/${id}/cotizacion`}
            className="flex-1 text-center bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Crear cotización
          </Link>
          {sol.estado !== 'convertida_obra' && (
            <Link
              href={`/obras/nueva?solicitud_id=${id}&cliente_id=${sol.cliente_id}`}
              className="flex-1 text-center border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Convertir a obra
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}


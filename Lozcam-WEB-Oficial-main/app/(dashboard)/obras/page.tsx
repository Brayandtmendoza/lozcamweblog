import { getObras } from '@/lib/supabase/queries/obras'
import Link from 'next/link'
import { formatFecha, formatPEN } from '@/lib/utils/formatters'
import { ESTADO_OBRA_COLOR, ESTADO_OBRA_LABEL, TIPO_SERVICIO_LABEL } from '@/lib/utils/constants'

export default async function ObrasPage() {
  const obras = await getObras()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Obras</h1>

          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {obras.length} obra{obras.length !== 1 ? 's' : ''} registrada{obras.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/obras/nueva"
          className="bg-amber-500 hover:bg-amber-400 text-gray-950 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nueva obra
        </Link>
      </div>

      {obras.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          <p className="text-gray-400 text-sm">No hay obras registradas aún</p>
          <Link
            href="/obras/nueva"
            className="mt-4 inline-block bg-amber-500 hover:bg-amber-400 text-gray-950 px-4 py-2 rounded-lg text-sm font-medium"
          >
            Registrar primera obra
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {obras.map((obra) => (
            <Link
              key={obra.id}
              href={`/obras/${obra.id}`}
              className="rounded-xl p-5 hover:shadow-md transition-all"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{obra.nombre}</h3>
                    {obra.codigo && (
                      <span className="text-xs text-gray-400 font-mono">{obra.codigo}</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_OBRA_COLOR[obra.estado]}`}>
                      {ESTADO_OBRA_LABEL[obra.estado]}
                    </span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {TIPO_SERVICIO_LABEL[obra.tipo_servicio]} · {obra.direccion}
                    {obra.distrito && `, ${obra.distrito}`}
                  </p>
                  <div className="flex items-center gap-6 text-xs text-gray-400">
                    {obra.clientes && (
                      <span>
                        Cliente:{' '}
                        {obra.clientes.razon_social ??
                          `${obra.clientes.nombres} ${obra.clientes.apellidos}`}
                      </span>
                    )}
                    {obra.fecha_inicio_planificada && (
                      <span>Inicio: {formatFecha(obra.fecha_inicio_planificada)}</span>
                    )}
                    {obra.fecha_fin_planificada && (
                      <span>Fin: {formatFecha(obra.fecha_fin_planificada)}</span>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{formatPEN(obra.monto_contrato)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">monto contrato</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}


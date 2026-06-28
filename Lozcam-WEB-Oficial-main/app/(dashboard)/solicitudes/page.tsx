import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatFecha } from '@/lib/utils/formatters'

import { ESTADO_SOLICITUD_COLOR, ESTADO_SOLICITUD_LABEL, PRIORIDAD_COLOR } from '@/lib/types/solicitudes'
import { TIPO_SERVICIO_LABEL } from '@/lib/utils/constants'
import { FilaTabla } from '@/components/shared/FilaTabla'

export default async function SolicitudesPage() {
  const supabase = await createClient()
  const { data: solicitudes } = await supabase
    .from('solicitudes')
    .select('*, clientes (nombres, apellidos, razon_social)')
    .order('created_at', { ascending: false })

  const lista = solicitudes ?? []
  const cardStyle = { background: 'var(--card-bg)', border: '1px solid var(--card-border)' }
  const tp = { color: 'var(--text-primary)' }
  const ts = { color: 'var(--text-secondary)' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={tp}>Solicitudes</h1>
          <p className="text-sm mt-0.5" style={ts}>
            {lista.length} solicitud{lista.length !== 1 ? 'es' : ''} registrada{lista.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/solicitudes/nueva"
          className="bg-amber-500 hover:bg-amber-400 text-gray-950 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nueva solicitud
        </Link>
      </div>

      {lista.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={ts}>No hay solicitudes registradas aún</p>
          <Link
            href="/solicitudes/nueva"
            className="mt-4 inline-block bg-amber-500 hover:bg-amber-400 text-gray-950 px-4 py-2 rounded-lg text-sm font-medium"
          >
            Registrar primera solicitud
          </Link>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={cardStyle}>
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--table-header-bg)' }}>
              <tr style={{ borderBottom: '2px solid var(--table-border)' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Solicitud</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Servicio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Prioridad</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((s: any) => (
                <FilaTabla
                  key={s.id}
                  href={`/solicitudes/${s.id}`}
                >

                  <td className="px-4 py-3">
                    <div className="font-medium" style={tp}>{s.titulo}</div>

                    {s.distrito && <div className="text-xs mt-0.5" style={ts}>{s.distrito}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ ...ts }}>

                    {s.clientes?.razon_social ?? `${s.clientes?.nombres ?? ''} ${s.clientes?.apellidos ?? ''}`}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ borderTop: '1px solid var(--table-border)', ...ts }}>
                    {TIPO_SERVICIO_LABEL[s.tipo_servicio] ?? s.tipo_servicio}
                  </td>
                  <td className="px-4 py-3" style={{ borderTop: '1px solid var(--table-border)' }}>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_SOLICITUD_COLOR[s.estado]}`}>
                      {ESTADO_SOLICITUD_LABEL[s.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ borderTop: '1px solid var(--table-border)' }}>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORIDAD_COLOR[s.prioridad]}`}>

                      {s.prioridad.charAt(0).toUpperCase() + s.prioridad.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ borderTop: '1px solid var(--table-border)', ...ts }}>
                    {formatFecha(s.created_at)}
                  </td>
                  <td className="px-4 py-3" style={{ borderTop: '1px solid var(--table-border)' }}>
                    <Link href={`/solicitudes/${s.id}`} className="text-amber-500 hover:text-amber-400 font-medium">
                      Ver
                    </Link>
                  </td>
                </FilaTabla>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}



'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatFecha } from '@/lib/utils/formatters'
import { ESTADO_SOLICITUD_LABEL } from '@/lib/types/solicitudes'
import { EstadoBadge } from '@/components/EstadoBadge'
import { TIPO_SERVICIO_LABEL } from '@/lib/utils/constants'
import { FilaTabla } from '@/components/shared/FilaTabla'
import { AccionesFila } from '@/components/shared/AccionesFila'

export default function SolicitudesPage() {
  const supabase = createClient()

  const [lista, setLista] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase
      .from('solicitudes')
      .select('*, clientes (nombres, apellidos, razon_social)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setLista(data ?? [])
        setCargando(false)
      })
  }, [])

  async function handleEliminar(id: number | string) {
    const { error } = await supabase
      .from('solicitudes')
      .delete()
      .eq('id', id)
    if (error) throw new Error(error.message)
    setLista(prev => prev.filter(s => s.id !== id))
  }

  const cardStyle = { background: 'var(--card-bg)', border: '1px solid var(--card-border)' }
  const tp = { color: 'var(--text-primary)' }
  const ts = { color: 'var(--text-secondary)' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={tp}>Solicitudes</h1>
          <p className="text-sm mt-0.5" style={ts}>
            {cargando ? '...' : `${lista.length} solicitud${lista.length !== 1 ? 'es' : ''} registrada${lista.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/solicitudes/nueva"
          className="bg-action hover:bg-action-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nueva solicitud
        </Link>
      </div>

      {cargando ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={ts}>Cargando...</p>
        </div>
      ) : lista.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={ts}>No hay solicitudes registradas aún</p>
          <Link
            href="/solicitudes/nueva"
            className="mt-4 inline-block bg-action hover:bg-action-hover text-white px-4 py-2 rounded-lg text-sm font-medium"
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
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((s: any) => (
                <FilaTabla key={s.id} href={`/solicitudes/${s.id}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium" style={tp}>{s.titulo}</div>
                    {s.distrito && <div className="text-xs mt-0.5" style={ts}>{s.distrito}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm" style={ts}>
                    {s.clientes?.razon_social ?? `${s.clientes?.nombres ?? ''} ${s.clientes?.apellidos ?? ''}`}
                  </td>
                  <td className="px-4 py-3 text-xs" style={ts}>
                    {TIPO_SERVICIO_LABEL[s.tipo_servicio] ?? s.tipo_servicio}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={s.estado} label={ESTADO_SOLICITUD_LABEL[s.estado]} />
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={s.prioridad} />
                  </td>
                  <td className="px-4 py-3 text-xs" style={ts}>
                    {formatFecha(s.created_at)}
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <AccionesFila
                      id={s.id}
                      rutaBase="/solicitudes"
                      onEliminar={handleEliminar}
                      tituloModal="¿Eliminar esta solicitud?"
                      descripcionModal="Esta acción no se puede deshacer y también eliminará sus citas."
                      mensajeExito="Solicitud eliminada"
                    />
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

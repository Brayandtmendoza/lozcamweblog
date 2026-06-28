'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatFecha, formatPEN } from '@/lib/utils/formatters'
import { ESTADO_OBRA_LABEL, TIPO_SERVICIO_LABEL } from '@/lib/utils/constants'
import { EstadoBadge } from '@/components/EstadoBadge'
import { AccionesFila } from '@/components/shared/AccionesFila'

export default function ObrasPage() {
  const supabase = createClient()

  const [obras, setObras] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase
      .from('obras')
      .select('*, clientes (nombres, apellidos, razon_social)')
      .eq('activo', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setObras(data ?? [])
        setCargando(false)
      })
  }, [])

  async function handleEliminar(id: number | string) {
    const { error } = await supabase
      .from('obras')
      .update({ activo: false })
      .eq('id', id)
    if (error) throw new Error(error.message)
    setObras(prev => prev.filter(o => o.id !== id))
  }

  const cardStyle = { background: 'var(--card-bg)', border: '1px solid var(--card-border)' }
  const tp = { color: 'var(--text-primary)' }
  const ts = { color: 'var(--text-secondary)' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={tp}>Obras</h1>
          <p className="text-sm mt-0.5" style={ts}>
            {cargando ? '...' : `${obras.length} obra${obras.length !== 1 ? 's' : ''} registrada${obras.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/obras/nueva"
          className="bg-action hover:bg-action-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nueva obra
        </Link>
      </div>

      {cargando ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={ts}>Cargando...</p>
        </div>
      ) : obras.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={ts}>No hay obras registradas aún</p>
          <Link
            href="/obras/nueva"
            className="mt-4 inline-block bg-action hover:bg-action-hover text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Registrar primera obra
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {obras.map((obra) => (
            <div
              key={obra.id}
              className="rounded-xl p-5 hover:shadow-md transition-all"
              style={cardStyle}
            >
              <div className="flex items-start justify-between">
                <Link href={`/obras/${obra.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold" style={tp}>{obra.nombre}</h3>
                    {obra.codigo && (
                      <span className="text-xs font-mono" style={ts}>{obra.codigo}</span>
                    )}
                    <EstadoBadge estado={obra.estado} label={ESTADO_OBRA_LABEL[obra.estado]} />
                  </div>
                  <p className="text-sm mb-3" style={ts}>
                    {TIPO_SERVICIO_LABEL[obra.tipo_servicio]} · {obra.direccion}
                    {obra.distrito && `, ${obra.distrito}`}
                  </p>
                  <div className="flex items-center gap-6 text-xs" style={ts}>
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
                </Link>
                <div className="ml-4 flex flex-col items-end gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-bold" style={tp}>{formatPEN(obra.monto_contrato)}</p>
                    <p className="text-xs mt-0.5" style={ts}>monto contrato</p>
                  </div>
                  <AccionesFila
                    id={obra.id}
                    rutaBase="/obras"
                    onEliminar={handleEliminar}
                    tituloModal="¿Eliminar esta obra?"
                    descripcionModal="Dejará de aparecer en los listados. (No se elimina su historial.)"
                    mensajeExito="Obra eliminada"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ESTADO_SOLICITUD_LABEL } from '@/lib/types/solicitudes'

const ESTADOS_OPERATIVOS = [
  'nueva',
  'en_revision',
  'cotizando',
  'cotizacion_enviada',
  'negociando',
  'aprobada',
  'rechazada',
] as const

const ESTADOS_EXCLUIDOS = new Set(['cita_agendada', 'convertida_obra'])

interface Props {
  solicitudId: number
  estadoActual: string
  onSuccess: (nuevoEstado: string) => void
}

export function CambiarEstadoSolicitud({ solicitudId, estadoActual, onSuccess }: Props) {
  const [seleccionado, setSeleccionado] = useState(estadoActual)
  const [loading, setLoading] = useState(false)

  const sinCambio = seleccionado === estadoActual
  const esExcluido = ESTADOS_EXCLUIDOS.has(estadoActual)

  async function handleActualizar() {
    if (sinCambio) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('solicitudes')
      .update({ estado: seleccionado })
      .eq('id', solicitudId)

    if (error) {
      toast.error(`No se pudo actualizar el estado: ${error.message}`)
      setLoading(false)
      return
    }

    const label = ESTADO_SOLICITUD_LABEL[seleccionado] ?? seleccionado
    toast.success(`Estado actualizado a "${label}"`)
    onSuccess(seleccionado)
    setLoading(false)
  }

  const selectStyle = {
    background: 'var(--surface-elevated)',
    border: '1px solid var(--card-border)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={seleccionado}
        onChange={e => setSeleccionado(e.target.value)}
        className="rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        style={selectStyle}
      >
        {esExcluido && (
          <option value={estadoActual} disabled>
            {ESTADO_SOLICITUD_LABEL[estadoActual] ?? estadoActual}
          </option>
        )}
        {ESTADOS_OPERATIVOS.map(v => (
          <option key={v} value={v}>
            {ESTADO_SOLICITUD_LABEL[v]}
          </option>
        ))}
      </select>
      <button
        onClick={handleActualizar}
        disabled={sinCambio || loading}
        className="bg-action hover:bg-action-hover text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40 transition-colors"
      >
        {loading ? 'Guardando...' : 'Actualizar estado'}
      </button>
    </div>
  )
}

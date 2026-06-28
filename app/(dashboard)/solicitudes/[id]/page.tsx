'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatFecha, formatPEN } from '@/lib/utils/formatters'
import {
  ESTADO_SOLICITUD_LABEL,
} from '@/lib/types/solicitudes'
import { EstadoBadge } from '@/components/EstadoBadge'
import { CambiarEstadoSolicitud } from '@/components/solicitudes/CambiarEstadoSolicitud'
import { TIPO_SERVICIO_LABEL } from '@/lib/utils/constants'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmarEliminar } from '@/components/ConfirmarEliminar'

export default function SolicitudDetallePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = Number(params.id)

  const supabase = createClient()

  const [sol, setSol] = useState<any>(null)
  const [citas, setCitas] = useState<any[]>([])
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (isNaN(id)) { setMissing(true); return }

    supabase
      .from('solicitudes')
      .select(`*, clientes (nombres, apellidos, razon_social, telefono, email)`)
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setMissing(true); return }
        setSol(data)
      })

    supabase
      .from('citas')
      .select('*')
      .eq('solicitud_id', id)
      .order('fecha', { ascending: true })
      .then(({ data }) => setCitas(data ?? []))
  }, [id])

  async function handleDelete() {
    const { error } = await supabase
      .from('solicitudes')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error(error.message ?? 'No se pudo eliminar la solicitud')
      throw new Error(error.message)
    }

    toast.success('Solicitud eliminada')
    router.push('/solicitudes')
    router.refresh()
  }

  const cardStyle = { background: 'var(--card-bg)', border: '1px solid var(--card-border)' }
  const tp = { color: 'var(--text-primary)' }
  const ts = { color: 'var(--text-secondary)' }
  const mostrar = (v: any) =>
    v === null || v === undefined || v === '' ? '—' : String(v)

  if (missing) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p style={tp}>Solicitud no encontrada.</p>
        <Link href="/solicitudes" className="text-amber-500 text-sm mt-2 block">← Volver a solicitudes</Link>
      </div>
    )
  }

  if (!sol) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-sm" style={ts}>Cargando...</p>
      </div>
    )
  }

  const nombreCliente =
    sol.clientes?.razon_social ??
    (sol.clientes
      ? `${sol.clientes.nombres ?? ''} ${sol.clientes.apellidos ?? ''}`.trim() || null
      : null)

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold" style={tp}>{sol.titulo}</h1>
            <EstadoBadge estado={sol.estado} label={ESTADO_SOLICITUD_LABEL[sol.estado]} />
            <EstadoBadge estado={sol.prioridad} />
          </div>
          <p className="text-sm" style={ts}>
            {TIPO_SERVICIO_LABEL[sol.tipo_servicio]} · {formatFecha(sol.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ConfirmarEliminar
            trigger={
              <button
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-400 px-3 py-1.5 rounded-lg font-medium transition-colors"
                style={{ border: '1px solid rgba(239,68,68,0.3)' }}
              >
                <Trash2 size={15} />
                Eliminar
              </button>
            }
            titulo="¿Eliminar esta solicitud?"
            descripcion="Esta acción no se puede deshacer y también eliminará sus citas asociadas."
            onConfirm={handleDelete}
          />
          <Link
            href={`/solicitudes/${id}/editar`}
            className="flex items-center gap-1.5 text-sm border border-accent/40 text-accent hover:bg-accent/10 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            <Pencil size={15} />
            Editar
          </Link>
          <Link href="/solicitudes" className="text-sm hover:opacity-70 transition-opacity" style={ts}>
            ← Volver
          </Link>
        </div>
      </div>

      {/* Cambio rápido de estado */}
      <div className="rounded-xl px-5 py-4 mb-4 flex items-center gap-4 flex-wrap" style={cardStyle}>
        <span className="text-sm font-medium shrink-0" style={{ color: 'var(--text-secondary)' }}>
          Cambiar estado:
        </span>
        <CambiarEstadoSolicitud
          key={sol.estado}
          solicitudId={id}
          estadoActual={sol.estado}
          onSuccess={(nuevoEstado) => {
            setSol((prev: any) => ({ ...prev, estado: nuevoEstado }))
            router.refresh()
          }}
        />
      </div>

      {/* Cliente + Ubicación */}
      <div className="grid grid-cols-2 gap-4 mb-4">

        {/* Cliente */}
        <div className="rounded-xl p-5" style={cardStyle}>
          <h2 className="text-sm font-semibold mb-3" style={tp}>Cliente</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs mb-0.5" style={ts}>Nombre</p>
              <p className="text-sm font-medium" style={tp}>{mostrar(nombreCliente)}</p>
            </div>
            <div>
              <p className="text-xs mb-0.5" style={ts}>Teléfono</p>
              <p className="text-sm" style={tp}>{mostrar(sol.clientes?.telefono)}</p>
            </div>
            <div>
              <p className="text-xs mb-0.5" style={ts}>Email</p>
              <p className="text-sm" style={tp}>{mostrar(sol.clientes?.email)}</p>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="rounded-xl p-5" style={cardStyle}>
          <h2 className="text-sm font-semibold mb-3" style={tp}>Ubicación del proyecto</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs mb-0.5" style={ts}>Dirección</p>
              <p className="text-sm" style={tp}>{mostrar(sol.direccion_obra)}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <p className="text-xs mb-0.5" style={ts}>Distrito</p>
                <p className="text-sm" style={tp}>{mostrar(sol.distrito)}</p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={ts}>Provincia</p>
                <p className="text-sm" style={tp}>{mostrar(sol.provincia)}</p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={ts}>Departamento</p>
                <p className="text-sm" style={tp}>{mostrar(sol.departamento)}</p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={ts}>Área (m²)</p>
                <p className="text-sm" style={tp}>{mostrar(sol.area_m2)}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Detalles de la solicitud */}
      <div className="rounded-xl p-5 mb-4" style={cardStyle}>
        <h2 className="text-sm font-semibold mb-3" style={tp}>Detalles de la solicitud</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs mb-0.5" style={ts}>Tipo de servicio</p>
            <p className="text-sm" style={tp}>
              {TIPO_SERVICIO_LABEL[sol.tipo_servicio] ?? mostrar(sol.tipo_servicio)}
            </p>
          </div>
          <div>
            <p className="text-xs mb-0.5" style={ts}>Presupuesto ref.</p>
            <p className="text-sm" style={tp}>
              {sol.presupuesto_ref ? formatPEN(sol.presupuesto_ref) : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs mb-0.5" style={ts}>Fuente</p>
            <p className="text-sm" style={tp}>{mostrar(sol.fuente)}</p>
          </div>
          <div>
            <p className="text-xs mb-0.5" style={ts}>Fecha de registro</p>
            <p className="text-sm" style={tp}>{formatFecha(sol.created_at)}</p>
          </div>
          <div>
            <p className="text-xs mb-0.5" style={ts}>Planos</p>
            <p className="text-sm" style={tp}>
              {sol.tiene_planos ? (
                <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">Tiene planos</span>
              ) : (
                '—'
              )}
            </p>
          </div>
          <div>
            <p className="text-xs mb-0.5" style={ts}>Terreno</p>
            <p className="text-sm" style={tp}>
              {sol.tiene_terreno ? (
                <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded">Tiene terreno</span>
              ) : (
                '—'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="rounded-xl p-5 mb-4" style={cardStyle}>
        <h2 className="text-sm font-semibold mb-2" style={tp}>Descripción</h2>
        <p className="text-sm" style={ts}>{mostrar(sol.descripcion)}</p>
      </div>

      {/* Notas internas */}
      <div className="rounded-xl p-5 mb-4" style={cardStyle}>
        <h2 className="text-sm font-semibold mb-2" style={tp}>Notas internas</h2>
        <p className="text-sm" style={ts}>{mostrar(sol.notas_internas)}</p>
      </div>

      {/* Citas */}
      <div className="rounded-xl p-5 mb-4" style={cardStyle}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={tp}>
            Citas ({citas?.length ?? 0})
          </h2>
          <Link
            href={`/solicitudes/${id}/cita`}
            className="text-sm text-amber-500 hover:text-amber-400 font-medium"
          >
            + Agendar cita
          </Link>
        </div>
        {!citas || citas.length === 0 ? (
          <p className="text-sm text-center py-4" style={ts}>No hay citas agendadas</p>
        ) : (
          <div className="space-y-2">
            {citas.map((c: any) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ border: '1px solid var(--card-border)' }}
              >
                <div>
                  <p className="text-sm font-medium" style={tp}>
                    {formatFecha(c.fecha)} a las {c.hora.slice(0, 5)}
                  </p>
                  <p className="text-xs mt-0.5" style={ts}>
                    {c.tipo_cita} · {c.estado}
                  </p>
                </div>
                <EstadoBadge estado={c.estado} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="rounded-xl p-5" style={cardStyle}>
        <h2 className="text-sm font-semibold mb-4" style={tp}>Acciones</h2>
        <div className="flex gap-3">
          <Link
            href={`/solicitudes/${id}/cotizacion`}
            className="flex-1 text-center bg-action hover:bg-action-hover text-white rounded-lg py-2 text-sm font-medium transition-colors"
          >
            Crear cotización
          </Link>
          {sol.estado !== 'convertida_obra' && (
            <Link
              href={`/obras/nueva?solicitud_id=${id}&cliente_id=${sol.cliente_id}`}
              className="flex-1 text-center rounded-lg py-2 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
            >
              Convertir a obra
            </Link>
          )}
        </div>
      </div>

    </div>
  )
}

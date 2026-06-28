'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatFecha, formatPEN } from '@/lib/utils/formatters'
import { ESTADO_OBRA_LABEL, TIPO_SERVICIO_LABEL } from '@/lib/utils/constants'
import { EstadoBadge } from '@/components/EstadoBadge'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmarEliminar } from '@/components/ConfirmarEliminar'

export default function ObraDetallePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = Number(params.id)

  const supabase = createClient()

  const [obra, setObra] = useState<any>(null)
  const [fases, setFases] = useState<any[]>([])
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (isNaN(id)) { setMissing(true); return }

    supabase
      .from('obras')
      .select('*, clientes (nombres, apellidos, razon_social)')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setMissing(true); return }
        setObra(data)
      })

    supabase
      .from('fases_obra')
      .select('*')
      .eq('obra_id', id)
      .order('orden', { ascending: true })
      .then(({ data }) => setFases(data ?? []))
  }, [id])

  async function handleDelete() {
    const { error } = await supabase
      .from('obras')
      .update({ activo: false })
      .eq('id', id)

    if (error) {
      toast.error(error.message ?? 'No se pudo eliminar la obra')
      throw new Error(error.message)
    }

    toast.success('Obra eliminada')
    router.push('/obras')
    router.refresh()
  }

  const cardStyle = { background: 'var(--card-bg)', border: '1px solid var(--card-border)' }
  const tp = { color: 'var(--text-primary)' }
  const ts = { color: 'var(--text-secondary)' }
  const mostrar = (v: any) =>
    v === null || v === undefined || v === '' ? '—' : String(v)

  if (missing) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p style={tp}>Obra no encontrada.</p>
        <Link href="/obras" className="text-amber-500 text-sm mt-2 block">← Volver a obras</Link>
      </div>
    )
  }

  if (!obra) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-sm" style={ts}>Cargando...</p>
      </div>
    )
  }

  const nombreCliente =
    obra.clientes?.razon_social ??
    (obra.clientes
      ? `${obra.clientes.nombres ?? ''} ${obra.clientes.apellidos ?? ''}`.trim() || null
      : null)

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold" style={tp}>{obra.nombre}</h1>
            <EstadoBadge estado={obra.estado} label={ESTADO_OBRA_LABEL[obra.estado]} />
          </div>
          <p className="text-sm" style={ts}>
            {TIPO_SERVICIO_LABEL[obra.tipo_servicio]}
            {obra.codigo && ` · ${obra.codigo}`}
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
            titulo="¿Eliminar esta obra?"
            descripcion="Dejará de aparecer en los listados. (No se elimina su historial de pagos, reportes ni documentos.)"
            onConfirm={handleDelete}
          />
          <Link
            href={`/obras/${obra.id}/editar`}
            className="flex items-center gap-1.5 text-sm border border-accent/40 text-accent hover:bg-accent/10 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            <Pencil size={15} />
            Editar
          </Link>
          <Link href="/obras" className="text-sm hover:opacity-70 transition-opacity" style={ts}>
            ← Volver
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="rounded-xl p-4" style={cardStyle}>
          <p className="text-xs mb-1" style={ts}>Monto contrato</p>
          <p className="text-xl font-bold" style={tp}>{formatPEN(obra.monto_contrato)}</p>
          <p className="text-xs mt-0.5" style={ts}>{mostrar(obra.moneda)}</p>
        </div>
        <div className="rounded-xl p-4" style={cardStyle}>
          <p className="text-xs mb-1" style={ts}>Inicio planificado</p>
          <p className="text-sm font-semibold" style={tp}>
            {obra.fecha_inicio_planificada ? formatFecha(obra.fecha_inicio_planificada) : '—'}
          </p>
          {obra.fecha_inicio_real && (
            <p className="text-xs mt-1" style={ts}>
              Real: {formatFecha(obra.fecha_inicio_real)}
            </p>
          )}
        </div>
        <div className="rounded-xl p-4" style={cardStyle}>
          <p className="text-xs mb-1" style={ts}>Fin planificado</p>
          <p className="text-sm font-semibold" style={tp}>
            {obra.fecha_fin_planificada ? formatFecha(obra.fecha_fin_planificada) : '—'}
          </p>
          {obra.fecha_fin_real && (
            <p className="text-xs mt-1" style={ts}>
              Real: {formatFecha(obra.fecha_fin_real)}
            </p>
          )}
        </div>
      </div>

      {/* Datos generales + Cliente */}
      <div className="grid grid-cols-2 gap-4 mb-4">

        {/* Datos generales */}
        <div className="rounded-xl p-5" style={cardStyle}>
          <h2 className="text-sm font-semibold mb-3" style={tp}>Datos generales</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs mb-0.5" style={ts}>Código</p>
                <p className="text-sm font-mono" style={tp}>{mostrar(obra.codigo)}</p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={ts}>Tipo de servicio</p>
                <p className="text-sm" style={tp}>
                  {TIPO_SERVICIO_LABEL[obra.tipo_servicio] ?? mostrar(obra.tipo_servicio)}
                </p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={ts}>Área (m²)</p>
                <p className="text-sm" style={tp}>{mostrar(obra.area_m2)}</p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={ts}>Pisos</p>
                <p className="text-sm" style={tp}>{mostrar(obra.pisos)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cliente */}
        <div className="rounded-xl p-5" style={cardStyle}>
          <h2 className="text-sm font-semibold mb-3" style={tp}>Cliente</h2>
          <div>
            <p className="text-xs mb-0.5" style={ts}>Nombre</p>
            <p className="text-sm font-medium" style={tp}>{mostrar(nombreCliente)}</p>
          </div>
        </div>

      </div>

      {/* Ubicación */}
      <div className="rounded-xl p-5 mb-4" style={cardStyle}>
        <h2 className="text-sm font-semibold mb-3" style={tp}>Ubicación</h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs mb-0.5" style={ts}>Dirección</p>
            <p className="text-sm" style={tp}>{mostrar(obra.direccion)}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs mb-0.5" style={ts}>Distrito</p>
              <p className="text-sm" style={tp}>{mostrar(obra.distrito)}</p>
            </div>
            <div>
              <p className="text-xs mb-0.5" style={ts}>Provincia</p>
              <p className="text-sm" style={tp}>{mostrar(obra.provincia)}</p>
            </div>
            <div>
              <p className="text-xs mb-0.5" style={ts}>Departamento</p>
              <p className="text-sm" style={tp}>{mostrar(obra.departamento)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="rounded-xl p-5 mb-4" style={cardStyle}>
        <h2 className="text-sm font-semibold mb-2" style={tp}>Descripción</h2>
        <p className="text-sm" style={ts}>{mostrar(obra.descripcion)}</p>
      </div>

      {/* Notas internas */}
      <div className="rounded-xl p-5 mb-4" style={cardStyle}>
        <h2 className="text-sm font-semibold mb-2" style={tp}>Notas internas</h2>
        <p className="text-sm" style={ts}>{mostrar(obra.notas)}</p>
      </div>

      {/* Fases */}
      <div className="rounded-xl p-5" style={cardStyle}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={tp}>Fases de obra ({fases.length})</h2>
          <Link
            href={`/obras/${obra.id}/fases/nueva`}
            className="text-sm text-amber-500 hover:text-amber-400 font-medium"
          >
            + Agregar fase
          </Link>
        </div>

        {fases.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm mb-3" style={ts}>No hay fases registradas</p>
            <Link
              href={`/obras/${obra.id}/fases/nueva`}
              className="bg-action hover:bg-action-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Agregar primera fase
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {fases.map((fase, index) => (
              <div
                key={fase.id}
                className="flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ border: '1px solid var(--card-border)' }}
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={tp}>{fase.nombre}</p>
                  {fase.descripcion && (
                    <p className="text-xs mt-0.5" style={ts}>{fase.descripcion}</p>
                  )}
                </div>
                <div className="text-right">
                  <EstadoBadge estado={fase.estado} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

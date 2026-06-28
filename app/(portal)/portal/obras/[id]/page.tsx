import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  Check,
  Clock3,
  Info,
  MapPin,
  Building2,
  Layers,
} from 'lucide-react'
import { labelEstadoObra, labelEstadoFase, labelTipoServicio, limpiarDemo } from '@/lib/labels'


type Props = {
  params: Promise<{ id: string }>
}

function formatFecha(input: string | null | undefined) {
  if (!input) return '-'
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return String(input)
  return d.toISOString().slice(0, 10)
}

function porcentajeToNumber(p: number | string | null | undefined) {
  if (p === null || p === undefined) return 0
  const n = typeof p === 'number' ? p : Number(p)
  return Number.isFinite(n) ? n : 0
}

function badgeEstadoClasses(estado: string | null | undefined) {
  const s = (estado ?? '').toLowerCase()

  if (s.includes('complet') || s.includes('completada')) {
    return {
      bg: 'bg-emerald-500/10',
      fg: 'text-emerald-400',
      border: 'border-emerald-500/20',
    }
  }

  if (s.includes('bloq') || s.includes('bloque')) {
    return {
      bg: 'bg-red-500/10',
      fg: 'text-red-400',
      border: 'border-red-500/20',
    }
  }

  if (s.includes('progreso') || s.includes('ejecuc') || s.includes('en_progreso')) {
    return {
      bg: 'bg-amber-500/10',
      fg: 'text-amber-500',
      border: 'border-amber-500/20',
    }
  }

  // pendiente / default
  return {
    bg: 'bg-gray-500/10',
    fg: 'text-gray-400',
    border: 'border-gray-500/20',
  }
}

function BadgeEstado({ estado }: { estado: string | null | undefined }) {
  const classes = badgeEstadoClasses(estado)
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${classes.bg} ${classes.fg} ${classes.border}`}
    >
      <Clock3 size={14} className="opacity-90" />
      {estado ?? 'Sin estado'}
    </span>
  )
}

function getFaseEstado(faseEstado: string | null | undefined) {
  const s = (faseEstado ?? '').toLowerCase()
  if (s.includes('complet')) return 'completada' as const
  if (s.includes('en_progreso') || s.includes('progreso') || s.includes('ejecuc')) return 'en_progreso' as const
  if (s.includes('bloq') || s.includes('bloque')) return 'bloqueada' as const
  return 'pendiente' as const
}

function ProgressRing({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value))
  const r = 52
  const c = 2 * Math.PI * r
  const offset = c * (1 - v / 100)

  return (
    <div className="relative w-[140px] h-[140px] flex items-center justify-center">
      <svg
        width={140}
        height={140}
        viewBox="0 0 140 140"
        className="-rotate-90"
      >
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="transparent"
          stroke="#5e7087"
          strokeWidth="11"
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="transparent"
          stroke="#56a2f0"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-semibold text-[var(--text-primary)] leading-none">
          {Math.round(v)}%
        </div>
        <div className="text-xs text-[var(--text-secondary)] mt-1">avance</div>
      </div>
    </div>
  )
}

export default async function ObraDetallePage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()

  const { data: obra, error: obraError } = await supabase
    .from('obras')
    .select(
      'id, codigo, nombre, tipo_servicio, distrito, estado, monto_contrato'
    )
    .eq('id', id)
    .single()

  if (obraError || !obra) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
          <div className="flex items-center gap-3">
            <ArrowLeft size={18} />
            <h1 className="text-lg font-semibold">Obra no encontrada</h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            No podemos mostrar la información de esta obra.
          </p>
          <div className="mt-4">
            <Link
              href="/portal/obras"
              className="inline-flex items-center rounded-lg bg-amber-500/10 text-amber-500 px-4 py-2 text-sm font-medium hover:bg-amber-500/20 transition-colors"
            >
              Volver a Mis Obras
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { data: fases } = await supabase
    .from('fases_obra')
    .select('id, nombre, descripcion, orden, estado, fecha_inicio, fecha_fin')
    .eq('obra_id', id)
    .order('orden')

  const { data: avances } = await supabase
    .from('avance_obra')
    .select('id, fase_id, fecha, porcentaje, descripcion')
    .eq('obra_id', id)
    .order('fecha', { ascending: false })

  const fasesList = fases ?? []
  const avancesList = avances ?? []

  const ultimoAvancePorFase = new Map<string, (typeof avancesList)[number]>()

  for (const a of avancesList) {
    if (!ultimoAvancePorFase.has(String(a.fase_id))) {
      ultimoAvancePorFase.set(String(a.fase_id), a)
    }
  }

  const avanceFases = fasesList.map((f) => {
    const a = ultimoAvancePorFase.get(String((f as any).id))
    const p = porcentajeToNumber((a as any)?.porcentaje)
    return {
      fase: f,
      ultimoAvance: a ?? null,
      porcentaje: p,
    }
  })

  const avanceGlobal =
    avanceFases.length === 0
      ? 0
      : avanceFases.reduce((acc, x) => acc + x.porcentaje, 0) /
        avanceFases.length

  const formatMonto = (monto: number | null | undefined) => {
    const n = monto ?? 0
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(n)
  }

  const formatFechaMes = (input: string | null | undefined) => {
    if (!input) return '-'
    const d = new Date(input)
    if (Number.isNaN(d.getTime())) return String(input)
    return new Intl.DateTimeFormat('es-PE', {
      month: 'short',
      year: 'numeric',
    }).format(d)
  }

  const formatRango = (inicio: string | null | undefined, fin: string | null | undefined) => {
    if (!inicio && !fin) return '—'
    return `${formatFechaMes(inicio)} – ${formatFechaMes(fin)}`
  }

  const plazoEstado = (fechaFin: string | null | undefined) => {
    if (!fechaFin) return null
    const fin = new Date(fechaFin)
    if (Number.isNaN(fin.getTime())) return null

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    fin.setHours(0, 0, 0, 0)

    const diffMs = fin.getTime() - hoy.getTime()
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDias < 0) return { label: 'Plazo vencido', tone: 'amber' as const }
    if (diffDias < 30) return { label: 'Por vencer', tone: 'amber' as const }
    return { label: 'En plazo', tone: 'green' as const }
  }


  const primeraNoCompletada = avanceFases.find(
    (x) =>
      getFaseEstado(
        ((x.fase as any)?.estado as string | null | undefined) ?? undefined
      ) !== 'completada'
  )

  const faseEnProgreso = avanceFases.find(
    (x) =>
      getFaseEstado(
        ((x.fase as any)?.estado as string | null | undefined) ?? undefined
      ) === 'en_progreso'
  )

  const faseActualNombre =
    faseEnProgreso?.fase?.nombre ?? primeraNoCompletada?.fase?.nombre ?? '—'

  const fasesConDatos = avanceFases

  const ultimaFase = [...fasesConDatos]
    .map(x => x.fase)
    .slice(-1)[0] as any

  const entregaEstimada = ultimaFase?.fecha_fin ?? null

  return (

    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/portal/obras"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--table-row-hover)] transition-colors"
        >
          <ArrowLeft size={16} />
          Volver a Mis Obras
        </Link>
      </div>

      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex justify-start md:justify-center md:col-span-1">
            <ProgressRing value={avanceGlobal} />
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-[var(--text-primary)] leading-tight">
                {obra.nombre}
              </h1>
              <div className="text-sm text-[var(--text-secondary)] flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-2">
                  <MapPin size={16} className="opacity-90" />
                  {obra.distrito}
                </span>
                <span aria-hidden className="opacity-50">·</span>
                <span>{labelTipoServicio(obra.tipo_servicio)}</span>
                <span aria-hidden className="opacity-50">·</span>
                <span className="text-[var(--text-primary)] font-medium">{obra.codigo}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-3">
                <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Contrato
                </div>
                <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                  {formatMonto(obra.monto_contrato as number | null)}
                </div>
              </div>

              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-3">
                <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Estado
                </div>
                  <div className="mt-2">
                    <BadgeEstado estado={labelEstadoObra(obra.estado as string | null)} />
                  </div>
              </div>

              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-3">
                <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Fase actual
                </div>
                <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                  {faseActualNombre}
                </div>
              </div>

              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-3 sm:col-span-3">
                <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Entrega estimada
                </div>
                <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                  {formatFechaMes(entregaEstimada)}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Layers size={18} className="text-amber-500" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Fases del proyecto</h2>
        </div>

        {fasesConDatos.length === 0 ? (
          <div className="rounded-xl border border-[var(--table-border)] bg-[var(--card-bg)] p-6">
            <p className="text-sm text-[var(--text-secondary)]">No hay fases registradas para esta obra.</p>
          </div>
        ) : (
          <div className="relative">
            {fasesConDatos.map(({ fase, ultimoAvance, porcentaje }, idx) => {
              const estadoFase = (fase as any).estado as string | null | undefined
              const estadoNorm = getFaseEstado(estadoFase)
              const isCompletada = estadoNorm === 'completada'
              const isEnProgreso = estadoNorm === 'en_progreso'
              const isBloqueada = estadoNorm === 'bloqueada'
              const isPendiente = estadoNorm === 'pendiente'

              const opacity = isPendiente || isBloqueada ? 'opacity-[0.55]' : 'opacity-100'

              const nodeStyles = (() => {
                if (isCompletada) {
                  return {
                    border: 'border-emerald-400',
                    inner: 'bg-emerald-500',
                    dot: 'bg-emerald-500',
                    connector: 'bg-emerald-500',
                    text: '#34d399',
                  }
                }
                if (isEnProgreso) {
                  return {
                    border: 'border-[#56a2f0]',
                    inner: 'bg-transparent',
                    dot: 'bg-[#56a2f0]',
                    connector: 'bg-[#56a2f0]',
                    text: '#56a2f0',
                  }
                }
                if (isBloqueada) {
                  return {
                    border: 'border-gray-400',
                    inner: 'bg-transparent',
                    dot: 'bg-transparent',
                    connector: 'bg-gray-400',
                    text: '#ef4444',
                  }
                }
                return {
                  border: 'border-gray-400',
                  inner: 'bg-transparent',
                  dot: 'bg-transparent',
                  connector: 'bg-gray-400',
                  text: '#6b7280',
                }
              })()

              const nextConnectorColor = (() => {
                if (idx < fasesConDatos.length - 1) {
                  const next = fasesConDatos[idx + 1]
                  const nextEstado = getFaseEstado((next?.fase as any)?.estado as string | null | undefined)
                  if (estadoNorm === 'completada' && nextEstado === 'completada') return 'bg-emerald-500'
                  if (estadoNorm === 'completada' && nextEstado !== 'completada') return 'bg-emerald-500'
                  if (estadoNorm === 'en_progreso') return 'bg-[#56a2f0]'
                  if (estadoNorm === 'pendiente' || estadoNorm === 'bloqueada') return 'bg-gray-400'
                }
                return 'bg-gray-400'
              })()

              const showConnectorToNext = idx < fasesConDatos.length - 1

              return (
                <div key={String((fase as any).id)} className={`grid grid-cols-[28px_1fr] gap-4 ${opacity} relative`}
                >
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full border-2 ${nodeStyles.border} flex items-center justify-center bg-[var(--card-bg)]`}
                      style={{ boxShadow: 'none' }}
                      aria-label={`Estado fase: ${estadoFase ?? 'pendiente'}`}
                    >
                      {isCompletada ? (
                        <Check size={18} className="text-emerald-400" />
                      ) : isEnProgreso ? (
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#56a2f0' }} />
                      ) : isBloqueada ? (
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} />
                      ) : null}
                    </div>

                    {showConnectorToNext ? (
                      <div
                        className={`w-[2px] mt-0.5 flex-1 ${nextConnectorColor} rounded-full`}
                        style={{ minHeight: '36px' }}
                      />
                    ) : null}
                  </div>

                  <div className="pb-2">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                          Orden {(fase as any).orden}
                        </div>
                        <div className="text-base font-semibold text-[var(--text-primary)]">
                          {String((fase as any).nombre ?? '')}

                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          {Math.round(porcentaje)}%
                        </div>
                      </div>
                    </div>

                    {isEnProgreso ? (
                      <div className="mt-3 space-y-2">
                        <div className="w-full h-2.5 rounded-full bg-[var(--table-row-hover)] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.max(0, Math.min(100, porcentaje))}%`, background: '#56a2f0' }}
                          />
                        </div>

                        {(() => {
                          const estadoPlazo = plazoEstado((fase as any).fecha_fin)
                          if (!estadoPlazo) return null
                          const isVencido = estadoPlazo.label === 'Plazo vencido' || estadoPlazo.label === 'Por vencer'

                          return (
                            <div
                              className={`text-xs font-semibold ${isVencido ? 'text-amber-500' : 'text-emerald-400'}`}
                            >
                              {estadoPlazo.label}
                            </div>
                          )
                        })()}
                      </div>
                    ) : null}


                    {ultimoAvance ? (
                      <div className="mt-3 rounded-lg border border-[var(--table-border)] bg-[var(--card-bg)] p-3">
                        <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                          Último reporte
                        </div>
                        <div className="text-sm font-medium text-[var(--text-primary)] mt-1">
                          {limpiarDemo(ultimoAvance.descripcion) || '—'}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] mt-2">
                          {formatFecha((ultimoAvance as any).fecha)}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 text-sm text-[var(--text-secondary)]">Sin reportes registrados.</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}



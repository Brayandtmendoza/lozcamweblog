import Link from 'next/link'
import { TrendingUp, ClipboardList, CheckCircle, Users, PlusCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Perfil } from '@/lib/auth/getPerfil'
import { formatPEN } from '@/lib/utils/formatters'
import { EstadoBadge } from '@/components/EstadoBadge'
import { TIPO_SERVICIO_LABEL } from '@/lib/utils/constants'
import { ESTADO_SOLICITUD_LABEL } from '@/lib/types/solicitudes'
import { GraficoSolicitudesMes } from './charts/GraficoSolicitudesMes'
import { GraficoTipoServicio } from './charts/GraficoTipoServicio'

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const MESES_COMPLETOS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const PRIORIDAD_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  alta:    { bg: 'bg-red-500/15',    text: 'text-red-600 dark:text-red-400',       label: 'Alta' },
  media:   { bg: 'bg-yellow-500/15', text: 'text-yellow-700 dark:text-yellow-400', label: 'Media' },
  baja:    { bg: 'bg-gray-500/15',   text: 'text-gray-600 dark:text-gray-400',     label: 'Baja' },
  critica: { bg: 'bg-red-600/20',    text: 'text-red-700 dark:text-red-300',       label: 'Crítica' },
}

const FUNNEL_STAGES = [
  { key: 'nueva',       label: 'Nueva',       color: '#1E6FBF' },
  { key: 'en_revision', label: 'En revisión', color: '#3b82f6' },
  { key: 'cotizando',   label: 'Cotizando',   color: '#F5A623' },
  { key: 'aprobada',    label: 'Aprobada',    color: '#10b981' },
] as const

interface Props { perfil: Perfil }

export default async function DashboardVendedor({ perfil }: Props) {
  const supabase = await createClient()

  const [
    { data: rawSolicitudes },
    { count: clientesActivos },
  ] = await Promise.all([
    supabase
      .from('solicitudes')
      .select('id, titulo, tipo_servicio, presupuesto_ref, estado, prioridad, created_at, clientes(nombres, apellidos, razon_social)')
      .order('created_at', { ascending: false }),
    supabase.from('clientes').select('*', { count: 'exact', head: true }).eq('activo', true),
  ])

  const solicitudes = rawSolicitudes ?? []

  const now = new Date()
  const mesIdx = now.getMonth()
  const anio = now.getFullYear()

  // ── KPIs ──────────────────────────────────────────────────────────────
  const nuevas = solicitudes.filter(s => s.estado === 'nueva').length
  const esMes = solicitudes.filter(s => {
    const d = new Date(s.created_at)
    return d.getFullYear() === anio && d.getMonth() === mesIdx
  }).length
  const aprobadas = solicitudes.filter(s => s.estado === 'aprobada').length
  const tasa = solicitudes.length > 0 ? Math.round((aprobadas / solicitudes.length) * 100) : 0

  // ── Embudo ─────────────────────────────────────────────────────────────
  const funnelData = FUNNEL_STAGES.map(stage => ({
    ...stage,
    count: solicitudes.filter(s => s.estado === stage.key).length,
  }))
  const rechazadas = solicitudes.filter(s => s.estado === 'rechazada').length
  const maxFunnel = Math.max(...funnelData.map(s => s.count), 1)

  // ── Solicitudes por mes (últimos 6 meses) ──────────────────────────────
  const porMes = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(anio, mesIdx - (5 - i), 1)
    const yr = d.getFullYear()
    const mo = d.getMonth()
    const count = solicitudes.filter(s => {
      const sd = new Date(s.created_at)
      return sd.getFullYear() === yr && sd.getMonth() === mo
    }).length
    return { mes: MESES_CORTOS[mo], count }
  })

  // ── Por tipo de servicio ────────────────────────────────────────────────
  const tipoMap = new Map<string, number>()
  solicitudes.forEach(s => {
    const k = (s.tipo_servicio as string | null) ?? 'otro'
    tipoMap.set(k, (tipoMap.get(k) ?? 0) + 1)
  })
  const porTipo = [...tipoMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tipo, count]) => ({
      nombre: TIPO_SERVICIO_LABEL[tipo] ?? tipo,
      count,
    }))

  // ── Últimas 8 solicitudes ───────────────────────────────────────────────
  const ultimas8 = solicitudes.slice(0, 8).map(s => {
    const cli = s.clientes as { nombres?: string; apellidos?: string; razon_social?: string } | null
    return {
      id: s.id as number,
      titulo: s.titulo as string,
      cliente: (cli?.razon_social ??
        `${cli?.nombres ?? ''} ${cli?.apellidos ?? ''}`.trim()) || '—',
      tipo: TIPO_SERVICIO_LABEL[s.tipo_servicio as string] ?? (s.tipo_servicio as string) ?? '—',
      presupuesto_ref: s.presupuesto_ref != null ? Number(s.presupuesto_ref) : null,
      prioridad: s.prioridad as string,
      estado: s.estado as string,
    }
  })

  // ── Estilos ─────────────────────────────────────────────────────────────
  const card = { background: 'var(--card-bg)', border: '1px solid var(--card-border)' }
  const tp = { color: 'var(--text-primary)' }
  const ts = { color: 'var(--text-secondary)' }
  const div = '1px solid var(--card-border)'

  const kpis = [
    {
      label: 'Solicitudes nuevas',
      valor: String(nuevas),
      sub: 'sin atender',
      icon: <ClipboardList size={18} className="text-yellow-400" />,
      bg: 'bg-yellow-400/10',
      valColor: 'text-yellow-400',
    },
    {
      label: 'Este mes',
      valor: String(esMes),
      sub: `${MESES_COMPLETOS[mesIdx].toLowerCase()} ${anio}`,
      icon: <TrendingUp size={18} className="text-blue-400" />,
      bg: 'bg-blue-400/10',
      valColor: '',
    },
    {
      label: 'Tasa de conversión',
      valor: `${tasa}%`,
      sub: `${aprobadas} aprobadas / ${solicitudes.length} total`,
      icon: <CheckCircle size={18} className="text-amber-500" />,
      bg: 'bg-amber-500/10',
      valColor: 'text-amber-500',
    },
    {
      label: 'Clientes activos',
      valor: String(clientesActivos ?? 0),
      sub: 'registrados en sistema',
      icon: <Users size={18} className="text-emerald-400" />,
      bg: 'bg-emerald-400/10',
      valColor: 'text-emerald-400',
    },
  ]

  return (
    <div className="space-y-6">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={ts}>
            Panel comercial · {MESES_COMPLETOS[mesIdx]} {anio}
          </p>
          <h1 className="text-2xl font-bold" style={tp}>
            Hola, {perfil.nombre}
          </h1>
        </div>
        <Link
          href="/solicitudes/nueva"
          className="flex items-center gap-2 bg-action hover:bg-action-hover text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shrink-0 mt-1"
        >
          <PlusCircle size={15} />
          Nueva solicitud
        </Link>
      </div>

      {/* ── KPIs ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="rounded-2xl p-5" style={card}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider leading-tight" style={ts}>
                {kpi.label}
              </p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${kpi.bg}`}>
                {kpi.icon}
              </div>
            </div>
            <p className={`text-3xl font-bold leading-none mb-1.5 ${kpi.valColor || ''}`}
               style={kpi.valColor ? {} : tp}>
              {kpi.valor}
            </p>
            <p className="text-xs" style={ts}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* ── EMBUDO DE VENTAS ───────────────────────────────────────────── */}
      <div className="rounded-2xl p-5" style={card}>
        <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold" style={tp}>Embudo de ventas</h2>
            <p className="text-xs mt-0.5" style={ts}>Solicitudes por etapa del proceso comercial</p>
          </div>
          {rechazadas > 0 && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 shrink-0">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              {rechazadas} rechazada{rechazadas !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {funnelData.map(stage => {
            const pct = stage.count > 0
              ? Math.max((stage.count / maxFunnel) * 100, 6)
              : 0
            return (
              <div key={stage.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium" style={ts}>{stage.label}</span>
                  <span className="text-xs font-bold tabular-nums" style={tp}>{stage.count}</span>
                </div>
                <div
                  className="h-9 rounded-xl overflow-hidden"
                  style={{ background: 'var(--card-border)' }}
                >
                  <div
                    className="h-full rounded-xl flex items-center px-3 transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: stage.color,
                    }}
                  >
                    {stage.count > 0 && (
                      <span className="text-white text-xs font-semibold truncate">
                        {stage.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── GRÁFICOS ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={card}>
          <h2 className="text-sm font-semibold" style={tp}>Solicitudes por mes</h2>
          <p className="text-xs mt-0.5 mb-3" style={ts}>Últimos 6 meses</p>
          <GraficoSolicitudesMes data={porMes} />
        </div>
        <div className="rounded-2xl p-5" style={card}>
          <h2 className="text-sm font-semibold" style={tp}>Por tipo de servicio</h2>
          <p className="text-xs mt-0.5 mb-3" style={ts}>Distribución de solicitudes</p>
          <GraficoTipoServicio data={porTipo} />
        </div>
      </div>

      {/* ── TABLA SOLICITUDES RECIENTES ─────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: div }}
        >
          <h2 className="text-sm font-semibold" style={tp}>Solicitudes recientes</h2>
          <Link href="/solicitudes" className="text-xs text-amber-500 hover:text-amber-400 transition-colors">
            Ver todas →
          </Link>
        </div>

        {ultimas8.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm" style={ts}>Sin solicitudes registradas</p>
            <Link href="/solicitudes/nueva" className="mt-3 inline-block text-xs text-amber-500 hover:text-amber-400">
              + Nueva solicitud
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead style={{ background: 'var(--table-header-bg)' }}>
                <tr style={{ borderBottom: div }}>
                  {['Título', 'Cliente', 'Tipo', 'Presupuesto ref.', 'Prioridad', 'Estado'].map(h => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider"
                      style={ts}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ultimas8.map(s => {
                  const prio = PRIORIDAD_STYLE[s.prioridad] ?? PRIORIDAD_STYLE['baja']
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-black/[.04] dark:hover:bg-white/[.04] transition-colors"
                      style={{ borderTop: div }}
                    >
                      <td className="px-5 py-3">
                        <span className="block truncate max-w-[180px] font-medium text-sm" style={tp}>
                          {s.titulo}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs" style={ts}>
                        <span className="block truncate max-w-[130px]">{s.cliente}</span>
                      </td>
                      <td className="px-5 py-3 text-xs whitespace-nowrap" style={ts}>{s.tipo}</td>
                      <td className="px-5 py-3 font-semibold whitespace-nowrap text-amber-500">
                        {s.presupuesto_ref != null ? formatPEN(s.presupuesto_ref) : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${prio.bg} ${prio.text}`}>
                          {prio.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <EstadoBadge
                          estado={s.estado}
                          label={ESTADO_SOLICITUD_LABEL[s.estado] ?? s.estado}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

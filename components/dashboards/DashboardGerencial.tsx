import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  DollarSign, Building2, TrendingUp, ClipboardList, AlertTriangle,
} from 'lucide-react'
import { formatPEN } from '@/lib/utils/formatters'
import { EstadoBadge } from '@/components/EstadoBadge'
import { ESTADO_OBRA_LABEL } from '@/lib/utils/constants'
import { GraficoCobranzaMensual } from '@/components/dashboards/charts/GraficoCobranzaMensual'
import { GraficoCobranzaObra } from '@/components/dashboards/charts/GraficoCobranzaObra'
import { GraficoTopClientes } from '@/components/dashboards/charts/GraficoTopClientes'
import GraficoObrasPorEstado from '@/components/dashboards/charts/GraficoObrasPorEstado'
import GraficoEmbudoSolicitudes from '@/components/dashboards/charts/GraficoEmbudoSolicitudes'

interface Props { perfil: any }

const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const MESES_COMPLETOS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const LABEL_SOLICITUD: Record<string, string> = {
  nueva:              'Nueva',
  cita_agendada:      'Cita agendada',
  en_revision:        'En revisión',
  cotizando:          'Cotizando',
  cotizacion_enviada: 'Cotiz. enviada',
  negociando:         'Negociando',
  aprobada:           'Aprobada',
  rechazada:          'Rechazada',
  convertida_obra:    'Convertida a obra',
}

const EMBUDO_ORDER = [
  'nueva', 'cita_agendada', 'en_revision', 'cotizando',
  'cotizacion_enviada', 'negociando', 'aprobada', 'rechazada', 'convertida_obra',
]

const ESTADOS_TERMINAL = new Set(['aprobada', 'rechazada', 'convertida_obra'])

const ROL_LABEL: Record<string, string> = {
  gerente_general: 'Gerente General',
  subgerente:      'Subgerente',
  administrador:   'Administrador',
}

const GRAVEDAD_STYLE: Record<string, string> = {
  critica:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  grave:    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  moderada: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  leve:     'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

export default async function DashboardGerencial({ perfil }: Props) {
  const supabase = await createClient()

  const [
    { data: rawPagos },
    { data: rawObras },
    { data: rawSolicitudes },
    { data: rawClientes },
    { data: rawIncidencias },
  ] = await Promise.all([
    supabase
      .from('pagos_clientes')
      .select('id, obra_id, cliente_id, monto, estado, fecha_pago, concepto')
      .order('fecha_pago', { ascending: false }),

    supabase
      .from('obras')
      .select('id, nombre, estado, monto_contrato')
      .eq('activo', true),

    supabase
      .from('solicitudes')
      .select('id, estado'),

    supabase
      .from('clientes')
      .select('id, nombres, apellidos, razon_social'),

    supabase
      .from('incidencias')
      .select('id, obra_id, tipo, descripcion, gravedad, created_at, obras(nombre)')
      .in('gravedad', ['grave', 'critica'])
      .eq('resuelto', false)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const pagos       = rawPagos       ?? []
  const obras       = rawObras       ?? []
  const solicitudes = rawSolicitudes ?? []
  const clientes    = rawClientes    ?? []
  const incidencias = rawIncidencias ?? []

  // ── KPIs ────────────────────────────────────────────────────────────────
  const totalCobrado = pagos
    .filter(p => p.estado === 'pagado')
    .reduce((sum, p) => sum + Number(p.monto), 0)

  const obrasActivas = obras.filter(o =>
    o.estado === 'en_ejecucion' || o.estado === 'contratada'
  ).length

  const valorCartera = obras.reduce((sum, o) => sum + Number(o.monto_contrato ?? 0), 0)

  const solicitudesPendientes = solicitudes.filter(s =>
    !ESTADOS_TERMINAL.has(s.estado as string)
  ).length

  const pctCobrado = valorCartera > 0
    ? Math.min(100, Math.round((totalCobrado / valorCartera) * 100))
    : 0
  const porCobrar = Math.max(0, valorCartera - totalCobrado)

  // ── Datos gráficos ───────────────────────────────────────────────────────
  const now    = new Date()
  const mesIdx = now.getMonth()
  const anio   = now.getFullYear()

  const cobranzaMensual = Array.from({ length: 6 }, (_, i) => {
    const d  = new Date(anio, mesIdx - (5 - i), 1)
    const yr = d.getFullYear()
    const mo = d.getMonth() + 1
    const total = pagos
      .filter(p => {
        if (p.estado !== 'pagado' || !p.fecha_pago) return false
        const parts = (p.fecha_pago as string).split('-')
        return Number(parts[0]) === yr && Number(parts[1]) === mo
      })
      .reduce((s, p) => s + Number(p.monto), 0)
    return { mes: MESES_CORTOS[d.getMonth()], total }
  })

  // Cobrado por obra (top 6)
  const obrasMap     = new Map(obras.map(o => [o.id, (o.nombre as string)]))
  const obrasMonto   = new Map<number, number>()
  pagos.filter(p => p.estado === 'pagado').forEach(p => {
    if (p.obra_id == null) return
    const id = p.obra_id as number
    obrasMonto.set(id, (obrasMonto.get(id) ?? 0) + Number(p.monto))
  })
  const topObras = [...obrasMonto.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id, total]) => ({ nombre: obrasMap.get(id) ?? `Obra ${id}`, total }))

  // Top clientes por cobrado
  const clientesMap = new Map(
    clientes.map(c => {
      const nombre = (
        (c.razon_social as string | null) ??
        `${(c.nombres as string | null) ?? ''} ${(c.apellidos as string | null) ?? ''}`.trim()
      ) || `Cliente ${c.id}`
      return [c.id, nombre]
    })
  )
  const clientesMonto = new Map<number, number>()
  pagos.filter(p => p.estado === 'pagado' && p.cliente_id != null).forEach(p => {
    const id = p.cliente_id as number
    clientesMonto.set(id, (clientesMonto.get(id) ?? 0) + Number(p.monto))
  })
  const topClientes = [...clientesMonto.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, total]) => ({ nombre: clientesMap.get(id) ?? `Cliente ${id}`, total }))

  // Obras por estado (donut)
  const obrasPorEstadoMap = new Map<string, number>()
  obras.forEach(o => {
    const estado = o.estado as string
    obrasPorEstadoMap.set(estado, (obrasPorEstadoMap.get(estado) ?? 0) + 1)
  })
  const obrasPorEstado = [...obrasPorEstadoMap.entries()].map(([estado, count]) => ({
    estado,
    label: ESTADO_OBRA_LABEL[estado] ?? estado,
    count,
  }))

  // Embudo solicitudes
  const solMap = new Map<string, number>()
  solicitudes.forEach(s => {
    const e = s.estado as string
    solMap.set(e, (solMap.get(e) ?? 0) + 1)
  })
  const embudoData = EMBUDO_ORDER
    .filter(e => solMap.has(e))
    .map(e => ({
      estado: e,
      label: LABEL_SOLICITUD[e] ?? e,
      count: solMap.get(e) ?? 0,
    }))

  // Pagos pendientes
  const pagosPendientes = pagos.filter(p => p.estado === 'pendiente').slice(0, 5)

  // ── Presentación ────────────────────────────────────────────────────────
  const rolLabel    = ROL_LABEL[perfil.rol as string] ?? 'Gerencia'
  const mesActual   = MESES_COMPLETOS[mesIdx]

  const cardStyle = {
    background: 'var(--card-bg)',
    boxShadow:  'var(--card-shadow)',
    border:     '1px solid var(--card-border)',
  }
  const tp      = { color: 'var(--text-primary)' }
  const ts      = { color: 'var(--text-secondary)' }
  const divider = '1px solid var(--card-border)'

  return (
    <div>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-0.5" style={tp}>Panel Ejecutivo</h1>
        <p className="text-sm" style={ts}>
          {rolLabel} · GRUPO LOZCAM S.A.C · {mesActual} {anio}
        </p>
      </div>

      {/* ── KPIs ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={ts}>
              Total cobrado
            </p>
            <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
              <DollarSign size={18} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold mb-1 text-green-500">{formatPEN(totalCobrado)}</p>
          <p className="text-xs" style={ts}>pagos confirmados</p>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={ts}>
              Obras activas
            </p>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Building2 size={18} className="text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1" style={tp}>{obrasActivas}</p>
          <p className="text-xs" style={ts}>en ejecución o contratadas</p>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={ts}>
              Valor de cartera
            </p>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <TrendingUp size={18} className="text-amber-500" />
            </div>
          </div>
          <p className="text-xl font-bold mb-1 text-accent">{formatPEN(valorCartera)}</p>
          <p className="text-xs" style={ts}>monto contratado activo</p>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={ts}>
              Solicitudes abiertas
            </p>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <ClipboardList size={18} className="text-purple-500" />
            </div>
          </div>
          <p className={`text-3xl font-bold mb-1 ${solicitudesPendientes > 0 ? 'text-purple-500' : ''}`}
             style={solicitudesPendientes === 0 ? tp : undefined}>
            {solicitudesPendientes}
          </p>
          <p className="text-xs" style={ts}>sin cerrar</p>
        </div>

      </div>

      {/* ── Cartera progress ────────────────────────────────────────────── */}
      {valorCartera > 0 && (
        <div className="rounded-2xl p-5 mb-4" style={cardStyle}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold" style={tp}>Ejecución de cartera</h2>
            <span className="text-sm font-bold text-accent">{pctCobrado}%</span>
          </div>
          <div
            className="h-3 rounded-full overflow-hidden mb-3"
            style={{ background: 'var(--card-border)' }}
          >
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-700"
              style={{ width: `${pctCobrado}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <span className="text-xs" style={ts}>
              Cobrado: <span className="font-semibold text-green-500">{formatPEN(totalCobrado)}</span>
            </span>
            <span className="text-xs" style={ts}>
              Cartera total: <span className="font-semibold" style={tp}>{formatPEN(valorCartera)}</span>
            </span>
            <span className="text-xs" style={ts}>
              Por cobrar: <span className="font-semibold text-amber-500">{formatPEN(porCobrar)}</span>
            </span>
          </div>
        </div>
      )}

      {/* ── Cobranza mensual ────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5 mb-4" style={cardStyle}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={tp}>Cobranza mensual</h2>
          <Link href="/pagos" className="text-xs text-amber-500 hover:text-amber-400">
            Ver pagos →
          </Link>
        </div>
        <GraficoCobranzaMensual data={cobranzaMensual} />
      </div>

      {/* ── Cobrado por obra + Top clientes ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={tp}>Cobrado por obra</h2>
            <Link href="/obras" className="text-xs text-amber-500 hover:text-amber-400">
              Ver obras →
            </Link>
          </div>
          <GraficoCobranzaObra data={topObras} />
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={tp}>Top clientes</h2>
            <Link href="/clientes" className="text-xs text-amber-500 hover:text-amber-400">
              Ver clientes →
            </Link>
          </div>
          <GraficoTopClientes data={topClientes} />
        </div>

      </div>

      {/* ── Obras por estado + Embudo solicitudes ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={tp}>Obras por estado</h2>
            <span className="text-xs" style={ts}>{obras.length} obras activas</span>
          </div>
          <GraficoObrasPorEstado data={obrasPorEstado} />
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={tp}>Embudo de solicitudes</h2>
            <Link href="/solicitudes" className="text-xs text-amber-500 hover:text-amber-400">
              Ver todas →
            </Link>
          </div>
          <GraficoEmbudoSolicitudes data={embudoData} />
        </div>

      </div>

      {/* ── Alertas ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Incidencias críticas */}
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div
            className="px-5 py-4 flex items-center gap-2"
            style={{ borderBottom: divider }}
          >
            <AlertTriangle size={15} className="text-red-500 shrink-0" />
            <h2 className="text-sm font-semibold" style={tp}>Incidencias graves / críticas</h2>
          </div>
          {incidencias.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-green-500">Sin incidencias graves abiertas ✅</p>
            </div>
          ) : (
            incidencias.map((inc: any) => {
              const obraNombre = (inc.obras?.nombre as string | null) ?? '—'
              return (
                <div
                  key={inc.id}
                  className="px-5 py-3"
                  style={{ borderBottom: divider }}
                >
                  <div className="flex items-center justify-between mb-0.5 gap-2">
                    <span className="text-xs font-medium truncate" style={tp}>
                      {obraNombre}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 uppercase tracking-wide ${GRAVEDAD_STYLE[inc.gravedad as string] ?? GRAVEDAD_STYLE['leve']}`}>
                      {inc.gravedad}
                    </span>
                  </div>
                  <p className="text-xs" style={ts}>
                    {inc.tipo ? (inc.tipo as string).replace(/_/g, ' ') : ''}
                    {inc.descripcion ? ` · ${(inc.descripcion as string).slice(0, 70)}` : ''}
                  </p>
                </div>
              )
            })
          )}
        </div>

        {/* Pagos pendientes */}
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: divider }}
          >
            <h2 className="text-sm font-semibold" style={tp}>Pagos por verificar</h2>
            <Link href="/pagos" className="text-xs text-amber-500 hover:text-amber-400">
              Ver todos →
            </Link>
          </div>
          {pagosPendientes.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-green-500">Sin pagos pendientes ✅</p>
            </div>
          ) : (
            pagosPendientes.map((p: any) => {
              const obraNombre = obrasMap.get(p.obra_id as number) ?? '—'
              return (
                <Link
                  key={p.id}
                  href={`/pagos/${p.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  style={{ borderBottom: divider }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={tp}>
                      {(p.concepto as string | null) ?? '—'}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={ts}>{obraNombre}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-amber-500">
                      {formatPEN(Number(p.monto))}
                    </p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 font-medium">
                      Pendiente
                    </span>
                  </div>
                </Link>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}

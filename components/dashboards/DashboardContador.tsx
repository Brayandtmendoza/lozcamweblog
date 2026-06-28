import Link from 'next/link'
import { DollarSign, TrendingUp, Clock, FileText, PlusCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Perfil } from '@/lib/auth/getPerfil'
import { formatPEN, formatFecha } from '@/lib/utils/formatters'
import { EstadoBadge } from '@/components/EstadoBadge'
import { ESTADO_PAGO_LABEL } from '@/lib/types/pagos'
import { GraficoCobranzaMensual } from './charts/GraficoCobranzaMensual'
import { GraficoCobranzaObra } from './charts/GraficoCobranzaObra'
import { GraficoTopClientes } from './charts/GraficoTopClientes'

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const MESES_COMPLETOS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

interface Props { perfil: Perfil }

export default async function DashboardContador({ perfil }: Props) {
  const supabase = await createClient()

  const [
    { data: rawPagos },
    { data: obras },
    { data: clientes },
    { count: presupuestosVigentes },
  ] = await Promise.all([
    supabase
      .from('pagos_clientes')
      .select('id, obra_id, cliente_id, concepto, monto, fecha_pago, estado')
      .order('fecha_pago', { ascending: false }),
    supabase.from('obras').select('id, nombre'),
    supabase.from('clientes').select('id, nombres, apellidos, razon_social'),
    supabase
      .from('presupuestos')
      .select('*', { count: 'exact', head: true })
      .or('es_vigente.eq.true,estado.eq.aprobado'),
  ])

  const pagos = rawPagos ?? []

  const obrasMap = new Map<number, string>(
    (obras ?? []).map(o => [o.id as number, o.nombre as string])
  )
  const clientesMap = new Map<number, string>(
    (clientes ?? []).map(c => [
      c.id as number,
      ((c.razon_social as string | null) ??
        `${(c.nombres as string | null) ?? ''} ${(c.apellidos as string | null) ?? ''}`.trim()) ||
        `Cliente ${c.id}`,
    ])
  )

  const now = new Date()
  const mesIdx = now.getMonth()     // 0-based
  const anio = now.getFullYear()

  // ── KPIs ──────────────────────────────────────────────────────────────
  const totalCobrado = pagos
    .filter(p => p.estado === 'pagado')
    .reduce((s, p) => s + Number(p.monto), 0)

  const cobradoMes = pagos
    .filter(p => {
      if (p.estado !== 'pagado') return false
      const [yr, mo] = (p.fecha_pago as string).split('-').map(Number)
      return yr === anio && mo === mesIdx + 1
    })
    .reduce((s, p) => s + Number(p.monto), 0)

  const pendienteCobro = pagos
    .filter(p => p.estado === 'pendiente')
    .reduce((s, p) => s + Number(p.monto), 0)

  // ── Cobranza mensual (últimos 6 meses) ────────────────────────────────
  const cobranzaMensual = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(anio, mesIdx - (5 - i), 1)
    const yr = d.getFullYear()
    const mo = d.getMonth() + 1
    const total = pagos
      .filter(p => {
        if (p.estado !== 'pagado') return false
        const [pYr, pMo] = (p.fecha_pago as string).split('-').map(Number)
        return pYr === yr && pMo === mo
      })
      .reduce((s, p) => s + Number(p.monto), 0)
    return { mes: MESES_CORTOS[d.getMonth()], total }
  })

  // ── Top 5 obras ───────────────────────────────────────────────────────
  const obrasMonto = new Map<number, number>()
  pagos
    .filter(p => p.estado === 'pagado')
    .forEach(p => {
      const id = p.obra_id as number
      obrasMonto.set(id, (obrasMonto.get(id) ?? 0) + Number(p.monto))
    })
  const topObras = [...obrasMonto.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, total]) => ({ nombre: obrasMap.get(id) ?? `Obra ${id}`, total }))

  // ── Top 5 clientes ────────────────────────────────────────────────────
  const clientesMonto = new Map<number, number>()
  pagos
    .filter(p => p.estado === 'pagado' && p.cliente_id != null)
    .forEach(p => {
      const id = p.cliente_id as number
      clientesMonto.set(id, (clientesMonto.get(id) ?? 0) + Number(p.monto))
    })
  const topClientes = [...clientesMonto.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, total]) => ({ nombre: clientesMap.get(id) ?? `Cliente ${id}`, total }))

  // ── Últimos 8 pagos para tabla ─────────────────────────────────────────
  const ultimos8 = pagos.slice(0, 8).map(p => ({
    id: p.id as number,
    obraNombre: obrasMap.get(p.obra_id as number) ?? '—',
    concepto: p.concepto as string,
    fecha_pago: p.fecha_pago as string,
    monto: Number(p.monto),
    estado: p.estado as string,
  }))

  // ── Estilos ────────────────────────────────────────────────────────────
  const card = {
    background: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
  }
  const tp = { color: 'var(--text-primary)' }
  const ts = { color: 'var(--text-secondary)' }
  const div = '1px solid var(--card-border)'

  const kpis = [
    {
      label: 'Total cobrado',
      valor: formatPEN(totalCobrado),
      sub: `${pagos.filter(p => p.estado === 'pagado').length} pagos confirmados`,
      icon: <DollarSign size={18} className="text-amber-500" />,
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Cobrado este mes',
      valor: formatPEN(cobradoMes),
      sub: `${MESES_COMPLETOS[mesIdx].toLowerCase()} ${anio}`,
      icon: <TrendingUp size={18} className="text-emerald-400" />,
      bg: 'bg-emerald-400/10',
    },
    {
      label: 'Pendiente de cobro',
      valor: formatPEN(pendienteCobro),
      sub: `${pagos.filter(p => p.estado === 'pendiente').length} pagos sin confirmar`,
      icon: <Clock size={18} className="text-yellow-400" />,
      bg: 'bg-yellow-400/10',
    },
    {
      label: 'Presupuestos vigentes',
      valor: String(presupuestosVigentes ?? 0),
      sub: 'aprobados o activos',
      icon: <FileText size={18} className="text-blue-400" />,
      bg: 'bg-blue-400/10',
      esCuenta: true,
    },
  ]

  return (
    <div className="space-y-6">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={ts}>
            Panel financiero · {MESES_COMPLETOS[mesIdx]} {anio}
          </p>
          <h1 className="text-2xl font-bold" style={tp}>
            Hola, {perfil.nombre}
          </h1>
        </div>
        <Link
          href="/pagos/nuevo"
          className="flex items-center gap-2 bg-action hover:bg-action-hover text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shrink-0 mt-1"
        >
          <PlusCircle size={15} />
          Registrar pago
        </Link>
      </div>

      {/* ── KPIs ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-2xl p-5" style={card}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider leading-tight" style={ts}>
                {kpi.label}
              </p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${kpi.bg}`}>
                {kpi.icon}
              </div>
            </div>
            <p className={`font-bold leading-none mb-1.5 text-amber-500 ${kpi.esCuenta ? 'text-3xl' : 'text-xl'}`}>
              {kpi.valor}
            </p>
            <p className="text-xs" style={ts}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* ── GRÁFICO COBRANZA MENSUAL ────────────────────────────────────── */}
      <div className="rounded-2xl p-5" style={card}>
        <div className="mb-4">
          <h2 className="text-sm font-semibold" style={tp}>Cobranza mensual</h2>
          <p className="text-xs mt-0.5" style={ts}>Últimos 6 meses · pagos confirmados (S/)</p>
        </div>
        <GraficoCobranzaMensual data={cobranzaMensual} />
      </div>

      {/* ── PIE + TOP CLIENTES ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={card}>
          <h2 className="text-sm font-semibold" style={tp}>Cobranza por obra</h2>
          <p className="text-xs mt-0.5 mb-3" style={ts}>Top 5 proyectos por monto cobrado</p>
          <GraficoCobranzaObra data={topObras} />
        </div>

        <div className="rounded-2xl p-5" style={card}>
          <h2 className="text-sm font-semibold" style={tp}>Top clientes</h2>
          <p className="text-xs mt-0.5 mb-3" style={ts}>Top 5 por monto cobrado total</p>
          <GraficoTopClientes data={topClientes} />
        </div>
      </div>

      {/* ── TABLA ÚLTIMOS PAGOS ─────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: div }}
        >
          <h2 className="text-sm font-semibold" style={tp}>Últimos pagos</h2>
          <Link href="/pagos" className="text-xs text-amber-500 hover:text-amber-400 transition-colors">
            Ver todos →
          </Link>
        </div>

        {ultimos8.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm" style={ts}>No hay pagos registrados aún</p>
            <Link
              href="/pagos/nuevo"
              className="mt-3 inline-block text-xs text-amber-500 hover:text-amber-400"
            >
              + Registrar primer pago
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead style={{ background: 'var(--table-header-bg)' }}>
                <tr style={{ borderBottom: div }}>
                  {['Proyecto', 'Concepto', 'Fecha', 'Monto', 'Estado'].map(h => (
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
                {ultimos8.map(p => (
                  <tr
                    key={p.id}
                    className="hover:bg-black/[.04] dark:hover:bg-white/[.04] transition-colors"
                    style={{ borderTop: div }}
                  >
                    <td className="px-5 py-3" style={tp}>
                      <span className="block truncate max-w-[180px] font-medium text-sm">
                        {p.obraNombre}
                      </span>
                    </td>
                    <td className="px-5 py-3" style={ts}>
                      <span className="block truncate max-w-[200px] text-xs">{p.concepto}</span>
                    </td>
                    <td className="px-5 py-3 text-xs whitespace-nowrap" style={ts}>
                      {formatFecha(p.fecha_pago + 'T12:00:00')}
                    </td>
                    <td className="px-5 py-3 font-semibold whitespace-nowrap text-amber-500">
                      {formatPEN(p.monto)}
                    </td>
                    <td className="px-5 py-3">
                      <EstadoBadge estado={p.estado} label={ESTADO_PAGO_LABEL[p.estado]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

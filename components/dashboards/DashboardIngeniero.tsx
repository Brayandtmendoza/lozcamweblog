import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Building2, TrendingUp, Hammer, AlertTriangle } from 'lucide-react'
import { EstadoBadge } from '@/components/EstadoBadge'
import { ESTADO_OBRA_LABEL } from '@/lib/utils/constants'
import { formatFecha } from '@/lib/utils/formatters'
import GraficoAvanceObras from '@/components/dashboards/charts/GraficoAvanceObras'

interface Props {
  perfil: any
}

function barColorClass(pct: number): string {
  if (pct >= 80) return 'bg-green-500'
  if (pct >= 30) return 'bg-amber-500'
  return 'bg-slate-400'
}

export default async function DashboardIngeniero({ perfil }: Props) {
  const supabase = await createClient()

  // ── 1. Obras donde este ingeniero es residente ───────────────────────────
  const { data: obras, error: obrasError } = await supabase
    .from('obras')
    .select('id, nombre, estado, distrito, clientes(nombres, apellidos, razon_social)')
    .eq('residente_id', perfil.id)
    .eq('activo', true)
    .order('created_at', { ascending: false })

  if (obrasError) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-red-500">Error al cargar tus obras. Intenta de nuevo.</p>
      </div>
    )
  }

  const obrasList = obras ?? []
  const obraIds = obrasList.map(o => o.id)

  // ── 2. Datos relacionados en paralelo ────────────────────────────────────
  const [fasesRes, avancesRes, incidenciasRes, reportesRes] = await Promise.all([
    obraIds.length > 0
      ? supabase
          .from('fases_obra')
          .select('id, obra_id, nombre, orden, estado')
          .in('obra_id', obraIds)
          .order('orden', { ascending: true })
      : Promise.resolve({ data: [] as any[], error: null }),

    obraIds.length > 0
      ? supabase
          .from('avance_obra')
          .select('fase_id, obra_id, porcentaje, created_at')
          .in('obra_id', obraIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as any[], error: null }),

    obraIds.length > 0
      ? supabase
          .from('incidencias')
          .select('id, obra_id, tipo, descripcion, gravedad, created_at')
          .in('obra_id', obraIds)
          .eq('resuelto', false)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as any[], error: null }),

    obraIds.length > 0
      ? supabase
          .from('reportes_diarios')
          .select('id, obra_id, fecha, descripcion, created_at')
          .in('obra_id', obraIds)
          .order('fecha', { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] as any[], error: null }),
  ])

  const fases       = fasesRes.data       ?? []
  const avances     = avancesRes.data     ?? []
  const incidencias = incidenciasRes.data ?? []
  const reportes    = reportesRes.data    ?? []

  // ── 3. Calcular avance por obra ──────────────────────────────────────────
  // avances está ordenado por created_at desc → primer registro por fase_id = más reciente
  const latestAvanceByFase = new Map<number, number>()
  for (const av of avances) {
    if (!latestAvanceByFase.has(av.fase_id)) {
      latestAvanceByFase.set(av.fase_id, Number(av.porcentaje))
    }
  }

  const fasesByObra = new Map<number, typeof fases>()
  for (const f of fases) {
    const list = fasesByObra.get(f.obra_id) ?? []
    list.push(f)
    fasesByObra.set(f.obra_id, list)
  }

  const avancePorObra = new Map<number, number>()
  for (const obra of obrasList) {
    const obraFases = fasesByObra.get(obra.id) ?? []
    if (obraFases.length === 0) {
      avancePorObra.set(obra.id, 0)
    } else {
      const sum = obraFases.reduce(
        (acc, f) => acc + (latestAvanceByFase.get(f.id) ?? 0),
        0
      )
      avancePorObra.set(obra.id, Math.round(sum / obraFases.length))
    }
  }

  // ── 4. KPIs ──────────────────────────────────────────────────────────────
  const totalObras        = obrasList.length
  const totalEnEjecucion  = obrasList.filter(o => o.estado === 'en_ejecucion').length
  const totalIncidencias  = incidencias.length
  const pctValues         = [...avancePorObra.values()]
  const avancePromedio    = pctValues.length > 0
    ? Math.round(pctValues.reduce((a, b) => a + b, 0) / pctValues.length)
    : 0

  // ── 5. Datos para gráfico ────────────────────────────────────────────────
  const chartData = obrasList.map(o => ({
    nombre: o.nombre.length > 22 ? o.nombre.slice(0, 20) + '…' : o.nombre,
    avance: avancePorObra.get(o.id) ?? 0,
  }))

  // ── 6. Saludo ────────────────────────────────────────────────────────────
  const nombreDisplay = perfil.nombre?.trim() || ''
  const saludo        = nombreDisplay ? `Hola, ${nombreDisplay}` : 'Hola 👋'

  // Estilos
  const cardStyle = {
    background: 'var(--card-bg)',
    boxShadow: 'var(--card-shadow)',
    border: '1px solid var(--card-border)',
  }
  const tp = { color: 'var(--text-primary)' }
  const ts = { color: 'var(--text-secondary)' }
  const divider = '1px solid var(--card-border)'

  return (
    <div>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-0.5" style={tp}>{saludo}</h1>
        <p className="text-sm" style={ts}>Ingeniero Residente · GRUPO LOZCAM S.A.C</p>
      </div>

      {/* ── KPIs ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={ts}>
              Obras a mi cargo
            </p>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Building2 size={18} className="text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1" style={tp}>{totalObras}</p>
          <p className="text-xs" style={ts}>{totalEnEjecucion} en ejecución</p>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={ts}>
              Avance promedio
            </p>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <TrendingUp size={18} className="text-amber-500" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1 text-accent">{avancePromedio}%</p>
          <p className="text-xs" style={ts}>entre todas tus obras</p>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={ts}>
              En ejecución
            </p>
            <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Hammer size={18} className="text-green-500" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1 text-green-500">{totalEnEjecucion}</p>
          <p className="text-xs" style={ts}>obras activas</p>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={ts}>
              Incidencias abiertas
            </p>
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
          </div>
          <p
            className={`text-3xl font-bold mb-1 ${totalIncidencias > 0 ? 'text-red-500' : ''}`}
            style={totalIncidencias === 0 ? tp : undefined}
          >
            {totalIncidencias}
          </p>
          <p className="text-xs" style={ts}>sin resolver</p>
        </div>

      </div>

      {/* ── Mis obras ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden mb-4" style={cardStyle}>
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: divider }}
        >
          <h2 className="text-sm font-semibold" style={tp}>Mis obras</h2>
          <Link href="/obras" className="text-xs text-amber-500 hover:text-amber-400">
            Ver todas →
          </Link>
        </div>

        {obrasList.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm mb-1" style={ts}>No tienes obras asignadas aún</p>
            <p className="text-xs" style={ts}>
              Contacta al administrador para recibir una asignación
            </p>
          </div>
        ) : (
          obrasList.map(obra => {
            const avancePct    = avancePorObra.get(obra.id) ?? 0
            const clienteObj   = (obra as any).clientes
            const nombreCliente =
              (clienteObj?.razon_social ??
              [clienteObj?.nombres, clienteObj?.apellidos].filter(Boolean).join(' ')) ||
              null

            return (
              <Link
                key={obra.id}
                href={`/obras/${obra.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                style={{ borderBottom: divider }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-medium" style={tp}>{obra.nombre}</p>
                    <EstadoBadge estado={obra.estado} label={ESTADO_OBRA_LABEL[obra.estado]} />
                  </div>
                  {(nombreCliente || obra.distrito) && (
                    <p className="text-xs mb-2" style={ts}>
                      {[nombreCliente, obra.distrito].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColorClass(avancePct)}`}
                        style={{ width: `${avancePct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold shrink-0 w-10 text-right" style={ts}>
                      {avancePct}%
                    </span>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* ── Gráfico avance ────────────────────────────────────────────────── */}
      {obrasList.length > 0 && (
        <div className="rounded-2xl p-5 mb-4" style={cardStyle}>
          <h2 className="text-sm font-semibold mb-4" style={tp}>Avance por obra</h2>
          <GraficoAvanceObras data={chartData} />
        </div>
      )}

      {/* ── Actividad reciente ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Reportes recientes */}
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: divider }}
          >
            <h2 className="text-sm font-semibold" style={tp}>Reportes recientes</h2>
            <Link href="/reportes" className="text-xs text-amber-500 hover:text-amber-400">
              Ver todos →
            </Link>
          </div>
          {reportes.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm" style={ts}>No hay reportes recientes</p>
            </div>
          ) : (
            reportes.map((r: any) => {
              const obraDeReporte = obrasList.find(o => o.id === r.obra_id)
              return (
                <Link
                  key={r.id}
                  href={`/reportes/${r.id}`}
                  className="flex items-start gap-3 px-5 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  style={{ borderBottom: divider }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={tp}>{formatFecha(r.fecha)}</p>
                    <p className="text-xs truncate mt-0.5" style={ts}>
                      {obraDeReporte?.nombre ?? '—'}
                      {r.descripcion ? ` · ${r.descripcion.slice(0, 55)}` : ''}
                    </p>
                  </div>
                </Link>
              )
            })
          )}
        </div>

        {/* Incidencias sin resolver */}
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div className="px-5 py-4" style={{ borderBottom: divider }}>
            <h2 className="text-sm font-semibold" style={tp}>Incidencias sin resolver</h2>
          </div>
          {incidencias.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-green-500">Sin incidencias abiertas ✅</p>
            </div>
          ) : (
            incidencias.slice(0, 5).map((inc: any) => (
              <div
                key={inc.id}
                className="px-5 py-3"
                style={{ borderBottom: divider }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium uppercase tracking-wide" style={tp}>
                    {(inc.tipo ?? 'incidencia').replace(/_/g, ' ')}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    inc.gravedad === 'critica'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : inc.gravedad === 'grave'
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      : inc.gravedad === 'moderada'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {inc.gravedad
                      ? inc.gravedad.charAt(0).toUpperCase() + inc.gravedad.slice(1)
                      : 'Leve'}
                  </span>
                </div>
                <p className="text-xs" style={ts}>
                  {inc.descripcion ? inc.descripcion.slice(0, 90) : '—'}
                </p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}

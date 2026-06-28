import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { labelEstadoObra, labelTipoServicio } from '@/lib/labels'
import {
  MapPin,
  Wallet,
  Navigation,
  Receipt,
  ClipboardList,
  Building2,
  ArrowRight,
} from 'lucide-react'

function safeNumber(n: any): number {
  const x = typeof n === 'number' ? n : Number(n)
  return Number.isFinite(x) ? x : 0
}

function formatPen(value: number) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 2,
  }).format(value)
}

function porcentajeToNumber(p: number | string | null | undefined) {
  if (p === null || p === undefined) return 0
  const n = typeof p === 'number' ? p : Number(p)
  return Number.isFinite(n) ? n : 0
}

function avanceGlobalPorFases(fases: any[]) {
  if (!fases?.length) return 0
  const sum = fases.reduce((acc: number, f: any) => acc + porcentajeToNumber(f.porcentaje), 0)
  return sum / fases.length
}

function getFaseEstado(estado: string | null | undefined) {
  const s = (estado ?? '').toLowerCase()
  if (s.includes('complet')) return 'completada'
  if (s.includes('en_progreso') || s.includes('progreso') || s.includes('ejecuc')) return 'en_progreso'
  if (s.includes('bloq') || s.includes('bloque')) return 'bloqueada'
  return 'pendiente'
}

function ProgressRing({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value))
  const r = 52
  const c = 2 * Math.PI * r
  const offset = c * (1 - v / 100)

  return (
    <div className="relative w-[140px] h-[140px] flex items-center justify-center">
      <svg width={140} height={140} viewBox="0 0 140 140" className="-rotate-90">
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

export default async function PortalPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, nombre, apellidos, rol, cliente_id')
    .eq('id', user.id)
    .maybeSingle()

  const clienteNombre =
    (profile?.nombre ?? profile?.apellidos ?? 'Cliente').toString().trim() || 'Cliente'

  const { data: obras } = await supabase
    .from('obras')
    .select('id, nombre, tipo_servicio, distrito, estado, monto_contrato')
    .order('created_at', { ascending: false })
    .limit(1)

  const obra = obras?.[0] ?? null

  let faseActualNombre = '—'
  let avanceGlobal = 0

  if (obra) {
    const { data: fases_obra } = await supabase
      .from('fases_obra')
      .select('estado, orden, nombre, id')
      .eq('obra_id', obra.id)
      .order('orden')

    const { data: avances } = await supabase
      .from('avance_obra')
      .select('fase_id, porcentaje')
      .eq('obra_id', obra.id)
      .order('fecha', { ascending: false })

    const fases = fases_obra ?? []

    // Usar el mismo método que detalle: por fase, tomar el último avance.
    const ultimoAvancePorFase = new Map<string, any>()
    for (const a of avances ?? []) {
      const fid = String(a.fase_id)
      if (!ultimoAvancePorFase.has(fid)) ultimoAvancePorFase.set(fid, a)
    }

    const avanceFases = fases.map((f: any) => {
      const a = ultimoAvancePorFase.get(String(f.id))
      return {
        fase: f,
        porcentaje: porcentajeToNumber(a?.porcentaje),
      }
    })

    avanceGlobal = avanceGlobalPorFases(avanceFases)

    const primeraNoCompletada = avanceFases.find(
      (x: any) =>
        getFaseEstado(x.fase.estado) !== 'completada'
    )

    const faseEnProgreso = avanceFases.find(
      (x: any) => getFaseEstado(x.fase.estado) === 'en_progreso'
    )

    faseActualNombre =
      faseEnProgreso?.fase?.nombre ??
      primeraNoCompletada?.fase?.nombre ??
      '—'
  }

  const { data: pagos } = await supabase
    .from('pagos_clientes')
    .select('monto, estado')

  const pagosList = pagos ?? []
  const totalPagado = pagosList
    .filter((p: any) => String(p.estado ?? '').toLowerCase() === 'pagado')
    .reduce((acc: number, p: any) => acc + safeNumber(p.monto), 0)

  const totalPendiente = pagosList
    .filter((p: any) => String(p.estado ?? '').toLowerCase() === 'pendiente')
    .reduce((acc: number, p: any) => acc + safeNumber(p.monto), 0)

  const contractMonto = safeNumber(obra?.monto_contrato)
  const porcentajePendiente = contractMonto > 0 ? Math.round((totalPendiente / contractMonto) * 100) : 0
  const hasObra = Boolean(obra)

  const { data: solicitudes } = await supabase
    .from('solicitudes')
    .select('id, estado')

  const solicitudesCount = solicitudes?.length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <div className="text-3xl md:text-4xl font-semibold text-[var(--text-primary)]">
          Hola, {clienteNombre}
        </div>
        <div className="text-sm md:text-base text-[var(--text-secondary)] mt-2">
          Este es el estado actual de tu proyecto con LOZCAM
        </div>
      </div>

      {/* Card hero obra */}
      <Link
        href={obra ? `/portal/obras/${obra.id}` : '/portal/obras'}
        className={`block rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 transition-colors hover:bg-[var(--table-row-hover)] ${
          hasObra ? '' : 'pointer-events-none opacity-90'
        }`}
        aria-disabled={!hasObra}
      >
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-center">
          <div className="flex justify-center">
            <ProgressRing value={avanceGlobal} />
          </div>

          <div className="space-y-3">
            {obra ? (
              <>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-xl font-semibold text-[var(--text-primary)]">
                      {obra.nombre}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)] mt-2 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-2">
                        <MapPin size={16} className="opacity-90" />
                        {obra.distrito}
                      </span>
                      <span aria-hidden className="opacity-50">
                        ·
                      </span>
                      <span>{labelTipoServicio(obra.tipo_servicio)}</span>
                    </div>
                  </div>

                  <div>
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      {labelEstadoObra(obra.estado ?? 'Sin estado')}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-primary)]">Fase actual:</span> {faseActualNombre}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="text-lg font-semibold text-[var(--text-primary)]">Aún no tienes obras registradas</div>
                <div className="text-sm text-[var(--text-secondary)]">
                  Cuando tu proyecto esté iniciado, verás aquí el avance global y tu fase actual.
                </div>
              </div>
            )}
          </div>
        </div>

        {obra ? (
          <div className="mt-4 flex items-center justify-end text-[var(--text-secondary)]">
            Ver detalle completo →
          </div>
        ) : null}
      </Link>

      {/* Accesos / cuenta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Estado de cuenta */}
        <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Wallet size={18} className="text-amber-500" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Estado de tu cuenta</h2>
          </div>

          <div className="text-sm text-[var(--text-secondary)]">
            Has pagado <span className="font-semibold text-[var(--text-primary)]">{formatPen(totalPagado)}</span> de{' '}
            <span className="font-semibold text-[var(--text-primary)]">{formatPen(contractMonto || totalPagado + totalPendiente)}</span>
          </div>

          <div>
            {(() => {
              const denom = contractMonto || totalPagado + totalPendiente
              const pct = denom > 0 ? Math.round((totalPagado / denom) * 100) : 0
              return (
                <div className="w-full">
                  <div className="h-2 rounded-full bg-[var(--table-header-bg)] border border-[var(--table-border)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span>Pagado</span>
                    <span>{Math.min(100, pct)}%</span>
                  </div>
                </div>
              )
            })()}
          </div>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Te queda por pagar</div>
            <div className="mt-1 text-lg font-semibold text-amber-400">
              {formatPen(totalPendiente)}
            </div>
            <div className="mt-1 text-sm text-amber-200">
              {porcentajePendiente}% del contrato
            </div>
          </div>
        </section>

        {/* Accesos rápidos */}
        <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Navigation size={18} className="text-emerald-500" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Accesos rápidos</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/portal/pagos"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--table-border)] bg-[var(--card-bg)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--table-row-hover)] transition-colors"
            >
              <Receipt size={16} className="text-amber-500" />
              Ver mis pagos
            </Link>

            <Link
              href="/portal/solicitudes"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--table-border)] bg-[var(--card-bg)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--table-row-hover)] transition-colors"
            >
              <ClipboardList size={16} className="text-blue-400" />
              Mis solicitudes
              {solicitudesCount > 0 ? (
                <span className="ml-auto inline-flex items-center rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2 py-0.5 text-xs">
                  {solicitudesCount}
                </span>
              ) : null}
            </Link>

            <Link
              href={obra ? `/portal/obras/${obra.id}` : '/portal/obras'}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--table-border)] bg-[var(--card-bg)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--table-row-hover)] transition-colors"
            >
              <Building2 size={16} className="text-emerald-500" />
              Ver avance de obra
              <ArrowRight size={16} className="ml-auto opacity-70" />
            </Link>

            <div className="hidden sm:flex" />
          </div>

          <div className="text-xs text-[var(--text-secondary)]">
            Tip: consulta tu avance por fases y revisa tus pagos cuando lo necesites.
          </div>
        </section>
      </div>
    </div>
  )
}



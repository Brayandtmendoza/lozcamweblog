import { createClient } from '@/lib/supabase/server'
import { labelEstadoPago, labelMetodoPago } from '@/lib/labels'
import ComprobanteModal from '@/components/portal/ComprobanteModal'

type Comprobante = {
  id: string | number
  pago_id: string | number
  tipo: string | null
  serie: string | null
  numero: string | null
  fecha_emision: string | null
  monto_base: number | null
  igv: number | null
  total: number | null
  estado_sunat: string | null
}

function EstadoBadge({ estado }: { estado: string | null }) {
  const text = (estado ?? '').toLowerCase()
  const pagado = text === 'pagado'
  const bg = pagado ? 'bg-emerald-500/10' : 'bg-amber-500/10'
  const fg = pagado ? 'text-emerald-400' : 'text-amber-400'

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${bg} ${fg}`}
    >
      {estado ?? 'Sin estado'}
    </span>
  )
}

export default async function MisPagosPage() {
  const supabase = await createClient()

  const { data: pagos, error } = await supabase
    .from('pagos_clientes')
    .select(
      'id, fecha_pago, concepto, monto, metodo_pago, estado, obra:obra_id(nombre)'
    )
    .order('fecha_pago', { ascending: false })

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-white">Mis Pagos y Deudas</h1>
        <p className="text-sm text-gray-400">No tienes pagos registrados.</p>
      </div>
    )
  }

  const list = pagos ?? []

  const { data: comprobantes } = await supabase
    .from('comprobantes')
    .select(
      'id, pago_id, tipo, serie, numero, fecha_emision, monto_base, igv, total, estado_sunat'
    )

  const comprobantesList = comprobantes ?? []
  const comprobantesByPagoId = new Map<string, Comprobante>()
  for (const c of comprobantesList) {
    comprobantesByPagoId.set(String(c.pago_id), c as any)
  }

  const formatMonto = (monto: number | null) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(monto ?? 0)

  const totalPagado = list
    .filter((p: any) => String(p.estado ?? '').toLowerCase() === 'pagado')
    .reduce((acc: number, p: any) => acc + Number(p.monto ?? 0), 0)

  const totalPendiente = list
    .filter((p: any) => String(p.estado ?? '').toLowerCase() === 'pendiente')
    .reduce((acc: number, p: any) => acc + Number(p.monto ?? 0), 0)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Mis Pagos y Deudas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5"
        >
          <div className="text-sm text-gray-400">Total Pagado</div>
          <div className="text-3xl font-semibold text-white">
            {formatMonto(totalPagado)}
          </div>
        </div>
        <div
          className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5"
        >
          <div className="text-sm text-gray-400">Total Pendiente</div>
          <div className="text-3xl font-semibold text-white">
            {formatMonto(totalPendiente)}
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-[var(--table-border)] bg-[var(--card-bg)] p-6">
          <p className="text-sm text-gray-400">No tienes pagos registrados.</p>
        </div>
      ) : (
        <>
          {/* Tabla escritorio */}
          <div
            className="hidden md:block rounded-xl border border-[var(--table-border)] bg-[var(--card-bg)] overflow-hidden"
          >
            <div
              className="bg-[var(--table-header-bg)] text-[var(--table-header-text)] border-b border-[var(--table-border)]"
            >
              <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-semibold">
                <div className="col-span-2">Fecha</div>
                <div className="col-span-2">Concepto</div>
                <div className="col-span-2">Obra</div>
                <div className="col-span-2">Método</div>
                <div className="col-span-1">Estado</div>
                <div className="col-span-2 text-right">Monto</div>
                <div className="col-span-1 text-center">Doc.</div>
              </div>
            </div>

            <div className="divide-y divide-[var(--table-border)]">
              {list.map((p: any) => (
                <div
                  key={p.id}
                  className="grid grid-cols-12 gap-3 px-4 py-3 hover:bg-[var(--table-row-hover)] transition-colors"
                >
                  <div className="col-span-2 text-sm text-[var(--text-primary)]">
                    {p.fecha_pago ? String(p.fecha_pago).slice(0, 10) : '-'}
                  </div>
                  <div className="col-span-2 text-sm text-[var(--text-primary)]">
                    {p.concepto}
                  </div>
                  <div className="col-span-2 text-sm text-[var(--text-primary)]">
                    {p.obra?.nombre ?? '-'}
                  </div>
                  <div className="col-span-2 text-sm text-[var(--text-primary)]">
                    {labelMetodoPago(p.metodo_pago)}
                  </div>
                  <div className="col-span-1">
                    <EstadoBadge estado={labelEstadoPago(p.estado as string | null)} />
                  </div>
                  <div className="col-span-2 text-right text-sm text-[var(--text-primary)]">
                    {formatMonto(p.monto ?? 0)}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {comprobantesByPagoId.has(String(p.id)) ? (
                      <ComprobanteModal comprobante={comprobantesByPagoId.get(String(p.id)) ?? null} />
                    ) : (
                      <span className="text-sm text-[var(--text-secondary)]">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cards móvil */}
          <div className="md:hidden space-y-3">
            {list.map((p: any) => (
              <div
                key={p.id}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {p.concepto}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {p.fecha_pago ? String(p.fecha_pago).slice(0, 10) : '-'} · {labelMetodoPago(p.metodo_pago)}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {p.obra?.nombre ?? '-'}
                    </div>
                  </div>
                  <EstadoBadge estado={labelEstadoPago(p.estado as string | null)} />
                </div>
                <div className="mt-3 pt-3 border-t border-[var(--table-border)] flex items-center justify-between">
                  <span className="text-lg font-semibold text-[var(--text-primary)]">
                    {formatMonto(p.monto ?? 0)}
                  </span>
                  {comprobantesByPagoId.has(String(p.id)) && (
                    <ComprobanteModal comprobante={comprobantesByPagoId.get(String(p.id)) ?? null} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
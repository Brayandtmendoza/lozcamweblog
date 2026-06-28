import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatFecha, formatPEN } from '@/lib/utils/formatters'
import { ESTADO_PAGO_COLOR, ESTADO_PAGO_LABEL, METODO_PAGO_LABEL } from '@/lib/types/pagos'
import { FilaTabla } from '@/components/shared/FilaTabla'

export default async function PagosPage() {
  const supabase = await createClient()
  const { data: pagos } = await supabase
    .from('pagos_clientes')
    .select('*, obras (nombre), clientes (nombres, apellidos, razon_social)')
    .order('created_at', { ascending: false })

  const lista = pagos ?? []
  const totalPagado = lista.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + Number(p.monto), 0)
  const cardStyle = { background: 'var(--card-bg)', border: '1px solid var(--card-border)' }
  const tp = { color: 'var(--text-primary)' }
  const ts = { color: 'var(--text-secondary)' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={tp}>Pagos</h1>
          <p className="text-sm mt-0.5" style={ts}>
            {lista.length} pago{lista.length !== 1 ? 's' : ''} registrado{lista.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/pagos/nuevo" className="bg-amber-500 hover:bg-amber-400 text-gray-950 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Registrar pago
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-4" style={cardStyle}>
          <p className="text-xs mb-1" style={ts}>Total pagos</p>
          <p className="text-xl font-bold" style={tp}>{lista.length}</p>
        </div>
        <div className="rounded-xl p-4" style={cardStyle}>
          <p className="text-xs mb-1" style={ts}>Total cobrado</p>
          <p className="text-xl font-bold text-green-500">{formatPEN(totalPagado)}</p>
        </div>
        <div className="rounded-xl p-4" style={cardStyle}>
          <p className="text-xs mb-1" style={ts}>Pendientes</p>
          <p className="text-xl font-bold text-yellow-500">{lista.filter(p => p.estado === 'pendiente').length}</p>
        </div>
      </div>

      {lista.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={ts}>No hay pagos registrados aÃºn</p>
          <Link href="/pagos/nuevo" className="mt-4 inline-block bg-amber-500 hover:bg-amber-400 text-gray-950 px-4 py-2 rounded-lg text-sm font-medium">
            Registrar primer pago
          </Link>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={cardStyle}>
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--table-header-bg)' }}>
              <tr style={{ borderBottom: '2px solid var(--table-border)' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Concepto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Obra</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Monto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>MÃ©todo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>AcciÃ³n</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p: any) => (
                <FilaTabla key={p.id} href={`/pagos/${p.id}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium" style={tp}>{p.concepto}</div>
                    {p.numero_cuota && <div className="text-xs mt-0.5" style={ts}>Cuota #{p.numero_cuota}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs" style={ts}>{p.obras?.nombre ?? 'â€”'}</td>
                  <td className="px-4 py-3 text-xs" style={ts}>
                    {p.clientes?.razon_social ?? `${p.clientes?.nombres ?? ''} ${p.clientes?.apellidos ?? ''}`}
                  </td>
                  <td className="px-4 py-3 font-semibold" style={tp}>{formatPEN(Number(p.monto))}</td>
                  <td className="px-4 py-3 text-xs" style={ts}>{METODO_PAGO_LABEL[p.metodo_pago] ?? p.metodo_pago}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_PAGO_COLOR[p.estado]}`}>
                      {ESTADO_PAGO_LABEL[p.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={ts}>{formatFecha(p.fecha_pago)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/pagos/${p.id}`} className="text-amber-500 hover:text-amber-400 font-medium">Ver</Link>
                  </td>
                </FilaTabla>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}



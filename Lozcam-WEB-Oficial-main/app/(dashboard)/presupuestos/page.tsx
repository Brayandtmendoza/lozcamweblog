import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatFecha, formatPEN } from '@/lib/utils/formatters'
import { ESTADO_PRESUPUESTO_COLOR } from '@/lib/types/presupuestos'
import { FilaTabla } from '@/components/shared/FilaTabla'

export default async function PresupuestosPage() {
  const supabase = await createClient()
  const { data: presupuestos } = await supabase
    .from('presupuestos').select('*, obras(nombre)').order('created_at', { ascending: false })

  const lista = presupuestos ?? []
  const cardStyle = { background: 'var(--card-bg)', border: '1px solid var(--card-border)' }
  const tp = { color: 'var(--text-primary)' }
  const ts = { color: 'var(--text-secondary)' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={tp}>Presupuestos</h1>
          <p className="text-sm mt-0.5" style={ts}>
            {lista.length} presupuesto{lista.length !== 1 ? 's' : ''} registrado{lista.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/presupuestos/nuevo" className="bg-amber-500 hover:bg-amber-400 text-gray-950 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Nuevo presupuesto
        </Link>
      </div>

      {lista.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={ts}>No hay presupuestos registrados aún</p>
          <Link href="/presupuestos/nuevo" className="mt-4 inline-block bg-amber-500 hover:bg-amber-400 text-gray-950 px-4 py-2 rounded-lg text-sm font-medium">
            Crear primer presupuesto
          </Link>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={cardStyle}>
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--table-header-bg)' }}>
              <tr style={{ borderBottom: '2px solid var(--table-border)' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Presupuesto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Obra</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Vigente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <FilaTabla key={p.id} href={`/presupuestos/${p.id}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium" style={tp}>{p.nombre}</div>
                    {p.descripcion && <div className="text-xs mt-0.5" style={ts}>{p.descripcion}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm" style={ts}>{p.obras?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold" style={tp}>{formatPEN(p.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_PRESUPUESTO_COLOR[p.estado] ?? 'bg-gray-100 text-gray-700'}`}>
                      {p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.es_vigente
                      ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 font-medium">Vigente</span>
                      : <span className="text-xs" style={ts}>—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-xs" style={ts}>{formatFecha(p.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/presupuestos/${p.id}`} className="text-amber-500 hover:text-amber-400 font-medium">Ver</Link>
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


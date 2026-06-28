import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatFecha } from '@/lib/utils/formatters'

export default async function ReportesPage() {
  const supabase = await createClient()
  const { data: reportes } = await supabase
    .from('reportes_diarios').select('*, obras(nombre)').order('fecha', { ascending: false })
  const { data: incidencias } = await supabase
    .from('incidencias').select('*').eq('resuelto', false)

  const lista = reportes ?? []
  const cardStyle = { background: 'var(--card-bg)', border: '1px solid var(--card-border)' }
  const tp = { color: 'var(--text-primary)' }
  const ts = { color: 'var(--text-secondary)' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={tp}>Reportes de Obra</h1>
          <p className="text-sm mt-0.5" style={ts}>
            {lista.length} reporte{lista.length !== 1 ? 's' : ''} registrado{lista.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/reportes/nuevo" className="bg-amber-500 hover:bg-amber-400 text-gray-950 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Nuevo reporte
          </Link>
          <a
            href="/api/reportes/export"
            className="bg-amber-500 hover:bg-amber-400 text-gray-950 px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
          >
            Exportar a Excel
          </a>
        </div>

      </div>

      {(incidencias?.length ?? 0) > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-lg">⚠️</span>
            <p className="text-sm font-medium text-red-400">
              {incidencias?.length} incidencia{incidencias!.length !== 1 ? 's' : ''} sin resolver
            </p>
            <Link href="/reportes/incidencias" className="ml-auto text-xs text-red-400 hover:text-red-300 font-medium">
              Ver incidencias →
            </Link>
          </div>
        </div>
      )}

      {lista.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={ts}>No hay reportes registrados aún</p>
          <Link href="/reportes/nuevo" className="mt-4 inline-block bg-amber-500 hover:bg-amber-400 text-gray-950 px-4 py-2 rounded-lg text-sm font-medium">
            Crear primer reporte
          </Link>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={cardStyle}>
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--table-header-bg)' }}>
              <tr style={{ borderBottom: '2px solid var(--table-border)' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Obra</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Clima</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Personal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Resumen</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((r: any) => (
                <tr
                  key={r.id}
                  className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  style={{ borderTop: '1px solid var(--table-border)' }}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium" style={tp}>{r.obras?.nombre ?? '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={ts}>{formatFecha(r.fecha)}</td>
                  <td className="px-4 py-3 text-xs" style={ts}>
                    {r.clima ?? '—'}{r.temp_celsius && ` · ${r.temp_celsius}°C`}
                  </td>
                  <td className="px-4 py-3 text-center text-sm" style={ts}>{r.personal_count ?? '—'}</td>
                  <td className="px-4 py-3 text-xs max-w-xs truncate" style={ts}>{r.descripcion}</td>
                  <td className="px-4 py-3">
                    <Link href={`/reportes/${r.id}`} className="text-amber-500 hover:text-amber-400 font-medium">Ver</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


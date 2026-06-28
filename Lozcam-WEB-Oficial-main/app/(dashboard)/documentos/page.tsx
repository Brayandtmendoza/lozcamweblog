import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatFecha } from '@/lib/utils/formatters'
import { TIPO_DOCUMENTO_LABEL, ESTADO_DOCUMENTO_COLOR, ESTADO_DOCUMENTO_LABEL } from '@/lib/types/documentos'

export default async function DocumentosPage() {
  const supabase = await createClient()
  const { data: documentos } = await supabase
    .from('documentos').select('*, obras (nombre)').order('created_at', { ascending: false })

  const lista = documentos ?? []
  const cardStyle = { background: 'var(--card-bg)', border: '1px solid var(--card-border)' }
  const tp = { color: 'var(--text-primary)' }
  const ts = { color: 'var(--text-secondary)' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={tp}>Documentos Técnicos</h1>
          <p className="text-sm mt-0.5" style={ts}>
            {lista.length} documento{lista.length !== 1 ? 's' : ''} registrado{lista.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/documentos/nuevo" className="bg-amber-500 hover:bg-amber-400 text-gray-950 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Subir documento
        </Link>
      </div>

      {lista.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={ts}>No hay documentos registrados aún</p>
          <Link href="/documentos/nuevo" className="mt-4 inline-block bg-amber-500 hover:bg-amber-400 text-gray-950 px-4 py-2 rounded-lg text-sm font-medium">
            Subir primer documento
          </Link>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={cardStyle}>
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--table-header-bg)' }}>
              <tr style={{ borderBottom: '2px solid var(--table-border)' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Documento</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Obra</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Versión</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Subido</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((doc: any) => (
                <tr
                  key={doc.id}
                  className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  style={{ borderTop: '1px solid var(--table-border)' }}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium" style={tp}>{doc.titulo}</div>
                    {doc.numero_plano && <div className="text-xs mt-0.5 font-mono" style={ts}>{doc.numero_plano}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs" style={ts}>{TIPO_DOCUMENTO_LABEL[doc.tipo] ?? doc.tipo}</td>
                  <td className="px-4 py-3 text-xs" style={ts}>{doc.obras?.nombre ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_DOCUMENTO_COLOR[doc.estado]}`}>
                      {ESTADO_DOCUMENTO_LABEL[doc.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm" style={ts}>v{doc.version_actual}</td>
                  <td className="px-4 py-3 text-xs" style={ts}>{formatFecha(doc.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/documentos/${doc.id}`} className="text-amber-500 hover:text-amber-400 font-medium">Ver</Link>
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


'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatFecha } from '@/lib/utils/formatters'
import { TIPO_DOCUMENTO_LABEL, ESTADO_DOCUMENTO_LABEL } from '@/lib/types/documentos'
import { EstadoBadge } from '@/components/EstadoBadge'
import { FilaTabla } from '@/components/shared/FilaTabla'
import { AccionesFila } from '@/components/shared/AccionesFila'

export default function DocumentosPage() {
  const supabase = createClient()

  const [lista, setLista] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase
      .from('documentos')
      .select('*, obras (nombre)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setLista(data ?? [])
        setCargando(false)
      })
  }, [])

  async function handleEliminar(id: number | string) {
    const { error } = await supabase
      .from('documentos')
      .delete()
      .eq('id', id)
    if (error) throw new Error(error.message)
    setLista(prev => prev.filter(d => d.id !== id))
  }

  const cardStyle = { background: 'var(--card-bg)', border: '1px solid var(--card-border)' }
  const tp = { color: 'var(--text-primary)' }
  const ts = { color: 'var(--text-secondary)' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={tp}>Documentos Técnicos</h1>
          <p className="text-sm mt-0.5" style={ts}>
            {cargando ? '...' : `${lista.length} documento${lista.length !== 1 ? 's' : ''} registrado${lista.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/documentos/nuevo" className="bg-action hover:bg-action-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Subir documento
        </Link>
      </div>

      {cargando ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={ts}>Cargando...</p>
        </div>
      ) : lista.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={ts}>No hay documentos registrados aún</p>
          <Link href="/documentos/nuevo" className="mt-4 inline-block bg-action hover:bg-action-hover text-white px-4 py-2 rounded-lg text-sm font-medium">
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
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((doc: any) => (
                <FilaTabla key={doc.id} href={`/documentos/${doc.id}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium" style={tp}>{doc.titulo}</div>
                    {doc.numero_plano && <div className="text-xs mt-0.5 font-mono" style={ts}>{doc.numero_plano}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs" style={ts}>{TIPO_DOCUMENTO_LABEL[doc.tipo] ?? doc.tipo}</td>
                  <td className="px-4 py-3 text-xs" style={ts}>{doc.obras?.nombre ?? '—'}</td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={doc.estado} label={ESTADO_DOCUMENTO_LABEL[doc.estado]} />
                  </td>
                  <td className="px-4 py-3 text-center text-sm" style={ts}>v{doc.version_actual}</td>
                  <td className="px-4 py-3 text-xs" style={ts}>{formatFecha(doc.created_at)}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <AccionesFila
                      id={doc.id}
                      rutaBase="/documentos"
                      onEliminar={handleEliminar}
                      tituloModal="¿Eliminar este documento?"
                      descripcionModal="Esta acción no se puede deshacer y también eliminará sus versiones."
                      mensajeExito="Documento eliminado"
                    />
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

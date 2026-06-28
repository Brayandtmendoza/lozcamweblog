import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatFecha, formatFechaHora } from '@/lib/utils/formatters'
import {
  TIPO_DOCUMENTO_LABEL,
  ESTADO_DOCUMENTO_COLOR,
  ESTADO_DOCUMENTO_LABEL,
} from '@/lib/types/documentos'

export default async function DocumentoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (isNaN(id)) notFound()

  const supabase = await createClient()

  const { data: doc, error } = await supabase
    .from('documentos')
    .select('*, obras (nombre)')
    .eq('id', id)
    .single()

  if (error || !doc) notFound()

  const { data: versiones } = await supabase
    .from('versiones_documento')
    .select('*')
    .eq('documento_id', id)
    .order('version', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{doc.titulo}</h1>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${ESTADO_DOCUMENTO_COLOR[doc.estado]}`}
            >
              {ESTADO_DOCUMENTO_LABEL[doc.estado]}
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            {TIPO_DOCUMENTO_LABEL[doc.tipo]} · v{doc.version_actual}
          </p>
        </div>
        <Link href="/documentos" className="text-sm text-gray-500 hover:text-gray-700">
          ← Volver
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Obra</p>
            <p className="text-sm font-medium text-gray-900">{doc.obras?.nombre ?? '—'}</p>
          </div>
          {doc.numero_plano && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Número de plano</p>
              <p className="text-sm font-medium text-gray-900 font-mono">{doc.numero_plano}</p>
            </div>
          )}
          {doc.escala && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Escala</p>
              <p className="text-sm font-medium text-gray-900">{doc.escala}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 mb-1">Fecha registro</p>
            <p className="text-sm font-medium text-gray-900">{formatFecha(doc.created_at)}</p>
          </div>
        </div>
        {doc.descripcion && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Descripción</p>
            <p className="text-sm text-gray-600">{doc.descripcion}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Versiones ({versiones?.length ?? 0})</h2>
          <Link
            href={`/documentos/${id}/nueva-version`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Nueva versión
          </Link>
        </div>

        {!versiones || versiones.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No hay archivos subidos aún</p>
        ) : (
          <div className="space-y-2">
            {versiones.map((v: any) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold">
                    v{v.version}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{v.nombre_archivo}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {v.tipo_archivo?.toUpperCase()}
                      {v.tamanio_bytes ? ` · ${(v.tamanio_bytes / 1024 / 1024).toFixed(2)} MB` : ''}
                      {` · ${formatFechaHora(v.created_at)}`}
                    </p>
                  </div>
                </div>

                <a
                  href={v.archivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Descargar
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


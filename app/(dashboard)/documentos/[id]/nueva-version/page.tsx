'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NuevaVersionPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const documentoId = Number(params.id)
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!archivo) {
      setError('Debes seleccionar un archivo')
      return
    }
    setLoading(true)
    setError('')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const { data: versiones } = await supabase
        .from('versiones_documento')
        .select('version')
        .eq('documento_id', documentoId)
        .order('version', { ascending: false })
        .limit(1)

      const nuevaVersion = (versiones?.[0]?.version ?? 0) + 1
      const ext = archivo.name.split('.').pop()
      const filePath = `${Date.now()}_${archivo.name}`

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, archivo)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath)

      const form = e.currentTarget
      const data = new FormData(form)

      await supabase.from('versiones_documento').insert({
        documento_id: documentoId,
        version: nuevaVersion,
        archivo_url: urlData.publicUrl,
        nombre_archivo: archivo.name,
        tipo_archivo: ext ?? null,
        tamanio_bytes: archivo.size,
        notas_version:
          typeof data.get('notas') === 'string'
            ? (data.get('notas') as string)
            : null,
        subido_por: user.id,
      })

      await supabase
        .from('documentos')
        .update({ version_actual: nuevaVersion })
        .eq('id', documentoId)

      router.push(`/documentos/${documentoId}`)
      router.refresh()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al subir la versión'
      setError(message)
      setLoading(false)
    }
  }

  const cardStyle = { background: 'var(--card-bg)', border: '1px solid var(--card-border)' }
  const tp = { color: 'var(--text-primary)' }
  const ts = { color: 'var(--text-secondary)' }
  const inputStyle = {
    background: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    color: 'var(--text-primary)',
  }
  const inputClass = 'w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
  const labelClass = 'block text-sm font-medium mb-1'

  return (
    <div className="max-w-xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={tp}>Nueva versión</h1>
        <p className="text-sm mt-0.5" style={ts}>Sube una versión actualizada del documento</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-4" style={cardStyle}>

        {/* Zona de upload */}
        <div>
          <label className={labelClass} style={ts}>Archivo *</label>
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center transition-colors hover:border-amber-500"
            style={{ borderColor: 'var(--card-border)' }}
          >
            <input
              type="file"
              accept=".pdf,.dwg,.rvt,.xlsx,.docx,.png,.jpg,.jpeg"
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              className="hidden"
              id="archivo-input"
            />
            <label htmlFor="archivo-input" className="cursor-pointer">
              {archivo ? (
                <div>
                  <p className="text-sm font-medium text-amber-500">{archivo.name}</p>
                  <p className="text-xs mt-1" style={ts}>
                    {(archivo.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm" style={ts}>Haz clic para seleccionar el archivo</p>
                  <p className="text-xs mt-1" style={ts}>PDF, DWG, RVT, Excel, Word, JPG, PNG</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Notas de versión */}
        <div>
          <label className={labelClass} style={ts}>Notas de la versión</label>
          <textarea
            name="notas"
            rows={3}
            placeholder="Describe los cambios de esta versión..."
            className={inputClass}
            style={inputStyle}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-lg py-2 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-action hover:bg-action-hover text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? 'Subiendo...' : 'Subir versión'}
          </button>
        </div>

      </form>
    </div>
  )
}

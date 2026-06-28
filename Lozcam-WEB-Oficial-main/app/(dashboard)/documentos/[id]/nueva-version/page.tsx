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

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva versión</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Sube una versión actualizada del documento
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Archivo *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
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
                  <p className="text-sm font-medium text-blue-600">{archivo.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {(archivo.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500">Haz clic para seleccionar el archivo</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DWG, RVT, Excel, Word, JPG, PNG</p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas de la versión
          </label>
          <textarea
            name="notas"
            rows={3}
            placeholder="Describe los cambios de esta versión..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Subiendo...' : 'Subir versión'}
          </button>
        </div>
      </form>
    </div>
  )
}


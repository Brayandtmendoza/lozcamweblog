'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TIPO_DOCUMENTO_LABEL } from '@/lib/types/documentos'

export default function NuevoDocumentoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [obras, setObras] = useState<any[]>([])
  const [archivo, setArchivo] = useState<File | null>(null)
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })

    supabase
      .from('obras')
      .select('id, nombre')
      .order('nombre')
      .then(({ data }) => setObras(data ?? []))
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!archivo) {
      setError('Debes seleccionar un archivo')
      return
    }
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const ext = archivo.name.split('.').pop()
      const filePath = `${Date.now()}_${archivo.name}`

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, archivo)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath)

      const { data: docData, error: docError } = await supabase
        .from('documentos')
        .insert({
          titulo: data.get('titulo') as string,
          tipo: data.get('tipo') as string,
          obra_id: data.get('obra_id') ? Number(data.get('obra_id')) : null,
          descripcion: (data.get('descripcion') as string) || null,
          numero_plano: (data.get('numero_plano') as string) || null,
          escala: (data.get('escala') as string) || null,
          estado: 'borrador',
          version_actual: 1,
          subido_por: userId,
        })
        .select()
        .single()

      if (docError) throw docError

      if (!urlData?.publicUrl) throw new Error('No se pudo generar URL pública')

      await supabase.from('versiones_documento').insert({
        documento_id: docData.id,
        version: 1,
        archivo_url: urlData.publicUrl,
        nombre_archivo: archivo.name,
        tipo_archivo: ext ?? null,
        tamanio_bytes: archivo.size,
        subido_por: userId,
      })

      router.push('/documentos')
      router.refresh()
    } catch (err: any) {
      console.error('ERROR DETALLE:', JSON.stringify(err))
      setError(err?.message ?? 'Error al subir el documento')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subir documento</h1>
        <p className="text-gray-500 text-sm mt-0.5">Registra un nuevo documento técnico</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input
            name="titulo"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Plano de planta primer piso"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
            <select
              name="tipo"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(TIPO_DOCUMENTO_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Obra</label>
            <select
              name="obra_id"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sin obra asignada</option>
              {obras.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de plano</label>
            <input
              name="numero_plano"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: A-01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escala</label>
            <input
              name="escala"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 1:100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            name="descripcion"
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Archivo *</label>
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
                  <p className="text-xs text-gray-400 mt-1">{(archivo.size / 1024 / 1024).toFixed(2)} MB</p>
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
            {loading ? 'Subiendo...' : 'Subir documento'}
          </button>
        </div>
      </form>
    </div>
  )
}


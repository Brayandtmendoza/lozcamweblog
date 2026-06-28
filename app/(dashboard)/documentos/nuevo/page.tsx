'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TIPO_DOCUMENTO_LABEL } from '@/lib/types/documentos'
import { toast } from 'sonner'

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

      toast.success('Documento creado')
      router.push('/documentos')
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message ?? 'Error al subir el documento')
      setError(err?.message ?? 'Error al subir el documento')
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
        <h1 className="text-2xl font-bold" style={tp}>Subir documento</h1>
        <p className="text-sm mt-0.5" style={ts}>Registra un nuevo documento técnico</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-4" style={cardStyle}>

        <div>
          <label className={labelClass} style={ts}>Título *</label>
          <input
            name="titulo"
            required
            className={inputClass}
            style={inputStyle}
            placeholder="Ej: Plano de planta primer piso"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={ts}>Tipo *</label>
            <select
              name="tipo"
              required
              className={inputClass}
              style={inputStyle}
            >
              {Object.entries(TIPO_DOCUMENTO_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} style={ts}>Obra</label>
            <select
              name="obra_id"
              className={inputClass}
              style={inputStyle}
            >
              <option value="">Sin obra asignada</option>
              {obras.map((o) => (
                <option key={o.id} value={o.id}>{o.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={ts}>Número de plano</label>
            <input
              name="numero_plano"
              className={inputClass}
              style={inputStyle}
              placeholder="Ej: A-01"
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Escala</label>
            <input
              name="escala"
              className={inputClass}
              style={inputStyle}
              placeholder="Ej: 1:100"
            />
          </div>
        </div>

        <div>
          <label className={labelClass} style={ts}>Descripción</label>
          <textarea
            name="descripcion"
            rows={2}
            className={inputClass}
            style={inputStyle}
          />
        </div>

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
                  <p className="text-xs mt-1" style={ts}>{(archivo.size / 1024 / 1024).toFixed(2)} MB</p>
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
            {loading ? 'Subiendo...' : 'Subir documento'}
          </button>
        </div>

      </form>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TIPO_DOCUMENTO_LABEL, ESTADO_DOCUMENTO_LABEL } from '@/lib/types/documentos'
import { toast } from 'sonner'

export default function EditarDocumentoPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<any>(null)
  const [obras, setObras] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      supabase.from('documentos').select('*').eq('id', id).single(),
      supabase.from('obras').select('id, nombre').order('nombre'),
    ]).then(([{ data: doc }, { data: obrasData }]) => {
      if (doc) setForm(doc)
      setObras(obrasData ?? [])
    })
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const formEl = e.currentTarget
    const data = new FormData(formEl)

    const payload = {
      titulo:       data.get('titulo') as string,
      tipo:         data.get('tipo') as string,
      obra_id:      data.get('obra_id') ? Number(data.get('obra_id')) : null,
      numero_plano: (data.get('numero_plano') as string) || null,
      escala:       (data.get('escala') as string) || null,
      descripcion:  (data.get('descripcion') as string) || null,
      estado:       data.get('estado') as string,
    }

    const { error: updateError } = await supabase
      .from('documentos')
      .update(payload)
      .eq('id', id)

    if (updateError) {
      toast.error(updateError.message ?? 'Error al actualizar el documento')
      setError(updateError.message ?? 'Error al actualizar el documento')
      setSaving(false)
      return
    }

    toast.success('Cambios guardados')
    router.push(`/documentos/${id}`)
    router.refresh()
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

  if (!form)
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm" style={ts}>Cargando...</p>
      </div>
    )

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={tp}>Editar documento</h1>
          <p className="text-sm mt-0.5" style={ts}>Actualiza los metadatos del documento</p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm hover:opacity-70 transition-opacity"
          style={ts}
        >
          ← Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-4" style={cardStyle}>

        <div>
          <label className={labelClass} style={tp}>Título *</label>
          <input
            name="titulo"
            required
            defaultValue={form.titulo ?? ''}
            placeholder="Ej: Plano de planta primer piso"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={tp}>Tipo *</label>
            <select
              name="tipo"
              required
              defaultValue={form.tipo ?? ''}
              className={inputClass}
              style={inputStyle}
            >
              {Object.entries(TIPO_DOCUMENTO_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} style={tp}>Estado *</label>
            <select
              name="estado"
              required
              defaultValue={form.estado ?? 'borrador'}
              className={inputClass}
              style={inputStyle}
            >
              {Object.entries(ESTADO_DOCUMENTO_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass} style={ts}>Obra</label>
          <select
            name="obra_id"
            defaultValue={form.obra_id ?? ''}
            className={inputClass}
            style={inputStyle}
          >
            <option value="">Sin obra asignada</option>
            {obras.map((o) => (
              <option key={o.id} value={o.id}>{o.nombre}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={ts}>Número de plano</label>
            <input
              name="numero_plano"
              defaultValue={form.numero_plano ?? ''}
              placeholder="Ej: A-01"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Escala</label>
            <input
              name="escala"
              defaultValue={form.escala ?? ''}
              placeholder="Ej: 1:100"
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} style={ts}>Descripción</label>
          <textarea
            name="descripcion"
            rows={2}
            defaultValue={form.descripcion ?? ''}
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
            disabled={saving}
            className="flex-1 bg-action hover:bg-action-hover text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}

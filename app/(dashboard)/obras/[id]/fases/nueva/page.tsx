'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NuevaFasePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const obraId = Number(params.id)

  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)

    const payload = {
      obra_id: obraId,
      nombre: data.get('nombre') as string,
      descripcion: (data.get('descripcion') as string) || null,
      orden: Number(data.get('orden')) || 0,
      fecha_inicio: (data.get('fecha_inicio') as string) || null,
      fecha_fin: (data.get('fecha_fin') as string) || null,
      estado: 'pendiente',
    }

    const { error } = await supabase.from('fases_obra').insert(payload)

    if (error) {
      setError('Error al guardar la fase.')
      setLoading(false)
      return
    }

    router.push(`/obras/${obraId}`)
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

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={tp}>Nueva fase</h1>
        <p className="text-sm mt-0.5" style={ts}>Agrega una etapa a la obra</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-4" style={cardStyle}>
        <div>
          <label className={labelClass} style={ts}>Nombre de la fase *</label>
          <input
            name="nombre"
            required
            className={inputClass}
            style={inputStyle}
            placeholder="Ej: Cimentación"
          />
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

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass} style={ts}>Orden</label>
            <input
              name="orden"
              type="number"
              min="0"
              defaultValue="0"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Fecha inicio</label>
            <input
              name="fecha_inicio"
              type="date"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Fecha fin</label>
            <input
              name="fecha_fin"
              type="date"
              className={inputClass}
              style={inputStyle}
            />
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
            {loading ? 'Guardando...' : 'Guardar fase'}
          </button>
        </div>
      </form>
    </div>
  )
}

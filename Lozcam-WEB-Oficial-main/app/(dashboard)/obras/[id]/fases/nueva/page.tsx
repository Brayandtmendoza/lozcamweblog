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

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva fase</h1>
        <p className="text-gray-500 text-sm mt-0.5">Agrega una etapa a la obra</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la fase *</label>
          <input
            name="nombre"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Cimentación"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            name="descripcion"
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
            <input
              name="orden"
              type="number"
              min="0"
              defaultValue="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
            <input
              name="fecha_inicio"
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
            <input
              name="fecha_fin"
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
            {loading ? 'Guardando...' : 'Guardar fase'}
          </button>
        </div>
      </form>
    </div>
  )
}


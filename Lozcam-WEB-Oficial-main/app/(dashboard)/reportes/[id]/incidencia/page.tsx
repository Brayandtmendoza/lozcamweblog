'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NuevaIncidenciaPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const reporteId = Number(params.id)
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [afectaPlazo, setAfectaPlazo] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('No autenticado')
      setLoading(false)
      return
    }

    const { data: reporte } = await supabase
      .from('reportes_diarios')
      .select('obra_id')
      .eq('id', reporteId)
      .single()

    const { error: incError } = await supabase.from('incidencias').insert({
      obra_id: reporte?.obra_id,
      reporte_id: reporteId,
      tipo: data.get('tipo') as string,
      descripcion: data.get('descripcion') as string,
      gravedad: data.get('gravedad') as string,
      afecta_plazo: afectaPlazo,
      dias_retraso: afectaPlazo ? Number(data.get('dias_retraso')) : 0,
      reportado_por: user.id,
      resuelto: false,
    })

    if (incError) {
      setError('Error al registrar la incidencia.')
      setLoading(false)
      return
    }

    router.push(`/reportes/${reporteId}`)
    router.refresh()
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva incidencia</h1>
        <p className="text-gray-500 text-sm mt-0.5">Registra un evento importante en obra</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
            <select
              name="tipo"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="accidente">Accidente</option>
              <option value="robo">Robo / Hurto</option>
              <option value="paralizacion">Paralización</option>
              <option value="clima">Clima adverso</option>
              <option value="falla_equipo">Falla de equipo</option>
              <option value="falta_material">Falta de material</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gravedad *</label>
            <select
              name="gravedad"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="leve">Leve</option>
              <option value="moderada">Moderada</option>
              <option value="grave">Grave</option>
              <option value="critica">Crítica</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
          <textarea
            name="descripcion"
            required
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe detalladamente lo que ocurrió..."
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={afectaPlazo}
              onChange={(e) => setAfectaPlazo(e.target.checked)}
              className="rounded"
            />
            Esta incidencia afecta el plazo de la obra
          </label>
        </div>

        {afectaPlazo && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Días de retraso estimados</label>
            <input
              name="dias_retraso"
              type="number"
              min="1"
              defaultValue={1}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

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
            className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Guardando...' : 'Registrar incidencia'}
          </button>
        </div>
      </form>
    </div>
  )
}


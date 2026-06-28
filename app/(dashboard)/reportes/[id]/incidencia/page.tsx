'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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
      toast.error('No se pudo registrar la incidencia')
      setError('Error al registrar la incidencia.')
      setLoading(false)
      return
    }

    toast.success('Incidencia registrada')
    router.push(`/reportes/${reporteId}`)
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

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={tp}>Nueva incidencia</h1>
        <p className="text-sm mt-0.5" style={ts}>Registra un evento importante en obra</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-4" style={cardStyle}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={ts}>Tipo *</label>
            <select
              name="tipo"
              required
              className={inputClass}
              style={inputStyle}
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
            <label className={labelClass} style={ts}>Gravedad *</label>
            <select
              name="gravedad"
              required
              className={inputClass}
              style={inputStyle}
            >
              <option value="leve">Leve</option>
              <option value="moderada">Moderada</option>
              <option value="grave">Grave</option>
              <option value="critica">Crítica</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass} style={ts}>Descripción *</label>
          <textarea
            name="descripcion"
            required
            rows={4}
            className={inputClass}
            style={inputStyle}
            placeholder="Describe detalladamente lo que ocurrió..."
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={ts}>
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
            <label className={labelClass} style={ts}>Días de retraso estimados</label>
            <input
              name="dias_retraso"
              type="number"
              min="1"
              defaultValue={1}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        )}

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
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? 'Guardando...' : 'Registrar incidencia'}
          </button>
        </div>
      </form>

    </div>
  )
}

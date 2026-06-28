'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AgendarCitaPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const solicitudId = Number(params.id)
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [personal, setPersonal] = useState<any[]>([])
  const [solicitud, setSolicitud] = useState<any>(null)

  useEffect(() => {
    supabase
      .from('solicitudes')
      .select('*, clientes(nombres, apellidos, razon_social)')
      .eq('id', solicitudId)
      .single()
      .then(({ data }) => setSolicitud(data))

    supabase
      .from('profiles')
      .select('id, nombre, apellidos, rol')
      .eq('activo', true)
      .then(({ data }) => setPersonal(data ?? []))
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)

    const { error } = await supabase.from('citas').insert({
      solicitud_id:  solicitudId,
      cliente_id:    solicitud?.cliente_id,
      asignado_a:    data.get('asignado_a') as string,
      fecha:         data.get('fecha') as string,
      hora:          data.get('hora') as string,
      duracion_min:  Number(data.get('duracion_min')) || 60,
      lugar:         data.get('lugar') as string || null,
      tipo_cita:     data.get('tipo_cita') as string,
      notas_previas: data.get('notas_previas') as string || null,
      estado:        'programada',
    })

    if (error) {
      setError('Error al agendar la cita.')
      setLoading(false)
      return
    }

    await supabase
      .from('solicitudes')
      .update({ estado: 'cita_agendada' })
      .eq('id', solicitudId)

    router.push(`/solicitudes/${solicitudId}`)
    router.refresh()
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agendar cita</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {solicitud?.titulo ?? 'Cargando...'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
            <input name="fecha" type="date" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
            <input name="hora" type="time" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de cita</label>
            <select name="tipo_cita" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="visita_tecnica">Visita técnica</option>
              <option value="reunion_oficina">Reunión en oficina</option>
              <option value="virtual">Virtual</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
            <input name="duracion_min" type="number" defaultValue={60} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Asignado a *</label>
          <select name="asignado_a" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Seleccionar personal</option>
            {personal.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre} {p.apellidos}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lugar</label>
          <input name="lugar" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Dirección o enlace de reunión virtual" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas previas</label>
          <textarea name="notas_previas" rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Instrucciones o información para la cita..." />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()}
            className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading ? 'Agendando...' : 'Agendar cita'}
          </button>
        </div>
      </form>
    </div>
  )
}


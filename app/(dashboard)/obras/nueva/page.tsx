'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { TIPO_SERVICIO_LABEL, ESTADO_OBRA_LABEL } from '@/lib/utils/constants'
import { toast } from 'sonner'

const MapaUbicacionObra = dynamic(
  () => import('@/components/obras/MapaUbicacionObra'),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[300px] rounded-lg animate-pulse"
        style={{ background: 'var(--card-border)' }}
      />
    ),
  },
)

export default function NuevaObraPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientes, setClientes] = useState<any[]>([])
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null })

  useEffect(() => {
    supabase
      .from('clientes')
      .select('id, nombres, apellidos, razon_social, tipo_persona')
      .eq('activo', true)
      .then(({ data }) => setClientes(data ?? []))
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)

    const payload = {
      nombre: data.get('nombre') as string,
      tipo_servicio: data.get('tipo_servicio') as string,
      descripcion: (data.get('descripcion') as string) || null,
      direccion: data.get('direccion') as string,
      distrito: (data.get('distrito') as string) || null,
      provincia: (data.get('provincia') as string) || null,
      departamento: (data.get('departamento') as string) || null,
      area_m2: data.get('area_m2') ? Number(data.get('area_m2')) : null,
      pisos: data.get('pisos') ? Number(data.get('pisos')) : null,
      monto_contrato: Number(data.get('monto_contrato')) || 0,
      estado: data.get('estado') as string,
      cliente_id: data.get('cliente_id') ? Number(data.get('cliente_id')) : null,
      fecha_inicio_planificada: (data.get('fecha_inicio_planificada') as string) || null,
      fecha_fin_planificada: (data.get('fecha_fin_planificada') as string) || null,
      notas: (data.get('notas') as string) || null,
      latitud: coords.lat,
      longitud: coords.lng,
      radio_metros: data.get('radio_metros') ? Number(data.get('radio_metros')) : 200,
    }

    const { error: sbError } = await supabase.from('obras').insert(payload)

    if (sbError) {
      toast.error(sbError.message ?? 'Error al guardar la obra')
      setError(sbError.message ?? 'Error al guardar la obra')
      setLoading(false)
      return
    }

    toast.success('Obra creada')
    router.push('/obras')
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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={tp}>Nueva obra</h1>
        <p className="text-sm mt-0.5" style={ts}>Registra una nueva obra o proyecto</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-5" style={cardStyle}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass} style={ts}>Nombre de la obra *</label>
            <input
              name="nombre"
              required
              className={inputClass}
              style={inputStyle}
              placeholder="Ej: Construcción vivienda unifamiliar Los Olivos"
            />
          </div>

          <div>
            <label className={labelClass} style={ts}>Tipo de servicio *</label>
            <select
              name="tipo_servicio"
              required
              className={inputClass}
              style={inputStyle}
            >
              {Object.entries(TIPO_SERVICIO_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} style={ts}>Estado</label>
            <select
              name="estado"
              className={inputClass}
              style={inputStyle}
            >
              {Object.entries(ESTADO_OBRA_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} style={ts}>Cliente</label>
            <select
              name="cliente_id"
              className={inputClass}
              style={inputStyle}
            >
              <option value="">Sin cliente asignado</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tipo_persona === 'natural'
                    ? `${c.nombres} ${c.apellidos}`
                    : c.razon_social}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} style={ts}>Monto contrato (S/)</label>
            <input
              name="monto_contrato"
              type="number"
              step="0.01"
              min="0"
              className={inputClass}
              style={inputStyle}
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className={labelClass} style={ts}>Dirección de la obra *</label>
          <input
            name="direccion"
            required
            className={inputClass}
            style={inputStyle}
            placeholder="Av. ejemplo 123"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass} style={ts}>Distrito</label>
            <input
              name="distrito"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Provincia</label>
            <input
              name="provincia"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Departamento</label>
            <input
              name="departamento"
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Ubicación en el mapa + radio GPS */}
        <div>
          <label className={labelClass} style={ts}>Ubicación en el mapa</label>
          <MapaUbicacionObra
            value={coords}
            onChange={(lat, lng) => setCoords({ lat, lng })}
          />
        </div>

        <div>
          <label className={labelClass} style={ts}>Radio para marcar asistencia (metros)</label>
          <input
            name="radio_metros"
            type="number"
            min="50"
            step="1"
            defaultValue={200}
            className={inputClass}
            style={inputStyle}
          />
          <p className="text-xs mt-1" style={ts}>
            Distancia máxima desde la obra para que el personal pueda registrar asistencia por GPS. Por defecto 200 m.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass} style={ts}>Área (m²)</label>
            <input
              name="area_m2"
              type="number"
              step="0.01"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Pisos</label>
            <input
              name="pisos"
              type="number"
              min="1"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Moneda</label>
            <select
              name="moneda"
              className={inputClass}
              style={inputStyle}
            >
              <option value="PEN">PEN - Soles</option>
              <option value="USD">USD - Dólares</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={ts}>Fecha inicio planificada</label>
            <input
              name="fecha_inicio_planificada"
              type="date"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Fecha fin planificada</label>
            <input
              name="fecha_fin_planificada"
              type="date"
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} style={ts}>Descripción</label>
          <textarea
            name="descripcion"
            rows={3}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <label className={labelClass} style={ts}>Notas internas</label>
          <textarea
            name="notas"
            rows={2}
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
            {loading ? 'Guardando...' : 'Guardar obra'}
          </button>
        </div>
      </form>
    </div>
  )
}

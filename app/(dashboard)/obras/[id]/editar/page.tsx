'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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

export default function EditarObraPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<any>(null)
  const [clientes, setClientes] = useState<any[]>([])
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null })

  useEffect(() => {
    Promise.all([
      supabase.from('obras').select('*').eq('id', id).single(),
      supabase.from('clientes').select('id, nombres, apellidos, razon_social, tipo_persona').eq('activo', true),
    ]).then(([{ data: obra }, { data: clientesData }]) => {
      if (obra) {
        setForm(obra)
        setCoords({ lat: obra.latitud ?? null, lng: obra.longitud ?? null })
      }
      setClientes(clientesData ?? [])
    })
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const formEl = e.currentTarget
    const data = new FormData(formEl)

    const payload = {
      codigo: (data.get('codigo') as string) || null,
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
      moneda: data.get('moneda') as string,
      estado: data.get('estado') as string,
      cliente_id: data.get('cliente_id') ? Number(data.get('cliente_id')) : null,
      fecha_inicio_planificada: (data.get('fecha_inicio_planificada') as string) || null,
      fecha_fin_planificada: (data.get('fecha_fin_planificada') as string) || null,
      fecha_inicio_real: (data.get('fecha_inicio_real') as string) || null,
      fecha_fin_real: (data.get('fecha_fin_real') as string) || null,
      notas: (data.get('notas') as string) || null,
      latitud: coords.lat,
      longitud: coords.lng,
      radio_metros: data.get('radio_metros') ? Number(data.get('radio_metros')) : (form.radio_metros ?? 200),
      updated_at: new Date().toISOString(),
    }

    const { error: sbError } = await supabase.from('obras').update(payload).eq('id', id)

    if (sbError) {
      toast.error(sbError.message ?? 'Error al actualizar la obra')
      setError(sbError.message ?? 'Error al actualizar la obra')
      setSaving(false)
      return
    }

    toast.success('Cambios guardados')
    router.push(`/obras/${id}`)
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
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={tp}>Editar obra</h1>
          <p className="text-sm mt-0.5" style={ts}>Actualiza los datos de la obra</p>
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

      <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-5" style={cardStyle}>

        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3">
            <label className={labelClass} style={tp}>Nombre de la obra *</label>
            <input
              name="nombre"
              required
              defaultValue={form.nombre ?? ''}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Código</label>
            <input
              name="codigo"
              defaultValue={form.codigo ?? ''}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={tp}>Tipo de servicio *</label>
            <select
              name="tipo_servicio"
              required
              defaultValue={form.tipo_servicio ?? ''}
              className={inputClass}
              style={inputStyle}
            >
              {Object.entries(TIPO_SERVICIO_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} style={tp}>Estado *</label>
            <select
              name="estado"
              required
              defaultValue={form.estado ?? ''}
              className={inputClass}
              style={inputStyle}
            >
              {Object.entries(ESTADO_OBRA_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} style={ts}>Cliente</label>
            <select
              name="cliente_id"
              defaultValue={form.cliente_id ?? ''}
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
              defaultValue={form.monto_contrato ?? ''}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} style={tp}>Dirección *</label>
          <input
            name="direccion"
            required
            defaultValue={form.direccion ?? ''}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass} style={ts}>Distrito</label>
            <input
              name="distrito"
              defaultValue={form.distrito ?? ''}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Provincia</label>
            <input
              name="provincia"
              defaultValue={form.provincia ?? ''}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Departamento</label>
            <input
              name="departamento"
              defaultValue={form.departamento ?? ''}
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
            defaultValue={form.radio_metros ?? 200}
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
              defaultValue={form.area_m2 ?? ''}
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
              defaultValue={form.pisos ?? ''}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Moneda</label>
            <select
              name="moneda"
              defaultValue={form.moneda ?? 'PEN'}
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
              defaultValue={form.fecha_inicio_planificada?.slice(0, 10) ?? ''}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Fecha fin planificada</label>
            <input
              name="fecha_fin_planificada"
              type="date"
              defaultValue={form.fecha_fin_planificada?.slice(0, 10) ?? ''}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Fecha inicio real</label>
            <input
              name="fecha_inicio_real"
              type="date"
              defaultValue={form.fecha_inicio_real?.slice(0, 10) ?? ''}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Fecha fin real</label>
            <input
              name="fecha_fin_real"
              type="date"
              defaultValue={form.fecha_fin_real?.slice(0, 10) ?? ''}
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
            defaultValue={form.descripcion ?? ''}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <label className={labelClass} style={ts}>Notas internas</label>
          <textarea
            name="notas"
            rows={2}
            defaultValue={form.notas ?? ''}
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

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TIPO_SERVICIO_LABEL } from '@/lib/utils/constants'
import { toast } from 'sonner'

export default function NuevaSolicitudPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientes, setClientes] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('clientes')
      .select('id, nombres, apellidos, razon_social, tipo_persona')
      .eq('activo', true)
      .then(({ data, error }) => {
        console.log('CLIENTES:', data, error)
        setClientes(data ?? [])
      })
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)

    const payload = {
      cliente_id: Number(data.get('cliente_id')),
      tipo_servicio: data.get('tipo_servicio') as string,
      titulo: data.get('titulo') as string,
      descripcion: (data.get('descripcion') as string) || null,
      direccion_obra: (data.get('direccion_obra') as string) || null,
      distrito: (data.get('distrito') as string) || null,
      provincia: (data.get('provincia') as string) || null,
      departamento: (data.get('departamento') as string) || null,
      area_m2: data.get('area_m2') ? Number(data.get('area_m2')) : null,
      tiene_planos: data.get('tiene_planos') === 'true',
      tiene_terreno: data.get('tiene_terreno') === 'true',
      presupuesto_ref: data.get('presupuesto_ref') ? Number(data.get('presupuesto_ref')) : null,
      prioridad: (data.get('prioridad') as string) || 'media',
      fuente: (data.get('fuente') as string) || null,
      notas_internas: (data.get('notas_internas') as string) || null,
      estado: 'nueva',
    }

    console.log('ENVIANDO:', payload)

    try {
      const response = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error ?? 'Error al guardar')
        setError(result.error ?? 'Error al guardar')
        setLoading(false)
        return
      }

      toast.success('Solicitud creada')
      router.push('/solicitudes')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message ?? 'Error inesperado')
      setError(err.message ?? 'Error inesperado')
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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={tp}>Nueva solicitud</h1>
        <p className="text-sm mt-0.5" style={ts}>Registra una solicitud de servicio</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-5" style={cardStyle}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass} style={ts}>Título *</label>
            <input
              name="titulo"
              required
              className={inputClass}
              style={inputStyle}
              placeholder="Ej: Construcción vivienda 2 pisos"
            />
          </div>

          <div>
            <label className={labelClass} style={ts}>Cliente *</label>
            <select
              name="cliente_id"
              required
              className={inputClass}
              style={inputStyle}
            >
              <option value="">Seleccionar cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tipo_persona === 'natural' ? `${c.nombres} ${c.apellidos}` : c.razon_social}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} style={ts}>Tipo de servicio *</label>
            <select
              name="tipo_servicio"
              required
              className={inputClass}
              style={inputStyle}
            >
              {Object.entries(TIPO_SERVICIO_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} style={ts}>Prioridad</label>
            <select
              name="prioridad"
              className={inputClass}
              style={inputStyle}
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>

          <div>
            <label className={labelClass} style={ts}>Fuente</label>
            <input
              name="fuente"
              className={inputClass}
              style={inputStyle}
              placeholder="Referido, web, visita..."
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

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3">
            <label className={labelClass} style={ts}>Dirección de la obra</label>
            <input
              name="direccion_obra"
              className={inputClass}
              style={inputStyle}
            />
          </div>
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

        <div className="grid grid-cols-2 gap-4">
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
            <label className={labelClass} style={ts}>Presupuesto referencial (S/)</label>
            <input
              name="presupuesto_ref"
              type="number"
              step="0.01"
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={ts}>
            <input type="checkbox" name="tiene_planos" value="true" className="rounded" />
            Tiene planos
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={ts}>
            <input type="checkbox" name="tiene_terreno" value="true" className="rounded" />
            Tiene terreno
          </label>
        </div>

        <div>
          <label className={labelClass} style={ts}>Notas internas</label>
          <textarea
            name="notas_internas"
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
            {loading ? 'Guardando...' : 'Guardar solicitud'}
          </button>
        </div>
      </form>
    </div>
  )
}

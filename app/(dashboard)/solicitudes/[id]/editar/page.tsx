'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TIPO_SERVICIO_LABEL } from '@/lib/utils/constants'
import { ESTADO_SOLICITUD_LABEL } from '@/lib/types/solicitudes'
import { toast } from 'sonner'

export default function EditarSolicitudPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<any>(null)
  const [clientes, setClientes] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      supabase.from('solicitudes').select('*').eq('id', id).single(),
      supabase.from('clientes').select('id, nombres, apellidos, razon_social, tipo_persona').eq('activo', true),
    ]).then(([{ data: sol }, { data: clientesData }]) => {
      if (sol) setForm(sol)
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
      cliente_id: Number(data.get('cliente_id')),
      tipo_servicio: data.get('tipo_servicio') as string,
      titulo: data.get('titulo') as string,
      descripcion: (data.get('descripcion') as string) || null,
      estado: data.get('estado') as string,
      prioridad: data.get('prioridad') as string,
      fuente: (data.get('fuente') as string) || null,
      direccion_obra: (data.get('direccion_obra') as string) || null,
      distrito: (data.get('distrito') as string) || null,
      provincia: (data.get('provincia') as string) || null,
      departamento: (data.get('departamento') as string) || null,
      area_m2: data.get('area_m2') ? Number(data.get('area_m2')) : null,
      presupuesto_ref: data.get('presupuesto_ref') ? Number(data.get('presupuesto_ref')) : null,
      tiene_planos: data.get('tiene_planos') === 'true',
      tiene_terreno: data.get('tiene_terreno') === 'true',
      notas_internas: (data.get('notas_internas') as string) || null,
      updated_at: new Date().toISOString(),
    }

    const { error: sbError } = await supabase.from('solicitudes').update(payload).eq('id', id)

    if (sbError) {
      toast.error(sbError.message ?? 'Error al actualizar la solicitud')
      setError(sbError.message ?? 'Error al actualizar la solicitud')
      setSaving(false)
      return
    }

    toast.success('Cambios guardados')
    router.push(`/solicitudes/${id}`)
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
          <h1 className="text-2xl font-bold" style={tp}>Editar solicitud</h1>
          <p className="text-sm mt-0.5" style={ts}>Actualiza los datos de la solicitud</p>
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

        <div>
          <label className={labelClass} style={tp}>Título *</label>
          <input
            name="titulo"
            required
            defaultValue={form.titulo ?? ''}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={tp}>Cliente *</label>
            <select
              name="cliente_id"
              required
              defaultValue={form.cliente_id ?? ''}
              className={inputClass}
              style={inputStyle}
            >
              <option value="">Seleccionar cliente</option>
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
              {Object.entries(ESTADO_SOLICITUD_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} style={tp}>Prioridad</label>
            <select
              name="prioridad"
              defaultValue={form.prioridad ?? 'media'}
              className={inputClass}
              style={inputStyle}
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass} style={ts}>Fuente</label>
          <input
            name="fuente"
            defaultValue={form.fuente ?? ''}
            placeholder="Referido, web, visita..."
            className={inputClass}
            style={inputStyle}
          />
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
          <label className={labelClass} style={ts}>Dirección de la obra</label>
          <input
            name="direccion_obra"
            defaultValue={form.direccion_obra ?? ''}
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

        <div className="grid grid-cols-2 gap-4">
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
            <label className={labelClass} style={ts}>Presupuesto referencial (S/)</label>
            <input
              name="presupuesto_ref"
              type="number"
              step="0.01"
              defaultValue={form.presupuesto_ref ?? ''}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={tp}>
            <input
              type="checkbox"
              name="tiene_planos"
              value="true"
              defaultChecked={form.tiene_planos}
              className="rounded"
            />
            Tiene planos
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={tp}>
            <input
              type="checkbox"
              name="tiene_terreno"
              value="true"
              defaultChecked={form.tiene_terreno}
              className="rounded"
            />
            Tiene terreno
          </label>
        </div>

        <div>
          <label className={labelClass} style={ts}>Notas internas</label>
          <textarea
            name="notas_internas"
            rows={2}
            defaultValue={form.notas_internas ?? ''}
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

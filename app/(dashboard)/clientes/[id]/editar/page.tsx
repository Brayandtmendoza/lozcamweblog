'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function EditarClientePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [tipo, setTipo] = useState<'natural' | 'juridica'>('natural')
  const [form, setForm] = useState<any>(null)

  useEffect(() => {
    supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm(data)
          setTipo(data.tipo_persona)
        }
      })
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const formEl = e.currentTarget
    const data = new FormData(formEl)

    const payload = {
      tipo_persona: tipo,
      nombres: tipo === 'natural' ? (data.get('nombres') as string) : null,
      apellidos: tipo === 'natural' ? (data.get('apellidos') as string) : null,
      dni: tipo === 'natural' ? (data.get('dni') as string) : null,
      razon_social: tipo === 'juridica' ? (data.get('razon_social') as string) : null,
      ruc: tipo === 'juridica' ? (data.get('ruc') as string) : null,
      nombre_comercial: tipo === 'juridica' ? (data.get('nombre_comercial') as string) : null,
      email: (data.get('email') as string) || null,
      telefono: (data.get('telefono') as string) || null,
      whatsapp: (data.get('whatsapp') as string) || null,
      direccion: (data.get('direccion') as string) || null,
      distrito: (data.get('distrito') as string) || null,
      provincia: (data.get('provincia') as string) || null,
      departamento: (data.get('departamento') as string) || null,
      notas: (data.get('notas') as string) || null,
      updated_at: new Date().toISOString(),
    }

    const { error: sbError } = await supabase
      .from('clientes')
      .update(payload)
      .eq('id', id)

    if (sbError) {
      toast.error('No se pudo guardar')
      setError('Error al actualizar el cliente.')
      setSaving(false)
      return
    }

    toast.success('Cambios guardados')
    router.push(`/clientes/${id}`)
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={tp}>Editar cliente</h1>
        <p className="text-sm mt-0.5" style={ts}>Actualiza los datos del cliente</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-5" style={cardStyle}>

        <div>
          <label className={labelClass} style={ts}>Tipo de persona</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTipo('natural')}
              className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={
                tipo === 'natural'
                  ? { background: '#f59e0b', color: '#030712', borderColor: '#f59e0b' }
                  : { background: 'var(--card-bg)', color: 'var(--text-secondary)', borderColor: 'var(--card-border)' }
              }
            >
              Persona Natural
            </button>
            <button
              type="button"
              onClick={() => setTipo('juridica')}
              className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={
                tipo === 'juridica'
                  ? { background: '#f59e0b', color: '#030712', borderColor: '#f59e0b' }
                  : { background: 'var(--card-bg)', color: 'var(--text-secondary)', borderColor: 'var(--card-border)' }
              }
            >
              Persona Jurídica
            </button>
          </div>
        </div>

        {tipo === 'natural' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={ts}>Nombres *</label>
              <input
                name="nombres"
                required
                defaultValue={form.nombres ?? ''}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={ts}>Apellidos *</label>
              <input
                name="apellidos"
                required
                defaultValue={form.apellidos ?? ''}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={ts}>DNI *</label>
              <input
                name="dni"
                maxLength={8}
                required
                defaultValue={form.dni ?? ''}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass} style={ts}>Razón Social *</label>
              <input
                name="razon_social"
                required
                defaultValue={form.razon_social ?? ''}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={ts}>RUC *</label>
              <input
                name="ruc"
                maxLength={11}
                required
                defaultValue={form.ruc ?? ''}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={ts}>Nombre Comercial</label>
              <input
                name="nombre_comercial"
                defaultValue={form.nombre_comercial ?? ''}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={ts}>Email</label>
            <input
              name="email"
              type="email"
              defaultValue={form.email ?? ''}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Teléfono</label>
            <input
              name="telefono"
              defaultValue={form.telefono ?? ''}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>WhatsApp</label>
            <input
              name="whatsapp"
              defaultValue={form.whatsapp ?? ''}
              className={inputClass}
              style={inputStyle}
            />
          </div>
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

        <div>
          <label className={labelClass} style={ts}>Dirección</label>
          <input
            name="direccion"
            defaultValue={form.direccion ?? ''}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <label className={labelClass} style={ts}>Notas</label>
          <textarea
            name="notas"
            rows={3}
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

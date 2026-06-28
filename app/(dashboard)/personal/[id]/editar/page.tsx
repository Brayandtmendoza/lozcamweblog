'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const ROLES = [
  { value: 'gerente_general',     label: 'Gerente General' },
  { value: 'subgerente',          label: 'Subgerente' },
  { value: 'administrador',       label: 'Administrador' },
  { value: 'ingeniero_residente', label: 'Ing. Residente' },
  { value: 'arquitecto',          label: 'Arquitecto' },
  { value: 'tecnico_autocad',     label: 'Técnico AutoCAD' },
  { value: 'topografo',           label: 'Topógrafo' },
  { value: 'maestro_obra',        label: 'Maestro de Obra' },
  { value: 'personal_obra',       label: 'Personal de Obra' },
  { value: 'contador',            label: 'Contador' },
  { value: 'vendedor',            label: 'Vendedor' },
]

export default function EditarPersonalPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<any>(null)

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setForm(data)
      })
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const formEl = e.currentTarget
    const data = new FormData(formEl)

    const payload = {
      nombre:    data.get('nombre') as string,
      apellidos: data.get('apellidos') as string,
      rol:       data.get('rol') as string,
      dni:       (data.get('dni') as string) || null,
      telefono:  (data.get('telefono') as string) || null,
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', id)

    if (updateError) {
      toast.error(updateError.message ?? 'Error al actualizar el perfil')
      setError(updateError.message ?? 'Error al actualizar el perfil')
      setSaving(false)
      return
    }

    toast.success('Cambios guardados')
    router.push(`/personal/${id}`)
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
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={tp}>Editar perfil</h1>
          <p className="text-sm mt-0.5" style={ts}>Actualiza los datos del miembro del equipo</p>
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

      <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-4" style={cardStyle}>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={tp}>Nombre *</label>
            <input
              name="nombre"
              required
              defaultValue={form.nombre ?? ''}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={tp}>Apellidos *</label>
            <input
              name="apellidos"
              required
              defaultValue={form.apellidos ?? ''}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} style={tp}>Rol *</label>
          <select
            name="rol"
            required
            defaultValue={form.rol ?? ''}
            className={inputClass}
            style={inputStyle}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={ts}>DNI</label>
            <input
              name="dni"
              maxLength={8}
              defaultValue={form.dni ?? ''}
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

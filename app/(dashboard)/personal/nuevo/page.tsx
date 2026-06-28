'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function NuevoUsuarioPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)

    const email     = data.get('email') as string
    const nombre    = data.get('nombre') as string
    const apellidos = data.get('apellidos') as string
    const rol       = data.get('rol') as string
    const dni       = (data.get('dni') as string) || null
    const telefono  = (data.get('telefono') as string) || null

    try {
      const res = await fetch('/api/personal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nombre, apellidos, rol, dni, telefono }),
      })

      const json = await res.json()

      if (!json.ok) {
        setError(json.error ?? 'No se pudo enviar la invitación')
        toast.error(json.error ?? 'No se pudo enviar la invitación')
        setLoading(false)
        return
      }

      toast.success(`Invitación enviada a ${email}`)
      router.push('/personal')
      router.refresh()
    } catch {
      const msg = 'Error de red. Inténtalo de nuevo.'
      setError(msg)
      toast.error(msg)
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
    <div className="max-w-xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={tp}>Nuevo usuario</h1>
        <p className="text-sm mt-0.5" style={ts}>
          El usuario recibirá un correo para establecer su contraseña
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-4" style={cardStyle}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={ts}>Nombre *</label>
            <input
              name="nombre"
              required
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Apellidos *</label>
            <input
              name="apellidos"
              required
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} style={ts}>Rol *</label>
          <select
            name="rol"
            required
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
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Teléfono</label>
            <input
              name="telefono"
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} style={ts}>Email *</label>
          <input
            name="email"
            type="email"
            required
            className={inputClass}
            style={inputStyle}
            placeholder="usuario@lozcam.pe"
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
            {loading ? 'Enviando invitación...' : 'Enviar invitación'}
          </button>
        </div>
      </form>

    </div>
  )
}

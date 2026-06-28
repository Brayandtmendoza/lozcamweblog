'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)

    const email     = data.get('email') as string
    const password  = data.get('password') as string
    const nombre    = data.get('nombre') as string
    const apellidos = data.get('apellidos') as string
    const rol       = data.get('rol') as string
    const dni       = (data.get('dni') as string) || null
    const telefono  = (data.get('telefono') as string) || null

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, apellidos } }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        nombre,
        apellidos,
        rol,
        dni,
        telefono,
      })
    }

    router.push('/personal')
    router.refresh()
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo usuario</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Crea una cuenta para un miembro del equipo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              name="nombre"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
            <input
              name="apellidos"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
          <select
            name="rol"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
            <input
              name="dni"
              maxLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              name="telefono"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="usuario@lozcam.pe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

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
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creando...' : 'Crear usuario'}
          </button>
        </div>
      </form>
    </div>
  )
}


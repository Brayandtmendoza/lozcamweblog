'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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

    const { error } = await supabase
      .from('clientes')
      .update(payload)
      .eq('id', id)

    if (error) {
      setError('Error al actualizar el cliente.')
      setSaving(false)
      return
    }

    router.push(`/clientes/${id}`)
    router.refresh()
  }

  if (!form)
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar cliente</h1>
        <p className="text-gray-500 text-sm mt-0.5">Actualiza los datos del cliente</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de persona</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTipo('natural')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                tipo === 'natural'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              Persona Natural
            </button>
            <button
              type="button"
              onClick={() => setTipo('juridica')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                tipo === 'juridica'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              Persona Jurídica
            </button>
          </div>
        </div>

        {tipo === 'natural' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
              <input
                name="nombres"
                required
                defaultValue={form.nombres ?? ''}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
              <input
                name="apellidos"
                required
                defaultValue={form.apellidos ?? ''}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI *</label>
              <input
                name="dni"
                maxLength={8}
                required
                defaultValue={form.dni ?? ''}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social *</label>
              <input
                name="razon_social"
                required
                defaultValue={form.razon_social ?? ''}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RUC *</label>
              <input
                name="ruc"
                maxLength={11}
                required
                defaultValue={form.ruc ?? ''}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
              <input
                name="nombre_comercial"
                defaultValue={form.nombre_comercial ?? ''}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              defaultValue={form.email ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              name="telefono"
              defaultValue={form.telefono ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <input
              name="whatsapp"
              defaultValue={form.whatsapp ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distrito</label>
            <input
              name="distrito"
              defaultValue={form.distrito ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
            <input
              name="provincia"
              defaultValue={form.provincia ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
            <input
              name="departamento"
              defaultValue={form.departamento ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <input
            name="direccion"
            defaultValue={form.direccion ?? ''}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea
            name="notas"
            rows={3}
            defaultValue={form.notas ?? ''}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            disabled={saving}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}


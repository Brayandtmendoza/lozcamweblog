'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TIPO_SERVICIO_LABEL, ESTADO_OBRA_LABEL } from '@/lib/utils/constants'

export default function NuevaObraPage() {
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
    }

    const { error } = await supabase.from('obras').insert(payload)

    if (error) {
      setError('Error al guardar la obra. Intenta nuevamente.')
      setLoading(false)
      return
    }

    router.push('/obras')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva obra</h1>
        <p className="text-gray-500 text-sm mt-0.5">Registra una nueva obra o proyecto</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la obra *</label>
            <input
              name="nombre"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Construcción vivienda unifamiliar Los Olivos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de servicio *</label>
            <select
              name="tipo_servicio"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(TIPO_SERVICIO_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              name="estado"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(ESTADO_OBRA_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <select
              name="cliente_id"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto contrato (S/)</label>
            <input
              name="monto_contrato"
              type="number"
              step="0.01"
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de la obra *</label>
          <input
            name="direccion"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Av. ejemplo 123"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distrito</label>
            <input
              name="distrito"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
            <input
              name="provincia"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
            <input
              name="departamento"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Área (m²)</label>
            <input
              name="area_m2"
              type="number"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pisos</label>
            <input
              name="pisos"
              type="number"
              min="1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
            <select
              name="moneda"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PEN">PEN - Soles</option>
              <option value="USD">USD - Dólares</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio planificada</label>
            <input
              name="fecha_inicio_planificada"
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin planificada</label>
            <input
              name="fecha_fin_planificada"
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            name="descripcion"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas internas</label>
          <textarea
            name="notas"
            rows={2}
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
            disabled={loading}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Guardando...' : 'Guardar obra'}
          </button>
        </div>
      </form>
    </div>
  )
}


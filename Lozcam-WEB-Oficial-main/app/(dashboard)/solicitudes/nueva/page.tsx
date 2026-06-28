'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TIPO_SERVICIO_LABEL } from '@/lib/utils/constants'

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
      console.log('RESULTADO:', result)

      if (!response.ok) {
        setError(result.error ?? 'Error al guardar')
        setLoading(false)
        return
      }

      router.push('/solicitudes')
      router.refresh()
    } catch (err: any) {
      console.error('ERROR:', err)
      setError(err.message ?? 'Error inesperado')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva solicitud</h1>
        <p className="text-gray-500 text-sm mt-0.5">Registra una solicitud de servicio</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input
              name="titulo"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Construcción vivienda 2 pisos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
            <select
              name="cliente_id"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de servicio *</label>
            <select
              name="tipo_servicio"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(TIPO_SERVICIO_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
            <select
              name="prioridad"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fuente</label>
            <input
              name="fuente"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Referido, web, visita..."
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

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de la obra</label>
            <input
              name="direccion_obra"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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

        <div className="grid grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto referencial (S/)</label>
            <input
              name="presupuesto_ref"
              type="number"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" name="tiene_planos" value="true" className="rounded" />
            Tiene planos
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" name="tiene_terreno" value="true" className="rounded" />
            Tiene terreno
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas internas</label>
          <textarea
            name="notas_internas"
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
            {loading ? 'Guardando...' : 'Guardar solicitud'}
          </button>
        </div>
      </form>
    </div>
  )
}


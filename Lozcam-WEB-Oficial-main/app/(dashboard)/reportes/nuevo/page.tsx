'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Material {
  material: string
  unidad: string
  cantidad: number
  costo_unitario: number | null
  proveedor: string
}

export default function NuevoReportePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [obras, setObras] = useState<any[]>([])
  const [userId, setUserId] = useState('')
  const [materiales, setMateriales] = useState<Material[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
    supabase
      .from('obras')
      .select('id, nombre')
      .in('estado', ['en_ejecucion', 'contratada'])
      .order('nombre')
      .then(({ data }) => setObras(data ?? []))
  }, [])

  function agregarMaterial() {
    setMateriales([
      ...materiales,
      {
        material: '',
        unidad: 'und',
        cantidad: 1,
        costo_unitario: null,
        proveedor: '',
      },
    ])
  }

  function actualizarMaterial(index: number, field: keyof Material, value: any) {
    const nuevos = [...materiales]
    nuevos[index] = { ...nuevos[index], [field]: value }
    setMateriales(nuevos)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)
    const obraId = Number(data.get('obra_id'))

    try {
      const { data: reporte, error: repError } = await supabase
        .from('reportes_diarios')
        .insert({
          obra_id: obraId,
          fecha: data.get('fecha') as string,
          elaborado_por: userId,
          clima: (data.get('clima') as string) || null,
          temp_celsius: data.get('temp_celsius') ? Number(data.get('temp_celsius')) : null,
          personal_count: data.get('personal_count') ? Number(data.get('personal_count')) : null,
          descripcion: data.get('descripcion') as string,
          avance_descripcion: (data.get('avance_descripcion') as string) || null,
          problemas: (data.get('problemas') as string) || null,
        })
        .select()
        .single()

      if (repError) throw repError

      if (materiales.length > 0) {
        const matsData = materiales
          .filter((m) => m.material.trim())
          .map((m) => ({
            reporte_id: reporte.id,
            obra_id: obraId,
            material: m.material,
            unidad: m.unidad,
            cantidad: m.cantidad,
            costo_unitario: m.costo_unitario,
            proveedor: m.proveedor || null,
          }))

        if (matsData.length > 0) {
          await supabase.from('materiales_usados').insert(matsData)
        }
      }

      router.push(`/reportes/${reporte.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'Error al guardar el reporte')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo reporte diario</h1>
        <p className="text-gray-500 text-sm mt-0.5">Parte diario de obra</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Información general</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Obra *</label>
              <select
                name="obra_id"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar obra</option>
                {obras.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
              <input
                name="fecha"
                type="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clima</label>
              <select
                name="clima"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin registrar</option>
                <option value="soleado">☀️ Soleado</option>
                <option value="nublado">☁️ Nublado</option>
                <option value="lluvia">🌧️ Lluvia</option>
                <option value="tormenta">⛈️ Tormenta</option>
                <option value="viento">💨 Viento</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura (°C)</label>
              <input
                name="temp_celsius"
                type="number"
                step="0.1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 22.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Personal en obra</label>
              <input
                name="personal_count"
                type="number"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cantidad de personas"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de actividades *</label>
            <textarea
              name="descripcion"
              required
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe las actividades realizadas durante el día..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avance del día</label>
            <textarea
              name="avance_descripcion"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe el avance logrado..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Problemas / Observaciones</label>
            <textarea
              name="problemas"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Problemas encontrados, observaciones importantes..."
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Materiales usados ({materiales.length})</h2>
            <button type="button" onClick={agregarMaterial} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              + Agregar material
            </button>
          </div>

          {materiales.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Sin materiales registrados — opcional</p>
          ) : (
            <div className="space-y-3">
              {materiales.map((m, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <input
                      value={m.material}
                      onChange={(e) => actualizarMaterial(i, 'material', e.target.value)}
                      placeholder="Material"
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      value={m.unidad}
                      onChange={(e) => actualizarMaterial(i, 'unidad', e.target.value)}
                      placeholder="Unidad"
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={m.cantidad}
                      onChange={(e) => actualizarMaterial(i, 'cantidad', Number(e.target.value))}
                      placeholder="Cant."
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      value={m.proveedor}
                      onChange={(e) => actualizarMaterial(i, 'proveedor', e.target.value)}
                      placeholder="Proveedor"
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => setMateriales(materiales.filter((_, idx) => idx !== i))}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3">
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
            {loading ? 'Guardando...' : 'Guardar reporte'}
          </button>
        </div>
      </form>
    </div>
  )
}


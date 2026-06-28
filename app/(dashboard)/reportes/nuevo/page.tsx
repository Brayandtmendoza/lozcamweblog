'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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
      { material: '', unidad: 'und', cantidad: 1, costo_unitario: null, proveedor: '' },
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

      toast.success('Reporte creado')
      router.push(`/reportes/${reporte.id}`)
      router.refresh()
    } catch (err: any) {
      toast.error('No se pudo crear el reporte')
      setError(err.message ?? 'Error al guardar el reporte')
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
  const partidaInputStyle = {
    background: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    color: 'var(--text-primary)',
  }
  const partidaInputClass = 'w-full rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500'

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={tp}>Nuevo reporte diario</h1>
        <p className="text-sm mt-0.5" style={ts}>Parte diario de obra</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Información general */}
        <div className="rounded-xl p-6 space-y-4" style={cardStyle}>
          <h2 className="text-sm font-semibold" style={tp}>Información general</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={ts}>Obra *</label>
              <select name="obra_id" required className={inputClass} style={inputStyle}>
                <option value="">Seleccionar obra</option>
                {obras.map((o) => (
                  <option key={o.id} value={o.id}>{o.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} style={ts}>Fecha *</label>
              <input
                name="fecha"
                type="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={ts}>Clima</label>
              <select name="clima" className={inputClass} style={inputStyle}>
                <option value="">Sin registrar</option>
                <option value="soleado">☀️ Soleado</option>
                <option value="nublado">☁️ Nublado</option>
                <option value="lluvia">🌧️ Lluvia</option>
                <option value="tormenta">⛈️ Tormenta</option>
                <option value="viento">💨 Viento</option>
              </select>
            </div>
            <div>
              <label className={labelClass} style={ts}>Temperatura (°C)</label>
              <input
                name="temp_celsius"
                type="number"
                step="0.1"
                className={inputClass}
                style={inputStyle}
                placeholder="Ej: 22.5"
              />
            </div>
            <div>
              <label className={labelClass} style={ts}>Personal en obra</label>
              <input
                name="personal_count"
                type="number"
                min="0"
                className={inputClass}
                style={inputStyle}
                placeholder="Cantidad de personas"
              />
            </div>
          </div>

          <div>
            <label className={labelClass} style={ts}>Descripción de actividades *</label>
            <textarea
              name="descripcion"
              required
              rows={4}
              className={inputClass}
              style={inputStyle}
              placeholder="Describe las actividades realizadas durante el día..."
            />
          </div>

          <div>
            <label className={labelClass} style={ts}>Avance del día</label>
            <textarea
              name="avance_descripcion"
              rows={2}
              className={inputClass}
              style={inputStyle}
              placeholder="Describe el avance logrado..."
            />
          </div>

          <div>
            <label className={labelClass} style={ts}>Problemas / Observaciones</label>
            <textarea
              name="problemas"
              rows={2}
              className={inputClass}
              style={inputStyle}
              placeholder="Problemas encontrados, observaciones importantes..."
            />
          </div>
        </div>

        {/* Materiales usados */}
        <div className="rounded-xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={tp}>
              Materiales usados ({materiales.length})
            </h2>
            <button
              type="button"
              onClick={agregarMaterial}
              className="text-sm text-amber-500 hover:text-amber-400 font-medium"
            >
              + Agregar material
            </button>
          </div>

          {materiales.length === 0 ? (
            <p className="text-xs text-center py-4" style={ts}>Sin materiales registrados — opcional</p>
          ) : (
            <div className="space-y-3">
              {materiales.map((m, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <input
                      value={m.material}
                      onChange={(e) => actualizarMaterial(i, 'material', e.target.value)}
                      placeholder="Material"
                      className={partidaInputClass}
                      style={partidaInputStyle}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      value={m.unidad}
                      onChange={(e) => actualizarMaterial(i, 'unidad', e.target.value)}
                      placeholder="Unidad"
                      className={partidaInputClass}
                      style={partidaInputStyle}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={m.cantidad}
                      onChange={(e) => actualizarMaterial(i, 'cantidad', Number(e.target.value))}
                      placeholder="Cant."
                      className={partidaInputClass}
                      style={partidaInputStyle}
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      value={m.proveedor}
                      onChange={(e) => actualizarMaterial(i, 'proveedor', e.target.value)}
                      placeholder="Proveedor"
                      className={partidaInputClass}
                      style={partidaInputStyle}
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
            {loading ? 'Guardando...' : 'Guardar reporte'}
          </button>
        </div>

      </form>
    </div>
  )
}

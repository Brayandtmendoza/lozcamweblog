'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TIPO_COSTO_LABEL } from '@/lib/types/presupuestos'
import { toast } from 'sonner'

interface Partida {
  codigo: string
  descripcion: string
  unidad: string
  metrado: number
  precio_unitario: number
  tipo_costo: string
  orden: number
}

export default function NuevoPresupuestoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [obras, setObras] = useState<Array<{ id: number; nombre: string }>>([])
  const [userId, setUserId] = useState('')
  const [partidas, setPartidas] = useState<Partida[]>([
    {
      codigo: '',
      descripcion: '',
      unidad: 'glb',
      metrado: 1,
      precio_unitario: 0,
      tipo_costo: 'mano_obra',
      orden: 0,
    },
  ])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })

    supabase
      .from('obras')
      .select('id, nombre')
      .order('nombre')
      .then(({ data }) => setObras((data ?? []) as Array<{ id: number; nombre: string }>))
  }, [])

  function agregarPartida() {
    setPartidas([
      ...partidas,
      {
        codigo: '',
        descripcion: '',
        unidad: 'glb',
        metrado: 1,
        precio_unitario: 0,
        tipo_costo: 'mano_obra',
        orden: partidas.length,
      },
    ])
  }

  function eliminarPartida(index: number) {
    setPartidas(partidas.filter((_, i) => i !== index))
  }

  function actualizarPartida(index: number, field: keyof Partida, value: string | number) {
    const nuevas = [...partidas]
    nuevas[index] = { ...nuevas[index], [field]: value } as Partida
    setPartidas(nuevas)
  }

  const totalDirecto = partidas.reduce((sum, p) => sum + p.metrado * p.precio_unitario, 0)
  const gastosGenerales = totalDirecto * 0.1
  const utilidad = totalDirecto * 0.08
  const subtotal = totalDirecto + gastosGenerales + utilidad
  const igv = subtotal * 0.18
  const total = subtotal + igv

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const { data: presData, error: presError } = await supabase
        .from('presupuestos')
        .insert({
          obra_id: Number(data.get('obra_id')),
          nombre: data.get('nombre') as string,
          descripcion: (data.get('descripcion') as string) || null,
          elaborado_por: userId,
          total_directo: totalDirecto,
          gastos_generales: gastosGenerales,
          utilidad: utilidad,
          igv: igv,
          total: total,
          moneda: 'PEN',
          estado: 'borrador',
          es_vigente: false,
        })
        .select()
        .single()

      if (presError) throw presError

      if (partidas.length > 0) {
        const partidasData = partidas.map((p, i) => ({
          presupuesto_id: presData.id,
          codigo: p.codigo || null,
          descripcion: p.descripcion,
          unidad: p.unidad,
          metrado: p.metrado,
          precio_unitario: p.precio_unitario,
          parcial: p.metrado * p.precio_unitario,
          tipo_costo: p.tipo_costo,
          orden: i,
        }))

        await supabase.from('partidas').insert(partidasData)
      }

      toast.success('Presupuesto creado')
      router.push(`/presupuestos/${presData.id}`)
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      toast.error(message ?? 'Error al guardar')
      setError(message ?? 'Error al guardar')
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={tp}>Nuevo presupuesto</h1>
        <p className="text-sm mt-0.5" style={ts}>Elabora el presupuesto de una obra</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Tarjeta 1: Información general */}
        <div className="rounded-xl p-6 space-y-4" style={cardStyle}>
          <h2 className="text-sm font-semibold" style={ts}>Información general</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={ts}>Nombre *</label>
              <input
                name="nombre"
                required
                className={inputClass}
                style={inputStyle}
                placeholder="Ej: Presupuesto inicial"
              />
            </div>
            <div>
              <label className={labelClass} style={ts}>Obra *</label>
              <select
                name="obra_id"
                required
                className={inputClass}
                style={inputStyle}
              >
                <option value="">Seleccionar obra</option>
                {obras.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass} style={ts}>Descripción</label>
            <textarea
              name="descripcion"
              rows={2}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Tarjeta 2: Partidas */}
        <div className="rounded-xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={ts}>Partidas ({partidas.length})</h2>
            <button
              type="button"
              onClick={agregarPartida}
              className="text-sm font-medium text-amber-500 hover:text-amber-400"
            >
              + Agregar partida
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium px-1" style={ts}>
              <div className="col-span-1">Código</div>
              <div className="col-span-3">Descripción</div>
              <div className="col-span-1">Unidad</div>
              <div className="col-span-1">Metrado</div>
              <div className="col-span-2">P. Unit (S/)</div>
              <div className="col-span-2">Tipo</div>
              <div className="col-span-1">Parcial</div>
              <div className="col-span-1"></div>
            </div>

            {partidas.map((p, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-1">
                  <input
                    value={p.codigo}
                    onChange={(e) => actualizarPartida(i, 'codigo', e.target.value)}
                    className={partidaInputClass}
                    style={partidaInputStyle}
                    placeholder="01.01"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    value={p.descripcion}
                    onChange={(e) => actualizarPartida(i, 'descripcion', e.target.value)}
                    required
                    className={partidaInputClass}
                    style={partidaInputStyle}
                    placeholder="Descripción"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    value={p.unidad}
                    onChange={(e) => actualizarPartida(i, 'unidad', e.target.value)}
                    className={partidaInputClass}
                    style={partidaInputStyle}
                    placeholder="m2"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    type="number"
                    value={p.metrado}
                    onChange={(e) => actualizarPartida(i, 'metrado', Number(e.target.value))}
                    className={partidaInputClass}
                    style={partidaInputStyle}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={p.precio_unitario}
                    onChange={(e) => actualizarPartida(i, 'precio_unitario', Number(e.target.value))}
                    className={partidaInputClass}
                    style={partidaInputStyle}
                  />
                </div>
                <div className="col-span-2">
                  <select
                    value={p.tipo_costo}
                    onChange={(e) => actualizarPartida(i, 'tipo_costo', e.target.value)}
                    className={partidaInputClass}
                    style={partidaInputStyle}
                  >
                    {Object.entries(TIPO_COSTO_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1 text-xs font-medium text-right" style={tp}>
                  S/ {(p.metrado * p.precio_unitario).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </div>
                <div className="col-span-1 text-center">
                  {partidas.length > 1 && (
                    <button type="button" onClick={() => eliminarPartida(i)} className="text-red-400 hover:text-red-600 text-xs">
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="mt-6 pt-4 space-y-2" style={{ borderTop: '1px solid var(--card-border)' }}>
            <div className="flex justify-between text-sm">
              <span style={ts}>Costo directo</span>
              <span className="font-medium" style={tp}>S/ {totalDirecto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={ts}>Gastos generales (10%)</span>
              <span style={ts}>S/ {gastosGenerales.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={ts}>Utilidad (8%)</span>
              <span style={ts}>S/ {utilidad.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={ts}>IGV (18%)</span>
              <span style={ts}>S/ {igv.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2" style={{ borderTop: '1px solid var(--card-border)' }}>
              <span style={tp}>TOTAL</span>
              <span className="text-amber-500">S/ {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
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
            {loading ? 'Guardando...' : 'Guardar presupuesto'}
          </button>
        </div>

      </form>
    </div>
  )
}

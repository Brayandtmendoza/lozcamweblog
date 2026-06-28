'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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

export default function EditarPresupuestoPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<any>(null)
  const [obras, setObras] = useState<Array<{ id: number; nombre: string }>>([])
  const [partidas, setPartidas] = useState<Partida[]>([])

  useEffect(() => {
    Promise.all([
      supabase.from('presupuestos').select('*').eq('id', id).single(),
      supabase.from('obras').select('id, nombre').order('nombre'),
      supabase
        .from('partidas')
        .select('*')
        .eq('presupuesto_id', id)
        .order('orden', { ascending: true }),
    ]).then(([{ data: pres }, { data: obrasData }, { data: partidasData }]) => {
      if (pres) setForm(pres)
      setObras((obrasData ?? []) as Array<{ id: number; nombre: string }>)
      if (partidasData && partidasData.length > 0) {
        setPartidas(
          partidasData.map((p: any) => ({
            codigo: p.codigo ?? '',
            descripcion: p.descripcion,
            unidad: p.unidad ?? 'glb',
            metrado: p.metrado ?? 1,
            precio_unitario: p.precio_unitario ?? 0,
            tipo_costo: p.tipo_costo,
            orden: p.orden,
          }))
        )
      } else {
        setPartidas([
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
      }
    })
  }, [id])

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
    setSaving(true)
    setError('')

    const formEl = e.currentTarget
    const data = new FormData(formEl)

    try {
      const { error: updateError } = await supabase
        .from('presupuestos')
        .update({
          obra_id: Number(data.get('obra_id')),
          nombre: data.get('nombre') as string,
          descripcion: (data.get('descripcion') as string) || null,
          estado: data.get('estado') as string,
          es_vigente: data.get('es_vigente') === 'true',
          total_directo: totalDirecto,
          gastos_generales: gastosGenerales,
          utilidad: utilidad,
          igv: igv,
          total: total,
        })
        .eq('id', id)

      if (updateError) throw updateError

      await supabase.from('partidas').delete().eq('presupuesto_id', id)

      if (partidas.length > 0) {
        const partidasData = partidas.map((p, i) => ({
          presupuesto_id: id,
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

      toast.success('Cambios guardados')
      router.push(`/presupuestos/${id}`)
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      toast.error(message ?? 'Error al guardar')
      setError(message ?? 'Error al guardar')
      setSaving(false)
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
  const partidaInputClass =
    'w-full rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500'

  if (!form)
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm" style={ts}>Cargando...</p>
      </div>
    )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={tp}>Editar presupuesto</h1>
          <p className="text-sm mt-0.5" style={ts}>Actualiza los datos y partidas del presupuesto</p>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl p-6 space-y-4" style={cardStyle}>
          <h2 className="text-sm font-semibold" style={tp}>Información general</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={tp}>Nombre *</label>
              <input
                name="nombre"
                required
                defaultValue={form.nombre ?? ''}
                placeholder="Ej: Presupuesto inicial"
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={tp}>Obra *</label>
              <select
                name="obra_id"
                required
                defaultValue={form.obra_id ?? ''}
                className={inputClass}
                style={inputStyle}
              >
                <option value="">Seleccionar obra</option>
                {obras.map((o) => (
                  <option key={o.id} value={o.id}>{o.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={ts}>Estado</label>
              <select
                name="estado"
                defaultValue={form.estado ?? 'borrador'}
                className={inputClass}
                style={inputStyle}
              >
                <option value="borrador">Borrador</option>
                <option value="revision">En Revisión</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={tp}>
                <input
                  type="checkbox"
                  name="es_vigente"
                  value="true"
                  defaultChecked={form.es_vigente}
                  className="rounded"
                />
                Marcar como vigente
              </label>
            </div>
          </div>

          <div>
            <label className={labelClass} style={ts}>Descripción</label>
            <textarea
              name="descripcion"
              rows={2}
              defaultValue={form.descripcion ?? ''}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div className="rounded-xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={tp}>
              Partidas ({partidas.length})
            </h2>
            <button
              type="button"
              onClick={agregarPartida}
              className="text-sm text-amber-500 hover:text-amber-400 font-medium"
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
                    style={inputStyle}
                    placeholder="01.01"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    value={p.descripcion}
                    onChange={(e) => actualizarPartida(i, 'descripcion', e.target.value)}
                    required
                    className={partidaInputClass}
                    style={inputStyle}
                    placeholder="Descripción"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    value={p.unidad}
                    onChange={(e) => actualizarPartida(i, 'unidad', e.target.value)}
                    className={partidaInputClass}
                    style={inputStyle}
                    placeholder="m2"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    type="number"
                    value={p.metrado}
                    onChange={(e) => actualizarPartida(i, 'metrado', Number(e.target.value))}
                    className={partidaInputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={p.precio_unitario}
                    onChange={(e) =>
                      actualizarPartida(i, 'precio_unitario', Number(e.target.value))
                    }
                    className={partidaInputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="col-span-2">
                  <select
                    value={p.tipo_costo}
                    onChange={(e) => actualizarPartida(i, 'tipo_costo', e.target.value)}
                    className={partidaInputClass}
                    style={inputStyle}
                  >
                    {Object.entries(TIPO_COSTO_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1 text-xs font-medium text-right" style={tp}>
                  S/{' '}
                  {(p.metrado * p.precio_unitario).toLocaleString('es-PE', {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <div className="col-span-1 text-center">
                  {partidas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarPartida(i)}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-6 pt-4 space-y-2"
            style={{ borderTop: '1px solid var(--card-border)' }}
          >
            <div className="flex justify-between text-sm">
              <span style={ts}>Costo directo</span>
              <span className="font-medium" style={tp}>
                S/ {totalDirecto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={ts}>Gastos generales (10%)</span>
              <span style={tp}>
                S/ {gastosGenerales.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={ts}>Utilidad (8%)</span>
              <span style={tp}>
                S/ {utilidad.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={ts}>IGV (18%)</span>
              <span style={tp}>
                S/ {igv.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div
              className="flex justify-between text-base font-bold pt-2"
              style={{ borderTop: '1px solid var(--card-border)' }}
            >
              <span style={tp}>TOTAL</span>
              <span className="text-amber-500">
                S/ {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
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

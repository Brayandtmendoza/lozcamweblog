'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { METODO_PAGO_LABEL, ESTADO_PAGO_LABEL } from '@/lib/types/pagos'
import { toast } from 'sonner'

export default function EditarPagoPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<any>(null)
  const [obras, setObras] = useState<any[]>([])
  const [clienteNombre, setClienteNombre] = useState('')
  const [clienteId, setClienteId] = useState<number | null>(null)
  const [nuevoArchivo, setNuevoArchivo] = useState<File | null>(null)

  useEffect(() => {
    Promise.all([
      supabase.from('pagos_clientes').select('*').eq('id', id).single(),
      supabase
        .from('obras')
        .select('id, nombre, cliente_id, clientes(nombres, apellidos, razon_social, tipo_persona)')
        .order('nombre'),
    ]).then(([{ data: pago }, { data: obrasData }]) => {
      if (pago) setForm(pago)
      const lista = obrasData ?? []
      setObras(lista)
      if (pago) {
        const obra = lista.find((o: any) => o.id === pago.obra_id)
        if (obra?.clientes) {
          const c = obra.clientes as any
          setClienteNombre(
            c.razon_social ?? `${c.nombres ?? ''} ${c.apellidos ?? ''}`.trim()
          )
          setClienteId(obra.cliente_id)
        }
      }
    })
  }, [id])

  function handleObraChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const obraId = Number(e.target.value)
    const obra = obras.find((o: any) => o.id === obraId)
    if (obra?.clientes) {
      const c = obra.clientes as any
      setClienteNombre(
        c.razon_social ?? `${c.nombres ?? ''} ${c.apellidos ?? ''}`.trim()
      )
      setClienteId(obra.cliente_id)
    } else {
      setClienteNombre('')
      setClienteId(null)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const formEl = e.currentTarget
    const data = new FormData(formEl)

    try {
      let archivo_voucher: string | null = form.archivo_voucher ?? null

      if (nuevoArchivo) {
        const filePath = `vouchers/${Date.now()}_${nuevoArchivo.name}`
        const { error: uploadError } = await supabase.storage
          .from('documentos')
          .upload(filePath, nuevoArchivo)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage
          .from('documentos')
          .getPublicUrl(filePath)
        archivo_voucher = urlData.publicUrl
      }

      const payload = {
        obra_id: Number(data.get('obra_id')),
        cliente_id: clienteId,
        concepto: data.get('concepto') as string,
        numero_cuota: data.get('numero_cuota') ? Number(data.get('numero_cuota')) : null,
        monto: Number(data.get('monto')),
        moneda: (form.moneda as string) || 'PEN',
        metodo_pago: data.get('metodo_pago') as string,
        numero_operacion: (data.get('numero_operacion') as string) || null,
        fecha_pago: data.get('fecha_pago') as string,
        estado: data.get('estado') as string,
        notas: (data.get('notas') as string) || null,
        archivo_voucher,
      }

      const { error: updateError } = await supabase
        .from('pagos_clientes')
        .update(payload)
        .eq('id', id)

      if (updateError) throw updateError

      toast.success('Cambios guardados')
      router.push(`/pagos/${id}`)
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message ?? 'Error al actualizar el pago')
      setError(err?.message ?? 'Error al actualizar el pago')
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
          <h1 className="text-2xl font-bold" style={tp}>Editar pago</h1>
          <p className="text-sm mt-0.5" style={ts}>Actualiza los datos del pago</p>
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

        <div>
          <label className={labelClass} style={tp}>Concepto *</label>
          <input
            name="concepto"
            required
            defaultValue={form.concepto ?? ''}
            placeholder="Ej: Adelanto 30%, Valorización #2"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={tp}>Obra *</label>
            <select
              name="obra_id"
              required
              defaultValue={form.obra_id ?? ''}
              onChange={handleObraChange}
              className={inputClass}
              style={inputStyle}
            >
              <option value="">Seleccionar obra</option>
              {obras.map((o: any) => (
                <option key={o.id} value={o.id}>{o.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} style={ts}>Cliente (de la obra)</label>
            <div
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={{ ...inputStyle, opacity: 0.75 }}
            >
              <span style={clienteNombre ? tp : ts}>{clienteNombre || '—'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={tp}>Monto (S/) *</label>
            <input
              name="monto"
              type="number"
              step="0.01"
              min="0.01"
              required
              defaultValue={form.monto ?? ''}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>N° Cuota</label>
            <input
              name="numero_cuota"
              type="number"
              min="1"
              defaultValue={form.numero_cuota ?? ''}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={tp}>Método de pago *</label>
            <select
              name="metodo_pago"
              required
              defaultValue={form.metodo_pago ?? ''}
              className={inputClass}
              style={inputStyle}
            >
              {Object.entries(METODO_PAGO_LABEL).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} style={tp}>Fecha de pago *</label>
            <input
              name="fecha_pago"
              type="date"
              required
              defaultValue={form.fecha_pago?.slice(0, 10) ?? ''}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={tp}>Estado *</label>
            <select
              name="estado"
              required
              defaultValue={form.estado ?? 'pendiente'}
              className={inputClass}
              style={inputStyle}
            >
              {Object.entries(ESTADO_PAGO_LABEL).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} style={ts}>N° Operación</label>
            <input
              name="numero_operacion"
              defaultValue={form.numero_operacion ?? ''}
              placeholder="Número de transferencia o referencia"
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} style={ts}>Voucher / Comprobante</label>
          {form.archivo_voucher && !nuevoArchivo && (
            <p className="text-xs mb-2 text-amber-500">
              Archivo actual:{' '}
              <a
                href={form.archivo_voucher}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                ver
              </a>
            </p>
          )}
          <div
            className="rounded-lg p-4 text-center transition-colors"
            style={{ border: '2px dashed var(--card-border)' }}
          >
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setNuevoArchivo(e.target.files?.[0] ?? null)}
              className="hidden"
              id="voucher-input-edit"
            />
            <label htmlFor="voucher-input-edit" className="cursor-pointer">
              {nuevoArchivo ? (
                <p className="text-sm font-medium text-amber-500">{nuevoArchivo.name}</p>
              ) : (
                <p className="text-sm" style={ts}>Clic para reemplazar voucher (PDF, JPG, PNG)</p>
              )}
            </label>
          </div>
        </div>

        <div>
          <label className={labelClass} style={ts}>Notas</label>
          <textarea
            name="notas"
            rows={2}
            defaultValue={form.notas ?? ''}
            className={inputClass}
            style={inputStyle}
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

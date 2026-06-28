'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { METODO_PAGO_LABEL } from '@/lib/types/pagos'
import { toast } from 'sonner'

export default function NuevoPagoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [obras, setObras] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [userId, setUserId] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })

    supabase
      .from('obras')
      .select('id, nombre')
      .order('nombre')
      .then(({ data }) => setObras(data ?? []))

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

    try {
      let archivo_voucher: string | null = null

      if (archivo) {
        const filePath = `vouchers/${Date.now()}_${archivo.name}`
        const { error: uploadError } = await supabase.storage
          .from('documentos')
          .upload(filePath, archivo)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(filePath)
        archivo_voucher = urlData.publicUrl
      }

      const { error: pagoError } = await supabase
        .from('pagos_clientes')
        .insert({
          obra_id: Number(data.get('obra_id')),
          cliente_id: Number(data.get('cliente_id')),
          registrado_por: userId,
          concepto: data.get('concepto') as string,
          numero_cuota: data.get('numero_cuota') ? Number(data.get('numero_cuota')) : null,
          monto: Number(data.get('monto')),
          moneda: 'PEN',
          metodo_pago: data.get('metodo_pago') as string,
          numero_operacion: (data.get('numero_operacion') as string) || null,
          fecha_pago: data.get('fecha_pago') as string,
          estado: 'pendiente',
          notas: (data.get('notas') as string) || null,
          archivo_voucher,
        })

      if (pagoError) throw pagoError

      toast.success('Pago registrado')
      router.push('/pagos')
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message ?? 'Error al registrar el pago')
      setError(err?.message ?? 'Error al registrar el pago')
    } finally {
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={tp}>Registrar pago</h1>
        <p className="text-sm mt-0.5" style={ts}>Registra un pago recibido de un cliente</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-4" style={cardStyle}>

        <div>
          <label className={labelClass} style={ts}>Concepto *</label>
          <input
            name="concepto"
            required
            className={inputClass}
            style={inputStyle}
            placeholder="Ej: Adelanto 30%, Valorización #2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <label className={labelClass} style={ts}>Cliente *</label>
            <select
              name="cliente_id"
              required
              className={inputClass}
              style={inputStyle}
            >
              <option value="">Seleccionar cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tipo_persona === 'natural'
                    ? `${c.nombres} ${c.apellidos}`
                    : c.razon_social}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={ts}>Monto (S/) *</label>
            <input
              name="monto"
              type="number"
              step="0.01"
              min="0.01"
              required
              className={inputClass}
              style={inputStyle}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>N° Cuota</label>
            <input
              name="numero_cuota"
              type="number"
              min="1"
              className={inputClass}
              style={inputStyle}
              placeholder="Ej: 1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={ts}>Método de pago *</label>
            <select
              name="metodo_pago"
              required
              className={inputClass}
              style={inputStyle}
            >
              {Object.entries(METODO_PAGO_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} style={ts}>Fecha de pago *</label>
            <input
              name="fecha_pago"
              type="date"
              required
              defaultValue={new Date().toISOString().split('T')[0]}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} style={ts}>N° Operación</label>
          <input
            name="numero_operacion"
            className={inputClass}
            style={inputStyle}
            placeholder="Número de transferencia o referencia"
          />
        </div>

        {/* Zona upload voucher */}
        <div>
          <label className={labelClass} style={ts}>Voucher / Comprobante</label>
          <div
            className="border-2 border-dashed rounded-lg p-4 text-center transition-colors hover:border-amber-500"
            style={{ borderColor: 'var(--card-border)' }}
          >
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              className="hidden"
              id="voucher-input"
            />
            <label htmlFor="voucher-input" className="cursor-pointer">
              {archivo ? (
                <p className="text-sm font-medium text-amber-500">{archivo.name}</p>
              ) : (
                <p className="text-sm" style={ts}>Clic para subir voucher (PDF, JPG, PNG)</p>
              )}
            </label>
          </div>
        </div>

        <div>
          <label className={labelClass} style={ts}>Notas</label>
          <textarea
            name="notas"
            rows={2}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        {error ? <p className="text-red-500 text-sm">{error}</p> : null}

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
            {loading ? 'Guardando...' : 'Registrar pago'}
          </button>
        </div>
      </form>
    </div>
  )
}

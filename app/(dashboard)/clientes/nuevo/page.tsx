'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function NuevoClientePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [tipo, setTipo] = useState<'natural' | 'juridica'>('natural')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const data = new FormData(form)

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
      referencia: (data.get('referencia') as string) || null,
      notas: (data.get('notas') as string) || null,
    }

    const { error: sbError } = await supabase.from('clientes').insert(payload)

    if (sbError) {
      toast.error(sbError.message ?? 'No se pudo crear el cliente')
      setLoading(false)
      return
    }

    toast.success('Cliente creado correctamente')
    router.push('/clientes')
    router.refresh()
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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={tp}>Nuevo cliente</h1>
        <p className="text-sm mt-0.5" style={ts}>Completa los datos del cliente</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-5" style={cardStyle}>

        {/* Toggle tipo de persona */}
        <div>
          <label className={labelClass} style={ts}>Tipo de persona</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTipo('natural')}
              className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={
                tipo === 'natural'
                  ? { background: '#f59e0b', color: '#030712', borderColor: '#f59e0b' }
                  : { background: 'var(--card-bg)', color: 'var(--text-secondary)', borderColor: 'var(--card-border)' }
              }
            >
              Persona Natural
            </button>
            <button
              type="button"
              onClick={() => setTipo('juridica')}
              className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={
                tipo === 'juridica'
                  ? { background: '#f59e0b', color: '#030712', borderColor: '#f59e0b' }
                  : { background: 'var(--card-bg)', color: 'var(--text-secondary)', borderColor: 'var(--card-border)' }
              }
            >
              Persona Jurídica
            </button>
          </div>
        </div>

        {tipo === 'natural' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={ts}>Nombres *</label>
              <input
                name="nombres"
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={ts}>Apellidos *</label>
              <input
                name="apellidos"
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={ts}>DNI *</label>
              <input
                name="dni"
                maxLength={8}
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass} style={ts}>Razón Social *</label>
              <input
                name="razon_social"
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={ts}>RUC *</label>
              <input
                name="ruc"
                maxLength={11}
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={ts}>Nombre Comercial</label>
              <input
                name="nombre_comercial"
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={ts}>Email</label>
            <input
              name="email"
              type="email"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Teléfono</label>
            <input
              name="telefono"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>WhatsApp</label>
            <input
              name="whatsapp"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Distrito</label>
            <input
              name="distrito"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Provincia</label>
            <input
              name="provincia"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={ts}>Departamento</label>
            <input
              name="departamento"
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} style={ts}>Dirección</label>
          <input
            name="direccion"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <label className={labelClass} style={ts}>Notas</label>
          <textarea
            name="notas"
            rows={3}
            className={inputClass}
            style={inputStyle}
          />
        </div>

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
            {loading ? 'Guardando...' : 'Guardar cliente'}
          </button>
        </div>
      </form>
    </div>
  )
}

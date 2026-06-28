'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatFecha } from '@/lib/utils/formatters'
import { FilaTabla } from './TablaHover'
import { AccionesFila } from '@/components/shared/AccionesFila'
import { toast } from 'sonner'

export default function ClientesPage() {
  const supabase = createClient()

  const [clientes, setClientes] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase
      .from('clientes')
      .select('*')
      .eq('activo', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setClientes(data ?? [])
        setCargando(false)
      })
  }, [])

  async function handleEliminar(id: number | string) {
    const { error } = await supabase
      .from('clientes')
      .update({ activo: false })
      .eq('id', id)
    if (error) throw new Error(error.message)
    setClientes(prev => prev.filter(c => c.id !== id))
  }

  const cardStyle = { background: 'var(--card-bg)', border: '1px solid var(--card-border)' }
  const tp = { color: 'var(--text-primary)' }
  const ts = { color: 'var(--text-secondary)' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={tp}>Clientes</h1>
          <p className="text-sm mt-0.5" style={ts}>
            {cargando ? '...' : `${clientes.length} cliente${clientes.length !== 1 ? 's' : ''} registrado${clientes.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/clientes/nuevo"
          className="bg-action hover:bg-action-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nuevo cliente
        </Link>
      </div>

      {cargando ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={ts}>Cargando...</p>
        </div>
      ) : clientes.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={ts}>No hay clientes registrados aún</p>
          <Link
            href="/clientes/nuevo"
            className="mt-4 inline-block bg-action hover:bg-action-hover text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Registrar primer cliente
          </Link>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={cardStyle}>
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--table-header-bg)' }}>
              <tr style={{ borderBottom: '2px solid var(--table-border)' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>DNI / RUC</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Contacto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Distrito</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Registrado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente: any) => (
                <FilaTabla key={cliente.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium" style={tp}>
                      {cliente.tipo_persona === 'natural'
                        ? `${cliente.nombres} ${cliente.apellidos}`
                        : cliente.razon_social}
                    </div>
                    <div className="text-xs mt-0.5" style={ts}>
                      {cliente.tipo_persona === 'natural' ? 'Persona natural' : 'Persona jurídica'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={ts}>
                    {cliente.tipo_persona === 'natural' ? cliente.dni : cliente.ruc}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm" style={ts}>{cliente.email ?? '—'}</div>
                    <div className="text-xs mt-0.5" style={ts}>{cliente.telefono ?? '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={ts}>{cliente.distrito ?? '—'}</td>
                  <td className="px-4 py-3 text-xs" style={ts}>{formatFecha(cliente.created_at)}</td>
                  <td className="px-4 py-3">
                    <AccionesFila
                      id={cliente.id}
                      rutaBase="/clientes"
                      onEliminar={handleEliminar}
                      tituloModal="¿Eliminar este cliente?"
                      descripcionModal="Dejará de aparecer en los listados. (No se elimina su historial.)"
                      mensajeExito="Cliente eliminado"
                    />
                  </td>
                </FilaTabla>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

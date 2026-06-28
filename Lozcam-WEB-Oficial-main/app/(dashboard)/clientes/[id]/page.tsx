import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatFecha } from '@/lib/utils/formatters'

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (isNaN(id)) notFound()

  const supabase = await createClient()
  const { data: cliente, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !cliente) notFound()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {cliente.tipo_persona === 'natural'
              ? `${cliente.nombres} ${cliente.apellidos}`
              : cliente.razon_social}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {cliente.tipo_persona === 'natural' ? 'Persona Natural' : 'Persona Jurídica'}
          </p>
        </div>
        <Link href="/clientes" className="text-sm text-gray-500 hover:text-gray-700">
          ← Volver
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {cliente.tipo_persona === 'natural' ? (
            <>
              <div>
                <p className="text-xs text-gray-500 mb-1">DNI</p>
                <p className="text-sm font-medium text-gray-900">{cliente.dni ?? '—'}</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-xs text-gray-500 mb-1">RUC</p>
                <p className="text-sm font-medium text-gray-900">{cliente.ruc ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Nombre comercial</p>
                <p className="text-sm font-medium text-gray-900">{cliente.nombre_comercial ?? '—'}</p>
              </div>
            </>
          )}

          <div>
            <p className="text-xs text-gray-500 mb-1">Email</p>
            <p className="text-sm font-medium text-gray-900">{cliente.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Teléfono</p>
            <p className="text-sm font-medium text-gray-900">{cliente.telefono ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">WhatsApp</p>
            <p className="text-sm font-medium text-gray-900">{cliente.whatsapp ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Distrito</p>
            <p className="text-sm font-medium text-gray-900">{cliente.distrito ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Provincia</p>
            <p className="text-sm font-medium text-gray-900">{cliente.provincia ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Departamento</p>
            <p className="text-sm font-medium text-gray-900">{cliente.departamento ?? '—'}</p>
          </div>
        </div>

        {cliente.direccion && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Dirección</p>
            <p className="text-sm font-medium text-gray-900">{cliente.direccion}</p>
          </div>
        )}

        {cliente.notas && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Notas</p>
            <p className="text-sm text-gray-600">{cliente.notas}</p>
          </div>
        )}

        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400">Registrado el {formatFecha(cliente.created_at)}</p>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <Link
          href={`/clientes/${cliente.id}/editar`}
          className="flex-1 text-center border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Editar cliente
        </Link>
      </div>
    </div>
  )
}


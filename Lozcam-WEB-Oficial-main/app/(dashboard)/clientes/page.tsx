import { getClientes } from '@/lib/supabase/queries/clientes'
import Link from 'next/link'
import { formatFecha } from '@/lib/utils/formatters'
import { FilaTabla } from './TablaHover'

export default async function ClientesPage() {
  const clientes = await getClientes()

  const cardStyle = { background: 'var(--card-bg)', border: '1px solid var(--card-border)' }
  const tp = { color: 'var(--text-primary)' }
  const ts = { color: 'var(--text-secondary)' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={tp}>
            Clientes
          </h1>
          <p className="text-sm mt-0.5" style={ts}>
            {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} registrado
            {clientes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/clientes/nuevo"
          className="bg-amber-500 hover:bg-amber-400 text-gray-950 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nuevo cliente
        </Link>
      </div>

      {clientes.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={ts}>
            No hay clientes registrados aún
          </p>
          <Link
            href="/clientes/nuevo"
            className="mt-4 inline-block bg-amber-500 hover:bg-amber-400 text-gray-950 px-4 py-2 rounded-lg text-sm font-medium"
          >
            Registrar primer cliente
          </Link>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={cardStyle}>
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--table-header-bg)' }}>
              <tr style={{ borderBottom: '2px solid var(--table-border)' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>
                  Cliente
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>
                  DNI / RUC
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>
                  Contacto
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>
                  Distrito
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>
                  Registrado
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>
                  Acción
                </th>
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
                    <div className="text-sm" style={ts}>
                      {cliente.email ?? '—'}
                    </div>
                    <div className="text-xs mt-0.5" style={ts}>
                      {cliente.telefono ?? '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={ts}>
                    {cliente.distrito ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-xs" style={ts}>
                    {formatFecha(cliente.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/clientes/${cliente.id}`}
                      className="text-amber-500 hover:text-amber-400 font-medium text-sm"
                    >
                      Ver
                    </Link>
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


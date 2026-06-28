import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const ROL_LABEL: Record<string, string> = {
  gerente_general: 'Gerente General', subgerente: 'Subgerente',
  administrador: 'Administrador', ingeniero_residente: 'Ing. Residente',
  arquitecto: 'Arquitecto', tecnico_autocad: 'Técnico AutoCAD',
  topografo: 'Topógrafo', maestro_obra: 'Maestro de Obra',
  personal_obra: 'Personal de Obra', contador: 'Contador',
  vendedor: 'Vendedor', cliente: 'Cliente',
}

const ROL_COLOR: Record<string, string> = {
  gerente_general: 'bg-purple-100 text-purple-700', subgerente: 'bg-purple-100 text-purple-700',
  administrador: 'bg-blue-100 text-blue-700', ingeniero_residente: 'bg-green-100 text-green-700',
  arquitecto: 'bg-teal-100 text-teal-700', tecnico_autocad: 'bg-cyan-100 text-cyan-700',
  topografo: 'bg-indigo-100 text-indigo-700', maestro_obra: 'bg-orange-100 text-orange-700',
  personal_obra: 'bg-gray-100 text-gray-700', contador: 'bg-yellow-100 text-yellow-700',
  vendedor: 'bg-pink-100 text-pink-700', cliente: 'bg-red-100 text-red-700',
}

export default async function PersonalPage() {
  const supabase = await createClient()
  const { data: personal } = await supabase
    .from('profiles').select('*').eq('activo', true).order('nombre', { ascending: true })

  const lista = personal ?? []
  const cardStyle = { background: 'var(--card-bg)', border: '1px solid var(--card-border)' }
  const tp = { color: 'var(--text-primary)' }
  const ts = { color: 'var(--text-secondary)' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={tp}>Personal</h1>
          <p className="text-sm mt-0.5" style={ts}>{lista.length} miembro{lista.length !== 1 ? 's' : ''} del equipo</p>
        </div>
        <Link href="/personal/nuevo" className="bg-amber-500 hover:bg-amber-400 text-gray-950 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Nuevo usuario
        </Link>
      </div>

      {lista.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={ts}>No hay personal registrado aún</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={cardStyle}>
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--table-header-bg)' }}>
              <tr style={{ borderBottom: '2px solid var(--table-border)' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Rol</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>DNI</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Teléfono</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Especialidades</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  style={{ borderTop: '1px solid var(--table-border)' }}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium" style={tp}>{p.nombre} {p.apellidos}</div>
                    <div className="text-xs mt-0.5" style={ts}>{p.email_personal ?? '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROL_COLOR[p.rol] ?? 'bg-gray-100 text-gray-700'}`}>
                      {ROL_LABEL[p.rol] ?? p.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={ts}>{p.dni ?? '—'}</td>
                  <td className="px-4 py-3 text-sm" style={ts}>{p.telefono ?? '—'}</td>
                  <td className="px-4 py-3 text-xs" style={ts}>{p.especialidades?.join(', ') ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Link href={`/personal/${p.id}`} className="text-amber-500 hover:text-amber-400 font-medium">Ver</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


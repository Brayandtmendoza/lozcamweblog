import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const ROL_LABEL: Record<string, string> = {
  gerente_general:     'Gerente General',
  subgerente:          'Subgerente',
  administrador:       'Administrador',
  ingeniero_residente: 'Ing. Residente',
  arquitecto:          'Arquitecto',
  tecnico_autocad:     'Técnico AutoCAD',
  topografo:           'Topógrafo',
  maestro_obra:        'Maestro de Obra',
  personal_obra:       'Personal de Obra',
  contador:            'Contador',
  vendedor:            'Vendedor',
  cliente:             'Cliente',
}

export default async function PersonalDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: perfil, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !perfil) notFound()

  const { data: asignaciones } = await supabase
    .from('asignaciones')
    .select('*, obras(nombre, estado)')
    .eq('perfil_id', id)
    .eq('activo', true)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {perfil.nombre} {perfil.apellidos}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {ROL_LABEL[perfil.rol] ?? perfil.rol}
          </p>
        </div>
        <Link href="/personal" className="text-sm text-gray-500 hover:text-gray-700">
          ← Volver
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">DNI</p>
            <p className="text-sm font-medium text-gray-900">{perfil.dni ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Teléfono</p>
            <p className="text-sm font-medium text-gray-900">{perfil.telefono ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Email personal</p>
            <p className="text-sm font-medium text-gray-900">{perfil.email_personal ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Fecha ingreso</p>
            <p className="text-sm font-medium text-gray-900">{perfil.fecha_ingreso ?? '—'}</p>
          </div>
        </div>
        {perfil.especialidades && perfil.especialidades.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Especialidades</p>
            <div className="flex flex-wrap gap-2">
              {perfil.especialidades.map((esp: string) => (
                <span key={esp} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                  {esp}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Obras asignadas ({asignaciones?.length ?? 0})
        </h2>
        {!asignaciones || asignaciones.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">
            No tiene obras asignadas actualmente
          </p>
        ) : (
          <div className="space-y-2">
            {asignaciones.map((a: any) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.obras?.nombre}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {ROL_LABEL[a.rol_en_obra] ?? a.rol_en_obra}
                  </p>
                </div>
                <Link
                  href={`/obras/${a.obra_id}`}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Ver obra →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


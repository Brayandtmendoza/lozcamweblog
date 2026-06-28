'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatFecha } from '@/lib/utils/formatters'
import { EstadoBadge } from '@/components/EstadoBadge'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmarEliminar } from '@/components/ConfirmarEliminar'

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

export default function PersonalDetallePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id

  const supabase = createClient()

  const [perfil, setPerfil] = useState<any>(null)
  const [asignaciones, setAsignaciones] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (!id) { setMissing(true); return }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null)
    })

    supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setMissing(true); return }
        setPerfil(data)
      })

    supabase
      .from('asignaciones')
      .select('*, obras(nombre, estado)')
      .eq('perfil_id', id)
      .eq('activo', true)
      .then(({ data }) => setAsignaciones(data ?? []))
  }, [id])

  async function handleDelete() {
    if (currentUserId === id) return

    const { error } = await supabase
      .from('profiles')
      .update({ activo: false })
      .eq('id', id)

    if (error) {
      toast.error(error.message ?? 'No se pudo eliminar el miembro')
      throw new Error(error.message)
    }

    toast.success('Miembro eliminado')
    router.push('/personal')
    router.refresh()
  }

  const cardStyle = { background: 'var(--card-bg)', border: '1px solid var(--card-border)' }
  const tp = { color: 'var(--text-primary)' }
  const ts = { color: 'var(--text-secondary)' }
  const mostrar = (v: any) =>
    v === null || v === undefined || v === '' ? '—' : String(v)

  if (missing) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p style={tp}>Miembro no encontrado.</p>
        <Link href="/personal" className="text-amber-500 text-sm mt-2 block">← Volver a personal</Link>
      </div>
    )
  }

  if (!perfil) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-sm" style={ts}>Cargando...</p>
      </div>
    )
  }

  const esPropioUsuario = currentUserId === id
  const especialidadesVacio =
    !Array.isArray(perfil.especialidades) || perfil.especialidades.length === 0

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={tp}>
            {mostrar(perfil.nombre)} {perfil.apellidos ?? ''}
          </h1>
          <p className="text-sm mt-0.5" style={ts}>
            {ROL_LABEL[perfil.rol] ?? mostrar(perfil.rol)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {esPropioUsuario ? (
            <span className="text-xs" style={ts}>No puedes eliminar tu propio perfil</span>
          ) : (
            <ConfirmarEliminar
              trigger={
                <button
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-400 px-3 py-1.5 rounded-lg font-medium transition-colors"
                  style={{ border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  <Trash2 size={15} />
                  Eliminar
                </button>
              }
              titulo="¿Eliminar este miembro del equipo?"
              descripcion="Dejará de aparecer en los listados. (Su historial se conserva.)"
              onConfirm={handleDelete}
            />
          )}
          <Link
            href={`/personal/${id}/editar`}
            className="flex items-center gap-1.5 text-sm border border-accent/40 text-accent hover:bg-accent/10 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            <Pencil size={15} />
            Editar
          </Link>
          <Link href="/personal" className="text-sm hover:opacity-70 transition-opacity" style={ts}>
            ← Volver
          </Link>
        </div>
      </div>

      {/* Datos personales */}
      <div className="rounded-xl p-5 mb-4" style={cardStyle}>
        <h2 className="text-sm font-semibold mb-3" style={tp}>Datos personales</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs mb-0.5" style={ts}>Nombre</p>
            <p className="text-sm font-medium" style={tp}>{mostrar(perfil.nombre)}</p>
          </div>
          <div>
            <p className="text-xs mb-0.5" style={ts}>Apellidos</p>
            <p className="text-sm font-medium" style={tp}>{mostrar(perfil.apellidos)}</p>
          </div>
          <div>
            <p className="text-xs mb-0.5" style={ts}>DNI</p>
            <p className="text-sm font-mono" style={tp}>{mostrar(perfil.dni)}</p>
          </div>
          <div>
            <p className="text-xs mb-0.5" style={ts}>Teléfono</p>
            <p className="text-sm" style={tp}>{mostrar(perfil.telefono)}</p>
          </div>
          <div>
            <p className="text-xs mb-0.5" style={ts}>Teléfono alternativo</p>
            <p className="text-sm" style={tp}>{mostrar(perfil.telefono_alt)}</p>
          </div>
          <div>
            <p className="text-xs mb-0.5" style={ts}>Email personal</p>
            <p className="text-sm" style={tp}>{mostrar(perfil.email_personal)}</p>
          </div>
        </div>
      </div>

      {/* Información laboral */}
      <div className="rounded-xl p-5 mb-4" style={cardStyle}>
        <h2 className="text-sm font-semibold mb-3" style={tp}>Información laboral</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs mb-0.5" style={ts}>Rol</p>
            <p className="text-sm" style={tp}>{ROL_LABEL[perfil.rol] ?? mostrar(perfil.rol)}</p>
          </div>
          <div>
            <p className="text-xs mb-0.5" style={ts}>Estado</p>
            <EstadoBadge estado={perfil.activo ? 'activo' : 'inactivo'} />
          </div>
          <div>
            <p className="text-xs mb-0.5" style={ts}>Fecha de ingreso</p>
            <p className="text-sm" style={tp}>
              {perfil.fecha_ingreso ? formatFecha(perfil.fecha_ingreso) : '—'}
            </p>
          </div>
        </div>
        <div>
          <p className="text-xs mb-2" style={ts}>Especialidades</p>
          {especialidadesVacio ? (
            <p className="text-sm" style={tp}>—</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(perfil.especialidades as string[]).map((esp) => (
                <span key={esp} className="text-xs px-2 py-1 bg-amber-500/10 text-amber-500 rounded-full">
                  {esp}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Obras asignadas */}
      <div className="rounded-xl p-5" style={cardStyle}>
        <h2 className="text-sm font-semibold mb-4" style={tp}>
          Obras asignadas ({asignaciones.length})
        </h2>
        {asignaciones.length === 0 ? (
          <p className="text-sm text-center py-4" style={ts}>
            No tiene obras asignadas actualmente
          </p>
        ) : (
          <div className="space-y-2">
            {asignaciones.map((a: any) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ border: '1px solid var(--card-border)' }}
              >
                <div>
                  <p className="text-sm font-medium" style={tp}>{a.obras?.nombre}</p>
                  <p className="text-xs mt-0.5" style={ts}>
                    {ROL_LABEL[a.rol_en_obra] ?? a.rol_en_obra}
                  </p>
                </div>
                <Link
                  href={`/obras/${a.obra_id}`}
                  className="text-xs text-amber-500 hover:text-amber-400"
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

import { createClient } from '@/lib/supabase/server'
import { ROL_SISTEMA, ROLES_GERENCIA } from '@/lib/utils/constants'

export type RolSistema = typeof ROL_SISTEMA[keyof typeof ROL_SISTEMA]

export interface Perfil {
  id: string
  nombre: string | null
  apellidos: string | null
  rol: RolSistema
  activo: boolean | null
  avatar_url: string | null
  cliente_id: number | null
}

/**
 * Obtiene el perfil del usuario autenticado desde la tabla `profiles`.
 * Devuelve null si no hay sesión activa o si el perfil no existe.
 *
 * Ejemplo de uso en un Server Component o layout:
 *
 *   import { getPerfil, esGerencia, tieneRol } from '@/lib/auth/getPerfil'
 *
 *   const perfil = await getPerfil()
 *   if (!perfil) redirect('/login')
 *   if (!tieneRol(perfil, ['gerente_general', 'administrador'])) redirect('/dashboard')
 */
export async function getPerfil(): Promise<Perfil | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: perfil } = await supabase
    .from('profiles')
    .select('id, nombre, apellidos, rol, activo, avatar_url, cliente_id')
    .eq('id', user.id)
    .single()

  if (!perfil) return null

  return perfil as Perfil
}

/** Devuelve true si el perfil tiene un rol de gerencia (gerente_general, subgerente, administrador). */
export function esGerencia(perfil: Pick<Perfil, 'rol'>): boolean {
  return (ROLES_GERENCIA as readonly string[]).includes(perfil.rol)
}

/** Devuelve true si el rol del perfil está en la lista de roles permitidos. */
export function tieneRol(perfil: Pick<Perfil, 'rol'>, rolesPermitidos: string[]): boolean {
  return rolesPermitidos.includes(perfil.rol)
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ROLES_GERENCIA = ['gerente_general', 'subgerente', 'administrador']

export async function POST(request: Request) {
  try {
    // ── 1. Verificar sesión y permisos (anon client, NO admin) ──────────
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 })
    }

    const { data: perfil } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (!perfil || !ROLES_GERENCIA.includes(perfil.rol)) {
      return NextResponse.json(
        { ok: false, error: 'Sin permisos para crear usuarios' },
        { status: 403 }
      )
    }

    // ── 2. Validar body ─────────────────────────────────────────────────
    const body = await request.json()
    const { email, rol, nombre, apellidos, dni, telefono } = body

    if (!email || !rol || !nombre || !apellidos) {
      return NextResponse.json(
        { ok: false, error: 'Faltan campos requeridos: email, rol, nombre, apellidos' },
        { status: 400 }
      )
    }

    // ── 3. Invitar usuario vía admin client ─────────────────────────────
    const rawBase = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin
    const baseUrl = rawBase.replace(/\/$/, '')
    const admin = createAdminClient()

    const { error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: {
        nombre,
        apellidos,
        rol,
        dni: dni || null,
        telefono: telefono || null,
      },
      redirectTo: `${baseUrl}/reset-password`,
    })

    if (error) {
      const msg = error.message ?? ''
      if (
        msg.toLowerCase().includes('already registered') ||
        msg.toLowerCase().includes('already exists') ||
        msg.toLowerCase().includes('already been invited')
      ) {
        return NextResponse.json(
          { ok: false, error: 'Ya existe un usuario con ese correo' },
          { status: 409 }
        )
      }
      return NextResponse.json({ ok: false, error: msg }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function crearSolicitud(formData: FormData) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'No autenticado' } as const
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, cliente_id, rol')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      return { error: 'Error consultando perfil' } as const
    }

    // Seguridad: el cliente_id SIEMPRE viene del perfil, no del form.
    // Si tu tabla no usa cliente_id en profiles, ajusta ese campo.
    const clienteId = (profile as any)?.cliente_id

    const rol = (profile as any)?.rol
    if (!clienteId || rol !== 'cliente') {
      return { error: 'No eres cliente' } as const
    }

    const titulo = String(formData.get('titulo') ?? '').trim()
    const tipo_servicio = String(formData.get('tipo_servicio') ?? '').trim()
    const descripcion = String(formData.get('descripcion') ?? '').trim()
    const distrito = String(formData.get('distrito') ?? '').trim()

    const area_m2_raw = formData.get('area_m2')
    const presupuesto_ref_raw = formData.get('presupuesto_ref')

    const area_m2_num =
      area_m2_raw === null || area_m2_raw === ''
        ? null
        : Number(area_m2_raw)

    const presupuesto_ref_num =
      presupuesto_ref_raw === null || presupuesto_ref_raw === ''
        ? null
        : Number(presupuesto_ref_raw)

    const tiene_terreno = formData.get('tiene_terreno') === 'on'
    const tiene_planos = formData.get('tiene_planos') === 'on'

    if (!titulo) return { error: 'Título requerido' } as const
    if (!tipo_servicio) return { error: 'Tipo de servicio requerido' } as const

    const payload = {
      cliente_id: Number(clienteId),
      titulo,
      tipo_servicio,
      descripcion: descripcion || null,
      distrito: distrito || null,
      area_m2: Number.isFinite(area_m2_num as number) ? area_m2_num : null,
      tiene_terreno,
      tiene_planos,
      presupuesto_ref:
        Number.isFinite(presupuesto_ref_num as number) ? presupuesto_ref_num : null,
    }

    const { error: insertError } = await supabase
      .from('solicitudes')
      .insert(payload)

    if (insertError) {
      return { error: insertError.message } as const
    }

    revalidatePath('/portal/solicitudes')

    return { success: true } as const
  } catch (err: any) {
    return { error: err?.message ?? 'Error creando solicitud' } as const
  }
}


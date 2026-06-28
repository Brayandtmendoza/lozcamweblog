import { createClient } from '@/lib/supabase/server'

export async function getObras() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('obras')
    .select(`
      *,
      clientes (nombres, apellidos, razon_social)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('ERROR OBRAS:', JSON.stringify(error))
    throw error
  }

  return data ?? []
}


export async function getObraById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('obras')
    .select(`
      *,
      clientes (nombres, apellidos, razon_social)
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function getFasesObra(obraId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('fases_obra')
    .select('*')
    .eq('obra_id', obraId)
    .order('orden', { ascending: true })
  if (error) throw error
  return data
}

export async function getUltimoAvancePorFase(faseId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('avance_obra')
    .select('porcentaje')
    .eq('fase_id', faseId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (error) return 0
  return data?.porcentaje ?? 0
}


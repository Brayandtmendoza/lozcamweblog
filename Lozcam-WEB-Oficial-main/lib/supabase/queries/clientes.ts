import { createClient } from '@/lib/supabase/server'
import { Cliente, ClienteForm } from '@/lib/types/clientes'

export async function getClientes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Cliente[]
}

export async function getClienteById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Cliente
}

export async function createCliente(form: ClienteForm) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clientes')
    .insert(form)
    .select()
    .single()
  if (error) throw error
  return data as Cliente
}

export async function updateCliente(id: number, form: Partial<ClienteForm>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clientes')
    .update({
      ...form,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Cliente
}

export async function deleteCliente(id: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('clientes')
    .update({ activo: false })
    .eq('id', id)

  if (error) throw error
}


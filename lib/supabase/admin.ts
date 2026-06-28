import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase con service role key — SOLO para uso en servidor.
 * Nunca importar desde componentes 'use client'.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

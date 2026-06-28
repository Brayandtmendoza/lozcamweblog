'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  nombre: string
  apellidos: string
  rol: string
  avatar_url: string | null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase
          .from('profiles')

          .select('id, nombre, apellidos, rol, avatar_url')
          .eq('id', user.id)
          .single()

        setProfile(data)
      }

      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (!session?.user) setProfile(null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const isGerencia = profile?.rol
    ? ['gerente_general', 'subgerente', 'administrador'].includes(profile.rol)
    : false

  return { user, profile, loading, signOut, isGerencia }
}


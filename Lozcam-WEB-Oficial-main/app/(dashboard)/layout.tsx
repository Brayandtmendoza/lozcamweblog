import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/shared/Sidebar'
import Navbar from '@/components/shared/Navbar'
import { DashboardShell } from './dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, nombre, apellidos, rol, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <DashboardShell
      sidebar={<Sidebar rol={profile?.rol ?? ''} />}
      navbar={<Navbar profile={profile} />}
    >
      {children}
    </DashboardShell>
  )
}


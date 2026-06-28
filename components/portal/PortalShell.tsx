'use client'

import { useTheme } from '@/contexts/ThemeContext'
import PortalSidebar from '@/components/portal/PortalSidebar'
import PortalNavbar from '@/components/portal/PortalNavbar'
import { useState } from 'react'

type Profile = any

export default function PortalShell({
  profile,
  children,
}: {
  profile: Profile | null
  children: React.ReactNode
}) {
  const { isDark } = useTheme()
  const [sidebarMovilAbierto, setSidebarMovilAbierto] = useState(false)

  return (
    <div
      className="flex h-screen transition-colors duration-200"
      style={{ background: isDark ? '#0b1727' : '#f8fafc' }}
    >
      {/* Sidebar desktop */}
      <div className="hidden md:block">
        <PortalSidebar />
      </div>

      {/* Sidebar mobile drawer */}
      {sidebarMovilAbierto && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setSidebarMovilAbierto(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64">
            <div
              className={`h-full transition-transform duration-300 transform ${
                sidebarMovilAbierto ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <PortalSidebar onNavigate={() => setSidebarMovilAbierto(false)} />
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <PortalNavbar profile={profile} onOpenSidebarMovil={() => setSidebarMovilAbierto(true)} />

        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ background: isDark ? '#0b1727' : '#f8fafc' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}



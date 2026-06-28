'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils/formatters'

interface DashboardShellProps {
  sidebar: React.ReactNode
  navbar: React.ReactNode
  children: React.ReactNode
}

export function DashboardShell({ sidebar, navbar, children }: DashboardShellProps) {
  const { isDark } = useTheme()
  return (
    <div
      className="flex h-screen transition-colors duration-200"
      style={{ background: isDark ? '#0b1727' : '#f8fafc' }}
    >
      {sidebar}
      <div className="flex flex-col flex-1 overflow-hidden">
        {navbar}
        <main
          className="flex-1 overflow-y-auto p-6 transition-colors duration-200"
          style={{ background: isDark ? '#0b1727' : '#f8fafc' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}



'use client'

import { createContext, useContext, useState } from 'react'

interface SidebarContextType {
  colapsado: boolean
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType>({
  colapsado: true,
  toggleSidebar: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [colapsado, setColapsado] = useState(true)
  return (
    <SidebarContext.Provider value={{ colapsado, toggleSidebar: () => setColapsado(c => !c) }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}

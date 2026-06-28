'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Tema = 'claro' | 'oscuro' | 'automatico'

interface ThemeContextType {
  tema: Tema
  setTema: (t: Tema) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  tema: 'oscuro',
  setTema: () => {},
  isDark: true,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>('oscuro')
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    let cleanup: (() => void) | undefined
    if (tema === 'automatico') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => {
        setIsDark(e.matches)
      }
      mq.addEventListener('change', handler)
      setIsDark(mq.matches)
      cleanup = () => mq.removeEventListener('change', handler)
    } else {
      setIsDark(tema === 'oscuro')
    }
    return cleanup
  }, [tema])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <ThemeContext.Provider value={{ tema, setTema, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}


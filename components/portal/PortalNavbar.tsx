'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Sun, Moon, Monitor, LogOut, ChevronDown, Menu } from 'lucide-react'


type Tema = 'claro' | 'oscuro' | 'automatico'

export default function PortalNavbar({
  profile,
  onOpenSidebarMovil,
}: {
  profile: any
  onOpenSidebarMovil?: () => void
}) {

  const router = useRouter()
  const supabase = createClient()
  const { tema, setTema, isDark } = useTheme() as {
    tema: Tema
    setTema: (t: Tema) => void
    isDark: boolean
  }

  const [temaMenuAbierto, setTemaMenuAbierto] = useState(false)
  const [userMenuAbierto, setUserMenuAbierto] = useState(false)

  const temaRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (temaRef.current && !temaRef.current.contains(e.target as Node)) {
        setTemaMenuAbierto(false)
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuAbierto(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const nombre = profile?.nombre ?? ''
  const iniciales = nombre ? String(nombre[0] ?? '').toUpperCase() : 'U'

  const temaIcono: Record<Tema, React.ReactNode> = {
    claro: <Sun size={15} />,
    oscuro: <Moon size={15} />,
    automatico: <Monitor size={15} />,
  }

  const navBg = isDark ? 'bg-[#0b1727]' : 'bg-white'
  const border = isDark ? 'border-white/10' : 'border-gray-200'
  const textLeft = isDark ? 'text-white' : 'text-gray-900'
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500'

  const btnBg = isDark
    ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
    : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-900'

  const dropBg = isDark ? 'bg-[#0b1727] border-white/10' : 'bg-white border-gray-200 shadow-lg'
  const dropItem = isDark
    ? 'text-gray-400 hover:bg-white/5 hover:text-white'
    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'

  return (
    <header
      className={`${navBg} ${border} border-b px-6 py-3 flex items-center justify-between gap-4 transition-colors`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={`md:hidden p-1.5 rounded-lg transition-colors ${btnBg}`}
          onClick={() => onOpenSidebarMovil?.()}
          aria-label="Abrir menú"
        >
          <Menu size={18} />
        </button>

        <div>
          <div className={`text-base font-medium ${textLeft}`}>Bienvenido, {nombre}</div>
          <div className={`text-xs ${textMuted}`}>Resumen general de tu cuenta</div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">

        <div className="relative" ref={temaRef}>
          <button
            onClick={() => setTemaMenuAbierto(!temaMenuAbierto)}
            className={`flex items-center gap-1.5 border px-3 py-2 rounded-xl text-xs transition-colors ${btnBg}`}
          >
            {temaIcono[tema]}
            <ChevronDown size={11} />
          </button>

          {temaMenuAbierto && (
            <div
              className={`absolute right-0 top-full mt-2 w-44 border rounded-xl shadow-xl z-50 overflow-hidden ${dropBg}`}
            >
              {(['claro', 'oscuro', 'automatico'] as Tema[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTema(t)
                    setTemaMenuAbierto(false)
                  }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors ${tema === t ? 'bg-amber-500/10 text-amber-400' : dropItem}`}
                >
                  {temaIcono[t]}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserMenuAbierto(!userMenuAbierto)}
            className={`flex items-center gap-2 border px-3 py-2 rounded-xl transition-colors ${btnBg} hover:border-amber-500/50`}
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-gray-950 font-bold text-xs">
              {iniciales}
            </div>
            <span className={`text-xs ${textMuted} hidden sm:block`}>Cliente</span>
            <ChevronDown size={13} className="opacity-50" />
          </button>

          {userMenuAbierto && (
            <div
              className={`absolute right-0 top-full mt-2 w-52 border rounded-xl shadow-xl z-50 overflow-hidden ${dropBg}`}
            >
              <div className={`px-4 py-3 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                <div className={`text-xs font-semibold ${textLeft}`}>{profile?.nombre} {profile?.apellidos}</div>
                <div className={`text-[10px] mt-0.5 ${textMuted}`}>Cliente</div>
              </div>

              <div className={`border-t ${isDark ? 'border-white/10' : 'border-gray-100'} py-1`}>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut size={14} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}


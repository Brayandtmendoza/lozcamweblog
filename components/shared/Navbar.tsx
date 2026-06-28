'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Search, Sun, Moon, Monitor, ChevronDown, User, Settings, LogOut, Bell, Menu } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useSidebar } from '@/contexts/SidebarContext'

const ROL_LABEL: Record<string, string> = {
  gerente_general: 'Gerente General',
  subgerente: 'Subgerente',
  administrador: 'Administrador',
  ingeniero_residente: 'Ing. Residente',
  arquitecto: 'Arquitecto',
  tecnico_autocad: 'Técnico AutoCAD',
  topografo: 'Topógrafo',
  maestro_obra: 'Maestro de Obra',
  personal_obra: 'Personal de Obra',
  contador: 'Contador',
  vendedor: 'Vendedor',
  cliente: 'Cliente',
}

type Tema = 'claro' | 'oscuro' | 'automatico'

interface Profile {
  nombre: string
  apellidos: string
  rol: string
  avatar_url: string | null
}

export default function Navbar({ profile }: { profile: Profile | null }) {
  const router = useRouter()
  const supabase = createClient()
  const { tema, setTema, isDark } = useTheme()

  const { toggleSidebar } = useSidebar()

  const [menuAbierto, setMenuAbierto] = useState(false)
  const [temaMenuAbierto, setTemaMenuAbierto] = useState(false)
  const [notiAbierto, setNotiAbierto] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const temaRef = useRef<HTMLDivElement>(null)
  const notiRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuAbierto(false)
      if (temaRef.current && !temaRef.current.contains(e.target as Node)) setTemaMenuAbierto(false)
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) setNotiAbierto(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const iniciales = profile
    ? `${profile.nombre?.[0] ?? ''}${profile.apellidos?.[0] ?? ''}`.toUpperCase()
    : 'U'

  const temaIcono: Record<Tema, React.ReactNode> = {
    claro: <Sun size={15} />,
    oscuro: <Moon size={15} />,
    automatico: <Monitor size={15} />,
  }

  const navBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
  const inputBg = isDark
    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
    : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400'

  const btnBg = isDark
    ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
    : 'bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-900'

  const dropBg = isDark
    ? 'bg-gray-900 border-gray-700'
    : 'bg-white border-gray-200 shadow-lg'

  const dropItem = isDark
    ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'

  const dropDivider = isDark ? 'border-gray-800' : 'border-gray-100'

  const textPrimary = isDark ? 'text-white' : 'text-gray-900'
  const textSecondary = isDark ? 'text-gray-500' : 'text-gray-500'

  return (
    <header
      className={`${navBg} border-b px-4 py-3 flex items-center justify-between gap-3 transition-colors duration-200`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={toggleSidebar}
          className={`flex items-center justify-center w-9 h-9 border rounded-xl transition-colors shrink-0 ${btnBg}`}
          title="Colapsar/expandir menú"
        >
          <Menu size={15} />
        </button>
        <div className={`flex items-center gap-2 border rounded-xl px-4 py-2 w-full max-w-sm ${inputBg}`}>
          <Search size={14} className="shrink-0 opacity-50" />
          <input
            type="text"
            placeholder="Buscar obra, cliente, documento..."
            className="bg-transparent text-sm outline-none w-full"
          />
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
              className={`absolute right-0 top-full mt-2 w-36 border rounded-xl shadow-xl z-50 overflow-hidden ${dropBg}`}
            >
              {(['claro', 'oscuro', 'automatico'] as Tema[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTema(t)
                    setTemaMenuAbierto(false)
                  }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors ${
                    tema === t ? 'bg-amber-500/10 text-amber-400' : dropItem
                  }`}
                >
                  {temaIcono[t]}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={notiRef}>
          <button
            onClick={() => setNotiAbierto(!notiAbierto)}
            className={`relative flex items-center justify-center border w-9 h-9 rounded-xl transition-colors ${btnBg}`}
          >
            <Bell size={15} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
          </button>

          {notiAbierto && (
            <div
              className={`absolute right-0 top-full mt-2 w-72 border rounded-xl shadow-xl z-50 overflow-hidden ${dropBg}`}
            >
              <div
                className={`px-4 py-3 border-b ${dropDivider} flex items-center justify-between`}
              >
                <p className={`text-xs font-semibold ${textPrimary}`}>Notificaciones</p>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-medium">
                  3 nuevas
                </span>
              </div>

              <div className="py-1">
                {[
                  { titulo: 'Obra "Puente" al 78%', tiempo: 'Hace 5 min' },
                  { titulo: 'Nueva solicitud de Carlos Rojas', tiempo: 'Hace 1 hora' },
                  { titulo: 'Pago pendiente registrado', tiempo: 'Hace 3 horas' },
                ].map((n, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${dropItem}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div>
                      <p className={`text-xs font-medium ${textPrimary}`}>{n.titulo}</p>
                      <p className={`text-[10px] mt-0.5 ${textSecondary}`}>{n.tiempo}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`border-t ${dropDivider} px-4 py-2.5`}>
                <p className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer text-center">
                  Ver todas las notificaciones
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className={`flex items-center gap-2.5 border px-3 py-1.5 rounded-xl transition-all ${btnBg} hover:border-amber-500/50`}
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-xs font-bold text-gray-950">
              {iniciales}
            </div>
            <div className="text-left hidden sm:block">
              <p className={`text-xs font-semibold leading-tight ${textPrimary}`}>
                {profile?.nombre} {profile?.apellidos}
              </p>
              <p className={`text-[10px] leading-tight ${textSecondary}`}>
                {profile?.rol ? ROL_LABEL[profile.rol] : ''}
              </p>
            </div>
            <ChevronDown size={13} className="opacity-50" />
          </button>

          {menuAbierto && (
            <div
              className={`absolute right-0 top-full mt-2 w-52 border rounded-xl shadow-xl z-50 overflow-hidden ${dropBg}`}
            >
              <div className={`px-4 py-3 border-b ${dropDivider}`}>
                <p className={`text-xs font-semibold ${textPrimary}`}>
                  {profile?.nombre} {profile?.apellidos}
                </p>
                <p className={`text-[10px] mt-0.5 ${textSecondary}`}>
                  {profile?.rol ? ROL_LABEL[profile.rol] : ''}
                </p>
              </div>

              <div className="py-1">
                <button
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-colors ${dropItem}`}
                >
                  <User size={14} /> Mi perfil
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-colors ${dropItem}`}
                >
                  <Settings size={14} /> Configuración
                </button>
              </div>

              <div className={`border-t ${dropDivider} py-1`}>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut size={14} /> Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}


'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils/formatters'
import { useTheme } from '@/contexts/ThemeContext'
import {
  Building2, Users, FileText, FolderOpen, Calculator,
  CreditCard, UserCheck, ClipboardList, LayoutDashboard,
  HardHat, Menu,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles: string[]
}

interface NavSection {
  titulo: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    titulo: 'Principal',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard size={17} />,
        roles: ['gerente_general', 'subgerente', 'administrador'],
      },
    ],
  },
  {
    titulo: 'Gestión',
    items: [
      {
        label: 'Obras',
        href: '/obras',
        icon: <Building2 size={17} />,
        roles: ['gerente_general', 'subgerente', 'administrador', 'ingeniero_residente', 'arquitecto', 'maestro_obra'],
      },
      {
        label: 'Clientes',
        href: '/clientes',
        icon: <Users size={17} />,
        roles: ['gerente_general', 'subgerente', 'administrador', 'vendedor'],
      },
      {
        label: 'Solicitudes',
        href: '/solicitudes',
        icon: <ClipboardList size={17} />,
        roles: ['gerente_general', 'subgerente', 'administrador', 'vendedor'],
      },
      {
        label: 'Personal',
        href: '/personal',
        icon: <UserCheck size={17} />,
        roles: ['gerente_general', 'subgerente', 'administrador'],
      },
    ],
  },
  {
    titulo: 'Finanzas',
    items: [
      {
        label: 'Presupuestos',
        href: '/presupuestos',
        icon: <Calculator size={17} />,
        roles: ['gerente_general', 'subgerente', 'administrador', 'ingeniero_residente', 'contador'],
      },
      {
        label: 'Pagos',
        href: '/pagos',
        icon: <CreditCard size={17} />,
        roles: ['gerente_general', 'subgerente', 'administrador', 'contador'],
      },
    ],
  },
  {
    titulo: 'Operaciones',
    items: [
      {
        label: 'Documentos',
        href: '/documentos',
        icon: <FolderOpen size={17} />,
        roles: ['gerente_general', 'subgerente', 'administrador', 'ingeniero_residente', 'arquitecto', 'tecnico_autocad', 'topografo'],
      },
      {
        label: 'Reportes',
        href: '/reportes',
        icon: <FileText size={17} />,
        roles: ['gerente_general', 'subgerente', 'administrador', 'ingeniero_residente', 'maestro_obra'],
      },
    ],
  },
]

export default function Sidebar({ rol }: { rol: string }) {
  const pathname = usePathname()
  const [colapsado, setColapsado] = useState(true)
  const [hovered, setHovered] = useState(false)
  const expandido = !colapsado || hovered
  const { isDark } = useTheme()

  const bg = isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'

  const logoText = isDark ? 'text-white' : 'text-gray-900'
  const logoSub = isDark ? 'text-gray-500' : 'text-gray-400'
  const seccionLabel = isDark ? 'text-gray-600' : 'text-gray-400'
  const itemActivo = isDark
    ? 'bg-amber-500/10 text-amber-400 font-medium'
    : 'bg-amber-50 text-amber-600 font-medium'
  const itemNormal = isDark
    ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
  const menuBtnColor = isDark
    ? 'text-gray-400 hover:text-white'
    : 'text-gray-500 hover:text-gray-900'
  const headerBorder = isDark ? 'border-gray-800' : 'border-gray-200'

  return (
    <aside className={cn(
      'relative border-r flex flex-col transition-all duration-300 ease-in-out overflow-hidden',
      bg,
      expandido ? 'w-64' : 'w-16'
    )}>
      <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="contents"
    />

      {/* Header */}
      <div className={cn('flex items-center border-b h-16 px-3 gap-2 shrink-0', headerBorder)}>
        <button
          onClick={() => setColapsado(!colapsado)}
          className={cn('shrink-0 p-1.5 rounded-lg transition-colors', menuBtnColor)}
        >
          <Menu size={18} />
        </button>
        <div className={cn(
          'flex items-center gap-2 min-w-0 transition-all duration-300',
          expandido ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
        )}>
          <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
            <HardHat size={14} className="text-gray-950" />
          </div>
          <div className="min-w-0">
            <h1 className={cn('text-sm font-bold leading-tight truncate', logoText)}>
              GRUPO LOZCAM
            </h1>
            <p className={cn('text-[10px]', logoSub)}>Sistema de Gestión</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto px-2">
        {navSections.map((seccion) => {
          const itemsVisibles = seccion.items.filter(item => item.roles.includes(rol))
          if (itemsVisibles.length === 0) return null
          return (
            <div key={seccion.titulo} className="mb-4">
              <div className={cn(
                'transition-all duration-300 overflow-hidden',
                  !expandido ? 'max-h-0 opacity-0 mb-0' : 'max-h-8 opacity-100 mb-1'
              )}>
                <p className={cn(
                  'text-[10px] uppercase tracking-widest font-semibold px-3',
                  seccionLabel
                )}>
                  {seccion.titulo}
                </p>
              </div>
              <div className="space-y-0.5">
                {itemsVisibles.map((item) => {
                  const activo = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={!expandido ? item.label : undefined}
                      className={cn(
                        'flex items-center rounded-xl text-sm transition-all duration-150',
                        !expandido ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
                        activo ? itemActivo : itemNormal
                      )}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      <span className={cn(
                        'transition-all duration-300 overflow-hidden whitespace-nowrap',
                        !expandido ? 'w-0 opacity-0' : 'w-auto opacity-100'
                      )}>
                        {item.label}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>
    </aside>

  )
}


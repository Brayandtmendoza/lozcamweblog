import { createClient } from '@/lib/supabase/server'
import { getPerfil } from '@/lib/auth/getPerfil'
import DashboardContador from '@/components/dashboards/DashboardContador'
import DashboardVendedor from '@/components/dashboards/DashboardVendedor'
import DashboardIngeniero from '@/components/dashboards/DashboardIngeniero'
import DashboardGerencial from '@/components/dashboards/DashboardGerencial'
import DashboardMaestroObra from '@/components/dashboards/DashboardMaestroObra'

import Link from 'next/link'
import { formatPEN } from '@/lib/utils/formatters'
import { ESTADO_OBRA_COLOR, ESTADO_OBRA_LABEL, TIPO_SERVICIO_LABEL } from '@/lib/utils/constants'
import { Building2, Users, ClipboardList, CreditCard } from 'lucide-react'

export default async function DashboardPage() {
  const perfil = await getPerfil()
  if (perfil?.rol === 'contador')          return <DashboardContador  perfil={perfil} />
  if (perfil?.rol === 'vendedor')          return <DashboardVendedor  perfil={perfil} />
  if (perfil?.rol === 'ingeniero_residente') return <DashboardIngeniero perfil={perfil} />
  if (['gerente_general', 'subgerente', 'administrador'].includes(perfil?.rol ?? ''))
    return <DashboardGerencial perfil={perfil} />
  if (perfil?.rol === 'maestro_obra')      return <DashboardMaestroObra perfil={perfil} />

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('nombre, rol')
    .eq('id', user!.id)
    .single()

  const [
    { count: totalObras },
    { count: obrasActivas },
    { count: solicitudesPendientes },
    { count: totalClientes },
    { data: obras },
    { data: pagosRecientes },
    { data: solicitudesRecientes },
  ] = await Promise.all([
    supabase.from('obras').select('*', { count: 'exact', head: true }),
    supabase.from('obras').select('*', { count: 'exact', head: true }).eq('estado', 'en_ejecucion'),
    supabase.from('solicitudes').select('*', { count: 'exact', head: true }).eq('estado', 'nueva'),
    supabase.from('clientes').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('obras')
      .select('id, nombre, estado, tipo_servicio, monto_contrato, distrito')
      .in('estado', ['en_ejecucion', 'contratada', 'formulacion'])
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('pagos_clientes')
      .select('id, concepto, monto, estado, fecha_pago, obras(nombre)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('solicitudes')
      .select('id, titulo, estado, prioridad, created_at, clientes(nombres, apellidos, razon_social)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const totalPagado = pagosRecientes
    ?.filter(p => p.estado === 'pagado')
    .reduce((sum, p) => sum + p.monto, 0) ?? 0

  const cardStyle = {
    background: 'var(--card-bg)',
    boxShadow: 'var(--card-shadow)',
    border: '1px solid var(--card-border)',
  }

  const textPrimary = { color: 'var(--text-primary)' }
  const textSecondary = { color: 'var(--text-secondary)' }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-0.5" style={textPrimary}>
          Bienvenido, {profile?.nombre}
        </h1>
        <p className="text-sm" style={textSecondary}>
          Panel de control — GRUPO LOZCAM S.A.C
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={textSecondary}>
              Total obras
            </p>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Building2 size={18} className="text-amber-500" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1" style={textPrimary}>{totalObras ?? 0}</p>
          <p className="text-xs" style={textSecondary}>{obrasActivas ?? 0} en ejecución</p>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={textSecondary}>
              Clientes
            </p>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users size={18} className="text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1" style={textPrimary}>{totalClientes ?? 0}</p>
          <p className="text-xs" style={textSecondary}>clientes activos</p>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={textSecondary}>
              Solicitudes
            </p>
            <div className="w-9 h-9 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <ClipboardList size={18} className="text-yellow-500" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1 text-yellow-500">{solicitudesPendientes ?? 0}</p>
          <p className="text-xs" style={textSecondary}>sin atender</p>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={textSecondary}>
              Cobrado
            </p>
            <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
              <CreditCard size={18} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold mb-1 text-green-500">{formatPEN(totalPagado)}</p>
          <p className="text-xs" style={textSecondary}>últimos pagos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <h2 className="text-sm font-semibold" style={textPrimary}>Obras recientes</h2>
            <Link href="/obras" className="text-xs text-amber-500 hover:text-amber-400">Ver todas →</Link>
          </div>
          <div>
            {!obras || obras.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm" style={textSecondary}>No hay obras registradas</p>
                <Link href="/obras/nueva" className="mt-2 inline-block text-xs text-amber-500 hover:text-amber-400">
                  + Crear primera obra
                </Link>
              </div>
            ) : (
              obras.map((obra: any) => (
                <Link key={obra.id} href={`/obras/${obra.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  style={{ borderBottom: '1px solid var(--card-border)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={textPrimary}>{obra.nombre}</p>
                    <p className="text-xs mt-0.5" style={textSecondary}>
                      {TIPO_SERVICIO_LABEL[obra.tipo_servicio]}{obra.distrito && ` · ${obra.distrito}`}
                    </p>
                  </div>
                  <div className="ml-3 text-right flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_OBRA_COLOR[obra.estado]}`}>
                      {ESTADO_OBRA_LABEL[obra.estado]}
                    </span>
                    <p className="text-xs mt-1" style={textSecondary}>{formatPEN(obra.monto_contrato)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <h2 className="text-sm font-semibold" style={textPrimary}>Solicitudes recientes</h2>
            <Link href="/solicitudes" className="text-xs text-amber-500 hover:text-amber-400">Ver todas →</Link>
          </div>
          <div>
            {!solicitudesRecientes || solicitudesRecientes.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm" style={textSecondary}>No hay solicitudes</p>
                <Link href="/solicitudes/nueva" className="mt-2 inline-block text-xs text-amber-500 hover:text-amber-400">
                  + Nueva solicitud
                </Link>
              </div>
            ) : (
              solicitudesRecientes.map((s: any) => (
                <Link key={s.id} href={`/solicitudes/${s.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  style={{ borderBottom: '1px solid var(--card-border)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={textPrimary}>{s.titulo}</p>
                    <p className="text-xs mt-0.5" style={textSecondary}>
                      {s.clientes?.razon_social ?? `${s.clientes?.nombres ?? ''} ${s.clientes?.apellidos ?? ''}`}
                    </p>
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      s.prioridad === 'critica' ? 'bg-red-500/20 text-red-500' :
                      s.prioridad === 'alta' ? 'bg-orange-500/20 text-orange-500' :
                      s.prioridad === 'media' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {s.prioridad.charAt(0).toUpperCase() + s.prioridad.slice(1)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <h2 className="text-sm font-semibold" style={textPrimary}>Pagos recientes</h2>
          <Link href="/pagos" className="text-xs text-amber-500 hover:text-amber-400">Ver todos →</Link>
        </div>
        <div>
          {!pagosRecientes || pagosRecientes.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm" style={textSecondary}>No hay pagos registrados</p>
              <Link href="/pagos/nuevo" className="mt-2 inline-block text-xs text-amber-500 hover:text-amber-400">
                + Registrar pago
              </Link>
            </div>
          ) : (
            pagosRecientes.map((p: any) => (
              <Link key={p.id} href={`/pagos/${p.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                style={{ borderBottom: '1px solid var(--card-border)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={textPrimary}>{p.concepto}</p>
                  <p className="text-xs mt-0.5" style={textSecondary}>{p.obras?.nombre}</p>
                </div>
                <div className="ml-3 text-right flex-shrink-0">
                  <p className="text-sm font-semibold" style={textPrimary}>{formatPEN(p.monto)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    p.estado === 'pagado' ? 'bg-green-500/20 text-green-500' :
                    p.estado === 'pendiente' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-gray-500/20 text-gray-500'
                  }`}>
                    {p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}


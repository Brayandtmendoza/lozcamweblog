import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatPEN } from '@/lib/utils/formatters'
import { ESTADO_OBRA_COLOR, ESTADO_OBRA_LABEL, TIPO_SERVICIO_LABEL } from '@/lib/utils/constants'

export default async function DashboardPage() {
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
    supabase.from('obras').select('*', { count: 'exact', head: true })
      .eq('estado', 'en_ejecucion'),
    supabase.from('solicitudes').select('*', { count: 'exact', head: true })
      .eq('estado', 'nueva'),
    supabase.from('clientes').select('*', { count: 'exact', head: true })
      .eq('activo', true),
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {profile?.nombre} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Panel de control — GRUPO LOZCAM S.A.C
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total obras</p>
            <span className="text-2xl">🏗️</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalObras ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">{obrasActivas ?? 0} en ejecución</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Clientes</p>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalClientes ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">clientes activos</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Solicitudes</p>
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-3xl font-bold text-yellow-500">{solicitudesPendientes ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">sin atender</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cobrado</p>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatPEN(totalPagado)}</p>
          <p className="text-xs text-gray-400 mt-1">últimos pagos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Obras activas */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Obras recientes</h2>
            <Link href="/obras" className="text-xs text-blue-600 hover:text-blue-800">
              Ver todas →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {!obras || obras.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-gray-400 text-sm">No hay obras registradas</p>
                <Link href="/obras/nueva" className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-800">
                  + Crear primera obra
                </Link>
              </div>
            ) : (
              obras.map((obra: any) => (
                <Link key={obra.id} href={`/obras/${obra.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{obra.nombre}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {TIPO_SERVICIO_LABEL[obra.tipo_servicio]}
                      {obra.distrito && ` · ${obra.distrito}`}
                    </p>
                  </div>
                  <div className="ml-3 text-right flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_OBRA_COLOR[obra.estado]}`}>
                      {ESTADO_OBRA_LABEL[obra.estado]}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{formatPEN(obra.monto_contrato)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Solicitudes recientes */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Solicitudes recientes</h2>
            <Link href="/solicitudes" className="text-xs text-blue-600 hover:text-blue-800">
              Ver todas →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {!solicitudesRecientes || solicitudesRecientes.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-gray-400 text-sm">No hay solicitudes</p>
                <Link href="/solicitudes/nueva" className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-800">
                  + Nueva solicitud
                </Link>
              </div>
            ) : (
              solicitudesRecientes.map((s: any) => (
                <Link key={s.id} href={`/solicitudes/${s.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.titulo}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {s.clientes?.razon_social ??
                       `${s.clientes?.nombres ?? ''} ${s.clientes?.apellidos ?? ''}`}
                    </p>
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      s.prioridad === 'critica' ? 'bg-red-100 text-red-700' :
                      s.prioridad === 'alta'    ? 'bg-orange-100 text-orange-700' :
                      s.prioridad === 'media'   ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
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

      {/* Pagos recientes */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Pagos recientes</h2>
          <Link href="/pagos" className="text-xs text-blue-600 hover:text-blue-800">
            Ver todos →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {!pagosRecientes || pagosRecientes.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-gray-400 text-sm">No hay pagos registrados</p>
              <Link href="/pagos/nuevo" className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-800">
                + Registrar pago
              </Link>
            </div>
          ) : (
            pagosRecientes.map((p: any) => (
              <Link key={p.id} href={`/pagos/${p.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.concepto}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.obras?.nombre}</p>
                </div>
                <div className="ml-3 text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">{formatPEN(p.monto)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    p.estado === 'pagado'    ? 'bg-green-100 text-green-700' :
                    p.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
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



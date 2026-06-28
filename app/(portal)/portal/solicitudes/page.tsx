import { createClient } from '@/lib/supabase/server'
import NuevaSolicitudModal from '@/components/portal/NuevaSolicitudModal'
import { labelEstadoSolicitud, labelPrioridad, labelTipoServicio } from '@/lib/labels'

function EstadoBadge({
  estado,
}: {
  estado: string | null
}) {
  const s = (estado ?? '').toLowerCase()
  const alta = s === 'alta' || s === 'critica'
  const bg = alta
    ? 'bg-amber-500/10'
    : 'bg-gray-500/10'
  const fg = alta
    ? 'text-amber-400'
    : 'text-gray-400'

  // Si el estado ya viene en texto amigable (media/baja), lo mostramos tal cual.
  const label = estado ?? 'Sin estado'

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${bg} ${fg}`}
    >
      {label}
    </span>
  )
}

export default async function MisSolicitudesPage() {
  const supabase = await createClient()

  const { data: solicitudes, error } = await supabase
    .from('solicitudes')
    .select(
      'id, created_at, titulo, tipo_servicio, estado, prioridad'
    )
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Mis Solicitudes
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          No tienes solicitudes registradas.
        </p>
      </div>
    )
  }

  const list = solicitudes ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Mis Solicitudes
        </h1>
        <NuevaSolicitudModal />
      </div>

      {list.length === 0 ? (
        <div
          className="rounded-xl border border-[var(--table-border)] bg-[var(--card-bg)] p-6"
        >
          <p className="text-sm text-gray-400">
            No tienes solicitudes registradas.
          </p>
        </div>
      ) : (
        <>
          {/* Tabla escritorio */}
          <div
            className="hidden md:block rounded-xl border border-[var(--table-border)] bg-[var(--card-bg)] overflow-hidden"
          >
            <div
              className="bg-[var(--table-header-bg)] text-[var(--table-header-text)] border-b border-[var(--table-border)]"
            >
              <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-semibold">
                <div className="col-span-2">Fecha</div>
                <div className="col-span-4">Título</div>
                <div className="col-span-2">Tipo</div>
                <div className="col-span-2">Estado</div>
                <div className="col-span-2">Prioridad</div>
              </div>
            </div>

            <div className="divide-y divide-[var(--table-border)]">
              {list.map((s: any) => (
                <div
                  key={s.id}
                  className="grid grid-cols-12 gap-3 px-4 py-3 hover:bg-[var(--table-row-hover)] transition-colors"
                >
                  <div className="col-span-2 text-sm text-[var(--text-primary)]">
                    {s.created_at ? String(s.created_at).slice(0, 10) : '-'}
                  </div>
                  <div className="col-span-4 text-sm text-[var(--text-primary)]">
                    {s.titulo}
                  </div>
                  <div className="col-span-2 text-sm text-[var(--text-primary)]">
                    {labelTipoServicio(s.tipo_servicio)}
                  </div>
                  <div className="col-span-2">
                    <EstadoBadge estado={labelEstadoSolicitud(s.estado)} />
                  </div>
                  <div className="col-span-2">
                    <EstadoBadge estado={labelPrioridad(s.prioridad)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cards móvil */}
          <div className="md:hidden space-y-3">
            {list.map((s: any) => (
              <div
                key={s.id}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {s.titulo}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {s.created_at ? String(s.created_at).slice(0, 10) : '-'} · {labelTipoServicio(s.tipo_servicio)}
                    </div>
                  </div>
                  <EstadoBadge estado={labelPrioridad(s.prioridad)} />
                </div>
                <div className="mt-3 pt-3 border-t border-[var(--table-border)]">
                  <EstadoBadge estado={labelEstadoSolicitud(s.estado)} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
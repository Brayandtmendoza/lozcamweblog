'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPEN } from '@/lib/utils/formatters'
import { EstadoBadge } from '@/components/EstadoBadge'
import { AccionesFila } from '@/components/shared/AccionesFila'
import type { Presupuesto } from '@/lib/types/presupuestos'

type Filtro = 'todos' | 'aprobado' | 'borrador'

const SEGMENTOS = [
  { key: 'total_directo'    as const, label: 'Costo directo', color: '#1E6FBF' },
  { key: 'gastos_generales' as const, label: 'G. generales',  color: '#d97706' },
  { key: 'utilidad'         as const, label: 'Utilidad',       color: '#10b981' },
  { key: 'igv'              as const, label: 'IGV',             color: '#94a3b8' },
]

const FILTROS: { key: Filtro; label: string }[] = [
  { key: 'todos',    label: 'Todos' },
  { key: 'aprobado', label: 'Aprobados' },
  { key: 'borrador', label: 'Borradores' },
]

export default function PresupuestosPage() {
  const supabase = createClient()
  const router = useRouter()

  const [lista, setLista] = useState<Presupuesto[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    supabase
      .from('presupuestos')
      .select('*, obras(nombre)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setLista((data ?? []) as Presupuesto[])
        setCargando(false)
      })
  }, [])

  async function handleEliminar(id: number | string) {
    const { error } = await supabase
      .from('presupuestos')
      .delete()
      .eq('id', id)
    if (error) throw new Error(error.message)
    setLista(prev => prev.filter(p => p.id !== id))
  }

  const filtrada = useMemo(() => {
    return lista.filter(p => {
      if (filtro !== 'todos' && p.estado !== filtro) return false
      if (busqueda) {
        const q = busqueda.toLowerCase()
        if (
          !p.nombre.toLowerCase().includes(q) &&
          !(p.obras?.nombre ?? '').toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  }, [lista, filtro, busqueda])

  // KPIs sobre lista completa
  const totalPresupuestado = lista.reduce((s, p) => s + Number(p.total), 0)
  const aprobados = lista.filter(p => p.estado === 'aprobado')
  const borradores = lista.filter(p => p.estado === 'borrador')
  const totalAprobado = aprobados.reduce((s, p) => s + Number(p.total), 0)

  const cardStyle = { background: 'var(--card-bg)', border: '1px solid var(--card-border)' }
  const tp = { color: 'var(--text-primary)' }
  const ts = { color: 'var(--text-secondary)' }
  const inputStyle = {
    background: 'var(--surface-elevated)',
    border: '1px solid var(--card-border)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="space-y-5">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={tp}>Presupuestos</h1>
          <p className="text-sm mt-0.5" style={ts}>
            {cargando
              ? '...'
              : `${lista.length} presupuesto${lista.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/presupuestos/nuevo"
          className="bg-action hover:bg-action-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          + Nuevo presupuesto
        </Link>
      </div>

      {/* ── KPI CARDS ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl p-4" style={cardStyle}>
          <p className="text-xs mb-1" style={ts}>Total presupuestado</p>
          <p className="text-xl font-bold text-amber-500">{formatPEN(totalPresupuestado)}</p>
        </div>
        <div className="rounded-xl p-4" style={cardStyle}>
          <p className="text-xs mb-1" style={ts}>Aprobados</p>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-green-500">{aprobados.length}</p>
            <p className="text-xs" style={{ color: '#10b981aa' }}>{formatPEN(totalAprobado)}</p>
          </div>
        </div>
        <div className="rounded-xl p-4" style={cardStyle}>
          <p className="text-xs mb-1" style={ts}>En borrador</p>
          <p className="text-xl font-bold" style={tp}>{borradores.length}</p>
        </div>
      </div>

      {/* ── FILTROS ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Segmented control */}
        <div
          className="flex rounded-lg overflow-hidden shrink-0"
          style={{ border: '1px solid var(--card-border)' }}
        >
          {FILTROS.map((f, i) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{
                background: filtro === f.key ? '#1E6FBF' : 'var(--card-bg)',
                color: filtro === f.key ? '#fff' : 'var(--text-secondary)',
                borderLeft: i > 0 ? '1px solid var(--card-border)' : undefined,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar por nombre u obra..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="flex-1 min-w-[180px] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-action/40"
          style={inputStyle}
        />
      </div>

      {/* ── CONTENIDO ──────────────────────────────────────────────────── */}
      {cargando ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={ts}>Cargando...</p>
        </div>
      ) : lista.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={ts}>No hay presupuestos registrados aún</p>
          <Link
            href="/presupuestos/nuevo"
            className="mt-4 inline-block bg-action hover:bg-action-hover text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Crear primer presupuesto
          </Link>
        </div>
      ) : filtrada.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={ts}>No se encontraron presupuestos con esos filtros.</p>
          <button
            onClick={() => { setFiltro('todos'); setBusqueda('') }}
            className="mt-3 text-xs hover:underline"
            style={{ color: '#F5A623' }}
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrada.map(p => {
            const total = Number(p.total) || 1

            return (
              <div
                key={p.id}
                className="rounded-xl p-5 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow"
                style={cardStyle}
                onClick={() => router.push(`/presupuestos/${p.id}`)}
              >
                {/* ── Badges + Acciones ── */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <EstadoBadge estado={p.estado} />
                    {p.es_vigente && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        Vigente
                      </span>
                    )}
                  </div>
                  <div onClick={e => e.stopPropagation()}>
                    <AccionesFila
                      id={p.id}
                      rutaBase="/presupuestos"
                      onEliminar={handleEliminar}
                      tituloModal="¿Eliminar este presupuesto?"
                      descripcionModal="Esta acción no se puede deshacer y también eliminará sus partidas."
                      mensajeExito="Presupuesto eliminado"
                    />
                  </div>
                </div>

                {/* ── Nombre + Obra ── */}
                <div>
                  <h3 className="font-semibold leading-tight" style={tp}>{p.nombre}</h3>
                  <p className="text-xs mt-0.5" style={ts}>{p.obras?.nombre ?? '—'}</p>
                </div>

                {/* ── Total ── */}
                <p className="text-2xl font-bold text-amber-500 leading-none">
                  {formatPEN(Number(p.total))}
                </p>

                {/* ── Barra segmentada + leyenda ── */}
                <div className="mt-auto pt-1">
                  <div
                    className="flex h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'var(--card-border)' }}
                  >
                    {SEGMENTOS.map(s => {
                      const val = Number(p[s.key]) || 0
                      const pct = (val / total) * 100
                      return (
                        <div
                          key={s.key}
                          style={{ width: `${Math.max(pct, 0)}%`, background: s.color }}
                          title={`${s.label}: ${formatPEN(val)}`}
                        />
                      )
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2.5">
                    {SEGMENTOS.map(s => {
                      const val = Number(p[s.key]) || 0
                      return (
                        <div key={s.key} className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: s.color }}
                          />
                          <span className="text-[10px] truncate" style={ts}>{s.label}</span>
                          <span
                            className="text-[10px] font-medium ml-auto shrink-0"
                            style={tp}
                          >
                            {formatPEN(val)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

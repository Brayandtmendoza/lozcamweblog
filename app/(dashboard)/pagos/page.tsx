'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatFecha, formatPEN } from '@/lib/utils/formatters'
import { ESTADO_PAGO_LABEL } from '@/lib/types/pagos'
import { EstadoBadge } from '@/components/EstadoBadge'
import { FilaTabla } from '@/components/shared/FilaTabla'
import { AccionesFila } from '@/components/shared/AccionesFila'

type OrdenCol = 'fecha_pago' | 'monto' | 'concepto'
type OrdenDir = 'asc' | 'desc'

function ThSort({
  col, label, ordenCol, ordenDir, onOrden,
}: {
  col: OrdenCol
  label: string
  ordenCol: OrdenCol
  ordenDir: OrdenDir
  onOrden: (col: OrdenCol) => void
}) {
  const activo = ordenCol === col
  return (
    <th
      onClick={() => onOrden(col)}
      className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none group"
      style={{ color: 'var(--text-secondary)' }}
    >
      <span className="flex items-center gap-1">
        {label}
        <span className={activo ? 'opacity-100' : 'opacity-30 group-hover:opacity-70'} style={{ fontSize: '10px' }}>
          {activo ? (ordenDir === 'asc' ? '▲' : '▼') : '▲▼'}
        </span>
      </span>
    </th>
  )
}

export default function PagosPage() {
  const supabase = createClient()

  const [lista, setLista] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroObra, setFiltroObra] = useState('')
  const [montoMin, setMontoMin] = useState('')
  const [montoMax, setMontoMax] = useState('')

  // Orden
  const [ordenCol, setOrdenCol] = useState<OrdenCol>('fecha_pago')
  const [ordenDir, setOrdenDir] = useState<OrdenDir>('desc')

  // Paginación
  const [pagina, setPagina] = useState(1)
  const [filasPorPagina, setFilasPorPagina] = useState(10)

  useEffect(() => {
    supabase
      .from('pagos_clientes')
      .select('*, obras (nombre), clientes (nombres, apellidos, razon_social)')
      .order('fecha_pago', { ascending: false })
      .then(({ data }) => {
        setLista(data ?? [])
        setCargando(false)
      })
  }, [])

  async function handleEliminar(id: number | string) {
    const { error } = await supabase
      .from('pagos_clientes')
      .delete()
      .eq('id', id)
    if (error) throw new Error(error.message)
    setLista(prev => prev.filter(p => p.id !== id))
  }

  // Obras únicas disponibles para el dropdown
  const obrasDisponibles = useMemo(() => {
    const seen = new Map<number, string>()
    lista.forEach(p => {
      if (p.obra_id && p.obras?.nombre) seen.set(p.obra_id as number, p.obras.nombre as string)
    })
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [lista])

  // Lista filtrada
  const filtrada = useMemo(() => {
    const q = busqueda.toLowerCase().trim()
    const minN = montoMin ? parseFloat(montoMin) : null
    const maxN = montoMax ? parseFloat(montoMax) : null
    return lista.filter(p => {
      if (filtroEstado && p.estado !== filtroEstado) return false
      if (filtroObra && String(p.obra_id) !== filtroObra) return false
      if (minN !== null && Number(p.monto) < minN) return false
      if (maxN !== null && Number(p.monto) > maxN) return false
      if (q) {
        const concepto = (p.concepto ?? '').toLowerCase()
        const obra = (p.obras?.nombre ?? '').toLowerCase()
        const cliente = (
          p.clientes?.razon_social ??
          `${p.clientes?.nombres ?? ''} ${p.clientes?.apellidos ?? ''}`.trim()
        ).toLowerCase()
        if (!concepto.includes(q) && !obra.includes(q) && !cliente.includes(q)) return false
      }
      return true
    })
  }, [lista, busqueda, filtroEstado, filtroObra, montoMin, montoMax])

  // Lista ordenada
  const ordenada = useMemo(() => {
    return [...filtrada].sort((a, b) => {
      let va: string | number
      let vb: string | number
      if (ordenCol === 'monto') {
        va = Number(a.monto)
        vb = Number(b.monto)
      } else if (ordenCol === 'concepto') {
        va = (a.concepto ?? '').toLowerCase()
        vb = (b.concepto ?? '').toLowerCase()
      } else {
        // fecha_pago: YYYY-MM-DD strings comparan lexicográficamente
        va = a.fecha_pago ?? ''
        vb = b.fecha_pago ?? ''
      }
      if (va < vb) return ordenDir === 'asc' ? -1 : 1
      if (va > vb) return ordenDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filtrada, ordenCol, ordenDir])

  const totalPaginas = Math.max(1, Math.ceil(ordenada.length / filasPorPagina))
  const paginaActual = Math.min(pagina, totalPaginas)
  const paginada = ordenada.slice((paginaActual - 1) * filasPorPagina, paginaActual * filasPorPagina)

  function handleOrden(col: OrdenCol) {
    if (ordenCol === col) {
      setOrdenDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setOrdenCol(col)
      setOrdenDir(col === 'fecha_pago' ? 'desc' : 'asc')
    }
    setPagina(1)
  }

  function limpiarFiltros() {
    setBusqueda('')
    setFiltroEstado('')
    setFiltroObra('')
    setMontoMin('')
    setMontoMax('')
    setPagina(1)
  }

  const hayFiltros = !!(busqueda || filtroEstado || filtroObra || montoMin || montoMax)

  // KPIs sobre la lista total (no filtrada)
  const totalCobrado = lista
    .filter(p => p.estado === 'pagado')
    .reduce((s, p) => s + Number(p.monto), 0)
  const pendientesCount = lista.filter(p => p.estado === 'pendiente').length

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
          <h1 className="text-2xl font-bold" style={tp}>Pagos</h1>
          <p className="text-sm mt-0.5" style={ts}>
            {cargando
              ? '...'
              : `${lista.length} pago${lista.length !== 1 ? 's' : ''} registrado${lista.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/pagos/nuevo"
          className="bg-action hover:bg-action-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          + Registrar pago
        </Link>
      </div>

      {/* ── KPI CARDS ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl p-4" style={cardStyle}>
          <p className="text-xs mb-1" style={ts}>Total pagos</p>
          <p className="text-xl font-bold" style={tp}>{lista.length}</p>
        </div>
        <div className="rounded-xl p-4" style={cardStyle}>
          <p className="text-xs mb-1" style={ts}>Total cobrado</p>
          <p className="text-xl font-bold text-amber-500">{formatPEN(totalCobrado)}</p>
        </div>
        <div className="rounded-xl p-4" style={cardStyle}>
          <p className="text-xs mb-1" style={ts}>Pendientes</p>
          <p className="text-xl font-bold text-yellow-500">{pendientesCount}</p>
        </div>
      </div>

      {/* ── BARRA DE FILTROS ───────────────────────────────────────────── */}
      <div className="rounded-xl p-4 space-y-3" style={cardStyle}>
        {/* Fila 1: búsqueda + estado + obra */}
        <div className="grid gap-3" style={{ gridTemplateColumns: '1fr auto auto' }}>
          <input
            type="text"
            placeholder="Buscar por concepto, obra o cliente..."
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
            className="rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-action/40 min-w-0"
            style={inputStyle}
          />
          <select
            value={filtroEstado}
            onChange={e => { setFiltroEstado(e.target.value); setPagina(1) }}
            className="rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-action/40"
            style={inputStyle}
          >
            <option value="">Todos los estados</option>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
          </select>
          <select
            value={filtroObra}
            onChange={e => { setFiltroObra(e.target.value); setPagina(1) }}
            className="rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-action/40 max-w-[200px]"
            style={inputStyle}
          >
            <option value="">Todas las obras</option>
            {obrasDisponibles.map(([id, nombre]) => (
              <option key={id} value={String(id)}>{nombre}</option>
            ))}
          </select>
        </div>

        {/* Fila 2: rango de monto + limpiar */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="number"
            placeholder="Monto mín (S/)"
            value={montoMin}
            onChange={e => { setMontoMin(e.target.value); setPagina(1) }}
            className="rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-action/40 w-40"
            style={inputStyle}
            min="0"
          />
          <span className="text-xs" style={ts}>—</span>
          <input
            type="number"
            placeholder="Monto máx (S/)"
            value={montoMax}
            onChange={e => { setMontoMax(e.target.value); setPagina(1) }}
            className="rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-action/40 w-40"
            style={inputStyle}
            min="0"
          />
          <div className="flex-1" />
          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80"
              style={{ background: 'var(--card-border)', color: 'var(--text-secondary)' }}
            >
              <X size={13} />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* ── CONTADOR FILTRADO ──────────────────────────────────────────── */}
      {!cargando && (
        <p className="text-xs" style={ts}>
          {hayFiltros
            ? `${ordenada.length} de ${lista.length} pago${lista.length !== 1 ? 's' : ''}`
            : `${lista.length} pago${lista.length !== 1 ? 's' : ''}`}
        </p>
      )}

      {/* ── TABLA ──────────────────────────────────────────────────────── */}
      {cargando ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={ts}>Cargando...</p>
        </div>
      ) : lista.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={ts}>No hay pagos registrados aún</p>
          <Link
            href="/pagos/nuevo"
            className="mt-4 inline-block bg-action hover:bg-action-hover text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Registrar primer pago
          </Link>
        </div>
      ) : ordenada.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={ts}>No se encontraron pagos con esos filtros.</p>
          <button
            onClick={limpiarFiltros}
            className="mt-3 text-xs hover:underline"
            style={{ color: 'var(--text-accent, #F5A623)' }}
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={cardStyle}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: '800px' }}>
              <thead style={{ background: 'var(--table-header-bg)' }}>
                <tr style={{ borderBottom: '2px solid var(--table-border)' }}>
                  <ThSort col="concepto" label="Concepto" ordenCol={ordenCol} ordenDir={ordenDir} onOrden={handleOrden} />
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Obra</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Cliente</th>
                  <ThSort col="fecha_pago" label="Fecha" ordenCol={ordenCol} ordenDir={ordenDir} onOrden={handleOrden} />
                  <ThSort col="monto" label="Monto" ordenCol={ordenCol} ordenDir={ordenDir} onOrden={handleOrden} />
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={ts}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginada.map((p: any) => (
                  <FilaTabla key={p.id} href={`/pagos/${p.id}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium" style={tp}>{p.concepto}</div>
                      {p.numero_cuota && (
                        <div className="text-xs mt-0.5" style={ts}>Cuota #{p.numero_cuota}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs" style={ts}>
                      {p.obras?.nombre ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs" style={ts}>
                      {(p.clientes?.razon_social ??
                        `${p.clientes?.nombres ?? ''} ${p.clientes?.apellidos ?? ''}`.trim()) ||
                        '—'}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={ts}>
                      {formatFecha(p.fecha_pago + 'T12:00:00')}
                    </td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap text-amber-500">
                      {formatPEN(Number(p.monto))}
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={p.estado} label={ESTADO_PAGO_LABEL[p.estado]} />
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <AccionesFila
                        id={p.id}
                        rutaBase="/pagos"
                        onEliminar={handleEliminar}
                        tituloModal="¿Eliminar este pago?"
                        descripcionModal="Esta acción no se puede deshacer."
                        mensajeExito="Pago eliminado"
                      />
                    </td>
                  </FilaTabla>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── PAGINACIÓN ─────────────────────────────────────────────── */}
          <div
            className="flex items-center justify-between px-4 py-3 gap-4 flex-wrap"
            style={{ borderTop: '1px solid var(--table-border)' }}
          >
            <div className="flex items-center gap-2 text-xs" style={ts}>
              <span>Filas por página:</span>
              <select
                value={filasPorPagina}
                onChange={e => { setFilasPorPagina(Number(e.target.value)); setPagina(1) }}
                className="rounded px-2 py-1 outline-none text-xs"
                style={inputStyle}
              >
                {[10, 25, 50].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 text-xs" style={ts}>
              <span>Página {paginaActual} de {totalPaginas}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  className="px-3 py-1.5 rounded text-xs transition-colors disabled:opacity-40 hover:opacity-80"
                  style={{ background: 'var(--card-border)', color: 'var(--text-primary)' }}
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-1.5 rounded text-xs transition-colors disabled:opacity-40 hover:opacity-80"
                  style={{ background: 'var(--card-border)', color: 'var(--text-primary)' }}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

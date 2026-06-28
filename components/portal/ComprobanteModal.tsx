'use client'

import { useMemo, useState } from 'react'
import { X, FileText } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { labelEstadoPago } from '@/lib/labels'

type Comprobante = {
  id: string | number
  pago_id: string | number
  tipo: string | null
  serie: string | null
  numero: string | null
  fecha_emision: string | null
  monto_base: number | null
  igv: number | null
  total: number | null
  estado_sunat: string | null
  archivo_url?: string | null
}

function formatPEN(v: number | null | undefined) {
  const num = typeof v === 'number' ? v : Number(v ?? 0)
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(Number.isFinite(num) ? num : 0)
}

function labelSunatEstado(estadoSunat: string | null | undefined) {
  const s = (estadoSunat ?? '').toLowerCase()
  if (!s) return '—'
  if (s.includes('acept')) return 'Aceptado'
  if (s.includes('pend')) return 'Pendiente'
  if (s.includes('recha')) return 'Rechazado'
  return estadoSunat
}

function sunatBadgeClasses(estadoSunat: string | null | undefined) {
  const s = (estadoSunat ?? '').toLowerCase()
  const aceptado = s.includes('acept')
  const pendiente = s.includes('pend')
  const rechazado = s.includes('recha') || s.includes('fail')

  if (aceptado) return { bg: 'bg-emerald-500/10', fg: 'text-emerald-400', border: 'border-emerald-500/20' }
  if (pendiente) return { bg: 'bg-amber-500/10', fg: 'text-amber-500', border: 'border-amber-500/20' }
  if (rechazado) return { bg: 'bg-red-500/10', fg: 'text-red-400', border: 'border-red-500/20' }
  return { bg: 'bg-gray-500/10', fg: 'text-gray-400', border: 'border-gray-500/20' }
}

function formatTipoSerieNumero(t: string | null | undefined, serie: string | null | undefined, numero: string | null | undefined) {
  const tipo = (t ?? '').trim() || 'Comprobante'
  const s = (serie ?? '').trim()
  const n = (numero ?? '').toString().trim()
  if (s && n) return `${tipo} ${s}-${n}`
  if (s) return `${tipo} ${s}`
  if (n) return `${tipo} ${n}`
  return tipo
}

export default function ComprobanteModal({
  comprobante,
}: {
  comprobante: Comprobante | null
}) {
  const [abierto, setAbierto] = useState(false)
  const { isDark } = useTheme()

  const title = useMemo(() => {
    if (!comprobante) return ''
    return formatTipoSerieNumero(comprobante.tipo, comprobante.serie, comprobante.numero)
  }, [comprobante])

  if (!comprobante) {
    return (
      <span className="inline-flex items-center gap-2 text-[var(--text-secondary)] text-sm">—</span>
    )
  }

  const sunatLabel = labelSunatEstado(comprobante.estado_sunat)
  const sunatClasses = sunatBadgeClasses(comprobante.estado_sunat)

  const fecha = comprobante.fecha_emision ? String(comprobante.fecha_emision).slice(0, 10) : '—'

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--table-border)] bg-[var(--card-bg)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--table-row-hover)] transition-colors"
        aria-label="Ver comprobante"
      >
        <FileText size={16} />
        Ver comprobante
      </button>

      {abierto ? (
        <div
          className="fixed inset-0 z-50 flex item-start items-center justify-center overflow-y-auto p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setAbierto(false)}
          />

          <div className="relative w-full max-w-2xl my_auto">
            <div
              className="w-full max-w-2xl rounded-xl border border-[var(--card-border)] shadow-lg overflow-hidden max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: isDark ? '#0f2238' : '#ffffff',
                color: 'inherit',
              }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      Fecha de emisión: <span className="font-medium text-[var(--text-primary)]">{fecha}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAbierto(false)}
                    aria-label="Cerrar"
                    className="rounded-lg border border-[var(--table-border)] bg-[var(--card-bg)] p-2 text-[var(--text-secondary)] hover:bg-[var(--table-row-hover)]"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold">
                    <span className={`mr-2 ${sunatClasses.fg}`}>SUNAT</span>
                    <span className={`${sunatClasses.bg} ${sunatClasses.fg} ${sunatClasses.border}`} style={{ borderWidth: 0, borderStyle: 'none' }}>
                      {/* keep text color predictable */}
                      {sunatLabel}
                    </span>
                  </div>

                  <div className="text-xs text-[var(--text-secondary)]">
                    ID: <span className="text-[var(--text-primary)] font-medium">{String(comprobante.id)}</span>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-[var(--table-border)] bg-[var(--card-bg)] p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Monto base
                      </div>
                      <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                        {formatPEN(comprobante.monto_base)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        IGV (18%)
                      </div>
                      <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                        {formatPEN(comprobante.igv)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Total
                      </div>
                      <div className="mt-1 text-sm font-semibold text-amber-500">
                        {formatPEN(comprobante.total)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
                  <button
                    type="button"
                    disabled
                    title="Próximamente"
                    className="rounded-lg border border-[var(--table-border)] bg-[var(--card-bg)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] opacity-70 cursor-not-allowed"
                  >
                    Descargar PDF
                    <span className="ml-2">Próximamente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAbierto(false)}
                    className="rounded-lg border border-[var(--table-border)] bg-[var(--card-bg)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--table-row-hover)]"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}


'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  id: number | string
  rutaBase: string
  onEliminar: (id: number | string) => Promise<void>
  tituloModal?: string
  descripcionModal?: string
  mensajeExito?: string
}

export function AccionesFila({
  id,
  rutaBase,
  onEliminar,
  tituloModal = '¿Eliminar este registro?',
  descripcionModal = 'Esta acción no se puede deshacer.',
  mensajeExito = 'Registro eliminado',
}: Props) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const tp = { color: 'var(--text-primary)' }
  const ts = { color: 'var(--text-secondary)' }

  async function handleConfirm() {
    setLoading(true)
    setError('')
    try {
      await onEliminar(id)
      toast.success(mensajeExito)
      setShowModal(false)
    } catch (e: any) {
      toast.error(e?.message ?? 'No se pudo eliminar')
      setError(e?.message ?? 'No se pudo eliminar')
      setLoading(false)
    }
  }

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => { if (!loading) setShowModal(false) }}
          />
          <div
            className="relative z-10 rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl bg-white dark:bg-gray-800"
            style={{ border: '1px solid var(--card-border)' }}
          >
            <h2 className="text-base font-semibold mb-2" style={tp}>{tituloModal}</h2>
            <p className="text-sm mb-5" style={ts}>{descripcionModal}</p>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 rounded-lg py-2 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
                style={{ border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {loading ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1">
        <Link
          href={`${rutaBase}/${id}`}
          title="Ver"
          className="p-1.5 rounded-md transition-opacity opacity-50 hover:opacity-100"
          style={ts}
        >
          <Eye size={15} />
        </Link>
        <Link
          href={`${rutaBase}/${id}/editar`}
          title="Editar"
          className="p-1.5 rounded-md transition-opacity opacity-50 hover:opacity-100"
          style={ts}
        >
          <Pencil size={15} />
        </Link>
        <button
          onClick={(e) => { e.stopPropagation(); setShowModal(true) }}
          title="Eliminar"
          className="p-1.5 rounded-md text-red-500 hover:text-red-400 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </>
  )
}

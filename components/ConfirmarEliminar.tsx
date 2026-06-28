'use client'

import { useState, cloneElement, isValidElement, type ReactNode } from 'react'
import { AlertDialog, AlertDialogPortal } from '@/components/ui/alert-dialog'
import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog'

interface Props {
  trigger: ReactNode
  titulo?: string
  descripcion?: string
  textoConfirmar?: string
  textoCancelar?: string
  onConfirm: () => Promise<void>
}

export function ConfirmarEliminar({
  trigger,
  titulo = '¿Eliminar este elemento?',
  descripcion = 'Esta acción no se puede deshacer.',
  textoConfirmar = 'Sí, eliminar',
  textoCancelar = 'Cancelar',
  onConfirm,
}: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    setLoading(true)
    setError('')
    try {
      await onConfirm()
      setOpen(false)
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo eliminar')
      setLoading(false)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const triggerEl = isValidElement(trigger)
    ? cloneElement(trigger as React.ReactElement<any>, { onClick: () => setOpen(true) })
    : trigger

  return (
    <>
      {triggerEl}
      <AlertDialog
        open={open}
        onOpenChange={(newOpen: boolean) => { if (!loading) setOpen(newOpen) }}
      >
        <AlertDialogPortal>
          <AlertDialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/60" />
          <AlertDialogPrimitive.Popup
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 shadow-xl outline-none"
            style={{ background: 'var(--popover)', border: '1px solid var(--card-border)' }}
          >
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {titulo}
            </h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              {descripcion}
            </p>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <div className="flex gap-3">
              <AlertDialogPrimitive.Close
                disabled={loading}
                className="flex-1 rounded-lg py-2 text-sm font-medium transition-colors hover:opacity-80 disabled:opacity-50"
                style={{
                  border: '1px solid var(--card-border)',
                  color: 'var(--text-primary)',
                  background: 'transparent',
                }}
              >
                {textoCancelar}
              </AlertDialogPrimitive.Close>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 rounded-lg py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition-colors"
              >
                {loading ? 'Eliminando...' : textoConfirmar}
              </button>
            </div>
          </AlertDialogPrimitive.Popup>
        </AlertDialogPortal>
      </AlertDialog>
    </>
  )
}

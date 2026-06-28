'use client'

import { useState, useTransition } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { Plus } from 'lucide-react'
import { crearSolicitud } from '@/app/(portal)/portal/solicitudes/actions'

type ActionResult =
  | { success: true }
  | { error: string }

function CheckboxField({
  name,
  label,
}: {
  name: string
  label: string
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
      <input
        type="checkbox"
        name={name}
        className="h-4 w-4 rounded border border-[var(--table-border)] bg-[var(--card-bg)]"
      />
      <span className="text-[var(--text-secondary)]">{label}</span>
    </label>
  )
}

export default function NuevaSolicitudModal() {
  const { isDark } = useTheme()
  const [abierto, setAbierto] = useState(false)
  const [pending, startTransition] = useTransition()
  const [actionError, setActionError] = useState<string | null>(null)

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setActionError(null)
            setAbierto(true)
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-sm font-medium text-amber-500 hover:bg-amber-500/20 transition-colors"
        >
          <Plus size={16} />
          Nueva solicitud
        </button>
      </div>

      {abierto ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => {
              if (!pending) setAbierto(false)
            }}
          />

          <div className="relative w-full max-w-2xl my-auto">
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
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                      Nueva solicitud
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      Completa los datos y envía tu requerimiento.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAbierto(false)}
                    aria-label="Cerrar"
                    className="rounded-lg border border-[var(--table-border)] bg-[var(--card-bg)] p-2 text-[var(--text-secondary)] hover:bg-[var(--table-row-hover)]"
                  >
                    ×
                  </button>
                </div>

                {actionError ? (
                  <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    {actionError}
                  </div>
                ) : null}


              <form
                action={async (fd: FormData) => {
                  setActionError(null)
                  startTransition(() => {
                    ;(async () => {
                      const res = (await crearSolicitud(fd)) as ActionResult
                      if ('success' in res) {
                        if (res.success) setAbierto(false)
                      } else {
                        setActionError(res.error)
                      }
                    })()
                  })
                }}
                className="mt-5 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">
                      Título <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="titulo"
                      type="text"
                      required
                      className="w-full rounded-lg border border-[var(--table-border)] bg-[var(--card-bg)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      placeholder="Ej. Levantamiento topográfico" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">
                      Tipo de servicio <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="tipo_servicio"
                      required
                      className="w-full rounded-lg border border-[var(--table-border)] bg-[var(--card-bg)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      defaultValue=""
                    >
                      <option value="" disabled style={{ color: '#94a3b8', background: '#0f2238' }}>Selecciona...</option>
                      <option value="construccion" style={{ color: '#fff', background: '#0f2238' }}>Construcción</option>
                      <option value="topografia" style={{ color: '#fff', background: '#0f2238' }}>Topografía</option>
                      <option value="arquitectura" style={{ color: '#fff', background: '#0f2238' }}>Arquitectura</option>
                      <option value="instalaciones" style={{ color: '#fff', background: '#0f2238' }}>Instalaciones</option>
                      <option value="supervision" style={{ color: '#fff', background: '#0f2238' }}>Supervisión</option>
                      <option value="habilitacion_urbana" style={{ color: '#fff', background: '#0f2238' }}>Habilitación urbana</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">
                      Distrito
                    </label>
                    <input
                      name="distrito"
                      type="text"
                      className="w-full rounded-lg border border-[var(--table-border)] bg-[var(--card-bg)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      placeholder="Ej. Miraflores"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">
                      Área aproximada en m²
                    </label>
                    <input
                      name="area_m2"
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full rounded-lg border border-[var(--table-border)] bg-[var(--card-bg)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">
                      Presupuesto referencial
                    </label>
                    <input
                      name="presupuesto_ref"
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full rounded-lg border border-[var(--table-border)] bg-[var(--card-bg)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    rows={4}
                    className="w-full rounded-lg border border-[var(--table-border)] bg-[var(--card-bg)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    placeholder="Describe brevemente lo que necesitas..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CheckboxField name="tiene_terreno" label="¿Tiene terreno?" />
                  <CheckboxField name="tiene_planos" label="¿Tiene planos?" />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAbierto(false)}
                    className="rounded-lg border border-[var(--table-border)] bg-[var(--card-bg)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--table-row-hover)]"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex items-center gap-2 rounded-lg bg-action hover:bg-action-hover px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {pending ? 'Enviando...' : 'Enviar solicitud'}
                  </button>
                </div>
              </form>
            </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}


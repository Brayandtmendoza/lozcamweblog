'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RecuperarPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError('No pudimos enviar el correo. Verifica el correo e intenta de nuevo.')
      setLoading(false)
      return
    }

    setEnviado(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1117] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl px-10 py-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">Recuperar contraseña</h1>
            <p className="text-gray-400 text-sm mt-2">
              Te enviaremos un enlace para restablecerla
            </p>
          </div>

          {enviado ? (
            <div className="space-y-5">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
                <p className="text-emerald-400 text-sm">
                  Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada y la carpeta de spam.
                </p>
              </div>
              <Link
                href="/login"
                className="block text-center w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-purple-900/40"
              >
                Volver a iniciar sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@lozcam.pe"
                  className="w-full bg-[#1e2535] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-purple-900/40"
              >
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>

              <Link
                href="/login"
                className="block text-center text-xs text-gray-400 hover:text-gray-200 transition-colors"
              >
                Volver a iniciar sesión
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
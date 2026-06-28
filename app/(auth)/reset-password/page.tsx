'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [listo, setListo] = useState(false)
  const [sesionValida, setSesionValida] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.top !== window.self) {
        window.top!.location.href = window.location.href
      }
    } catch {
      // window.top inaccesible por cross-origin — no hacer nada
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesionValida(!!session)
    })
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('No se pudo actualizar la contraseña. El enlace puede haber expirado.')
      setLoading(false)
      return
    }

    setListo(true)
    setLoading(false)
    setTimeout(() => router.push('/login'), 2500)
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">Nueva contraseña</h1>
            <p className="text-gray-400 text-sm mt-2">Escribe tu nueva contraseña</p>
          </div>

          {sesionValida === false ? (
            <div className="space-y-5">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
                <p className="text-amber-400 text-sm">
                  Este enlace no es válido o ya expiró. Solicita uno nuevo desde "¿Olvidaste tu contraseña?".
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push('/recuperar')}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-purple-900/40"
              >
                Solicitar nuevo enlace
              </button>
            </div>
          ) : listo ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
              <p className="text-emerald-400 text-sm">
                Contraseña actualizada. Te llevaremos al inicio de sesión...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Nueva contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#1e2535] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-xs"
                  >
                    {showPassword ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Confirmar contraseña</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
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
                {loading ? 'Guardando...' : 'Guardar contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
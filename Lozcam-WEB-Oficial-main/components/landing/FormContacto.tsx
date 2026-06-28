'use client'

import { useState } from 'react'

export default function FormContacto() {
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="text-center py-8">
        <p className="text-2xl mb-2">✅</p>
        <p className="text-green-600 font-medium">
          ¡Mensaje enviado! Nos contactaremos pronto.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nombre
          </label>
          <input
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950/20"
            placeholder="Tu nombre"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input
            type="email"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950/20"
            placeholder="tu@correo.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
          <input
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950/20"
            placeholder="+51 9xx xxx xxx"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de servicio</label>
          <select
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950/20"
            defaultValue="Construcción de viviendas y edificios"
            required
          >
            <option>Construcción de viviendas y edificios</option>
            <option>Topografía y levantamiento de terrenos</option>
            <option>Arquitectura y elaboración de planos</option>
            <option>Instalaciones eléctricas y sanitarias</option>
            <option>Supervisión y consultoría de obras</option>
            <option>Habilitación urbana</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Mensaje</label>
        <textarea
          className="w-full min-h-32 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950/20"
          placeholder="Cuéntanos sobre tu proyecto (ubicación, tipo de obra, cronograma estimado, etc.)"
          required
        />
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500">
          Al enviar, aceptas el uso de tu información para contactarte.
        </p>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#f59e0b] text-gray-900 font-extrabold hover:brightness-95 transition disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar consulta'}
        </button>
      </div>
    </form>
  )
}


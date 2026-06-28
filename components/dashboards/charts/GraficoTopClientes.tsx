'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

export interface EntradaCliente { nombre: string; total: number }

const trunc = (s: string, n = 20) => s.length > n ? s.slice(0, n) + '…' : s

const fmtMiles = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}k`

const fmtPEN = (v: number) => `S/ ${Math.round(v).toLocaleString('es-PE')}`

const tooltipStyle = {
  background: 'rgba(11,23,39,0.96)',
  border: '1px solid rgba(148,163,184,0.18)',
  borderRadius: 8,
  fontSize: 12,
}

export function GraficoTopClientes({ data }: { data: EntradaCliente[] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm" style={{ color: '#64748b' }}>
        Sin datos de clientes
      </div>
    )
  }

  const mapped = data.map(d => ({ ...d, nombreCorto: trunc(d.nombre) }))

  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart
        data={mapped}
        layout="vertical"
        margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(148,163,184,0.09)"
          horizontal={false}
        />
        <XAxis
          type="number"
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={fmtMiles}
        />
        <YAxis
          type="category"
          dataKey="nombreCorto"
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          width={112}
        />
        <Tooltip
          formatter={(value) => [fmtPEN(value as number), 'Cobrado']}
          contentStyle={tooltipStyle}
          labelStyle={{ color: '#94a3b8', marginBottom: 4, fontWeight: 600 }}
          itemStyle={{ color: '#1E6FBF' }}
          cursor={{ fill: 'rgba(30,111,191,0.07)' }}
        />
        <Bar dataKey="total" fill="#1E6FBF" radius={[0, 4, 4, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  )
}

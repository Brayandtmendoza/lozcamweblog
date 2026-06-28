'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

export interface PuntoMensual { mes: string; total: number }

const fmtMiles = (v: number) =>
  v >= 1_000_000
    ? `${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000
    ? `${(v / 1_000).toFixed(0)}k`
    : String(v)

const fmtPEN = (v: number) =>
  `S/ ${Math.round(v).toLocaleString('es-PE')}`

const tooltipStyle = {
  background: 'rgba(11,23,39,0.96)',
  border: '1px solid rgba(148,163,184,0.18)',
  borderRadius: 8,
  fontSize: 12,
}

export function GraficoCobranzaMensual({ data }: { data: PuntoMensual[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(148,163,184,0.09)"
          vertical={false}
        />
        <XAxis
          dataKey="mes"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={fmtMiles}
          width={48}
        />
        <Tooltip
          formatter={(value) => [fmtPEN(value as number), 'Cobrado']}
          contentStyle={tooltipStyle}
          labelStyle={{ color: '#94a3b8', marginBottom: 4, fontWeight: 600 }}
          itemStyle={{ color: '#F5A623' }}
          cursor={{ fill: 'rgba(245,166,35,0.07)' }}
        />
        <Bar dataKey="total" fill="#F5A623" radius={[4, 4, 0, 0]} maxBarSize={52} />
      </BarChart>
    </ResponsiveContainer>
  )
}

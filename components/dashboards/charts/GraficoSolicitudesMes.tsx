'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

export interface PuntoMes { mes: string; count: number }

const tooltipStyle = {
  background: 'rgba(11,23,39,0.96)',
  border: '1px solid rgba(148,163,184,0.18)',
  borderRadius: 8,
  fontSize: 12,
}

export function GraficoSolicitudesMes({ data }: { data: PuntoMes[] }) {
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
          allowDecimals={false}
          width={24}
        />
        <Tooltip
          formatter={(value) => [value, 'Solicitudes']}
          contentStyle={tooltipStyle}
          labelStyle={{ color: '#94a3b8', marginBottom: 4, fontWeight: 600 }}
          itemStyle={{ color: '#1E6FBF' }}
          cursor={{ fill: 'rgba(30,111,191,0.07)' }}
        />
        <Bar dataKey="count" fill="#1E6FBF" radius={[4, 4, 0, 0]} maxBarSize={52} />
      </BarChart>
    </ResponsiveContainer>
  )
}

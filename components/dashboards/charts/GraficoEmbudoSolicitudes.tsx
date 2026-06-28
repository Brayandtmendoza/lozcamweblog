'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'

export interface DataEmbudoSolicitud {
  estado: string
  label: string
  count: number
}

const ESTADO_COLOR: Record<string, string> = {
  nueva:              '#94a3b8',
  cita_agendada:      '#6366f1',
  en_revision:        '#F5A623',
  cotizando:          '#f97316',
  cotizacion_enviada: '#1E6FBF',
  negociando:         '#ec4899',
  aprobada:           '#10b981',
  rechazada:          '#ef4444',
  convertida_obra:    '#0d9488',
}

const tooltipStyle = {
  background: 'rgba(11,23,39,0.96)',
  border: '1px solid rgba(148,163,184,0.18)',
  borderRadius: 8,
  fontSize: 12,
}

export default function GraficoEmbudoSolicitudes({ data }: { data: DataEmbudoSolicitud[] }) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-[200px] text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        Sin solicitudes registradas
      </div>
    )
  }

  const chartData = data.map(d => ({ nombre: d.label, count: d.count, estado: d.estado }))
  const height = Math.max(160, chartData.length * 38 + 48)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        layout="vertical"
        data={chartData}
        margin={{ top: 4, right: 28, left: 8, bottom: 4 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={false}
          stroke="rgba(148,163,184,0.09)"
        />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="nombre"
          width={140}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: any) => [value, 'Solicitudes']}
          contentStyle={tooltipStyle}
          itemStyle={{ color: '#1E6FBF' }}
          cursor={{ fill: 'rgba(30,111,191,0.07)' }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={ESTADO_COLOR[entry.estado] ?? '#94a3b8'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

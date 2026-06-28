'use client'

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

export interface EntradaTipo { nombre: string; count: number }

const COLORS = ['#1E6FBF', '#F5A623', '#10b981', '#6366f1', '#94a3b8', '#d97706']

const tooltipStyle = {
  background: 'rgba(11,23,39,0.96)',
  border: '1px solid rgba(148,163,184,0.18)',
  borderRadius: 8,
  fontSize: 12,
}

export function GraficoTipoServicio({ data }: { data: EntradaTipo[] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm" style={{ color: '#64748b' }}>
        Sin datos de solicitudes
      </div>
    )
  }

  const rechartData = data.map(d => ({ name: d.nombre, value: d.count }))

  return (
    <ResponsiveContainer width="100%" height={230}>
      <PieChart>
        <Pie
          data={rechartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="42%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          strokeWidth={0}
        >
          {rechartData.map((_, i) => (
            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [value, 'solicitudes']}
          contentStyle={tooltipStyle}
          itemStyle={{ color: '#1E6FBF' }}
        />
        <Legend
          iconType="circle"
          iconSize={7}
          wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
          formatter={(value: string) => (
            <span style={{ color: '#94a3b8' }}>
              {value.length > 22 ? value.slice(0, 22) + '…' : value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

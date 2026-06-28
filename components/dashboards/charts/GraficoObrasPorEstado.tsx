'use client'

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

export interface DataObraEstado {
  estado: string
  label: string
  count: number
}

const ESTADO_COLOR: Record<string, string> = {
  formulacion:    '#94a3b8',
  licitacion:     '#1E6FBF',
  contratada:     '#6366f1',
  en_ejecucion:   '#10b981',
  paralizada:     '#F5A623',
  en_liquidacion: '#f97316',
  completada:     '#0d9488',
  cancelada:      '#ef4444',
}

const tooltipStyle = {
  background: 'rgba(11,23,39,0.96)',
  border: '1px solid rgba(148,163,184,0.18)',
  borderRadius: 8,
  fontSize: 12,
}

export default function GraficoObrasPorEstado({ data }: { data: DataObraEstado[] }) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-[200px] text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        Sin obras registradas
      </div>
    )
  }

  const pieData = data.map(d => ({
    name: d.label,
    value: d.count,
    estado: d.estado,
  }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="42%"
          innerRadius={50}
          outerRadius={82}
          paddingAngle={2}
          strokeWidth={0}
        >
          {pieData.map((entry, i) => (
            <Cell key={i} fill={ESTADO_COLOR[entry.estado] ?? '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any) => [value, 'Obras']}
          contentStyle={tooltipStyle}
          itemStyle={{ color: '#F5A623' }}
        />
        <Legend
          iconType="circle"
          iconSize={7}
          wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
          formatter={(value: string) => (
            <span style={{ color: '#94a3b8' }}>
              {value.length > 22 ? value.slice(0, 20) + '…' : value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

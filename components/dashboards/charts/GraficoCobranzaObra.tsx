'use client'

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

export interface SliceObra { nombre: string; total: number }

const COLORS = ['#F5A623', '#1E6FBF', '#10b981', '#6366f1', '#64748b']

const fmtPEN = (v: number) => `S/ ${Math.round(v).toLocaleString('es-PE')}`

const tooltipStyle = {
  background: 'rgba(11,23,39,0.96)',
  border: '1px solid rgba(148,163,184,0.18)',
  borderRadius: 8,
  fontSize: 12,
}

export function GraficoCobranzaObra({ data }: { data: SliceObra[] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm" style={{ color: '#64748b' }}>
        Sin datos de cobranza
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={230}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="nombre"
          cx="50%"
          cy="42%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [fmtPEN(value as number), 'Cobrado']}
          contentStyle={tooltipStyle}
          itemStyle={{ color: '#F5A623' }}
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

'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

interface DataPoint {
  nombre: string
  avance: number
}

export default function GraficoAvanceObras({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-32 text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        Sin datos de avance
      </div>
    )
  }

  const height = Math.max(140, data.length * 54 + 48)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 32, left: 8, bottom: 4 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={false}
          stroke="var(--card-border)"
        />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={v => `${v}%`}
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="nombre"
          width={140}
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: any) => [`${value}%`, 'Avance']}
          contentStyle={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'var(--text-primary)',
          }}
          cursor={{ fill: 'var(--table-row-hover)' }}
        />
        <Bar dataKey="avance" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={
                entry.avance >= 80
                  ? '#10b981'
                  : entry.avance >= 30
                  ? '#F5A623'
                  : '#94a3b8'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

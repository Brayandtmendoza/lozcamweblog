export interface Solicitud {
  id: number
  cliente_id: number
  tipo_servicio: string
  titulo: string
  descripcion: string | null
  direccion_obra: string | null
  distrito: string | null
  provincia: string | null
  departamento: string | null
  area_m2: number | null
  tiene_planos: boolean
  tiene_terreno: boolean
  presupuesto_ref: number | null
  estado: string
  prioridad: string
  asignado_a: string | null
  fuente: string | null
  notas_internas: string | null
  obra_id: number | null
  created_at: string
  updated_at: string
  clientes?: {
    nombres: string | null
    apellidos: string | null
    razon_social: string | null
  }
}

export const ESTADO_SOLICITUD_COLOR: Record<string, string> = {
  nueva: 'bg-blue-100 text-blue-700',
  cita_agendada: 'bg-purple-100 text-purple-700',
  en_revision: 'bg-yellow-100 text-yellow-700',
  cotizando: 'bg-orange-100 text-orange-700',
  cotizacion_enviada: 'bg-indigo-100 text-indigo-700',
  negociando: 'bg-pink-100 text-pink-700',
  aprobada: 'bg-green-100 text-green-700',
  rechazada: 'bg-red-100 text-red-700',
  convertida_obra: 'bg-teal-100 text-teal-700',
}

export const ESTADO_SOLICITUD_LABEL: Record<string, string> = {
  nueva: 'Nueva',
  cita_agendada: 'Cita agendada',
  en_revision: 'En revisión',
  cotizando: 'Cotizando',
  cotizacion_enviada: 'Cotización enviada',
  negociando: 'Negociando',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  convertida_obra: 'Convertida a obra',
}

export const PRIORIDAD_COLOR: Record<string, string> = {
  baja: 'bg-gray-100 text-gray-600',
  media: 'bg-yellow-100 text-yellow-700',
  alta: 'bg-orange-100 text-orange-700',
  critica: 'bg-red-100 text-red-700',
}


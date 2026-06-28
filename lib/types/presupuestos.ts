export interface Presupuesto {
  id: number
  obra_id: number
  nombre: string
  descripcion: string | null
  elaborado_por: string
  aprobado_por: string | null
  total_directo: number
  gastos_generales: number
  utilidad: number
  igv: number
  total: number
  moneda: string
  estado: string
  es_vigente: boolean
  archivo_url: string | null
  created_at: string
  updated_at: string
  obras?: { nombre: string } | null
}

export interface Partida {
  id: number
  presupuesto_id: number
  codigo: string | null
  descripcion: string
  unidad: string | null
  metrado: number | null
  precio_unitario: number | null
  parcial: number | null
  tipo_costo: string
  orden: number
}

export interface CostoReal {
  id: number
  obra_id: number
  fase_id: number | null
  tipo_costo: string
  descripcion: string
  proveedor: string | null
  monto_total: number
  fecha: string
  registrado_por: string
  created_at: string
}

export const TIPO_COSTO_LABEL: Record<string, string> = {
  mano_obra: 'Mano de Obra',
  materiales: 'Materiales',
  equipos: 'Equipos',
  subcontrato: 'Subcontrato',
  transporte: 'Transporte',
  administrativo: 'Administrativo',
  otro: 'Otro',
}

export const ESTADO_PRESUPUESTO_COLOR: Record<string, string> = {
  borrador: 'bg-gray-100 text-gray-700',
  revision: 'bg-yellow-100 text-yellow-700',
  aprobado: 'bg-green-100 text-green-700',
  rechazado: 'bg-red-100 text-red-700',
}


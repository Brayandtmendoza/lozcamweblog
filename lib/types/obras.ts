export interface Obra {
  id: number
  codigo: string | null
  nombre: string
  tipo_servicio: string
  descripcion: string | null
  direccion: string
  distrito: string | null
  provincia: string | null
  departamento: string | null
  latitud: number | null
  longitud: number | null
  radio_metros: number
  area_m2: number | null
  pisos: number | null
  monto_contrato: number
  moneda: string
  fecha_inicio_planificada: string | null
  fecha_fin_planificada: string | null
  fecha_inicio_real: string | null
  fecha_fin_real: string | null
  estado: string
  residente_id: string | null
  supervisor_id: string | null
  cliente_id: number | null
  notas: string | null
  created_at: string
  updated_at: string
  clientes?: { nombres: string | null; apellidos: string | null; razon_social: string | null }
}

export interface FaseObra {
  id: number
  obra_id: number
  nombre: string
  descripcion: string | null
  orden: number
  fecha_inicio: string | null
  fecha_fin: string | null
  estado: string
  porcentaje_meta: number
  created_at: string
  avance_actual?: number
}

export interface AvanceObra {
  id: number
  fase_id: number
  obra_id: number
  registrado_por: string
  fecha: string
  porcentaje: number
  descripcion: string | null
  fotos_urls: string[] | null
  created_at: string
}


export interface Cliente {
  id: number
  tipo_persona: 'natural' | 'juridica'
  nombres: string | null
  apellidos: string | null
  dni: string | null
  razon_social: string | null
  ruc: string | null
  nombre_comercial: string | null
  email: string | null
  telefono: string | null
  whatsapp: string | null
  direccion: string | null
  distrito: string | null
  provincia: string | null
  departamento: string | null
  referencia: string | null
  notas: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface ClienteForm {
  tipo_persona: 'natural' | 'juridica'
  nombres: string
  apellidos: string
  dni: string
  razon_social: string
  ruc: string
  nombre_comercial: string
  email: string
  telefono: string
  whatsapp: string
  direccion: string
  distrito: string
  provincia: string
  departamento: string
  referencia: string
  notas: string
}


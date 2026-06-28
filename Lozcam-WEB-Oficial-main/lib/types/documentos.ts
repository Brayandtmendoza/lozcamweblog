export interface Documento {
  id: number
  obra_id: number | null
  tipo: string
  titulo: string
  descripcion: string | null
  numero_plano: string | null
  escala: string | null
  estado: string
  version_actual: number
  subido_por: string
  aprobado_por: string | null
  fecha_aprobacion: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
  obras?: { nombre: string } | null
  profiles?: { nombre: string; apellidos: string } | null
}

export interface VersionDocumento {
  id: number
  documento_id: number
  version: number
  archivo_url: string
  nombre_archivo: string
  tipo_archivo: string | null
  tamanio_bytes: number | null
  notas_version: string | null
  subido_por: string
  created_at: string
}

export const TIPO_DOCUMENTO_LABEL: Record<string, string> = {
  plano_arquitectonico:      'Plano Arquitectónico',
  plano_estructural:         'Plano Estructural',
  plano_instalaciones:       'Plano de Instalaciones',
  plano_topografico:         'Plano Topográfico',
  memoria_descriptiva:       'Memoria Descriptiva',
  especificaciones_tecnicas: 'Especificaciones Técnicas',
  informe_topografico:       'Informe Topográfico',
  estudio_suelos:            'Estudio de Suelos',
  metrado:                   'Metrado',
  presupuesto:               'Presupuesto',
  cronograma:                'Cronograma',
  contrato:                  'Contrato',
  addenda:                   'Addenda',
  acta:                      'Acta',
  reporte_diario:            'Reporte Diario',
  otro:                      'Otro',
}

export const ESTADO_DOCUMENTO_COLOR: Record<string, string> = {
  borrador:    'bg-gray-100 text-gray-700',
  en_revision: 'bg-yellow-100 text-yellow-700',
  aprobado:    'bg-green-100 text-green-700',
  rechazado:   'bg-red-100 text-red-700',
  obsoleto:    'bg-orange-100 text-orange-700',
}

export const ESTADO_DOCUMENTO_LABEL: Record<string, string> = {
  borrador:    'Borrador',
  en_revision: 'En Revisión',
  aprobado:    'Aprobado',
  rechazado:   'Rechazado',
  obsoleto:    'Obsoleto',
}


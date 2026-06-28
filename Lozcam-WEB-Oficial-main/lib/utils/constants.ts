export const ROL_SISTEMA = {
  GERENTE_GENERAL:     'gerente_general',
  SUBGERENTE:          'subgerente',
  ADMINISTRADOR:       'administrador',
  INGENIERO_RESIDENTE: 'ingeniero_residente',
  ARQUITECTO:          'arquitecto',
  TECNICO_AUTOCAD:     'tecnico_autocad',
  TOPOGRAFO:           'topografo',
  MAESTRO_OBRA:        'maestro_obra',
  PERSONAL_OBRA:       'personal_obra',
  CONTADOR:            'contador',
  VENDEDOR:            'vendedor',
  CLIENTE:             'cliente',
} as const

export const ROLES_GERENCIA = [
  'gerente_general',
  'subgerente',
  'administrador',
] as const

export const TIPO_SERVICIO_LABEL: Record<string, string> = {
  construccion:        'Construcción',
  topografia:          'Topografía',
  arquitectura:        'Arquitectura',
  instalaciones:       'Instalaciones',
  supervision:         'Supervisión',
  habilitacion_urbana: 'Habilitación Urbana',
}

export const ESTADO_OBRA_LABEL: Record<string, string> = {
  formulacion:    'Formulación',
  licitacion:     'Licitación',
  contratada:     'Contratada',
  en_ejecucion:   'En Ejecución',
  paralizada:     'Paralizada',
  en_liquidacion: 'En Liquidación',
  completada:     'Completada',
  cancelada:      'Cancelada',
}

export const ESTADO_OBRA_COLOR: Record<string, string> = {
  formulacion:    'bg-gray-100 text-gray-700',
  licitacion:     'bg-blue-100 text-blue-700',
  contratada:     'bg-purple-100 text-purple-700',
  en_ejecucion:   'bg-green-100 text-green-700',
  paralizada:     'bg-yellow-100 text-yellow-700',
  en_liquidacion: 'bg-orange-100 text-orange-700',
  completada:     'bg-teal-100 text-teal-700',
  cancelada:      'bg-red-100 text-red-700',
}

export const METODO_PAGO_LABEL: Record<string, string> = {
  efectivo:               'Efectivo',
  transferencia_bancaria: 'Transferencia Bancaria',
  deposito_bancario:      'Depósito Bancario',
  cheque:                 'Cheque',
  yape:                   'Yape',
  plin:                   'Plin',
  tarjeta_credito:        'Tarjeta de Crédito',
  tarjeta_debito:         'Tarjeta de Débito',
}


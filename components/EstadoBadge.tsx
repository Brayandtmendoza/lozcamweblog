import { Badge } from '@/components/ui/badge'

const CLASE: Record<string, string> = {
  // positivos / activos
  activo:            'bg-green-500/15 text-green-700 dark:text-green-400 border-transparent',
  pagado:            'bg-green-500/15 text-green-700 dark:text-green-400 border-transparent',
  aprobado:          'bg-green-500/15 text-green-700 dark:text-green-400 border-transparent',
  aprobada:          'bg-green-500/15 text-green-700 dark:text-green-400 border-transparent',
  completada:        'bg-green-500/15 text-green-700 dark:text-green-400 border-transparent',
  completado:        'bg-green-500/15 text-green-700 dark:text-green-400 border-transparent',
  en_ejecucion:      'bg-green-500/15 text-green-700 dark:text-green-400 border-transparent',
  convertida_obra:   'bg-green-500/15 text-green-700 dark:text-green-400 border-transparent',
  vigente:           'bg-green-500/15 text-green-700 dark:text-green-400 border-transparent',
  // pendientes / en proceso / advertencia
  pendiente:         'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-transparent',
  en_revision:       'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-transparent',
  revision:          'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-transparent',
  paralizada:        'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-transparent',
  en_liquidacion:    'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-transparent',
  cotizando:         'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-transparent',
  reembolsado:       'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-transparent',
  obsoleto:          'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-transparent',
  // informativos / en proceso
  nueva:             'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-transparent',
  nuevo:             'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-transparent',
  cita_agendada:     'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-transparent',
  verificando:       'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-transparent',
  en_progreso:       'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-transparent',
  licitacion:        'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-transparent',
  cotizacion_enviada:'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-transparent',
  negociando:        'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-transparent',
  contratada:        'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-transparent',
  // neutros
  borrador:          'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-transparent',
  formulacion:       'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-transparent',
  inactivo:          'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-transparent',
  // negativos / cancelados
  cancelado:         'bg-red-500/15 text-red-700 dark:text-red-400 border-transparent',
  cancelada:         'bg-red-500/15 text-red-700 dark:text-red-400 border-transparent',
  rechazado:         'bg-red-500/15 text-red-700 dark:text-red-400 border-transparent',
  rechazada:         'bg-red-500/15 text-red-700 dark:text-red-400 border-transparent',
  bloqueada:         'bg-red-500/15 text-red-700 dark:text-red-400 border-transparent',
  // prioridades
  baja:              'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-transparent',
  media:             'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-transparent',
  alta:              'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-transparent',
  critica:           'bg-red-500/15 text-red-700 dark:text-red-400 border-transparent',
}

function formatLabel(estado: string): string {
  return estado.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
}

interface Props {
  estado: string
  label?: string
}

export function EstadoBadge({ estado, label }: Props) {
  const clase = CLASE[estado] ?? 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-transparent'
  return (
    <Badge className={clase}>
      {label ?? formatLabel(estado)}
    </Badge>
  )
}

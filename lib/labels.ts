export const ESTADOS_OBRA: Record<string, string> = {
  formulacion: 'Formulación',
  licitacion: 'Licitación',
  contratada: 'Contratada',
  en_ejecucion: 'En ejecución',
  paralizada: 'Paralizada',
  en_liquidacion: 'En liquidación',
  completada: 'Completada',
  cancelada: 'Cancelada',
}

export const ESTADOS_FASE: Record<string, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  completada: 'Completada',
  bloqueada: 'Bloqueada',
}

export const ESTADOS_PAGO: Record<string, string> = {
  pendiente: 'Pendiente',
  verificando: 'Verificando',
  pagado: 'Pagado',
  rechazado: 'Rechazado',
  reembolsado: 'Reembolsado',
}

export const ESTADOS_SOLICITUD: Record<string, string> = {
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

export const TIPOS_SERVICIO: Record<string, string> = {
  construccion: 'Construcción',
  topografia: 'Topografía',
  arquitectura: 'Arquitectura',
  instalaciones: 'Instalaciones',
  supervision: 'Supervisión',
  habilitacion_urbana: 'Habilitación urbana',
}

export const PRIORIDADES: Record<string, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica',
}

export const METODOS_PAGO: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia_bancaria: 'Transferencia bancaria',
  deposito_bancario: 'Depósito bancario',
  cheque: 'Cheque',
  yape: 'Yape',
  plin: 'Plin',
  tarjeta_credito: 'Tarjeta de crédito',
  tarjeta_debito: 'Tarjeta de débito',
}

function fallbackLabel(raw: string): string {
  const cleaned = raw.trim().replace(/_/g, ' ')
  if (!cleaned) return raw
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

function labelFromMap(map: Record<string, string>, value: unknown): string {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  const key = raw.toLowerCase()
  return map[key] ?? fallbackLabel(raw)
}

export function labelEstadoObra(v: unknown): string {
  return labelFromMap(ESTADOS_OBRA, v)
}

export function labelEstadoFase(v: unknown): string {
  return labelFromMap(ESTADOS_FASE, v)
}

export function labelEstadoPago(v: unknown): string {
  return labelFromMap(ESTADOS_PAGO, v)
}

export function labelEstadoSolicitud(v: unknown): string {
  return labelFromMap(ESTADOS_SOLICITUD, v)
}

export function labelTipoServicio(v: unknown): string {
  return labelFromMap(TIPOS_SERVICIO, v)
}

export function labelPrioridad(v: unknown): string {
  return labelFromMap(PRIORIDADES, v)
}

export function labelMetodoPago(v: unknown): string {
  return labelFromMap(METODOS_PAGO, v)
}

export function limpiarDemo(texto: string | null | undefined): string {
  if (!texto) return ''
  return texto.replace(/^\[DEMO\]\s*/i, '').trim()
}
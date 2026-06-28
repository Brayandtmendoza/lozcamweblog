export interface PagoCliente {
  id: number
  obra_id: number
  cliente_id: number
  registrado_por: string
  concepto: string
  numero_cuota: number | null
  monto: number
  moneda: string
  metodo_pago: string
  numero_operacion: string | null
  archivo_voucher: string | null
  fecha_pago: string
  estado: string
  notas: string | null
  created_at: string
  obras?: { nombre: string } | null
  clientes?: {
    nombres: string | null
    apellidos: string | null
    razon_social: string | null
  } | null
}

export const METODO_PAGO_LABEL: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia_bancaria: 'Transferencia Bancaria',
  deposito_bancario: 'Depósito Bancario',
  cheque: 'Cheque',
  yape: 'Yape',
  plin: 'Plin',
  tarjeta_credito: 'Tarjeta de Crédito',
  tarjeta_debito: 'Tarjeta de Débito',
}

export const ESTADO_PAGO_COLOR: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  verificando: 'bg-blue-100 text-blue-700',
  pagado: 'bg-green-100 text-green-700',
  rechazado: 'bg-red-100 text-red-700',
  reembolsado: 'bg-orange-100 text-orange-700',
}

export const ESTADO_PAGO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  verificando: 'Verificando',
  pagado: 'Pagado',
  rechazado: 'Rechazado',
  reembolsado: 'Reembolsado',
}


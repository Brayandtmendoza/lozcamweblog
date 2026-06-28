// Datos del reporte desde Supabase (base dnhagzhimzhijzlozyzs).
// Ajustado al esquema real: tabla pagos_clientes, obras.monto_contrato, obras.codigo.
// Enlaces: obras.cliente_id -> clientes ; pagos_clientes.obra_id -> obras ; pagos_clientes.cliente_id -> clientes.

import { createClient } from '@/lib/supabase/server'

export const METODO_PAGO: Record<string, string> = {
  efectivo: 'Efectivo', transferencia_bancaria: 'Transferencia Bancaria', deposito_bancario: 'Depósito Bancario',
  cheque: 'Cheque', yape: 'Yape', plin: 'Plin', tarjeta_credito: 'Tarjeta de Crédito', tarjeta_debito: 'Tarjeta de Débito',
}
export const ESTADO_PAGO: Record<string, string> = {
  pendiente: 'Pendiente', verificando: 'Verificando', pagado: 'Pagado', rechazado: 'Rechazado', reembolsado: 'Reembolsado',
}
export const TIPO_SERVICIO: Record<string, string> = {
  construccion: 'Construcción', topografia: 'Topografía', arquitectura: 'Arquitectura',
  instalaciones: 'Instalaciones', supervision: 'Supervisión', habilitacion_urbana: 'Habilitación Urbana',
}
export const ESTADO_OBRA: Record<string, string> = {
  formulacion: 'Formulación', licitacion: 'Licitación', contratada: 'Contratada', en_ejecucion: 'En Ejecución',
  paralizada: 'Paralizada', en_liquidacion: 'En Liquidación', completada: 'Completada', cancelada: 'Cancelada',
}
export const ESTADO_SOLICITUD: Record<string, string> = {
  nueva: 'Nueva', cita_agendada: 'Cita agendada', en_revision: 'En revisión', cotizando: 'Cotizando',
  cotizacion_enviada: 'Cotización enviada', negociando: 'Negociando', aprobada: 'Aprobada',
  rechazada: 'Rechazada', convertida_obra: 'Convertida a obra',
}
export const PRIORIDAD: Record<string, string> = { baja: 'Baja', media: 'Media', alta: 'Alta', critica: 'Crítica' }

function label(map: Record<string, string>, v?: string | null) {
  if (!v) return ''
  return map[v] ?? v.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
}
function nombreCliente(c: any): string {
  if (!c) return '—'
  return c.razon_social || [c.nombres, c.apellidos].filter(Boolean).join(' ') || '—'
}

export interface ObraRep { id: number; codigo: string; nombre: string; cliente_id: number | null; cliente: string; tipo_servicio: string; estado: string; distrito: string; monto_contrato: number }
export interface PagoRep { fecha: string; concepto: string; obra: string; cliente_id: number | null; cliente: string; metodo_pago: string; estado: string; monto: number }
export interface ClienteRep { tipo: string; nombre: string; documento: string; email: string; telefono: string; distrito: string; activo: boolean }
export interface SolicitudRep { fecha: string; titulo: string; cliente: string; tipo_servicio: string; estado: string; prioridad: string; presupuesto_ref: number }

export async function getDatosReporte() {
  const supabase = await createClient()

  const [oRes, pRes, cRes, sRes] = await Promise.all([
    supabase.from('obras').select('id, codigo, nombre, tipo_servicio, estado, distrito, monto_contrato, cliente:cliente_id(id, razon_social, nombres, apellidos)'),
    supabase.from('pagos_clientes').select('fecha_pago, concepto, monto, metodo_pago, estado, cliente:cliente_id(id, razon_social, nombres, apellidos), obra:obra_id(nombre)'),
    supabase.from('clientes').select('tipo_persona, razon_social, nombres, apellidos, ruc, dni, email, telefono, distrito, activo'),
    supabase.from('solicitudes').select('created_at, titulo, tipo_servicio, estado, prioridad, presupuesto_ref, cliente:cliente_id(razon_social, nombres, apellidos)'),
  ])

  const obras: ObraRep[] = (oRes.data ?? []).map((o: any) => ({
    id: o.id,
    codigo: o.codigo ?? `OBR-${o.id}`,
    nombre: o.nombre,
    cliente_id: o.cliente?.id ?? null,
    cliente: nombreCliente(o.cliente),
    tipo_servicio: label(TIPO_SERVICIO, o.tipo_servicio),
    estado: label(ESTADO_OBRA, o.estado),
    distrito: o.distrito ?? '',
    monto_contrato: Number(o.monto_contrato ?? 0),
  }))

  const pagos: PagoRep[] = (pRes.data ?? []).map((p: any) => ({
    fecha: p.fecha_pago ? String(p.fecha_pago).slice(0, 10) : '',
    concepto: p.concepto ?? '',
    obra: p.obra?.nombre ?? '—',
    cliente_id: p.cliente?.id ?? null,
    cliente: nombreCliente(p.cliente),
    metodo_pago: label(METODO_PAGO, p.metodo_pago),
    estado: label(ESTADO_PAGO, p.estado),
    monto: Number(p.monto ?? 0),
  }))

  const clientes: ClienteRep[] = (cRes.data ?? []).map((c: any) => ({
    tipo: c.tipo_persona === 'juridica' ? 'Jurídica' : 'Natural',
    nombre: nombreCliente(c),
    documento: c.ruc ? `RUC ${c.ruc}` : c.dni ? `DNI ${c.dni}` : '',
    email: c.email ?? '',
    telefono: c.telefono ?? '',
    distrito: c.distrito ?? '',
    activo: !!c.activo,
  }))

  const solicitudes: SolicitudRep[] = (sRes.data ?? []).map((s: any) => ({
    fecha: s.created_at ? String(s.created_at).slice(0, 10) : '',
    titulo: s.titulo,
    cliente: nombreCliente(s.cliente),
    tipo_servicio: label(TIPO_SERVICIO, s.tipo_servicio),
    estado: label(ESTADO_SOLICITUD, s.estado),
    prioridad: label(PRIORIDAD, s.prioridad),
    presupuesto_ref: Number(s.presupuesto_ref ?? 0),
  }))

  return { obras, pagos, clientes, solicitudes }
}

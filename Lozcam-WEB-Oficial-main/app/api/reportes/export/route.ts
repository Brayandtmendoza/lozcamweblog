import ExcelJS from 'exceljs'
import { getDatosReporte } from '@/lib/reportes/datos-demo'

export const runtime = 'nodejs'

const NAVY = 'FF0B1727'
const AMBER = 'FFF59E0B'
const WHITE = 'FFFFFFFF'
const INK = 'FF1F2937'
const PEN = '"S/" #,##0.00'
const borde = {
  top: { style: 'thin' as const, color: { argb: 'FFD9DEE6' } },
  left: { style: 'thin' as const, color: { argb: 'FFD9DEE6' } },
  bottom: { style: 'thin' as const, color: { argb: 'FFD9DEE6' } },
  right: { style: 'thin' as const, color: { argb: 'FFD9DEE6' } },
}

function tituloHoja(ws: ExcelJS.Worksheet, ncols: number, texto: string) {
  ws.mergeCells(1, 1, 1, ncols)
  const c = ws.getCell(1, 1)
  c.value = texto
  c.font = { name: 'Arial', bold: true, size: 14, color: { argb: WHITE } }
  c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }
  c.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  ws.getRow(1).height = 32
}
function encabezados(ws: ExcelJS.Worksheet, row: number, headers: string[], widths: number[]) {
  headers.forEach((h, i) => {
    const c = ws.getCell(row, i + 1)
    c.value = h
    c.font = { name: 'Arial', bold: true, size: 10, color: { argb: WHITE } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AMBER } }
    c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    c.border = borde
    ws.getColumn(i + 1).width = widths[i]
  })
  ws.getRow(row).height = 22
}
function celda(ws: ExcelJS.Worksheet, r: number, col: number, val: ExcelJS.CellValue, opts: { fmt?: string; bold?: boolean; align?: 'left' | 'center' | 'right' } = {}) {
  const c = ws.getCell(r, col)
  c.value = val
  c.font = { name: 'Arial', size: 10, bold: !!opts.bold, color: { argb: INK } }
  c.alignment = { vertical: 'middle', horizontal: opts.align ?? 'left' }
  c.border = borde
  if (opts.fmt) c.numFmt = opts.fmt
  return c
}

export async function GET() {
  const { obras, pagos, clientes, solicitudes } = await getDatosReporte()
  const wb = new ExcelJS.Workbook()
  wb.creator = 'GRUPO LOZCAM S.A.C'
  wb.created = new Date()

  const enEjecucion = obras.filter(o => (o.estado || '').toLowerCase().includes('ejecuc')).length
  const totalContratos = obras.reduce((s, o) => s + o.monto_contrato, 0)
  const cobrado = pagos.filter(p => p.estado === 'Pagado').reduce((s, p) => s + p.monto, 0)
  const porCobrar = totalContratos - cobrado

  // deudas por cliente (contratado - pagado)
  const porCli = new Map<number, { cliente: string; contratado: number; pagado: number }>()
  for (const o of obras) {
    if (o.cliente_id == null) continue
    const e = porCli.get(o.cliente_id) ?? { cliente: o.cliente, contratado: 0, pagado: 0 }
    e.contratado += o.monto_contrato
    porCli.set(o.cliente_id, e)
  }
  for (const p of pagos) {
    if (p.cliente_id == null || p.estado !== 'Pagado') continue
    const e = porCli.get(p.cliente_id)
    if (e) e.pagado += p.monto
  }
  const deudas = [...porCli.values()].map(d => ({ ...d, saldo: d.contratado - d.pagado })).sort((a, b) => b.saldo - a.saldo)

  // RESUMEN
  const res = wb.addWorksheet('Resumen', { views: [{ showGridLines: false }] })
  res.mergeCells('A1:B1')
  const tt = res.getCell('A1')
  tt.value = 'GRUPO LOZCAM S.A.C — Reporte General'
  tt.font = { name: 'Arial', bold: true, size: 16, color: { argb: WHITE } }
  tt.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }
  tt.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  res.getRow(1).height = 40
  res.mergeCells('A2:B2')
  res.getCell('A2').value = `Generado el ${new Date().toLocaleDateString('es-PE')}`
  res.getCell('A2').font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF6B7280' } }
  res.getColumn(1).width = 34
  res.getColumn(2).width = 22
  const kpis: [string, number, string?][] = [
    ['Total de obras', obras.length],
    ['Obras en ejecución', enEjecucion],
    ['Clientes activos', clientes.filter(c => c.activo).length],
    ['Solicitudes nuevas', solicitudes.filter(s => s.estado === 'Nueva').length],
    ['Monto total en contratos (S/)', totalContratos, PEN],
    ['Total cobrado (S/)', cobrado, PEN],
    ['Por cobrar (S/)', porCobrar, PEN],
  ]
  encabezados(res, 4, ['Indicador', 'Valor'], [34, 22])
  let row = 5
  for (const [lab, val, fmt] of kpis) {
    celda(res, row, 1, lab)
    const b = celda(res, row, 2, val, { fmt, bold: true, align: 'right' })
    b.font = { name: 'Arial', size: 11, bold: true, color: { argb: NAVY } }
    res.getRow(row).height = 22
    row++
  }

  // DEUDAS POR CLIENTE
  const wd = wb.addWorksheet('Deudas por cliente', { views: [{ state: 'frozen', ySplit: 2 }] })
  tituloHoja(wd, 4, 'Deudas por cliente')
  encabezados(wd, 2, ['Cliente', 'Contratado (S/)', 'Pagado (S/)', 'Saldo pendiente (S/)'], [36, 20, 20, 22])
  let r = 3
  for (const d of deudas) {
    celda(wd, r, 1, d.cliente)
    celda(wd, r, 2, d.contratado, { fmt: PEN, align: 'right' })
    celda(wd, r, 3, d.pagado, { fmt: PEN, align: 'right' })
    const sc = celda(wd, r, 4, d.saldo, { fmt: PEN, align: 'right', bold: d.saldo > 0 })
    if (d.saldo > 0) sc.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFA32D2D' } }
    r++
  }
  celda(wd, r, 1, 'TOTAL', { bold: true, align: 'right' })
  celda(wd, r, 2, { formula: `SUM(B3:B${r - 1})` }, { fmt: PEN, bold: true, align: 'right' })
  celda(wd, r, 3, { formula: `SUM(C3:C${r - 1})` }, { fmt: PEN, bold: true, align: 'right' })
  celda(wd, r, 4, { formula: `SUM(D3:D${r - 1})` }, { fmt: PEN, bold: true, align: 'right' })
  wd.autoFilter = `A2:D${Math.max(r - 1, 2)}`

  // OBRAS
  const wo = wb.addWorksheet('Obras', { views: [{ state: 'frozen', ySplit: 2 }] })
  tituloHoja(wo, 7, 'Obras')
  encabezados(wo, 2, ['Código', 'Nombre de obra', 'Cliente', 'Tipo de servicio', 'Estado', 'Distrito', 'Monto contrato (S/)'], [15, 32, 28, 18, 15, 18, 18])
  r = 3
  for (const o of obras) {
    celda(wo, r, 1, o.codigo); celda(wo, r, 2, o.nombre); celda(wo, r, 3, o.cliente)
    celda(wo, r, 4, o.tipo_servicio); celda(wo, r, 5, o.estado, { align: 'center' }); celda(wo, r, 6, o.distrito)
    celda(wo, r, 7, o.monto_contrato, { fmt: PEN, align: 'right' })
    r++
  }
  celda(wo, r, 6, 'TOTAL', { bold: true, align: 'right' })
  celda(wo, r, 7, { formula: `SUM(G3:G${r - 1})` }, { fmt: PEN, bold: true, align: 'right' })
  wo.autoFilter = `A2:G${Math.max(r - 1, 2)}`

  // PAGOS
  const wp = wb.addWorksheet('Pagos', { views: [{ state: 'frozen', ySplit: 2 }] })
  tituloHoja(wp, 7, 'Pagos de clientes')
  encabezados(wp, 2, ['Fecha', 'Concepto', 'Obra', 'Cliente', 'Método de pago', 'Estado', 'Monto (S/)'], [12, 28, 30, 28, 20, 14, 16])
  r = 3
  for (const p of pagos) {
    celda(wp, r, 1, p.fecha, { align: 'center' }); celda(wp, r, 2, p.concepto); celda(wp, r, 3, p.obra); celda(wp, r, 4, p.cliente)
    celda(wp, r, 5, p.metodo_pago); celda(wp, r, 6, p.estado, { align: 'center' })
    celda(wp, r, 7, p.monto, { fmt: PEN, align: 'right' })
    r++
  }
  celda(wp, r, 6, 'TOTAL', { bold: true, align: 'right' })
  celda(wp, r, 7, { formula: `SUM(G3:G${r - 1})` }, { fmt: PEN, bold: true, align: 'right' })
  wp.autoFilter = `A2:G${Math.max(r - 1, 2)}`

  // CLIENTES
  const wc = wb.addWorksheet('Clientes', { views: [{ state: 'frozen', ySplit: 2 }] })
  tituloHoja(wc, 7, 'Clientes')
  encabezados(wc, 2, ['Tipo', 'Nombre / Razón social', 'Documento', 'Email', 'Teléfono', 'Distrito', 'Estado'], [12, 32, 18, 28, 16, 20, 12])
  r = 3
  for (const c of clientes) {
    celda(wc, r, 1, c.tipo, { align: 'center' }); celda(wc, r, 2, c.nombre); celda(wc, r, 3, c.documento)
    celda(wc, r, 4, c.email); celda(wc, r, 5, c.telefono, { align: 'center' }); celda(wc, r, 6, c.distrito)
    celda(wc, r, 7, c.activo ? 'Activo' : 'Inactivo', { align: 'center' })
    r++
  }
  wc.autoFilter = `A2:G${Math.max(r - 1, 2)}`

  // SOLICITUDES
  const wsol = wb.addWorksheet('Solicitudes', { views: [{ state: 'frozen', ySplit: 2 }] })
  tituloHoja(wsol, 7, 'Solicitudes de servicio')
  encabezados(wsol, 2, ['Fecha', 'Título', 'Cliente', 'Tipo de servicio', 'Estado', 'Prioridad', 'Presup. ref. (S/)'], [12, 34, 30, 18, 18, 12, 16])
  r = 3
  for (const s of solicitudes) {
    celda(wsol, r, 1, s.fecha, { align: 'center' }); celda(wsol, r, 2, s.titulo); celda(wsol, r, 3, s.cliente)
    celda(wsol, r, 4, s.tipo_servicio); celda(wsol, r, 5, s.estado, { align: 'center' }); celda(wsol, r, 6, s.prioridad, { align: 'center' })
    celda(wsol, r, 7, s.presupuesto_ref, { fmt: PEN, align: 'right' })
    r++
  }
  wsol.autoFilter = `A2:G${Math.max(r - 1, 2)}`

  const buffer = await wb.xlsx.writeBuffer()
  const fecha = new Date().toISOString().slice(0, 10)
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="reporte-lozcam-${fecha}.xlsx"`,
    },
  })
}

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { fechaCorta, fechaHoy } from '@/lib/fechas'

export type DatosPdf = {
  titulo: string; profesional: string; matricula: string | null; paciente: string; dni: string;
  nacimiento: string; demo: boolean;
  secciones: { titulo: string; campos: { etiqueta: string; valor: string }[] }[];
}

export async function crearPdf(datos: DatosPdf) {
  const pdf = await PDFDocument.create()
  pdf.setTitle(datos.titulo)
  pdf.setAuthor(datos.profesional)
  pdf.setCreator('Portal Pediatría')
  const normal = await pdf.embedFont(StandardFonts.Helvetica), negrita = await pdf.embedFont(StandardFonts.HelveticaBold)
  const tinta = rgb(.13, .23, .26), secundario = rgb(.43, .52, .53), azul = rgb(.24, .43, .66)
  let page = pdf.addPage([595.28, 841.89]), y = 0
  const seguro = (texto: string) => Array.from(texto.normalize('NFC')).map(c => {
    if (c === '\n' || c === '\r' || c === '\t') return c
    try { normal.encodeText(c); return c } catch { return '?' }
  }).join('')
  function encabezado() {
    page.drawRectangle({ x: 0, y: 765, width: 595.28, height: 77, color: rgb(.94, .96, .94) })
    page.drawText('PORTAL PEDIATRÍA', { x: 45, y: 808, size: 9, font: negrita, color: azul })
    const nombre = seguro(datos.profesional)
    // Una identidad extensa se ajusta sin salir del encabezado.
    const tam = Math.min(13, 340 / Math.max(1, negrita.widthOfTextAtSize(nombre, 1)))
    page.drawText(nombre, { x: 45, y: 786, size: tam, font: negrita, color: tinta })
    page.drawText(seguro(datos.matricula ? `Matrícula: ${datos.matricula}` : 'Matrícula no registrada'), { x: 45, y: 773, size: 8, font: normal, color: secundario })
    page.drawText(fechaCorta(fechaHoy()), { x: 435, y: 806, size: 8, font: normal, color: secundario })
    y = 740
  }
  function espacio(altura: number) { if (y - altura < 64) { page = pdf.addPage([595.28, 841.89]); encabezado() } }
  function texto(valor: string, bold = false, size = 10) {
    const font = bold ? negrita : normal, ancho = 505
    for (const parrafo of seguro(valor).replace(/\r\n/g, '\n').split('\n')) {
      let linea = ''
      // Se conserva todo el texto, incluidos tokens largos que no tienen espacios.
      for (const caracter of parrafo.replace(/\t/g, '    ')) {
        if (font.widthOfTextAtSize(linea + caracter, size) > ancho && linea) {
          espacio(size + 6); page.drawText(linea, { x: 45, y, size, font, color: tinta }); y -= size + 6; linea = ''
        }
        linea += caracter
      }
      espacio(size + 6)
      if (linea) page.drawText(linea, { x: 45, y, size, font, color: tinta })
      y -= size + 6
    }
  }
  encabezado()
  texto(datos.titulo, true, 21); y -= 8
  if (datos.demo) { texto('DEMOSTRACIÓN · TODOS LOS DATOS SON FICTICIOS', true, 9); y -= 5 }
  texto(datos.paciente, true, 14)
  texto(`DNI: ${datos.dni}    |    Nacimiento: ${fechaCorta(datos.nacimiento)}`, false, 9)
  y -= 12
  for (const seccion of datos.secciones) {
    espacio(70)
    page.drawLine({ start: { x: 45, y: y + 4 }, end: { x: 550, y: y + 4 }, thickness: .5, color: rgb(.85, .89, .87) })
    y -= 17; texto(seccion.titulo, true, 12); y -= 4
    for (const campo of seccion.campos) {
      if (!campo.valor) continue
      espacio(40); texto(campo.etiqueta, true, 9); texto(campo.valor, false, 10); y -= 7
    }
    y -= 10
  }
  const paginas = pdf.getPages()
  paginas.forEach((p, i) => {
    p.drawLine({ start: { x: 45, y: 47 }, end: { x: 550, y: 47 }, thickness: .5, color: rgb(.87, .9, .88) })
    p.drawText('Copia de la información registrada · Documento confidencial', { x: 45, y: 32, size: 7, font: normal, color: secundario })
    p.drawText(`${i + 1} / ${paginas.length}`, { x: 520, y: 32, size: 8, font: normal, color: secundario })
  })
  return pdf.save()
}

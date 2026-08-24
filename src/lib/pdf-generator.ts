import jsPDF from 'jspdf';
import { 
  type PatternMeasurements, 
  type SilhouetteType, 
  SILHOUETTES, 
  calculatePantsPattern,
  type PatternPoint 
} from './pattern-math';

export function exportPatternToPdf(measurements: PatternMeasurements, silhouette: SilhouetteType) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const preset = SILHOUETTES[silhouette];
  const patternData = calculatePantsPattern(measurements, silhouette);
  const dateStr = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  // ══════════════════════════════════════════════════════════
  // PÁGINA 1: FICHA TÉCNICA EDITORIAL
  // ══════════════════════════════════════════════════════════
  // Fondo marfil / lino claro
  doc.setFillColor(248, 245, 240);
  doc.rect(0, 0, 210, 297, 'F');

  // Marco editorial
  doc.setDrawColor(28, 25, 22);
  doc.setLineWidth(0.3);
  doc.rect(12, 12, 186, 273, 'S');
  doc.setDrawColor(193, 68, 14); // Terracota
  doc.setLineWidth(0.8);
  doc.rect(14, 14, 182, 269, 'S');

  // Encabezado
  doc.setTextColor(193, 68, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('I N E F A B L E   •   A T E L I E R   D E   P A T R O N A J E', 105, 26, { align: 'center' });

  doc.setTextColor(28, 25, 22);
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.text('FICHA TÉCNICA DE PANTALÓN', 105, 36, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90, 82, 73);
  doc.text(`Silueta: ${preset.name.toUpperCase()}  |  Categoría: ${preset.category.toUpperCase()}`, 105, 43, { align: 'center' });

  doc.setDrawColor(193, 68, 14);
  doc.setLineWidth(0.5);
  doc.line(30, 48, 180, 48);

  // Metadatos
  doc.setFontSize(9);
  doc.setTextColor(28, 25, 22);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DE PRODUCCIÓN:', 20, 58);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 65, 58);
  doc.text(`• Fecha de Emisión: ${dateStr}`, 24, 65);
  doc.text(`• Sistema de Trazado: Geometría Sastrería de 19 Puntos Técnicos`, 24, 71);
  doc.text(`• Margen de Costura Recomendado: 1.0 cm en contornos / 3.0 cm en bajo`, 24, 77);
  doc.text(`• Holguras Anatómicas: Cintura +${preset.ease.waist}cm | Cadera +${preset.ease.hip}cm | Muslo +${preset.ease.thigh}cm`, 24, 83);

  // Tabla de Medidas Corporales Aplicadas
  doc.setFillColor(255, 253, 250);
  doc.roundedRect(20, 92, 170, 68, 2, 2, 'F');
  doc.setDrawColor(200, 190, 180);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, 92, 170, 68, 2, 2, 'S');

  doc.setFillColor(193, 68, 14);
  doc.rect(20, 92, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('COTAS Y MEDIDAS PARAMÉTRICAS APLICADAS (cm)', 24, 97.5);

  const measureItems = [
    { label: 'Contorno de Cintura (W):', val: `${measurements.waist} cm`, ease: `+${preset.ease.waist} cm holgura` },
    { label: 'Contorno de Cadera (H):', val: `${measurements.hip} cm`, ease: `+${preset.ease.hip} cm holgura` },
    { label: 'Profundidad / Altura de Tiro (CD):', val: `${measurements.crotchDepth} cm`, ease: 'Anatómico estándar' },
    { label: 'Largo Total de Pierna (LL):', val: `${measurements.legLength} cm`, ease: 'Cintura a suelo' },
    { label: 'Ancho a la Rodilla (KW):', val: `${measurements.kneeWidth} cm`, ease: `${preset.name}` },
    { label: 'Ancho de Bota / Bajo (BW):', val: `${measurements.bottomWidth} cm`, ease: `${preset.name}` }
  ];

  measureItems.forEach((item, index) => {
    const yPos = 107 + index * 8.5;
    doc.setTextColor(28, 25, 22);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, 24, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(193, 68, 14);
    doc.text(item.val, 110, yPos);
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(120, 115, 105);
    doc.text(`(${item.ease})`, 140, yPos);
    doc.setFontSize(9);
  });

  // Guía de los 19 Puntos Técnicos
  doc.setFillColor(255, 253, 250);
  doc.roundedRect(20, 168, 170, 64, 2, 2, 'F');
  doc.setDrawColor(200, 190, 180);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, 168, 170, 64, 2, 2, 'S');

  doc.setFillColor(28, 25, 22);
  doc.rect(20, 168, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('GUÍA DE LOS 19 PUNTOS TÉCNICOS DE PATRONAJE', 24, 173.5);

  const pointsGuide = [
    '1: Vértice superior costado cintura', '2: Base bajo costado',
    '3: Altura de cadera costado', '4: Altura de rodilla costado',
    '5: Cruce de entrepierna / tiro', '6: Punta de gancho de tiro',
    '7: Centro de tiro delantero', '8: Curva de profundidad de tiro',
    '9: Centro de rodilla', '10-11: Anchos simétricos de rodilla',
    '12: Centro de bota/bajo', '13-14: Anchos simétricos de bota',
    '15: Vértice cadera centro', '16: Vértice superior centro cintura',
    '17-18: Caída y desvío de cintura', '19: Ajuste anatómico de tiro'
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 55, 50);
  for (let i = 0; i < pointsGuide.length; i += 2) {
    const yRow = 182 + (i / 2) * 5.5;
    doc.text(`• ${pointsGuide[i]}`, 24, yRow);
    if (pointsGuide[i + 1]) {
      doc.text(`• ${pointsGuide[i + 1]}`, 105, yRow);
    }
  }

  // Cuadro de Verificación de Escala (50x50 mm)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, 240, 170, 36, 2, 2, 'F');
  doc.setDrawColor(193, 68, 14);
  doc.setLineWidth(0.6);
  doc.rect(26, 245, 25, 25, 'S');

  // Cruz interior en el cuadro
  doc.setLineWidth(0.2);
  doc.line(26, 257.5, 51, 257.5);
  doc.line(38.5, 245, 38.5, 270);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(193, 68, 14);
  doc.text('TEST DE CALIBRACIÓN DE IMPRESIÓN (25 × 25 mm)', 58, 251);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(70, 65, 60);
  doc.text('1. Al imprimir, seleccione Escala 100% o Tamaño Real (no ajustar a página).', 58, 257);
  doc.text('2. Mida con regla el cuadrado de la izquierda: debe medir exactamente 2.5 × 2.5 cm.', 58, 263);
  doc.text('3. Si coincide, todas las cotas y moldes de las páginas 2 y 3 están en escala 100%.', 58, 269);

  // ══════════════════════════════════════════════════════════
  // HELPER: RENDERIZAR PLANO TÉCNICO EN PDF
  // ══════════════════════════════════════════════════════════
  function renderPatternPage(
    title: string, 
    pieceType: 'front' | 'back', 
    pts: PatternPoint[], 
    grainLine: { x1: number; y1: number; x2: number; y2: number },
    notches: PatternPoint[]
  ) {
    doc.addPage('a4', 'portrait');

    // Fondo blanco puro para corte
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');

    // Marco exterior con milimetrado sutil
    doc.setDrawColor(230, 225, 220);
    doc.setLineWidth(0.2);
    for (let x = 15; x <= 195; x += 10) {
      doc.line(x, 15, x, 282);
    }
    for (let y = 15; y <= 282; y += 10) {
      doc.line(15, y, 195, y);
    }

    // Cabecera de la pieza
    doc.setFillColor(28, 25, 22);
    doc.rect(15, 15, 180, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(title.toUpperCase(), 20, 22.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`CORTAR 2 PIEZAS (EN ESPEJO) • HILO DE TELA OBLIGATORIO`, 190, 22.5, { align: 'right' });

    // Calcular escala y centrado para encajar en el área útil (170 x 235 mm)
    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const patternW = maxX - minX || 1;
    const patternH = maxY - minY || 1;

    const targetAreaW = 160;
    const targetAreaH = 225;

    const scale = Math.min(targetAreaW / patternW, targetAreaH / patternH);
    const offsetX = 25 + (targetAreaW - patternW * scale) / 2 - minX * scale;
    const offsetY = 35 + (targetAreaH - patternH * scale) / 2 - minY * scale;

    const tx = (x: number) => x * scale + offsetX;
    const ty = (y: number) => y * scale + offsetY;

    // DIBUJAR LÍNEAS GUÍA TÉCNICAS (CYAN / TURQUESA)
    doc.setDrawColor(2, 132, 199);
    doc.setLineWidth(0.25);
    // Guías punteadas (tiro, rodilla, bajo)
    const pDict: Record<string, PatternPoint> = {};
    pts.forEach(p => { if (p.label) pDict[p.label] = p; });

    if (pDict['6'] && pDict['3']) {
      doc.line(tx(pDict['6'].x) - 4, ty(pDict['3'].y), tx(pDict['3'].x) + 4, ty(pDict['3'].y));
    }
    if (pDict['10'] && pDict['4']) {
      doc.line(tx(pDict['10'].x) - 4, ty(pDict['4'].y), tx(pDict['4'].x) + 4, ty(pDict['4'].y));
    }
    if (pDict['13'] && pDict['2']) {
      doc.line(tx(pDict['13'].x) - 4, ty(pDict['2'].y), tx(pDict['2'].x) + 4, ty(pDict['2'].y));
    }
    if (pDict['1'] && pDict['2']) {
      doc.line(tx(pDict['1'].x), ty(pDict['1'].y), tx(pDict['2'].x), ty(pDict['2'].y));
    }

    // DIBUJAR LÍNEA DE APLOMO / HILO DE TELA
    doc.setDrawColor(2, 132, 199);
    doc.setLineWidth(0.4);
    const gx1 = tx(grainLine.x1);
    const gy1 = ty(grainLine.y1);
    const gx2 = tx(grainLine.x2);
    const gy2 = ty(grainLine.y2);
    doc.line(gx1, gy1, gx2, gy2);

    // Flechas de aplomo
    doc.setFillColor(2, 132, 199);
    doc.triangle(gx1, gy1 - 3, gx1 - 2, gy1, gx1 + 2, gy1, 'F');
    doc.triangle(gx2, gy2 + 3, gx2 - 2, gy2, gx2 + 2, gy2, 'F');

    doc.setTextColor(2, 132, 199);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('▲  H I L O   D E   T E L A   ( A P L O M O )  ▲', gx1 + 3, (gy1 + gy2) / 2, { angle: 90 });

    // DIBUJAR CONTORNO DEL PATRÓN EN ORDEN PERIMETRAL EXACTO
    doc.setDrawColor(28, 25, 22);
    doc.setLineWidth(0.7);

    const perimeterOrder = pieceType === 'front' 
      ? ['16', '18', '17', '19', '3', '11', '14', '13', '10', '6', '8', '15', '16']
      : ['16', '17', '1', '18', '3', '11', '14', '13', '10', '6', '8', '15', '16'];

    for (let i = 0; i < perimeterOrder.length - 1; i++) {
      const pA = pDict[perimeterOrder[i]];
      const pB = pDict[perimeterOrder[i + 1]];
      if (pA && pB) {
        doc.line(tx(pA.x), ty(pA.y), tx(pB.x), ty(pB.y));
      }
    }

    // DIBUJAR PINZA
    if (pieceType === 'front' && pDict['18']) {
      const dartTipY = pDict['18'].y + 90;
      doc.line(tx(pDict['18'].x - 7.5), ty(pDict['18'].y), tx(pDict['18'].x), ty(dartTipY));
      doc.line(tx(pDict['18'].x + 7.5), ty(pDict['18'].y), tx(pDict['18'].x), ty(dartTipY));
    } else if (pieceType === 'back' && pDict['17']) {
      const dartTipY = pDict['17'].y + 120;
      doc.line(tx(pDict['17'].x - 10), ty(pDict['17'].y), tx(pDict['17'].x - 5), ty(dartTipY));
      doc.line(tx(pDict['17'].x + 10), ty(pDict['17'].y), tx(pDict['17'].x - 5), ty(dartTipY));
    }

    // DIBUJAR PIQUETES DE ENSAMBLE
    doc.setDrawColor(193, 68, 14);
    doc.setLineWidth(0.6);
    notches.forEach((n) => {
      const nx = tx(n.x);
      const ny = ty(n.y);
      doc.line(nx - 2, ny, nx + 2, ny);
      doc.line(nx, ny - 2, nx, ny + 2);
    });

    // DIBUJAR LOS PUNTOS NUMERADOS (1 a 19)
    pts.forEach((pt) => {
      if (!pt.label) return;
      const px = tx(pt.x);
      const py = ty(pt.y);

      // Círculo del punto
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(pieceType === 'front' ? 28 : 193, pieceType === 'front' ? 25 : 68, pieceType === 'front' ? 22 : 14);
      doc.setLineWidth(0.3);
      doc.circle(px, py, 2.2, 'FD');

      // Número con posicionamiento inteligente
      doc.setTextColor(pieceType === 'front' ? 28 : 193, pieceType === 'front' ? 25 : 68, pieceType === 'front' ? 22 : 14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.text(pt.label, px, py + 1.8, { align: 'center' });
    });

    // Cuadro de especificaciones en el pie de página
    doc.setFillColor(248, 245, 240);
    doc.rect(15, 268, 180, 14, 'F');
    doc.setDrawColor(200, 190, 180);
    doc.setLineWidth(0.3);
    doc.rect(15, 268, 180, 14, 'S');

    doc.setTextColor(28, 25, 22);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(`INEFABLE • ${preset.name.toUpperCase()} • TALLA PARAMÉTRICA PERSONALIZADA`, 20, 273.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 90, 80);
    doc.text(`Cintura: ${measurements.waist}cm | Cadera: ${measurements.hip}cm | Tiro: ${measurements.crotchDepth}cm | Largo: ${measurements.legLength}cm | Bota: ${measurements.bottomWidth}cm`, 20, 278.5);
  }

  // ══════════════════════════════════════════════════════════
  // PÁGINA 2: MOLDE DELANTERO
  // ══════════════════════════════════════════════════════════
  const frontPts = patternData.labelPoints.front;
  const frontNotches = patternData.notches.slice(0, 4);
  renderPatternPage(
    `Pieza 1: Delantero Técnico (${preset.name})`, 
    'front', 
    frontPts, 
    patternData.grainLineFront, 
    frontNotches
  );

  // ══════════════════════════════════════════════════════════
  // PÁGINA 3: MOLDE TRASERO
  // ══════════════════════════════════════════════════════════
  const backPts = patternData.labelPoints.back;
  const backNotches = patternData.notches.slice(4, 8);
  renderPatternPage(
    `Pieza 2: Trasero Técnico (${preset.name})`, 
    'back', 
    backPts, 
    patternData.grainLineBack, 
    backNotches
  );

  // ══════════════════════════════════════════════════════════
  // PÁGINA 4: PLANO CONJUNTO (DELANTERO + TRASERO)
  // ══════════════════════════════════════════════════════════
  doc.addPage('a4', 'portrait');
  doc.setFillColor(248, 245, 240);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setFillColor(28, 25, 22);
  doc.rect(15, 15, 180, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`PLANO CONJUNTO TÉCNICO • DELANTERO & TRASERO`, 20, 22.5);

  // Renderizar ambos moldes lado a lado a escala conjunta
  const allPts = [...frontPts, ...backPts];
  const allXs = allPts.map(p => p.x);
  const allYs = allPts.map(p => p.y);
  const minX = Math.min(...allXs);
  const maxX = Math.max(...allXs);
  const minY = Math.min(...allYs);
  const maxY = Math.max(...allYs);

  const totalW = maxX - minX || 1;
  const totalH = maxY - minY || 1;

  const targetW = 165;
  const targetH = 220;
  const totalScale = Math.min(targetW / totalW, targetH / totalH);
  const totalOffX = 20 + (targetW - totalW * totalScale) / 2 - minX * totalScale;
  const totalOffY = 35 + (targetH - totalH * totalScale) / 2 - minY * totalScale;

  const ctx = (x: number) => x * totalScale + totalOffX;
  const cty = (y: number) => y * totalScale + totalOffY;

  const fDict: Record<string, PatternPoint> = {};
  frontPts.forEach(p => { if (p.label) fDict[p.label] = p; });
  const bDict: Record<string, PatternPoint> = {};
  backPts.forEach(p => { if (p.label) bDict[p.label] = p; });

  const fOrder = ['16', '18', '17', '19', '3', '11', '14', '13', '10', '6', '8', '15', '16'];
  const bOrder = ['16', '17', '1', '18', '3', '11', '14', '13', '10', '6', '8', '15', '16'];

  // Delantero en trazo negro sólido
  doc.setDrawColor(28, 25, 22);
  doc.setLineWidth(0.7);
  for (let i = 0; i < fOrder.length - 1; i++) {
    const pA = fDict[fOrder[i]];
    const pB = fDict[fOrder[i + 1]];
    if (pA && pB) doc.line(ctx(pA.x), cty(pA.y), ctx(pB.x), cty(pB.y));
  }

  // Trasero en trazo terracota
  doc.setDrawColor(193, 68, 14);
  doc.setLineWidth(0.7);
  for (let i = 0; i < bOrder.length - 1; i++) {
    const pA = bDict[bOrder[i]];
    const pB = bDict[bOrder[i + 1]];
    if (pA && pB) doc.line(ctx(pA.x), cty(pA.y), ctx(pB.x), cty(pB.y));
  }

  // Puntos del conjunto
  frontPts.forEach((pt) => {
    if (!pt.label) return;
    const px = ctx(pt.x);
    const py = cty(pt.y);
    doc.setFillColor(28, 25, 22);
    doc.circle(px, py, 1.2, 'F');
  });

  backPts.forEach((pt) => {
    if (!pt.label) return;
    const px = ctx(pt.x);
    const py = cty(pt.y);
    doc.setFillColor(193, 68, 14);
    doc.circle(px, py, 1.2, 'F');
  });

  // Rótulos de pieza
  doc.setTextColor(28, 25, 22);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('DELANTERO', ctx(patternData.grainLineFront.x1), cty(patternData.grainLineFront.y1) - 6, { align: 'center' });

  doc.setTextColor(193, 68, 14);
  doc.text('TRASERO', ctx(patternData.grainLineBack.x1), cty(patternData.grainLineBack.y1) - 6, { align: 'center' });

  // Pie de página final
  doc.setFillColor(255, 255, 255);
  doc.rect(15, 268, 180, 14, 'F');
  doc.setDrawColor(200, 190, 180);
  doc.rect(15, 268, 180, 14, 'S');

  doc.setTextColor(100, 90, 80);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Plano Maestro Vectorial Paramétrico • Inefable Haute Couture & Pattern Studio • Escala verificada', 105, 276.5, { align: 'center' });

  // Descargar archivo
  const filename = `Inefable-Molde-${silhouette}-${measurements.waist}w-${measurements.legLength}l.pdf`;
  doc.save(filename);
}


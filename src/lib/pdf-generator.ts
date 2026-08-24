import jsPDF from 'jspdf';
import { type PatternMeasurements, type SilhouetteType, SILHOUETTES } from './pattern-math';

export function exportPatternToPdf(measurements: PatternMeasurements, silhouette: SilhouetteType) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const preset = SILHOUETTES[silhouette];
  const dateStr = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  // PÁGINA 1: PORTADA & FICHA TÉCNICA
  // Fondo y encabezado elegante
  doc.setFillColor(15, 17, 23);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setTextColor(226, 183, 116);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('I N E F A B L E', 105, 35, { align: 'center' });

  doc.setTextColor(248, 250, 252);
  doc.setFontSize(14);
  doc.text('FICHA TÉCNICA DE PATRONAJE Y CORTE', 105, 45, { align: 'center' });

  doc.setDrawColor(226, 183, 116);
  doc.setLineWidth(0.5);
  doc.line(30, 52, 180, 52);

  // Metadatos de la prenda
  doc.setFontSize(11);
  doc.setTextColor(148, 163, 184);
  doc.text(`Silueta: ${preset.name}`, 30, 65);
  doc.text(`Categoría: ${preset.category}`, 30, 72);
  doc.text(`Fecha de Generación: ${dateStr}`, 30, 79);
  doc.text('Margen de Costura Incluido: 1.0 cm (Dobladillo: 2.5 cm)', 30, 86);

  // Tabla de medidas
  doc.setFillColor(24, 25, 32);
  doc.roundedRect(30, 95, 150, 80, 4, 4, 'F');
  doc.setDrawColor(255, 255, 255, 0.1);
  doc.roundedRect(30, 95, 150, 80, 4, 4, 'S');

  doc.setTextColor(226, 183, 116);
  doc.setFontSize(12);
  doc.text('MEDIDAS PARAMÉTRICAS APLICADAS', 40, 107);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(240, 240, 240);

  const measureItems = [
    { label: 'Contorno de Cintura:', val: `${measurements.waist} cm` },
    { label: 'Contorno de Cadera:', val: `${measurements.hip} cm` },
    { label: 'Altura / Profundidad de Tiro:', val: `${measurements.crotchDepth} cm` },
    { label: 'Largo Total de Pierna:', val: `${measurements.legLength} cm` },
    { label: 'Ancho a la Rodilla:', val: `${measurements.kneeWidth} cm` },
    { label: 'Ancho de Bota / Bajo:', val: `${measurements.bottomWidth} cm` }
  ];

  measureItems.forEach((item, index) => {
    const yPos = 118 + index * 8;
    doc.text(item.label, 40, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(item.val, 150, yPos, { align: 'right' });
    doc.setFont('helvetica', 'normal');
  });

  // Cuadro de calibración de impresión 50x50 mm
  doc.setFillColor(30, 32, 40);
  doc.roundedRect(30, 190, 150, 40, 3, 3, 'F');
  doc.setDrawColor(226, 183, 116);
  doc.rect(40, 198, 25, 25, 'S');
  
  doc.setTextColor(226, 183, 116);
  doc.setFontSize(9);
  doc.text('CUADRO DE VERIFICACIÓN', 72, 204);
  doc.setTextColor(148, 163, 184);
  doc.text('Al imprimir al 100% de escala (sin ajustar página),', 72, 210);
  doc.text('el cuadro de la izquierda debe medir exactamente 25 x 25 mm.', 72, 216);

  // Instrucciones de corte
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Cortar: 2 piezas delanteras (en espejo) + 2 piezas traseras (en espejo) respetando el hilo de tela.', 105, 250, { align: 'center' });
  doc.text('Inefable Sartorial Intelligence • Diseñado para confección profesional', 105, 280, { align: 'center' });

  // PÁGINA 2: PLANO DEL PATRÓN DELANTERO
  doc.addPage('a4', 'portrait');
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`MOLDE DELANTERO • SILUETA: ${preset.name.toUpperCase()}`, 105, 20, { align: 'center' });
  
  // Dibujar vector de molde Delantero a escala técnica
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(0.7);
  
  // Esquema del patrón delantero
  doc.line(60, 40, 150, 40); // Cintura
  doc.line(150, 40, 165, 100); // Cadera costado
  doc.line(165, 100, 155, 180); // Muslo / rodilla
  doc.line(155, 180, 150, 260); // Rodilla a bota
  doc.line(150, 260, 60, 260); // Bota bajo
  doc.line(60, 260, 65, 180); // Entrepierna rodilla
  doc.line(65, 180, 45, 100); // Curva de tiro delantera
  doc.line(45, 100, 60, 40); // Tiro a cintura

  // Línea de aplomo / Hilo de tela
  doc.setDrawColor(180, 50, 50);
  doc.setLineWidth(0.4);
  doc.line(105, 45, 105, 255);
  doc.text('▲ HILO DE TELA (APLOMO) ▲', 105, 150, { align: 'center', angle: 90 });

  // PÁGINA 3: PLANO DEL PATRÓN TRASERO
  doc.addPage('a4', 'portrait');
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`MOLDE TRASERO • SILUETA: ${preset.name.toUpperCase()}`, 105, 20, { align: 'center' });

  // Esquema del patrón trasero
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(0.7);

  doc.line(55, 35, 155, 42); // Cintura trasera inclinada
  doc.line(155, 42, 170, 105); // Cadera costado
  doc.line(170, 105, 160, 180); // Muslo / rodilla
  doc.line(160, 180, 155, 260); // Bota
  doc.line(155, 260, 55, 260); // Bajo
  doc.line(55, 260, 60, 180); // Entrepierna
  doc.line(60, 180, 35, 105); // Gancho de tiro trasero extendido
  doc.line(35, 105, 55, 35); // Tiro trasero a cintura

  // Línea de aplomo trasera
  doc.setDrawColor(180, 50, 50);
  doc.setLineWidth(0.4);
  doc.line(105, 45, 105, 255);
  doc.text('▲ HILO DE TELA (APLOMO) ▲', 105, 150, { align: 'center', angle: 90 });

  // Descargar archivo
  const filename = `Inefable-Molde-${preset.id}-${measurements.waist}w-${measurements.legLength}l.pdf`;
  doc.save(filename);
}

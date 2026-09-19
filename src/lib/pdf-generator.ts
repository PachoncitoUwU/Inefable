import jsPDF from 'jspdf';
import { 
  type PatternMeasurements, 
  type SilhouetteType, 
  SILHOUETTES, 
  calculatePantsPattern,
  type PatternPoint 
} from './pattern-math';

// ══════════════════════════════════════════════════════════════════
// CONSTANTES DE IMPRESIÓN Y MOSAICO EN HOJAS A4 (OPTIMIZADAS)
// ══════════════════════════════════════════════════════════════════
const PAGE_W = 210; // Ancho A4 en mm
const PAGE_H = 297; // Alto A4 en mm

// Márgenes de impresión optimizados para impresoras hogareñas (10 mm lateral, 12 mm vertical)
const MARGIN_X = 10;
const MARGIN_Y = 12;

// Área útil máxima de impresión por hoja (escala real 1:1: 1 mm CAD = 1 mm papel)
const TILE_W = PAGE_W - 2 * MARGIN_X; // 190 mm
const TILE_H = PAGE_H - 2 * MARGIN_Y; // 273 mm

interface LineSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// Diccionario pedagógico para explicar los 19 puntos técnicos a principiantes
export const ANATOMICAL_POINT_DESCRIPTIONS: Record<string, string> = {
  '1': 'Cintura Lateral',
  '2': 'Bajo Lateral',
  '3': 'Cruce Cadera/Tiro',
  '4': 'Rodilla Costado',
  '5': 'Base de Tiro',
  '6': 'Punta de Gancho de Tiro',
  '7': 'Aplomo Central (Tiro)',
  '8': 'Curva de Tiro Anatómico',
  '9': 'Aplomo Rodilla',
  '10': 'Rodilla Entrepierna',
  '11': 'Rodilla Costado',
  '12': 'Aplomo Dobladillo',
  '13': 'Bajo Entrepierna',
  '14': 'Bajo Costado',
  '15': 'Cadera Centro Frente',
  '16': 'Centro Frente Cintura',
  '17': 'Costado de Cintura',
  '18': 'Centro Pinza Cintura',
  '19': 'Curva Máxima Cadera'
};

// Algoritmo Liang-Barsky para recorte exacto de líneas dentro del azulejo A4
function clipLineSegment(
  x1: number, y1: number, x2: number, y2: number,
  xmin: number, ymin: number, xmax: number, ymax: number
): [number, number, number, number] | null {
  let t0 = 0;
  let t1 = 1;
  const dx = x2 - x1;
  const dy = y2 - y1;

  const p = [-dx, dx, -dy, dy];
  const q = [x1 - xmin, xmax - x1, y1 - ymin, ymax - y1];

  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return null;
    } else {
      const r = q[i] / p[i];
      if (p[i] < 0) {
        if (r > t1) return null;
        if (r > t0) t0 = r;
      } else {
        if (r < t0) return null;
        if (r < t1) t1 = r;
      }
    }
  }

  return [x1 + t0 * dx, y1 + t0 * dy, x1 + t1 * dx, y1 + t1 * dy];
}

// Discretización de curvas de Bézier cuadráticas (Q)
function sampleQuadraticBezier(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  steps: number = 36
): LineSegment[] {
  const segments: LineSegment[] = [];
  let prevX = p0.x;
  let prevY = p0.y;

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const inv = 1 - t;
    const curX = inv * inv * p0.x + 2 * inv * t * p1.x + t * t * p2.x;
    const curY = inv * inv * p0.y + 2 * inv * t * p1.y + t * t * p2.y;
    segments.push({ x1: prevX, y1: prevY, x2: curX, y2: curY });
    prevX = curX;
    prevY = curY;
  }

  return segments;
}

export interface PieceGeometry {
  name: string;
  pieceType: 'front' | 'back';
  perimeterSegments: LineSegment[];
  dartSegments: LineSegment[];
  grainLine: { x1: number; y1: number; x2: number; y2: number };
  notches: PatternPoint[];
  labelPoints: PatternPoint[];
  levels: { name: string; y: number }[];
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

// Extrae la geometría paramétrica exacta en milímetros reales
export function extractPieceGeometry(
  pieceType: 'front' | 'back',
  patternData: ReturnType<typeof calculatePantsPattern>,
  m: PatternMeasurements,
  sil: SilhouetteType
): PieceGeometry {
  const C = 10;
  const ease = SILHOUETTES[sil].ease;
  const H4 = ((m.hip + ease.hip) / 4) * C;
  const W4 = ((m.waist + ease.waist) / 4) * C;
  const CD = m.crotchDepth * C;
  const LL = m.legLength * C;
  const KW = (m.kneeWidth * C) / 2;
  const BW = (m.bottomWidth * C) / 2;

  const yWaist = 40;
  const yHip = yWaist + CD * 0.65;
  const yCrotch = yWaist + CD;
  const yKnee = yWaist + CD + (LL - CD) * 0.5 - 4 * C;
  const yHem = yWaist + LL;

  const levels = [
    { name: `LÍNEA DE CINTURA (${m.waist} cm)`, y: yWaist },
    { name: `LÍNEA DE CADERA (${m.hip} cm)`, y: yHip },
    { name: `LÍNEA DE TIRO (${m.crotchDepth} cm)`, y: yCrotch },
    { name: `LÍNEA DE RODILLA (${m.kneeWidth} cm)`, y: yKnee },
    { name: `LÍNEA DE BAJO / BOTA (${m.bottomWidth} cm)`, y: yHem }
  ];

  if (pieceType === 'front') {
    const marginX = 80;
    const fHook = H4 * 0.24;
    const fBoxOriginX = marginX + fHook;
    const fBoxW = H4;

    const f_p3 = { x: fBoxOriginX + fBoxW, y: yCrotch, label: '3' };
    const f_p16 = { x: fBoxOriginX, y: yWaist, label: '16' };
    const f_p15 = { x: fBoxOriginX, y: yHip, label: '15' };
    const f_p6  = { x: fBoxOriginX - fHook, y: yCrotch, label: '6' };
    const f_p8  = { x: fBoxOriginX - fHook * 0.42, y: yCrotch - fHook * 0.42, label: '8' };

    const fAplomoX = (f_p6.x + f_p3.x) / 2;
    const f_p10 = { x: fAplomoX - KW, y: yKnee, label: '10' };
    const f_p11 = { x: fAplomoX + KW, y: yKnee, label: '11' };
    const f_p13 = { x: fAplomoX - BW, y: yHem, label: '13' };
    const f_p14 = { x: fAplomoX + BW, y: yHem, label: '14' };

    const dartW = 1.5 * C;
    const f_p17 = { x: fBoxOriginX + W4 + dartW, y: yWaist, label: '17' };
    const f_p18 = { x: fAplomoX, y: yWaist, label: '18' };
    const f_p19 = { x: fBoxOriginX + fBoxW + 0.6 * C, y: yHip, label: '19' };

    const perimeterSegments: LineSegment[] = [
      { x1: f_p16.x, y1: f_p16.y, x2: f_p18.x - dartW / 2, y2: f_p18.y },
      { x1: f_p18.x + dartW / 2, y1: f_p18.y, x2: f_p17.x, y2: f_p17.y },
      ...sampleQuadraticBezier(
        f_p17,
        { x: f_p17.x + (f_p19.x - f_p17.x) * 0.8, y: (f_p17.y + f_p19.y) / 2 },
        f_p19
      ),
      ...sampleQuadraticBezier(
        f_p19,
        { x: f_p19.x, y: (f_p19.y + f_p3.y) / 2 },
        f_p3
      ),
      { x1: f_p3.x, y1: f_p3.y, x2: f_p11.x, y2: f_p11.y },
      { x1: f_p11.x, y1: f_p11.y, x2: f_p14.x, y2: f_p14.y },
      { x1: f_p14.x, y1: f_p14.y, x2: f_p13.x, y2: f_p13.y },
      { x1: f_p13.x, y1: f_p13.y, x2: f_p10.x, y2: f_p10.y },
      ...sampleQuadraticBezier(
        f_p10,
        { x: f_p10.x + (f_p6.x - f_p10.x) * 0.15, y: (f_p10.y + f_p6.y) / 2 },
        f_p6
      ),
      ...sampleQuadraticBezier(
        f_p6,
        { x: f_p8.x, y: f_p8.y },
        f_p15
      ),
      { x1: f_p15.x, y1: f_p15.y, x2: f_p16.x, y2: f_p16.y }
    ];

    const dartDepth = 9 * C;
    const dartSegments: LineSegment[] = [
      { x1: f_p18.x - dartW / 2, y1: yWaist, x2: f_p18.x, y2: yWaist + dartDepth },
      { x1: f_p18.x, y1: yWaist + dartDepth, x2: f_p18.x + dartW / 2, y2: yWaist }
    ];

    const pts = patternData.labelPoints.front;
    const xs = pts.map(p => p.x);

    return {
      name: 'Delantero (Frente)',
      pieceType: 'front',
      perimeterSegments,
      dartSegments,
      grainLine: patternData.grainLineFront,
      notches: patternData.notches.slice(0, 4),
      labelPoints: pts,
      levels,
      bounds: {
        minX: Math.min(...xs, f_p6.x),
        maxX: Math.max(...xs, f_p19.x),
        minY: yWaist,
        maxY: yHem
      }
    };
  } else {
    // TRASERO
    const f_p1_x = 80 + H4 * 0.24 + H4;
    const gapBetween = 90;
    const fHook = H4 * 0.24;
    const bBoxOriginX = f_p1_x + gapBetween + fHook * 2.2;
    const bBoxW = H4 * 1.05;
    const bHook = H4 * 0.58;

    const b_p1 = { x: bBoxOriginX + bBoxW, y: yWaist + 0.6 * C, label: '1' };
    const b_p3 = { x: bBoxOriginX + bBoxW, y: yCrotch + 0.8 * C, label: '3' };
    const bRiseIn = 3 * C;
    const bRiseUp = 2.8 * C;
    const b_p16 = { x: bBoxOriginX + bRiseIn, y: yWaist - bRiseUp, label: '16' };
    const b_p15 = { x: bBoxOriginX + 1.2 * C, y: yHip + 1.2 * C, label: '15' };
    const b_p6  = { x: bBoxOriginX - bHook, y: yCrotch + 1.4 * C, label: '6' };
    const b_p8  = { x: bBoxOriginX - bHook * 0.4, y: yCrotch + 0.8 * C, label: '8' };

    const bAplomoX = (b_p6.x + b_p3.x) / 2;
    const bKW = KW + 1.5 * C;
    const bBW = BW + 1.5 * C;
    const b_p10 = { x: bAplomoX - bKW, y: yKnee, label: '10' };
    const b_p11 = { x: bAplomoX + bKW, y: yKnee, label: '11' };
    const b_p13 = { x: bAplomoX - bBW, y: yHem, label: '13' };
    const b_p14 = { x: bAplomoX + bBW, y: yHem, label: '14' };

    const bDartW = 2.0 * C;
    const b_p17 = { x: (b_p16.x + b_p1.x) / 2, y: (b_p16.y + b_p1.y) / 2, label: '17' };
    const b_p18 = { x: bBoxOriginX + bBoxW + 1.2 * C, y: yHip + 0.5 * C, label: '18' };

    const perimeterSegments: LineSegment[] = [
      { x1: b_p16.x, y1: b_p16.y, x2: b_p17.x - bDartW / 2, y2: b_p17.y },
      { x1: b_p17.x + bDartW / 2, y1: b_p17.y, x2: b_p1.x, y2: b_p1.y },
      ...sampleQuadraticBezier(
        b_p1,
        { x: b_p1.x + (b_p18.x - b_p1.x) * 0.8, y: (b_p1.y + b_p18.y) / 2 },
        b_p18
      ),
      ...sampleQuadraticBezier(
        b_p18,
        { x: b_p18.x, y: (b_p18.y + b_p3.y) / 2 },
        b_p3
      ),
      { x1: b_p3.x, y1: b_p3.y, x2: b_p11.x, y2: b_p11.y },
      { x1: b_p11.x, y1: b_p11.y, x2: b_p14.x, y2: b_p14.y },
      { x1: b_p14.x, y1: b_p14.y, x2: b_p13.x, y2: b_p13.y },
      { x1: b_p13.x, y1: b_p13.y, x2: b_p10.x, y2: b_p10.y },
      ...sampleQuadraticBezier(
        b_p10,
        { x: b_p10.x + (b_p6.x - b_p10.x) * 0.18, y: (b_p10.y + b_p6.y) / 2 },
        b_p6
      ),
      ...sampleQuadraticBezier(
        b_p6,
        { x: b_p8.x, y: b_p8.y },
        b_p15
      ),
      { x1: b_p15.x, y1: b_p15.y, x2: b_p16.x, y2: b_p16.y }
    ];

    const bDartDepth = 12 * C;
    const dartSegments: LineSegment[] = [
      { x1: b_p17.x - bDartW / 2, y1: b_p17.y, x2: b_p17.x - 0.5 * C, y2: b_p17.y + bDartDepth },
      { x1: b_p17.x - 0.5 * C, y1: b_p17.y + bDartDepth, x2: b_p17.x + bDartW / 2, y2: b_p17.y }
    ];

    const pts = patternData.labelPoints.back;
    const xs = pts.map(p => p.x);

    return {
      name: 'Trasero (Espalda)',
      pieceType: 'back',
      perimeterSegments,
      dartSegments,
      grainLine: patternData.grainLineBack,
      notches: patternData.notches.slice(4, 8),
      labelPoints: pts,
      levels,
      bounds: {
        minX: Math.min(...xs, b_p6.x),
        maxX: Math.max(...xs, b_p18.x),
        minY: b_p16.y,
        maxY: yHem
      }
    };
  }
}

// Verifica si un azulejo contiene líneas de corte reales o puntos del patrón (filtro estricto para no generar hojas vacías)
function tileHasActualContent(
  geom: PieceGeometry,
  xmin: number, ymin: number, xmax: number, ymax: number
): boolean {
  // Margen de tolerancia de 2mm para no incluir hojas donde una línea sólo roza el borde
  const tol = 2;
  const innerXmin = xmin - tol;
  const innerYmin = ymin - tol;
  const innerXmax = xmax + tol;
  const innerYmax = ymax + tol;

  for (const seg of geom.perimeterSegments) {
    if (clipLineSegment(seg.x1, seg.y1, seg.x2, seg.y2, innerXmin, innerYmin, innerXmax, innerYmax)) {
      return true;
    }
  }
  for (const seg of geom.dartSegments) {
    if (clipLineSegment(seg.x1, seg.y1, seg.x2, seg.y2, innerXmin, innerYmin, innerXmax, innerYmax)) {
      return true;
    }
  }
  if (clipLineSegment(geom.grainLine.x1, geom.grainLine.y1, geom.grainLine.x2, geom.grainLine.y2, innerXmin, innerYmin, innerXmax, innerYmax)) {
    return true;
  }
  for (const pt of geom.labelPoints) {
    if (pt.x >= xmin && pt.x <= xmax && pt.y >= ymin && pt.y <= ymax) {
      return true;
    }
  }
  return false;
}

// Genera un nombre y código 100% INCONFUNDIBLE para cada hoja del mosaico
function getTileAnatomicalDescription(
  row: number,
  col: number,
  totalRows: number,
  totalCols: number,
  pieceType: 'front' | 'back'
): { title: string; subtitle: string; shortTag: string; code: string } {
  const code = `${String.fromCharCode(65 + col)}${row + 1}`;
  const isFront = pieceType === 'front';

  if (isFront) {
    if (row === 0) {
      if (col === 0) {
        return {
          code,
          title: `[${code}] Delantero: Cintura Superior & Centro Frente`,
          subtitle: 'Pretina frontal, centro delantero e inicio de tiro',
          shortTag: 'Cintura Frente'
        };
      } else if (col === 1 && totalCols > 2) {
        return {
          code,
          title: `[${code}] Delantero: Cintura Media & Pinza Anatómica`,
          subtitle: 'Eje de pinza frontal y pretina central',
          shortTag: 'Cintura Pinza'
        };
      } else {
        return {
          code,
          title: `[${code}] Delantero: Cintura & Cadera / Costado`,
          subtitle: 'Curva anatómica de cadera y pinza frontal de cintura',
          shortTag: 'Cintura Costado'
        };
      }
    } else if (row === 1) {
      if (col === 0) {
        return {
          code,
          title: `[${code}] Delantero: Tiro Delantero & Gancho Anatómico`,
          subtitle: 'Curvatura anatómica de tiro hacia entrepierna',
          shortTag: 'Tiro & Gancho'
        };
      } else {
        return {
          code,
          title: `[${code}] Delantero: Costado Lateral & Caída de Cadera`,
          subtitle: 'Costado exterior que conecta la cadera con la rodilla',
          shortTag: 'Costado Lateral'
        };
      }
    } else if (row === totalRows - 1) {
      if (col === 0) {
        return {
          code,
          title: `[${code}] Delantero: Bajo / Bota Interior & Dobladillo`,
          subtitle: 'Terminación inferior interna de pierna y ruedo',
          shortTag: 'Bota Interior'
        };
      } else {
        return {
          code,
          title: `[${code}] Delantero: Bajo / Bota Exterior & Dobladillo`,
          subtitle: 'Terminación inferior externa de pierna y ruedo',
          shortTag: 'Bota Exterior'
        };
      }
    } else {
      if (col === 0) {
        return {
          code,
          title: `[${code}] Delantero: Entrepierna & Rodilla Interior`,
          subtitle: 'Línea de entrepierna interior y piquete de rodilla',
          shortTag: 'Entrepierna Rodilla'
        };
      } else {
        return {
          code,
          title: `[${code}] Delantero: Costado Lateral & Rodilla Exterior`,
          subtitle: 'Línea lateral exterior y aplomo de pierna',
          shortTag: 'Rodilla Costado'
        };
      }
    }
  } else {
    // TRASERO
    if (row === 0) {
      if (col === 0) {
        return {
          code,
          title: `[${code}] Trasero: Cintura Alta & Tiro Superior`,
          subtitle: 'Inclinación anatómica de espalda para soporte lumbar',
          shortTag: 'Cintura Alta'
        };
      } else if (col === 1) {
        return {
          code,
          title: `[${code}] Trasero: Cintura Trasera & Pinza Anatómica`,
          subtitle: 'Pinza trasera de entalle y curvatura de pretina',
          shortTag: 'Pinza Trasera'
        };
      } else {
        return {
          code,
          title: `[${code}] Trasero: Costado Superior & Curva de Cadera`,
          subtitle: 'Costado lateral que une cadera trasera con delantera',
          shortTag: 'Cadera Trasera'
        };
      }
    } else if (row === 1) {
      if (col === 0) {
        return {
          code,
          title: `[${code}] Trasero: Tiro Profundo & Gancho de Asiento`,
          subtitle: 'Extensión anatómica que da capacidad y forma a los glúteos',
          shortTag: 'Tiro Asiento'
        };
      } else if (col === 1) {
        return {
          code,
          title: `[${code}] Trasero: Centro de Asiento & Hilo de Tela`,
          subtitle: 'Eje de aplomo y caída de tela en la parte trasera',
          shortTag: 'Centro Trasero'
        };
      } else {
        return {
          code,
          title: `[${code}] Trasero: Costado Exterior & Bajada de Cadera`,
          subtitle: 'Línea lateral de unión hacia la rodilla',
          shortTag: 'Costado Trasero'
        };
      }
    } else if (row === totalRows - 1) {
      if (col === 0) {
        return {
          code,
          title: `[${code}] Trasero: Bajo / Bota Interior & Dobladillo`,
          subtitle: 'Dobladillo inferior interno de la pierna trasera',
          shortTag: 'Bota Trasera Int.'
        };
      } else {
        return {
          code,
          title: `[${code}] Trasero: Bajo / Bota Exterior & Dobladillo`,
          subtitle: 'Dobladillo inferior externo de la pierna trasera',
          shortTag: 'Bota Trasera Ext.'
        };
      }
    } else {
      if (col === 0) {
        return {
          code,
          title: `[${code}] Trasero: Entrepierna Trasera & Rodilla Interior`,
          subtitle: 'Línea de entrepierna que se cose con el delantero',
          shortTag: 'Entrepierna Trasera'
        };
      } else {
        return {
          code,
          title: `[${code}] Trasero: Costado Trasero & Rodilla Exterior`,
          subtitle: 'Línea lateral exterior a nivel de rodilla',
          shortTag: 'Rodilla Trasera'
        };
      }
    }
  }
}

export interface ActiveTileInfo {
  sheetNumber: number;
  pieceType: 'front' | 'back';
  pieceName: string;
  code: string;
  row: number;
  col: number;
  totalRows: number;
  totalCols: number;
  xTileMin: number;
  xTileMax: number;
  yTileMin: number;
  yTileMax: number;
  title: string;
  subtitle: string;
  shortTag: string;
}

// Calcula de manera exacta el desglose de hojas necesarias (excluyendo hojas vacías)
export function getPatternTilingSummary(measurements: PatternMeasurements, silhouette: SilhouetteType) {
  const patternData = calculatePantsPattern(measurements, silhouette);
  const frontGeom = extractPieceGeometry('front', patternData, measurements, silhouette);
  const backGeom  = extractPieceGeometry('back',  patternData, measurements, silhouette);

  function getActiveTilesForPiece(geom: PieceGeometry, startSheetNum: number): { tiles: ActiveTileInfo[]; totalCols: number; totalRows: number } {
    // Alineación directa a las cotas reales para evitar columnas o filas extra innecesarias
    const originX = geom.bounds.minX;
    const originY = geom.bounds.minY;
    const totalW = geom.bounds.maxX - geom.bounds.minX;
    const totalH = geom.bounds.maxY - geom.bounds.minY;

    const cols = Math.max(1, Math.ceil(totalW / TILE_W));
    const rows = Math.max(1, Math.ceil(totalH / TILE_H));

    const activeTiles: ActiveTileInfo[] = [];
    let currentSheet = startSheetNum;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const xTileMin = originX + c * TILE_W;
        const xTileMax = xTileMin + TILE_W;
        const yTileMin = originY + r * TILE_H;
        const yTileMax = yTileMin + TILE_H;

        if (tileHasActualContent(geom, xTileMin, yTileMin, xTileMax, yTileMax)) {
          const desc = getTileAnatomicalDescription(r, c, rows, cols, geom.pieceType);
          activeTiles.push({
            sheetNumber: currentSheet++,
            pieceType: geom.pieceType,
            pieceName: geom.name,
            code: desc.code,
            row: r,
            col: c,
            totalRows: rows,
            totalCols: cols,
            xTileMin,
            xTileMax,
            yTileMin,
            yTileMax,
            title: desc.title,
            subtitle: desc.subtitle,
            shortTag: desc.shortTag
          });
        }
      }
    }

    return { tiles: activeTiles, totalCols: cols, totalRows: rows };
  }

  const frontResult = getActiveTilesForPiece(frontGeom, 1);
  const backResult  = getActiveTilesForPiece(backGeom, frontResult.tiles.length + 1);

  return {
    frontTiles: frontResult.tiles,
    backTiles: backResult.tiles,
    totalFrontSheets: frontResult.tiles.length,
    totalBackSheets: backResult.tiles.length,
    totalSheets: frontResult.tiles.length + backResult.tiles.length,
    frontGrid: { cols: frontResult.totalCols, rows: frontResult.totalRows },
    backGrid: { cols: backResult.totalCols, rows: backResult.totalRows }
  };
}

// ══════════════════════════════════════════════════════════════════
// EXPORTADOR PRINCIPAL: MOLDE PDF A ESCALA REAL 1:1 EN HOJAS A4
// ══════════════════════════════════════════════════════════════════
export function exportPatternToPdf(measurements: PatternMeasurements, silhouette: SilhouetteType) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const preset = SILHOUETTES[silhouette];
  const patternData = calculatePantsPattern(measurements, silhouette);
  const dateStr = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  const frontGeom = extractPieceGeometry('front', patternData, measurements, silhouette);
  const backGeom  = extractPieceGeometry('back',  patternData, measurements, silhouette);

  const summary = getPatternTilingSummary(measurements, silhouette);
  const { frontTiles, backTiles, totalSheets, totalFrontSheets, totalBackSheets } = summary;

  // ══════════════════════════════════════════════════════════════════
  // PÁGINA 1: FICHA TÉCNICA E ÍNDICE DE HOJAS CON GUÍA DE ENSAMBLAJE
  // ══════════════════════════════════════════════════════════════════
  // Fondo lino editorial
  doc.setFillColor(248, 245, 240);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  // Marco editorial sastre
  doc.setDrawColor(28, 25, 22);
  doc.setLineWidth(0.3);
  doc.rect(8, 8, 194, 281, 'S');
  doc.setDrawColor(193, 68, 14);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, 190, 277, 'S');

  // Encabezado editorial
  doc.setTextColor(193, 68, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('I N E F A B L E   •   A T E L I E R   D E   P A T R O N A J E   S A S T R E', 105, 17, { align: 'center' });

  doc.setTextColor(28, 25, 22);
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.text('MOLDE TÉCNICO A ESCALA REAL 1:1', 105, 24, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(90, 82, 73);
  doc.text(`Silueta: ${preset.name.toUpperCase()}  |  Total Hojas de Corte: ${totalSheets} Hojas A4  |  ${dateStr}`, 105, 29.5, { align: 'center' });

  doc.setDrawColor(193, 68, 14);
  doc.setLineWidth(0.4);
  doc.line(16, 33, 194, 33);

  // Cuadro de Calibración 26 x 26 mm
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 36, 182, 28, 2, 2, 'F');
  doc.setDrawColor(193, 68, 14);
  doc.setLineWidth(0.6);
  doc.rect(20, 39, 22, 22, 'S');

  // Cruz métrica interior de comprobación
  doc.setLineWidth(0.2);
  doc.line(20, 50, 42, 50);
  doc.line(31, 39, 31, 61);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(193, 68, 14);
  doc.text('TEST DE CALIBRACIÓN DE IMPRESIÓN (22 × 22 mm)', 48, 45);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(50, 45, 40);
  doc.text('1. Al imprimir, seleccione «Escala 100%» o «Tamaño Real» (desactive «Ajustar a página»).', 48, 50);
  doc.text('2. Compruebe con una regla el recuadro de la izquierda: debe medir exactamente 22 × 22 mm.', 48, 54.5);
  doc.text('3. Esto garantiza que el pantalón se confeccionará exactamente con tus medidas corporales reales.', 48, 59);

  // Tabla de Medidas Corporales Aplicadas
  doc.setFillColor(255, 253, 250);
  doc.roundedRect(14, 68, 182, 27, 2, 2, 'F');
  doc.setDrawColor(210, 200, 190);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 68, 182, 27, 2, 2, 'S');

  doc.setFillColor(193, 68, 14);
  doc.rect(14, 68, 182, 5.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text('COTAS Y MEDIDAS PARAMÉTRICAS APLICADAS', 18, 72);

  const measureItems = [
    { label: 'Cintura:', val: `${measurements.waist} cm` },
    { label: 'Cadera:', val: `${measurements.hip} cm` },
    { label: 'Tiro:', val: `${measurements.crotchDepth} cm` },
    { label: 'Largo Total:', val: `${measurements.legLength} cm` },
    { label: 'Rodilla:', val: `${measurements.kneeWidth} cm` },
    { label: 'Bota / Bajo:', val: `${measurements.bottomWidth} cm` }
  ];

  measureItems.forEach((it, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 18 + col * 60;
    const y = 80 + row * 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(80, 70, 60);
    doc.text(it.label, x, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(193, 68, 14);
    doc.text(it.val, x + 24, y);
  });

  // ══════════════════════════════════════════════════════════════════
  // ÍNDICE EXACTO DE HOJAS CON CÓDIGOS DE CUADRÍCULA (A1, B1...)
  // ══════════════════════════════════════════════════════════════════
  doc.setFillColor(255, 253, 250);
  doc.roundedRect(14, 99, 182, 148, 2, 2, 'F');
  doc.setDrawColor(210, 200, 190);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 99, 182, 148, 2, 2, 'S');

  doc.setFillColor(28, 25, 22);
  doc.rect(14, 99, 182, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`ÍNDICE DE HOJAS Y MAPA DE MONTAJE (${totalSheets} HOJAS A4 DE CORTE EN TOTAL)`, 18, 103.5);

  // Columna Izquierda: DELANTERO
  const colLeftX = 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(193, 68, 14);
  doc.text(`PIEZA 1: DELANTERO (${totalFrontSheets} Hojas A4)`, colLeftX, 112);

  const maxSheetsCol = Math.max(frontTiles.length, backTiles.length);
  const rowHeight = Math.min(13, 126 / Math.max(1, maxSheetsCol));

  frontTiles.forEach((tile, i) => {
    const y = 118 + i * rowHeight;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(193, 68, 14);
    doc.setLineWidth(0.25);
    doc.roundedRect(colLeftX, y - 3, 85, rowHeight - 2, 1, 1, 'FD');

    // Código A1, B1 destacado
    doc.setFillColor(193, 68, 14);
    doc.roundedRect(colLeftX + 2, y - 1.5, 7.5, 5.5, 0.5, 0.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.text(tile.code, colLeftX + 5.75, y + 2.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(28, 25, 22);
    doc.text(`Hoja ${tile.sheetNumber}: ${tile.shortTag}`, colLeftX + 11.5, y + 1);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(100, 90, 80);
    doc.text(tile.subtitle, colLeftX + 11.5, y + 5);
  });

  // Columna Derecha: TRASERO
  const colRightX = 107;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(193, 68, 14);
  doc.text(`PIEZA 2: TRASERO (${totalBackSheets} Hojas A4)`, colRightX, 112);

  backTiles.forEach((tile, i) => {
    const y = 118 + i * rowHeight;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(193, 68, 14);
    doc.setLineWidth(0.25);
    doc.roundedRect(colRightX, y - 3, 85, rowHeight - 2, 1, 1, 'FD');

    // Código A1, B1 destacado
    doc.setFillColor(28, 25, 22);
    doc.roundedRect(colRightX + 2, y - 1.5, 7.5, 5.5, 0.5, 0.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.text(tile.code, colRightX + 5.75, y + 2.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(28, 25, 22);
    doc.text(`Hoja ${tile.sheetNumber}: ${tile.shortTag}`, colRightX + 11.5, y + 1);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(100, 90, 80);
    doc.text(tile.subtitle, colRightX + 11.5, y + 5);
  });

  // Instrucción clara al pie de la portada
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 251, 182, 31, 2, 2, 'F');
  doc.setDrawColor(193, 68, 14);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, 251, 182, 31, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(193, 68, 14);
  doc.text('GUÍA RÁPIDA DE CORTE Y MONTAJE (PARA PRINCIPIANTES):', 18, 257);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(60, 55, 50);
  doc.text('1. Cada hoja tiene un código único ([A1], [B1]...) y un mini-mapa en la esquina superior para saber exactamente dónde va.', 18, 262.5);
  doc.text('2. Recorte los bordes por la línea punteada de tijera (✂) y pegue con cinta haciendo coincidir las cruces (+).', 18, 267);
  doc.text('3. Las líneas negras continuas gruesas son las líneas de corte del pantalón (las líneas interiores son guías técnicas).', 18, 271.5);
  doc.text('4. En la última página de este documento encontrará el «Mapa General del Pantalón» con la guía paso a paso para coserlo.', 18, 276);

  // ══════════════════════════════════════════════════════════════════
  // HELPER: RENDERIZAR HOJA INDIVIDUAL A ESCALA REAL 1:1
  // ══════════════════════════════════════════════════════════════════
  function renderSingleTilePage(geom: PieceGeometry, tile: ActiveTileInfo) {
    const { xTileMin, xTileMax, yTileMin, yTileMax, sheetNumber, title, subtitle, code, row, col, totalRows, totalCols } = tile;

    // Transformación escala 1:1 directa (1 mm CAD = 1 mm papel)
    const toPdfX = (x: number) => MARGIN_X + (x - xTileMin);
    const toPdfY = (y: number) => MARGIN_Y + (y - yTileMin);

    doc.addPage('a4', 'portrait');

    // Fondo blanco puro para corte
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

    // ── CABECERA DESTACADA CON MINI-MAPA DE CUADRÍCULA INTEGRADO ──
    doc.setFillColor(248, 245, 240);
    doc.roundedRect(MARGIN_X, 4, TILE_W, 12, 1, 1, 'F');
    doc.setDrawColor(193, 68, 14);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN_X, 4, TILE_W, 12, 1, 1, 'S');

    // Código de hoja [A1], [B1] destacado en caja terracotta
    doc.setFillColor(geom.pieceType === 'front' ? 193 : 28, geom.pieceType === 'front' ? 68 : 25, geom.pieceType === 'front' ? 14 : 22);
    doc.roundedRect(MARGIN_X + 3, 5.5, 10, 8.5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(code, MARGIN_X + 8, 11, { align: 'center' });

    doc.setTextColor(193, 68, 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.text(`HOJA ${sheetNumber} DE ${totalSheets}: ${title.toUpperCase()}`, MARGIN_X + 15, 9.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(90, 80, 70);
    doc.text(`${subtitle}  |  Escala 100% Real (1 mm = 1 mm)`, MARGIN_X + 15, 13.5);

    // ── MINI-MAPA DE POSICIÓN EN LA ESQUINA SUPERIOR DERECHA ──
    const mapW = 28;
    const mapH = 9.5;
    const mapX = PAGE_W - MARGIN_X - mapW - 2;
    const mapY = 5.25;
    const cellW = mapW / totalCols;
    const cellH = mapH / totalRows;

    for (let r = 0; r < totalRows; r++) {
      for (let c = 0; c < totalCols; c++) {
        const cx = mapX + c * cellW;
        const cy = mapY + r * cellH;
        const isCurrent = r === row && c === col;
        const cellCode = `${String.fromCharCode(65 + c)}${r + 1}`;

        if (isCurrent) {
          doc.setFillColor(193, 68, 14);
          doc.rect(cx, cy, cellW, cellH, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(4.8);
          doc.text(cellCode, cx + cellW / 2, cy + cellH / 2 + 1.4, { align: 'center' });
        } else {
          doc.setFillColor(255, 255, 255);
          doc.rect(cx, cy, cellW, cellH, 'FD');
          doc.setTextColor(130, 120, 110);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(4.2);
          doc.text(cellCode, cx + cellW / 2, cy + cellH / 2 + 1.2, { align: 'center' });
        }
      }
    }

    // ── MARCO GUÍA DE CORTE / SOLAPADO DE TIJERA ──
    doc.setDrawColor(180, 175, 170);
    doc.setLineWidth(0.25);
    doc.setLineDashPattern([2, 2], 0);
    doc.rect(MARGIN_X, MARGIN_Y + 2, TILE_W, TILE_H - 2, 'S');
    doc.setLineDashPattern([], 0);

    // Texto de tijera
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(5.5);
    doc.setTextColor(150, 140, 130);
    doc.text('✂ Línea de recorte y unión con cinta adhesiva', MARGIN_X + 15, MARGIN_Y + 1.2);

    // Indicadores cardinales de unión exactos con códigos de hojas adyacentes
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(130, 100, 80);

    if (row > 0) {
      const prevCode = `${String.fromCharCode(65 + col)}${row}`;
      doc.text(`▲ PEGAR CON HOJA [${prevCode}] ARRIBA ▲`, MARGIN_X + TILE_W / 2, MARGIN_Y + 5.5, { align: 'center' });
    }
    if (row < totalRows - 1) {
      const nextCode = `${String.fromCharCode(65 + col)}${row + 2}`;
      doc.text(`▼ PEGAR CON HOJA [${nextCode}] ABAJO ▼`, MARGIN_X + TILE_W / 2, MARGIN_Y + TILE_H - 1.2, { align: 'center' });
    }
    if (col > 0) {
      const leftCode = `${String.fromCharCode(65 + col - 1)}${row + 1}`;
      doc.text(`◄ PEGAR CON HOJA [${leftCode}] IZQUIERDA`, MARGIN_X + 2, MARGIN_Y + TILE_H / 2, { angle: 90 });
    }
    if (col < totalCols - 1) {
      const rightCode = `${String.fromCharCode(65 + col + 1)}${row + 1}`;
      doc.text(`PEGAR CON HOJA [${rightCode}] DERECHA ►`, MARGIN_X + TILE_W - 2, MARGIN_Y + TILE_H / 2, { angle: -90 });
    }

    // Cruces de registro (+) en esquinas y centros de unión
    const crossPoints = [
      { x: MARGIN_X, y: MARGIN_Y + 2 },
      { x: MARGIN_X + TILE_W, y: MARGIN_Y + 2 },
      { x: MARGIN_X, y: MARGIN_Y + TILE_H },
      { x: MARGIN_X + TILE_W, y: MARGIN_Y + TILE_H },
      { x: MARGIN_X + TILE_W / 2, y: MARGIN_Y + 2 },
      { x: MARGIN_X + TILE_W / 2, y: MARGIN_Y + TILE_H },
      { x: MARGIN_X, y: MARGIN_Y + TILE_H / 2 },
      { x: MARGIN_X + TILE_W, y: MARGIN_Y + TILE_H / 2 }
    ];

    doc.setDrawColor(193, 68, 14);
    doc.setLineWidth(0.35);
    crossPoints.forEach((cor) => {
      doc.line(cor.x - 3.5, cor.y, cor.x + 3.5, cor.y);
      doc.line(cor.x, cor.y - 3.5, cor.x, cor.y + 3.5);
    });

    // ── LÍNEAS ANATÓMICAS DE NIVEL DE SASTRERÍA ──
    doc.setDrawColor(14, 165, 233);
    doc.setLineWidth(0.25);
    doc.setLineDashPattern([3, 2], 0);

    geom.levels.forEach((lvl) => {
      if (lvl.y >= yTileMin && lvl.y <= yTileMax) {
        const py = toPdfY(lvl.y);
        doc.line(MARGIN_X, py, MARGIN_X + TILE_W, py);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.8);
        doc.setTextColor(2, 132, 199);
        doc.text(`--- ${lvl.name} ---`, MARGIN_X + 6, py - 1.5);
      }
    });
    doc.setLineDashPattern([], 0);

    // ── LÍNEA DE APLOMO / HILO DE TELA A ESCALA REAL ──
    const glClipped = clipLineSegment(
      geom.grainLine.x1, geom.grainLine.y1,
      geom.grainLine.x2, geom.grainLine.y2,
      xTileMin, yTileMin, xTileMax, yTileMax
    );

    if (glClipped) {
      doc.setDrawColor(2, 132, 199);
      doc.setLineWidth(0.5);
      const [gx1, gy1, gx2, gy2] = glClipped;
      doc.line(toPdfX(gx1), toPdfY(gy1), toPdfX(gx2), toPdfY(gy2));

      doc.setFillColor(2, 132, 199);
      const midY = (toPdfY(gy1) + toPdfY(gy2)) / 2;
      const gx = toPdfX(gx1);
      doc.triangle(gx, midY - 5, gx - 2, midY - 1.5, gx + 2, midY - 1.5, 'F');
      doc.triangle(gx, midY + 5, gx - 2, midY + 1.5, gx + 2, midY + 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.8);
      doc.setTextColor(2, 132, 199);
      doc.text('▲  HILO DE TELA (APLOMO - PARALELO AL ORILLO)  ▲', gx + 3, midY, { angle: 90 });
    }

    // ── PINZAS DE CINTURA (DARTS) A ESCALA REAL ──
    doc.setDrawColor(28, 25, 22);
    doc.setLineWidth(0.45);
    geom.dartSegments.forEach((seg) => {
      const clipped = clipLineSegment(seg.x1, seg.y1, seg.x2, seg.y2, xTileMin, yTileMin, xTileMax, yTileMax);
      if (clipped) {
        doc.line(toPdfX(clipped[0]), toPdfY(clipped[1]), toPdfX(clipped[2]), toPdfY(clipped[3]));
      }
    });

    // ── CONTORNO PERIMETRAL DEL PATRÓN A ESCALA REAL (LÍNEA PRINCIPAL DE CORTE) ──
    doc.setDrawColor(28, 25, 22);
    doc.setLineWidth(0.9);

    geom.perimeterSegments.forEach((seg) => {
      const clipped = clipLineSegment(seg.x1, seg.y1, seg.x2, seg.y2, xTileMin, yTileMin, xTileMax, yTileMax);
      if (clipped) {
        doc.line(toPdfX(clipped[0]), toPdfY(clipped[1]), toPdfX(clipped[2]), toPdfY(clipped[3]));
      }
    });

    // ── PIQUETES DE COSTURA (NOTCHES) A ESCALA REAL ──
    doc.setDrawColor(193, 68, 14);
    doc.setLineWidth(0.5);
    geom.notches.forEach((n) => {
      if (n.x >= xTileMin && n.x <= xTileMax && n.y >= yTileMin && n.y <= yTileMax) {
        const nx = toPdfX(n.x);
        const ny = toPdfY(n.y);
        doc.line(nx - 3, ny, nx + 3, ny);
        doc.line(nx, ny - 3, nx, ny + 3);
      }
    });

    // ── PUNTOS TÉCNICOS NUMERADOS (1 al 19) CON EXPLICACIÓN ANATÓMICA ──
    geom.labelPoints.forEach((pt) => {
      if (!pt.label) return;
      if (pt.x >= xTileMin && pt.x <= xTileMax && pt.y >= yTileMin && pt.y <= yTileMax) {
        const px = toPdfX(pt.x);
        const py = toPdfY(pt.y);

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(193, 68, 14);
        doc.setLineWidth(0.35);
        doc.circle(px, py, 2.6, 'FD');

        doc.setTextColor(193, 68, 14);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.text(pt.label, px, py + 2, { align: 'center' });

        const desc = ANATOMICAL_POINT_DESCRIPTIONS[pt.label];
        if (desc) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(4.8);
          doc.setTextColor(110, 100, 90);
          doc.text(desc, px, py + 5.6, { align: 'center' });
        }
      }
    });

    // Aclaración directa en la hoja para evitar cualquier confusión de corte
    doc.setFillColor(250, 248, 245);
    doc.rect(MARGIN_X, PAGE_H - 8.5, TILE_W, 6, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(90, 80, 70);
    doc.text('✂ LÍNEA NEGRA CONTINUA GRUESA = Línea de corte en tela (dejar 1 cm de margen). | Círculos numerados = Puntos técnicos de referencia.', MARGIN_X + 2, PAGE_H - 4.5);
  }

  // 1. RENDERIZAR HOJAS A4 DEL DELANTERO
  frontTiles.forEach((tile) => {
    renderSingleTilePage(frontGeom, tile);
  });

  // ══════════════════════════════════════════════════════════════════
  // PÁGINA SEPARADORA DE TRANSICIÓN: VIENE EL TRASERO
  // ══════════════════════════════════════════════════════════════════
  doc.addPage('a4', 'portrait');
  doc.setFillColor(248, 245, 240);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  doc.setDrawColor(28, 25, 22);
  doc.setLineWidth(0.3);
  doc.rect(10, 10, 190, 277, 'S');
  doc.setDrawColor(193, 68, 14);
  doc.setLineWidth(0.8);
  doc.rect(12, 12, 186, 273, 'S');

  // Insignia central
  doc.setFillColor(193, 68, 14);
  doc.roundedRect(65, 65, 80, 12, 100, 100, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('SIGUIENTE SECCIÓN DEL MOLDE', 105, 73, { align: 'center' });

  doc.setTextColor(28, 25, 22);
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.text('PIEZA 2: TRASERO (ESPALDA)', 105, 96, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(193, 68, 14);
  doc.text('MOLDE COMPLETO A ESCALA REAL 1:1', 105, 106, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(90, 80, 70);
  doc.text('Ha finalizado la sección del Delantero. Las siguientes hojas contienen el molde', 105, 116, { align: 'center' });
  doc.text('completo de la espalda / trasero a escala 100% real (con tiro profundo y cintura anatómica).', 105, 122, { align: 'center' });

  doc.setDrawColor(193, 68, 14);
  doc.setLineWidth(0.4);
  doc.line(40, 130, 170, 130);

  // Cuadro resumen del Trasero
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(26, 138, 158, 98, 2, 2, 'F');
  doc.setDrawColor(210, 200, 190);
  doc.setLineWidth(0.3);
  doc.roundedRect(26, 138, 158, 98, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(193, 68, 14);
  doc.text(`HOJAS DEL TRASERO (TOTAL: ${totalBackSheets} HOJAS A4):`, 32, 147);

  const backSpacing = Math.min(8.5, 78 / Math.max(1, backTiles.length));
  backTiles.forEach((tile, idx) => {
    const y = 155 + idx * backSpacing;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(28, 25, 22);
    doc.text(`• [${tile.code}] Hoja ${tile.sheetNumber}:`, 32, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 60, 50);
    doc.text(`${tile.shortTag} (${tile.subtitle})`, 58, y);
  });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 110, 100);
  doc.text('IMPORTANTE: Cortar 2 piezas en tela en espejo (cara contra cara).', 105, 252, { align: 'center' });

  // 2. RENDERIZAR HOJAS A4 DEL TRASERO
  backTiles.forEach((tile) => {
    renderSingleTilePage(backGeom, tile);
  });

  // ══════════════════════════════════════════════════════════════════
  // PÁGINA FINAL: GUÍA MAESTRA DE ENSAMBLAJE Y RESULTADO DEL PANTALÓN
  // (PETICIÓN EXPLÍCITA DEL USUARIO: CÓMO DEBE VERSE Y CÓMO SE UNE)
  // ══════════════════════════════════════════════════════════════════
  renderFinalGarmentGuidePage(
    doc,
    measurements,
    silhouette,
    frontGeom,
    backGeom,
    summary
  );

  // ══════════════════════════════════════════════════════════════════
  // GUARDAR Y DESCARGAR ARCHIVO PDF COMPILADO
  // ══════════════════════════════════════════════════════════════════
  const filename = `Inefable-Molde-Escala-Real-${silhouette}-${measurements.waist}w-${measurements.legLength}l.pdf`;
  doc.save(filename);
}

// ══════════════════════════════════════════════════════════════════
// FUNCIÓN DEDICADA: HOJA FINAL DE ENSAMBLAJE Y RESULTADO DEL PANTALÓN
// ══════════════════════════════════════════════════════════════════
function renderFinalGarmentGuidePage(
  doc: jsPDF,
  measurements: PatternMeasurements,
  silhouette: SilhouetteType,
  frontGeom: PieceGeometry,
  backGeom: PieceGeometry,
  summary: ReturnType<typeof getPatternTilingSummary>
) {
  doc.addPage('a4', 'portrait');

  // Fondo lino editorial
  doc.setFillColor(248, 245, 240);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  // Marco editorial sastre
  doc.setDrawColor(28, 25, 22);
  doc.setLineWidth(0.3);
  doc.rect(8, 8, 194, 281, 'S');
  doc.setDrawColor(193, 68, 14);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, 190, 277, 'S');

  // ENCABEZADO
  doc.setTextColor(193, 68, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('I N E F A B L E   •   G U Í A   M A E S T R A   D E   C O N F E C C I Ó N   P A S O   A   P A S O', 105, 17, { align: 'center' });

  doc.setTextColor(28, 25, 22);
  doc.setFont('times', 'bold');
  doc.setFontSize(15);
  doc.text('MAPA GENERAL DEL PANTALÓN: PIEZAS 1 Y 2 Y ENSAMBLAJE FINAL', 105, 23.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(90, 82, 73);
  doc.text(`Silueta: ${SILHOUETTES[silhouette].name}  |  Cintura: ${measurements.waist} cm  |  Cadera: ${measurements.hip} cm  |  Largo: ${measurements.legLength} cm`, 105, 28, { align: 'center' });
  doc.setFontSize(6.2);
  doc.setTextColor(120, 110, 100);
  doc.text('Visualización completa de cómo deben verse tus moldes recortados, qué función cumple cada parte y cómo se cosen.', 105, 31.5, { align: 'center' });

  doc.setDrawColor(193, 68, 14);
  doc.setLineWidth(0.4);
  doc.line(16, 33.5, 194, 33.5);

  // ══════════════════════════════════════════════════════════════════
  // SECCIÓN SUPERIOR: DIBUJO VECTORIAL DE LAS DOS PIEZAS SEPARADAS
  // ══════════════════════════════════════════════════════════════════
  const cardY = 35;
  const cardH = 136;
  const cardW = 89;

  // Escala para ajustar la silueta del pantalón (alto ~1050mm) dentro de una tarjeta de ~92mm
  const scale = 0.088;

  // ── TARJETA 1: PARTE 1 — DELANTERO (FRENTE) ──
  const frontCardX = 14;
  doc.setFillColor(255, 253, 250);
  doc.roundedRect(frontCardX, cardY, cardW, cardH, 2, 2, 'F');
  doc.setDrawColor(193, 68, 14);
  doc.setLineWidth(0.4);
  doc.roundedRect(frontCardX, cardY, cardW, cardH, 2, 2, 'S');

  // Cabecera Parte 1
  doc.setFillColor(193, 68, 14);
  doc.rect(frontCardX, cardY, cardW, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('PARTE 1: DELANTERO (FRENTE)', frontCardX + cardW / 2, cardY + 4.5, { align: 'center' });

  // Subtítulo e instrucciones de corte
  doc.setTextColor(28, 25, 22);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('✂ CORTAR 2 PIEZAS EN TELA (Frente Izq. y Der.)', frontCardX + 4, cardY + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(110, 90, 80);
  doc.text(`Compuesto por las Hojas 1 a ${summary.totalFrontSheets} de este PDF`, frontCardX + 4, cardY + 15.5);

  // DIBUJO VECTORIAL A ESCALA DEL DELANTERO
  const frontBoxCenterX = frontCardX + 42;
  const frontBoxTopY = cardY + 22;
  const fMidX = (frontGeom.bounds.minX + frontGeom.bounds.maxX) / 2;
  const fMinY = frontGeom.bounds.minY;

  const toFrontFigX = (x: number) => frontBoxCenterX + (x - fMidX) * scale;
  const toFrontFigY = (y: number) => frontBoxTopY + (y - fMinY) * scale;

  // Silueta contorno
  doc.setDrawColor(28, 25, 22);
  doc.setLineWidth(0.65);
  frontGeom.perimeterSegments.forEach((seg) => {
    doc.line(toFrontFigX(seg.x1), toFrontFigY(seg.y1), toFrontFigX(seg.x2), toFrontFigY(seg.y2));
  });

  // Pinza delantera
  doc.setDrawColor(193, 68, 14);
  doc.setLineWidth(0.4);
  frontGeom.dartSegments.forEach((seg) => {
    doc.line(toFrontFigX(seg.x1), toFrontFigY(seg.y1), toFrontFigX(seg.x2), toFrontFigY(seg.y2));
  });

  // Hilo de tela
  doc.setDrawColor(2, 132, 199);
  doc.setLineWidth(0.35);
  doc.line(
    toFrontFigX(frontGeom.grainLine.x1), toFrontFigY(frontGeom.grainLine.y1),
    toFrontFigX(frontGeom.grainLine.x2), toFrontFigY(frontGeom.grainLine.y2)
  );

  // Llamadas pedagógicas en el Delantero
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.2);

  // 1. Cintura
  doc.setTextColor(193, 68, 14);
  doc.text('① Cintura con Pinza', frontCardX + 6, cardY + 21);

  // 2. Tiro Delantero
  doc.setTextColor(185, 28, 28);
  const crotchFigY = toFrontFigY(frontGeom.levels[2].y);
  doc.text('② Tiro Frontal (Corto)', frontCardX + 4, crotchFigY - 2);

  // 3. Entrepierna
  doc.setTextColor(2, 132, 199);
  doc.text('③ Entrepierna ➔', frontCardX + 4, crotchFigY + 20);

  // 4. Costado
  doc.setTextColor(16, 149, 106);
  doc.text('④ Costado Exterior', frontCardX + cardW - 24, crotchFigY + 10);

  // 5. Dobladillo
  doc.setTextColor(120, 100, 80);
  doc.text('⑤ Bota / Ruedo', frontCardX + 28, cardY + cardH - 12);

  // Caja resumen del Delantero
  doc.setFillColor(245, 240, 235);
  doc.rect(frontCardX + 3, cardY + cardH - 10, cardW - 6, 8, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(70, 60, 50);
  doc.text('• Tiro corto anatómico que cae suave en el frente.', frontCardX + 5, cardY + cardH - 6.5);
  doc.text('• La pinza entalla la cintura; al coserla da forma al abdomen.', frontCardX + 5, cardY + cardH - 3.5);


  // ── TARJETA 2: PARTE 2 — TRASERO (ESPALDA) ──
  const backCardX = 107;
  doc.setFillColor(255, 253, 250);
  doc.roundedRect(backCardX, cardY, cardW, cardH, 2, 2, 'F');
  doc.setDrawColor(28, 25, 22);
  doc.setLineWidth(0.4);
  doc.roundedRect(backCardX, cardY, cardW, cardH, 2, 2, 'S');

  // Cabecera Parte 2
  doc.setFillColor(28, 25, 22);
  doc.rect(backCardX, cardY, cardW, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('PARTE 2: TRASERO (ESPALDA)', backCardX + cardW / 2, cardY + 4.5, { align: 'center' });

  // Subtítulo e instrucciones de corte
  doc.setTextColor(28, 25, 22);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('✂ CORTAR 2 PIEZAS EN ESPEJO (Cara contra cara)', backCardX + 4, cardY + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(110, 90, 80);
  doc.text(`Compuesto por las Hojas ${summary.totalFrontSheets + 1} a ${summary.totalSheets} de este PDF`, backCardX + 4, cardY + 15.5);

  // DIBUJO VECTORIAL A ESCALA DEL TRASERO
  const backBoxCenterX = backCardX + 44;
  const backBoxTopY = cardY + 22;
  const bMidX = (backGeom.bounds.minX + backGeom.bounds.maxX) / 2;
  const bMinY = backGeom.bounds.minY;

  const toBackFigX = (x: number) => backBoxCenterX + (x - bMidX) * scale;
  const toBackFigY = (y: number) => backBoxTopY + (y - bMinY) * scale;

  // Silueta contorno
  doc.setDrawColor(28, 25, 22);
  doc.setLineWidth(0.65);
  backGeom.perimeterSegments.forEach((seg) => {
    doc.line(toBackFigX(seg.x1), toBackFigY(seg.y1), toBackFigX(seg.x2), toBackFigY(seg.y2));
  });

  // Pinza trasera
  doc.setDrawColor(193, 68, 14);
  doc.setLineWidth(0.4);
  backGeom.dartSegments.forEach((seg) => {
    doc.line(toBackFigX(seg.x1), toBackFigY(seg.y1), toBackFigX(seg.x2), toBackFigY(seg.y2));
  });

  // Hilo de tela
  doc.setDrawColor(2, 132, 199);
  doc.setLineWidth(0.35);
  doc.line(
    toBackFigX(backGeom.grainLine.x1), toBackFigY(backGeom.grainLine.y1),
    toBackFigX(backGeom.grainLine.x2), toBackFigY(backGeom.grainLine.y2)
  );

  // Llamadas pedagógicas en el Trasero
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.2);

  // 1. Cintura Alta Inclinada
  doc.setTextColor(193, 68, 14);
  doc.text('① Cintura Alta Inclinada', backCardX + 4, cardY + 21);

  // 2. Tiro Trasero Profundo
  doc.setTextColor(185, 28, 28);
  const bCrotchFigY = toBackFigY(backGeom.levels[2].y);
  doc.text('② Tiro Profundo (Glúteos)', backCardX + 2, bCrotchFigY - 2);

  // 3. Entrepierna
  doc.setTextColor(2, 132, 199);
  doc.text('③ Entrepierna ➔', backCardX + 4, bCrotchFigY + 20);

  // 4. Costado
  doc.setTextColor(16, 149, 106);
  doc.text('④ Costado Exterior', backCardX + cardW - 24, bCrotchFigY + 10);

  // 5. Dobladillo
  doc.setTextColor(120, 100, 80);
  doc.text('⑤ Bota / Ruedo', backCardX + 30, cardY + cardH - 12);

  // Caja resumen del Trasero
  doc.setFillColor(245, 240, 235);
  doc.rect(backCardX + 3, cardY + cardH - 10, cardW - 6, 8, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(70, 60, 50);
  doc.text('• El tiro es más largo para dar volumen a los glúteos.', backCardX + 5, cardY + cardH - 6.5);
  doc.text('• La cintura sube inclinada para no bajarse al sentarse.', backCardX + 5, cardY + cardH - 3.5);


  // ══════════════════════════════════════════════════════════════════
  // SECCIÓN INFERIOR 1: CÓMO SE UNEN LAS DOS PIEZAS (MAPA DE COSTURAS)
  // ══════════════════════════════════════════════════════════════════
  const seamsY = 174;
  const seamsH = 43;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, seamsY, 182, seamsH, 2, 2, 'F');
  doc.setDrawColor(193, 68, 14);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, seamsY, 182, seamsH, 2, 2, 'S');

  doc.setFillColor(193, 68, 14);
  doc.rect(14, seamsY, 182, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text('CÓMO SE UNEN ENTRE SÍ LAS PIEZAS PARA ARMAR EL PANTALÓN (MAPA DE COSTURAS)', 18, seamsY + 4.2);

  const seamBoxes = [
    {
      step: 'A',
      color: [16, 149, 106] as [number, number, number], // Verde
      title: 'COSTADOS LATERALES (④ con ④)',
      desc: 'Enfrenta derecho con derecho la pieza del Delantero y la del Trasero. Cose todo el costado exterior desde la cintura hasta el bajo.'
    },
    {
      step: 'B',
      color: [2, 132, 199] as [number, number, number], // Azul
      title: 'ENTREPIERNAS (③ con ③)',
      desc: 'Cose la entrepierna interior uniendo el borde del Delantero con el del Trasero, desde la bota inferior hasta la punta de los tiros.'
    },
    {
      step: 'C',
      color: [185, 28, 28] as [number, number, number], // Rojo
      title: 'TIROS CENTRALES (② con ②)',
      desc: 'Introduce una pierna dentro de la otra (derecho con derecho) y cose en una sola pasada continua la U del tiro de adelante hacia atrás.'
    },
    {
      step: 'D',
      color: [193, 68, 14] as [number, number, number], // Terracotta
      title: 'CINTURA Y DOBLADILLOS (① y ⑤)',
      desc: 'Dobla 3 cm en la bota inferior para el dobladillo y cose con puntada recta. Coloca la pretina o banda elástica en la cintura.'
    }
  ];

  seamBoxes.forEach((sb, idx) => {
    const bx = 18 + (idx % 2) * 89;
    const by = seamsY + 8.5 + Math.floor(idx / 2) * 16.5;
    const bw = 85;
    const bh = 14.5;

    doc.setFillColor(250, 248, 245);
    doc.roundedRect(bx, by, bw, bh, 1, 1, 'F');
    doc.setDrawColor(sb.color[0], sb.color[1], sb.color[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(bx, by, bw, bh, 1, 1, 'S');

    // Círculo del paso
    doc.setFillColor(sb.color[0], sb.color[1], sb.color[2]);
    doc.circle(bx + 4.5, by + 4.5, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text(sb.step, bx + 4.5, by + 6, { align: 'center' });

    doc.setTextColor(sb.color[0], sb.color[1], sb.color[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text(sb.title, bx + 9.5, by + 5.2);

    doc.setTextColor(70, 60, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.9);
    doc.text(doc.splitTextToSize(sb.desc, bw - 11), bx + 9.5, by + 8.5);
  });


  // ══════════════════════════════════════════════════════════════════
  // SECCIÓN INFERIOR 2: GUÍA DE CORTE EN 5 PASOS PARA PRINCIPIANTES
  // ══════════════════════════════════════════════════════════════════
  const guideY = 220;
  const guideH = 61;
  doc.setFillColor(255, 253, 250);
  doc.roundedRect(14, guideY, 182, guideH, 2, 2, 'F');
  doc.setDrawColor(210, 200, 190);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, guideY, 182, guideH, 2, 2, 'S');

  doc.setFillColor(28, 25, 22);
  doc.rect(14, guideY, 182, 5.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('GUÍA PASO A PASO PARA QUIEN NUNCA HA HECHO UN PANTALÓN (DE LA HOJA A LA TELA):', 18, guideY + 3.8);

  const steps = [
    {
      num: '1',
      title: 'Armar el Puzzle de Hojas A4:',
      text: 'Recorta las hojas por la línea punteada de tijera (✂) y únelas con cinta adhesiva haciendo coincidir las cruces de registro (+) y los códigos de cuadrícula ([A1] con [B1], [A2] con [B2]...).'
    },
    {
      num: '2',
      title: 'Recortar los Dos Moldes Finales:',
      text: 'Una vez pegadas las hojas, corta con tijeras por la LÍNEA NEGRA CONTINUA GRUESA exterior. Obtendrás dos moldes gigantes: la PARTE 1 (Delantero) y la PARTE 2 (Trasero).'
    },
    {
      num: '3',
      title: 'Disponer sobre la Tela:',
      text: 'Dobla tu tela en dos a lo largo (derecho contra derecho hacia adentro). Coloca los moldes de papel encima asegurando que la flecha de «HILO DE TELA» quede exactamente paralela a la orilla de la tela. Sujeta con alfileres.'
    },
    {
      num: '4',
      title: 'Cortar la Tela con Margen de Costura:',
      text: 'Corta la tela dejando 1 cm extra alrededor de todo el contorno para poder coser (y 3 cm en la bota inferior para el dobladillo). Al tener la tela doblada, obtendrás automáticamente 2 delanteros y 2 traseros.'
    },
    {
      num: '5',
      title: 'Confección y Acabado:',
      text: '1) Cose las pinzas de cintura. 2) Cose costados exteriores y entrepiernas de cada pierna. 3) Une ambas piernas por el tiro en U continua. 4) Añade pretina o elástico en cintura y dobla el dobladillo inferior. ¡Listo!'
    }
  ];

  steps.forEach((st, idx) => {
    const y = guideY + 9 + idx * 10;
    doc.setFillColor(193, 68, 14);
    doc.roundedRect(18, y - 2.5, 5, 5, 0.5, 0.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text(st.num, 20.5, y + 1, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(28, 25, 22);
    doc.text(st.title, 25, y - 0.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.2);
    doc.setTextColor(80, 70, 60);
    doc.text(doc.splitTextToSize(st.text, 168), 25, y + 2.8);
  });
}

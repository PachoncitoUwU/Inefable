// PATRONAJE TÉCNICO DE PANTALÓN — SISTEMA PROFESIONAL DE 19 PUNTOS
// Geometría paramétrica exacta basada en el plano de taller de sastrería

export type SilhouetteType = 'baggy' | 'flare' | 'jogger' | 'cargo' | 'straight';

export interface PatternMeasurements {
  waist: number;
  hip: number;
  crotchDepth: number;
  legLength: number;
  kneeWidth: number;
  bottomWidth: number;
}

export interface SilhouettePreset {
  name: string;
  tagline: string;
  category: string;
  defaultMeasurements: PatternMeasurements;
  ease: { waist: number; hip: number; thigh: number };
}

export const SILHOUETTES: Record<SilhouetteType, SilhouettePreset> = {
  baggy: {
    name: 'Baggy / Wide Leg',
    tagline: 'Caída oversize con volumen generoso y bajo amplio.',
    category: 'Streetwear',
    defaultMeasurements: { waist: 82, hip: 106, crotchDepth: 30, legLength: 102, kneeWidth: 32, bottomWidth: 36 },
    ease: { waist: 4, hip: 16, thigh: 18 }
  },
  flare: {
    name: 'Campana / Flare',
    tagline: 'Ajustado en muslo, abre en campana progresiva desde la rodilla.',
    category: 'Editorial',
    defaultMeasurements: { waist: 78, hip: 96, crotchDepth: 28, legLength: 104, kneeWidth: 22, bottomWidth: 42 },
    ease: { waist: 2, hip: 8, thigh: 4 }
  },
  jogger: {
    name: 'Jogger Urbano',
    tagline: 'Tiro medio, pierna cónica con remate en tobillo.',
    category: 'Athleisure',
    defaultMeasurements: { waist: 80, hip: 100, crotchDepth: 30, legLength: 98, kneeWidth: 24, bottomWidth: 18 },
    ease: { waist: 6, hip: 12, thigh: 10 }
  },
  cargo: {
    name: 'Cargo Utilitario',
    tagline: 'Tiro alto estructurado, pierna recta funcional.',
    category: 'Técnico',
    defaultMeasurements: { waist: 84, hip: 108, crotchDepth: 32, legLength: 102, kneeWidth: 28, bottomWidth: 28 },
    ease: { waist: 5, hip: 18, thigh: 14 }
  },
  straight: {
    name: 'Recto Clásico',
    tagline: 'Corte sastrería depurado. Caída recta y uniforme.',
    category: 'Sastrería',
    defaultMeasurements: { waist: 78, hip: 96, crotchDepth: 28, legLength: 102, kneeWidth: 26, bottomWidth: 26 },
    ease: { waist: 2, hip: 8, thigh: 6 }
  }
};

export interface PatternPoint {
  x: number;
  y: number;
  label?: string;
}

export interface PatternData {
  front: PatternPoint[];
  back: PatternPoint[];
  frontSvgPath: string;
  backSvgPath: string;
  frontDartPath: string;
  backDartPath: string;
  grainLineFront: { x1: number; y1: number; x2: number; y2: number };
  grainLineBack: { x1: number; y1: number; x2: number; y2: number };
  notches: PatternPoint[];
  dimensions: { width: number; height: number };
  labelPoints: { front: PatternPoint[]; back: PatternPoint[] };
  gridBoxes: {
    front: { x: number; y: number; width: number; height: number };
    back: { x: number; y: number; width: number; height: number };
  };
}

// 1 cm = 10 unidades en el sistema de coordenadas
const C = 10;

export function calculatePantsPattern(m: PatternMeasurements, sil: SilhouetteType): PatternData {
  const ease = SILHOUETTES[sil].ease;

  // Medidas cuartas con holgura
  const H4 = ((m.hip + ease.hip) / 4) * C;
  const W4 = ((m.waist + ease.waist) / 4) * C;
  const CD = m.crotchDepth * C;
  const LL = m.legLength * C;
  const KW = (m.kneeWidth * C) / 2;
  const BW = (m.bottomWidth * C) / 2;

  // Niveles verticales anatómicos
  const yWaist = 40;
  const yHip = yWaist + CD * 0.65;
  const yCrotch = yWaist + CD;
  const yKnee = yWaist + CD + (LL - CD) * 0.5 - 4 * C;
  const yHem = yWaist + LL;

  // ══════════════════════════════════════════════════════════
  // 1. DELANTERO (19 PUNTOS SEGÚN DIAGRAMA TÉCNICO)
  // ══════════════════════════════════════════════════════════
  const marginX = 80;
  const fBoxW = H4;
  const fHook = H4 * 0.24; // Extensión gancho delantero
  const fBoxOriginX = marginX + fHook;

  // Puntos de la caja guía
  const f_p1 = { x: fBoxOriginX + fBoxW, y: yWaist, label: '1' };
  const f_p2 = { x: fBoxOriginX + fBoxW, y: yHem, label: '2' };
  const f_p3 = { x: fBoxOriginX + fBoxW, y: yCrotch, label: '3' };
  const f_p4 = { x: fBoxOriginX + fBoxW, y: yKnee, label: '4' };

  // Centro frente y tiro
  const f_p16 = { x: fBoxOriginX, y: yWaist, label: '16' };
  const f_p15 = { x: fBoxOriginX, y: yHip, label: '15' };
  const f_p5  = { x: fBoxOriginX, y: yCrotch, label: '5' };
  const f_p6  = { x: fBoxOriginX - fHook, y: yCrotch, label: '6' };
  const f_p8  = { x: fBoxOriginX - fHook * 0.42, y: yCrotch - fHook * 0.42, label: '8' };

  // Eje de aplomo (hilo de tela) pasa por la mitad entre 6 y 3
  const fAplomoX = (f_p6.x + f_p3.x) / 2;
  const f_p7  = { x: fAplomoX, y: yCrotch, label: '7' };
  const f_p9  = { x: fAplomoX, y: yKnee, label: '9' };
  const f_p12 = { x: fAplomoX, y: yHem, label: '12' };

  // Rodilla
  const f_p10 = { x: fAplomoX - KW, y: yKnee, label: '10' };
  const f_p11 = { x: fAplomoX + KW, y: yKnee, label: '11' };

  // Bota / Bajo
  const f_p13 = { x: fAplomoX - BW, y: yHem, label: '13' };
  const f_p14 = { x: fAplomoX + BW, y: yHem, label: '14' };

  // Cintura y cadera
  const dartW = 1.5 * C; // Ancho de pinza
  const f_p17 = { x: fBoxOriginX + W4 + dartW, y: yWaist, label: '17' };
  const f_p18 = { x: fAplomoX, y: yWaist, label: '18' };
  const f_p19 = { x: fBoxOriginX + fBoxW + 0.6 * C, y: yHip, label: '19' };

  // Pinza delantera (vértice a 9cm de profundidad)
  const dartDepth = 9 * C;
  const fDartTip = { x: f_p18.x, y: yWaist + dartDepth };
  const fDartPath = `M ${f_p18.x - dartW / 2} ${yWaist} L ${fDartTip.x} ${fDartTip.y} L ${f_p18.x + dartW / 2} ${yWaist}`;

  // Perímetro del delantero continuo
  const frontSvgPath = [
    `M ${f_p16.x} ${f_p16.y}`,
    `L ${f_p18.x - dartW / 2} ${f_p18.y}`,
    `L ${f_p18.x + dartW / 2} ${f_p18.y}`,
    `L ${f_p17.x} ${f_p17.y}`,
    // Costado: curva suave 17 -> 19 -> 3
    `Q ${f_p17.x + (f_p19.x - f_p17.x) * 0.8} ${(f_p17.y + f_p19.y) / 2} ${f_p19.x} ${f_p19.y}`,
    `Q ${f_p19.x} ${(f_p19.y + f_p3.y) / 2} ${f_p3.x} ${f_p3.y}`,
    // Costado hacia rodilla y bota
    `L ${f_p11.x} ${f_p11.y}`,
    `L ${f_p14.x} ${f_p14.y}`,
    // Bota
    `L ${f_p13.x} ${f_p13.y}`,
    // Entrepierna: 13 -> 10 -> curva hacia 6
    `L ${f_p10.x} ${f_p10.y}`,
    `Q ${f_p10.x + (f_p6.x - f_p10.x) * 0.15} ${(f_p10.y + f_p6.y) / 2} ${f_p6.x} ${f_p6.y}`,
    // Tiro delantero: curva 6 -> 8 -> 15
    `Q ${f_p8.x} ${f_p8.y} ${f_p15.x} ${f_p15.y}`,
    // Centro frente recto 15 -> 16
    `L ${f_p16.x} ${f_p16.y}`,
    `Z`
  ].join(' ');

  // ══════════════════════════════════════════════════════════
  // 2. TRASERO (19 PUNTOS SEGÚN DIAGRAMA TÉCNICO)
  // ══════════════════════════════════════════════════════════
  const gapBetween = 90;
  const bBoxOriginX = f_p1.x + gapBetween + fHook * 2.2;
  const bBoxW = H4 * 1.05;
  const bHook = H4 * 0.58; // Gancho trasero mucho más pronunciado

  // Caja guía trasera
  const b_p1 = { x: bBoxOriginX + bBoxW, y: yWaist + 0.6 * C, label: '1' };
  const b_p2 = { x: bBoxOriginX + bBoxW, y: yHem, label: '2' };
  const b_p3 = { x: bBoxOriginX + bBoxW, y: yCrotch + 0.8 * C, label: '3' };
  const b_p4 = { x: bBoxOriginX + bBoxW, y: yKnee, label: '4' };

  // Tiro trasero inclinado
  const bRiseIn = 3 * C; // Desvío hacia adentro
  const bRiseUp = 2.8 * C; // Elevación trasera
  const b_p16 = { x: bBoxOriginX + bRiseIn, y: yWaist - bRiseUp, label: '16' };
  const b_p15 = { x: bBoxOriginX + 1.2 * C, y: yHip + 1.2 * C, label: '15' };
  const b_p5  = { x: bBoxOriginX + 1.2 * C, y: yCrotch + 1.2 * C, label: '5' };
  const b_p6  = { x: bBoxOriginX - bHook, y: yCrotch + 1.4 * C, label: '6' };
  const b_p8  = { x: bBoxOriginX - bHook * 0.4, y: yCrotch + 0.8 * C, label: '8' };

  // Aplomo trasero
  const bAplomoX = (b_p6.x + b_p3.x) / 2;
  const b_p7  = { x: bAplomoX, y: yCrotch, label: '7' };
  const b_p9  = { x: bAplomoX, y: yKnee, label: '9' };
  const b_p12 = { x: bAplomoX, y: yHem, label: '12' };

  // Rodilla y bota traseras (1.5cm más anchas que delantero para ensamble)
  const bKW = KW + 1.5 * C;
  const bBW = BW + 1.5 * C;
  const b_p10 = { x: bAplomoX - bKW, y: yKnee, label: '10' };
  const b_p11 = { x: bAplomoX + bKW, y: yKnee, label: '11' };
  const b_p13 = { x: bAplomoX - bBW, y: yHem, label: '13' };
  const b_p14 = { x: bAplomoX + bBW, y: yHem, label: '14' };

  // Cintura y cadera trasera
  const bDartW = 2.0 * C;
  const b_p17 = { x: (b_p16.x + b_p1.x) / 2, y: (b_p16.y + b_p1.y) / 2, label: '17' };
  const b_p18 = { x: bBoxOriginX + bBoxW + 1.2 * C, y: yHip + 0.5 * C, label: '18' };

  // Pinza trasera (12cm de profundidad inclinada)
  const bDartDepth = 12 * C;
  const bDartTip = { x: b_p17.x - 0.5 * C, y: b_p17.y + bDartDepth };
  const bDartPath = `M ${b_p17.x - bDartW / 2} ${b_p17.y} L ${bDartTip.x} ${bDartTip.y} L ${b_p17.x + bDartW / 2} ${b_p17.y}`;

  // Perímetro del trasero continuo
  const backSvgPath = [
    `M ${b_p16.x} ${b_p16.y}`,
    `L ${b_p17.x - bDartW / 2} ${b_p17.y}`,
    `L ${b_p17.x + bDartW / 2} ${b_p17.y}`,
    `L ${b_p1.x} ${b_p1.y}`,
    // Costado: curva 1 -> 18 -> 3
    `Q ${b_p1.x + (b_p18.x - b_p1.x) * 0.8} ${(b_p1.y + b_p18.y) / 2} ${b_p18.x} ${b_p18.y}`,
    `Q ${b_p18.x} ${(b_p18.y + b_p3.y) / 2} ${b_p3.x} ${b_p3.y}`,
    // Rodilla y bota
    `L ${b_p11.x} ${b_p11.y}`,
    `L ${b_p14.x} ${b_p14.y}`,
    // Bajo
    `L ${b_p13.x} ${b_p13.y}`,
    // Entrepierna: 13 -> 10 -> curva hacia 6
    `L ${b_p10.x} ${b_p10.y}`,
    `Q ${b_p10.x + (b_p6.x - b_p10.x) * 0.18} ${(b_p10.y + b_p6.y) / 2} ${b_p6.x} ${b_p6.y}`,
    // Tiro trasero: curva profunda 6 -> 8 -> 15
    `Q ${b_p8.x} ${b_p8.y} ${b_p15.x} ${b_p15.y}`,
    // Tiro alto inclinado 15 -> 16
    `L ${b_p16.x} ${b_p16.y}`,
    `Z`
  ].join(' ');

  const frontLabelPts: PatternPoint[] = [
    f_p1, f_p2, f_p3, f_p4, f_p5, f_p6, f_p7, f_p8,
    f_p9, f_p10, f_p11, f_p12, f_p13, f_p14, f_p15, f_p16, f_p17, f_p18, f_p19
  ];

  const backLabelPts: PatternPoint[] = [
    b_p1, b_p2, b_p3, b_p4, b_p5, b_p6, b_p7, b_p8,
    b_p9, b_p10, b_p11, b_p12, b_p13, b_p14, b_p15, b_p16, b_p17, b_p18
  ];

  const totalWidth = b_p1.x + 80;
  const totalHeight = yHem + 60;

  return {
    front: frontLabelPts,
    back: backLabelPts,
    frontSvgPath,
    backSvgPath,
    frontDartPath: fDartPath,
    backDartPath: bDartPath,
    grainLineFront: { x1: fAplomoX, y1: yWaist + 20, x2: fAplomoX, y2: yHem - 20 },
    grainLineBack: { x1: bAplomoX, y1: yWaist + 20, x2: bAplomoX, y2: yHem - 20 },
    notches: [
      { x: f_p3.x, y: f_p3.y },
      { x: f_p10.x, y: f_p10.y },
      { x: f_p11.x, y: f_p11.y },
      { x: f_p6.x + 5, y: f_p6.y },
      { x: b_p3.x, y: b_p3.y },
      { x: b_p10.x, y: b_p10.y },
      { x: b_p11.x, y: b_p11.y },
      { x: b_p6.x + 8, y: b_p6.y }
    ],
    dimensions: { width: totalWidth, height: totalHeight },
    labelPoints: {
      front: frontLabelPts,
      back: backLabelPts
    },
    gridBoxes: {
      front: { x: fBoxOriginX, y: yWaist, width: fBoxW, height: LL },
      back: { x: bBoxOriginX, y: yWaist, width: bBoxW, height: LL }
    }
  };
}


export interface PatternMeasurements {
  waist: number;      // Cintura en cm (ej. 78)
  hip: number;        // Cadera en cm (ej. 98)
  crotchDepth: number;// Altura de tiro en cm (ej. 27)
  legLength: number;  // Largo total de pierna en cm (ej. 102)
  kneeWidth: number;  // Ancho a la rodilla en cm (ej. 24)
  bottomWidth: number;// Ancho de bota/bajo en cm (ej. 26)
}

export type SilhouetteType = 'baggy' | 'flare' | 'jogger' | 'cargo' | 'straight';

export interface SilhouettePreset {
  id: SilhouetteType;
  name: string;
  category: string;
  tagline: string;
  description: string;
  defaultMeasurements: PatternMeasurements;
  recommendedEase: { waist: number; hip: number; bottom: number };
}

export const SILHOUETTES: Record<SilhouetteType, SilhouettePreset> = {
  baggy: {
    id: 'baggy',
    name: 'Baggy / Wide Leg',
    category: 'Streetwear / Oversize',
    tagline: 'Caída relajada y volumen amplio en toda la pierna',
    description: 'Silueta icónica con tiro medio-bajo, holgura generosa en cadera y muslos, manteniendo caída recta ancha hasta el bajo.',
    defaultMeasurements: {
      waist: 80,
      hip: 104,
      crotchDepth: 30,
      legLength: 105,
      kneeWidth: 32,
      bottomWidth: 29
    },
    recommendedEase: { waist: 2, hip: 8, bottom: 10 }
  },
  flare: {
    id: 'flare',
    name: 'Campana / Flare',
    category: 'Retro Modern / Tailored',
    tagline: 'Entallado en muslo y rodilla con apertura amplia en bota',
    description: 'Estiliza y alarga la figura visual. Ajustado en la parte superior con un quiebre en rodilla que expande dramáticamente el bajo.',
    defaultMeasurements: {
      waist: 76,
      hip: 96,
      crotchDepth: 26,
      legLength: 106,
      kneeWidth: 20,
      bottomWidth: 32
    },
    recommendedEase: { waist: 1, hip: 3, bottom: 14 }
  },
  jogger: {
    id: 'jogger',
    name: 'Jogger Urbano',
    category: 'Athleisure / Confort',
    tagline: 'Comodidad con tiro amplio y ajuste elástico en tobillo',
    description: 'Diseñado para telas con o sin elasticidad, con tiro amplio y holgura en muslo que cierra progresivamente hacia el puño.',
    defaultMeasurements: {
      waist: 78,
      hip: 100,
      crotchDepth: 28,
      legLength: 98,
      kneeWidth: 23,
      bottomWidth: 15
    },
    recommendedEase: { waist: 4, hip: 6, bottom: -4 }
  },
  cargo: {
    id: 'cargo',
    name: 'Cargo Utilitario',
    category: 'Tactical / Streetwear',
    tagline: 'Corte recto estructurado optimizado para fuelles y bolsillos',
    description: 'Proporciones cuadradas con amplitud funcional en muslos y rodillas, apto para telas de gabardina, denim o ripstop.',
    defaultMeasurements: {
      waist: 82,
      hip: 102,
      crotchDepth: 28,
      legLength: 103,
      kneeWidth: 26,
      bottomWidth: 24
    },
    recommendedEase: { waist: 2, hip: 5, bottom: 4 }
  },
  straight: {
    id: 'straight',
    name: 'Corte Recto (Regular)',
    category: 'Timeless / Formal & Casual',
    tagline: 'Proporción clásica y equilibrada desde la cadera al bajo',
    description: 'El patrón base universal. Líneas limpias y aplomo vertical perfecto que funciona en cualquier ocasión y tipo de cuerpo.',
    defaultMeasurements: {
      waist: 78,
      hip: 98,
      crotchDepth: 27,
      legLength: 102,
      kneeWidth: 24,
      bottomWidth: 22
    },
    recommendedEase: { waist: 1.5, hip: 4, bottom: 2 }
  }
};

export interface PatternPathData {
  frontSvgPath: string;
  backSvgPath: string;
  grainLineFront: { x1: number; y1: number; x2: number; y2: number };
  grainLineBack: { x1: number; y1: number; x2: number; y2: number };
  notches: Array<{ x: number; y: number; label: string }>;
  dimensions: { width: number; height: number };
}

/**
 * Generador geométrico de vectores de patronaje de sastrería digital
 */
export function calculatePantsPattern(m: PatternMeasurements, _silhouette: SilhouetteType): PatternPathData {
  const scale = 2.8; // Factor de escala para visualización en pantalla (px/cm)
  
  // Cálculos base 1/4 de cuerpo para delantero y trasero
  const frontWaist = (m.waist / 4) + 0.5; // +0.5cm holgura
  const backWaist = (m.waist / 4) + 2.5;  // + pinza trasera (2cm)
  
  const frontHip = (m.hip / 4);
  const backHip = (m.hip / 4) + 1.5;
  
  // Gancho de tiro (Crotch Extension)
  const frontCrotchExt = (m.hip / 4) * 0.15;
  const backCrotchExt = (m.hip / 4) * 0.35;
  
  const crotchY = m.crotchDepth * scale;
  const kneeY = (m.crotchDepth + (m.legLength - m.crotchDepth) * 0.5) * scale;
  const bottomY = m.legLength * scale;
  
  const frontKneeHalf = (m.kneeWidth / 2) * scale;
  const backKneeHalf = (m.kneeWidth / 2 + 1.5) * scale;
  
  const frontBottomHalf = (m.bottomWidth / 2) * scale;
  const backBottomHalf = (m.bottomWidth / 2 + 1.5) * scale;
  
  // Coordenadas DELANTERO (Centro de pierna en X = 150)
  const fCenterX = 160;
  const fWCenter = fCenterX;
  
  // Puntos del Delantero
  const f_waistLeft = fWCenter - (frontWaist * 0.5 * scale);
  const f_waistRight = fWCenter + (frontWaist * 0.5 * scale);
  const f_crotchLeft = fWCenter - ((frontHip * 0.5 + frontCrotchExt) * scale);
  const f_hipRight = fWCenter + (frontHip * 0.5 * scale);
  
  const f_kneeLeft = fWCenter - frontKneeHalf;
  const f_kneeRight = fWCenter + frontKneeHalf;
  const f_bottomLeft = fWCenter - frontBottomHalf;
  const f_bottomRight = fWCenter + frontBottomHalf;
  
  const frontSvgPath = [
    `M ${f_waistRight} 10`,
    `Q ${f_hipRight} ${crotchY * 0.5} ${f_kneeRight} ${kneeY}`,
    `L ${f_bottomRight} ${bottomY}`,
    `L ${f_bottomLeft} ${bottomY}`,
    `L ${f_kneeLeft} ${kneeY}`,
    `Q ${f_crotchLeft * 1.05} ${crotchY * 0.9} ${f_crotchLeft} ${crotchY}`,
    `Q ${f_waistLeft + 10} ${crotchY * 0.4} ${f_waistLeft} 10`,
    'Z'
  ].join(' ');

  // Coordenadas TRASERO (Centro de pierna en X = 440)
  const bCenterX = 440;
  const b_waistLeft = bCenterX - (backWaist * 0.5 * scale);
  const b_waistRight = bCenterX + (backWaist * 0.5 * scale);
  const b_crotchLeft = bCenterX - ((backHip * 0.5 + backCrotchExt) * scale);
  const b_hipRight = bCenterX + (backHip * 0.5 * scale);
  
  const b_kneeLeft = bCenterX - backKneeHalf;
  const b_kneeRight = bCenterX + backKneeHalf;
  const b_bottomLeft = bCenterX - backBottomHalf;
  const b_bottomRight = bCenterX + backBottomHalf;
  
  const backSvgPath = [
    `M ${b_waistRight} 0`,
    `Q ${b_hipRight + 5} ${crotchY * 0.5} ${b_kneeRight} ${kneeY}`,
    `L ${b_bottomRight} ${bottomY}`,
    `L ${b_bottomLeft} ${bottomY}`,
    `L ${b_kneeLeft} ${kneeY}`,
    `Q ${b_crotchLeft * 1.08} ${crotchY * 0.95} ${b_crotchLeft} ${crotchY}`,
    `Q ${b_waistLeft + 15} ${crotchY * 0.45} ${b_waistLeft} 0`,
    'Z'
  ].join(' ');

  return {
    frontSvgPath,
    backSvgPath,
    grainLineFront: { x1: fCenterX, y1: 40, x2: fCenterX, y2: bottomY - 30 },
    grainLineBack: { x1: bCenterX, y1: 40, x2: bCenterX, y2: bottomY - 30 },
    notches: [
      { x: f_kneeLeft, y: kneeY, label: 'Piquete Rodilla Del.' },
      { x: f_kneeRight, y: kneeY, label: 'Piquete Costado Del.' },
      { x: b_kneeLeft, y: kneeY, label: 'Piquete Rodilla Tras.' },
      { x: b_kneeRight, y: kneeY, label: 'Piquete Costado Tras.' }
    ],
    dimensions: {
      width: 600,
      height: bottomY + 40
    }
  };
}

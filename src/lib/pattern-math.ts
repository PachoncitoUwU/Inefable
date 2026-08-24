// PATRONAJE TECNICO DE PANTALON - 19 PUNTOS
export type SilhouetteType = 'baggy' | 'flare' | 'jogger' | 'cargo' | 'straight';
export interface PatternMeasurements { waist: number; hip: number; crotchDepth: number; legLength: number; kneeWidth: number; bottomWidth: number; }
export interface SilhouettePreset { name: string; tagline: string; category: string; defaultMeasurements: PatternMeasurements; ease: { waist: number; hip: number; thigh: number }; }
export const SILHOUETTES: Record<SilhouetteType, SilhouettePreset> = {
  baggy: { name: 'Baggy / Wide Leg', tagline: 'Caida oversize desde la cadera hasta el bajo.', category: 'Streetwear', defaultMeasurements: { waist: 82, hip: 106, crotchDepth: 30, legLength: 102, kneeWidth: 32, bottomWidth: 36 }, ease: { waist: 4, hip: 18, thigh: 20 } },
  flare: { name: 'Campana / Flare', tagline: 'Ajustado en muslo, abre en campana desde la rodilla.', category: 'Editorial', defaultMeasurements: { waist: 78, hip: 96, crotchDepth: 28, legLength: 104, kneeWidth: 22, bottomWidth: 42 }, ease: { waist: 2, hip: 10, thigh: 6 } },
  jogger: { name: 'Jogger Urbano', tagline: 'Tiro medio, pierna conica con puno en tobillo.', category: 'Athleisure', defaultMeasurements: { waist: 80, hip: 100, crotchDepth: 30, legLength: 98, kneeWidth: 24, bottomWidth: 18 }, ease: { waist: 6, hip: 14, thigh: 12 } },
  cargo: { name: 'Cargo Utilitario', tagline: 'Tiro alto, pierna recta con bolsillos laterales.', category: 'Tecnico', defaultMeasurements: { waist: 84, hip: 108, crotchDepth: 32, legLength: 102, kneeWidth: 28, bottomWidth: 28 }, ease: { waist: 6, hip: 22, thigh: 16 } },
  straight: { name: 'Recto Clasico', tagline: 'Corte sastreria. Pierna uniforme de cadera al tobillo.', category: 'Sastreria', defaultMeasurements: { waist: 78, hip: 96, crotchDepth: 28, legLength: 102, kneeWidth: 26, bottomWidth: 26 }, ease: { waist: 2, hip: 8, thigh: 8 } },
};
export interface PatternPoint { x: number; y: number; label?: string }
export interface PatternData {
  front: PatternPoint[]; back: PatternPoint[];
  frontSvgPath: string; backSvgPath: string;
  grainLineFront: { x1: number; y1: number; x2: number; y2: number };
  grainLineBack: { x1: number; y1: number; x2: number; y2: number };
  notches: PatternPoint[];
  dimensions: { width: number; height: number };
  labelPoints: { front: PatternPoint[]; back: PatternPoint[] };
}
const C = 10;
export function calculatePantsPattern(m: PatternMeasurements, sil: SilhouetteType): PatternData {
  const ease = SILHOUETTES[sil].ease;
  const H = (m.hip + ease.hip) * C / 4;
  const W = (m.waist + ease.waist) * C / 4;
  const CD = m.crotchDepth * C;
  const LL = m.legLength * C;
  const KW = (m.kneeWidth * C) / 2;
  const BW = (m.bottomWidth * C) / 2;
  const yW = 0; const yH = CD * 0.65; const yC = CD;
  const yK = CD + LL * 0.45; const yA = CD + LL;
  const mg = 30; const gp = 90;
  const fce = H * 0.25;
  const fFold = mg + H / 2;
  const fp: Record<string, PatternPoint> = {
    p1: { x: mg + H, y: yW, label: '1' }, p2: { x: mg + H, y: yA, label: '2' },
    p3: { x: mg + H, y: yH, label: '3' }, p4: { x: mg + H, y: yK, label: '4' },
    p5: { x: mg + H / 4, y: yC, label: '5' }, p6: { x: mg - fce, y: yH + fce * 0.4, label: '6' },
    p7: { x: mg + H / 2, y: yC, label: '7' }, p8: { x: mg - fce * 0.2, y: (yH + yC) / 2, label: '8' },
    p9: { x: fFold, y: yK, label: '9' }, p10: { x: fFold - KW, y: yK, label: '10' },
    p11: { x: fFold + KW, y: yK, label: '11' }, p12: { x: fFold, y: yA, label: '12' },
    p13: { x: fFold - BW, y: yA, label: '13' }, p14: { x: fFold + BW, y: yA, label: '14' },
    p15: { x: mg, y: yH, label: '15' }, p16: { x: mg, y: yW, label: '16' },
    p17: { x: mg + W, y: yW, label: '17' }, p18: { x: mg + W / 2, y: yW - C * 0.4, label: '18' },
    p19: { x: mg + H, y: yW - C * 0.8, label: '19' },
  };
  const bH = H * 1.2; const bce = fce * 2.4; const bWR = C * 1.6;
  const bOff = mg + H + gp; const bFold = bOff + bH / 2;
  const bk: Record<string, PatternPoint> = {
    p1: { x: bOff + bH, y: yW - bWR * 0.7, label: '1' }, p2: { x: bOff + bH, y: yA, label: '2' },
    p3: { x: bOff + bH, y: yH, label: '3' }, p4: { x: bOff + bH, y: yK, label: '4' },
    p5: { x: bOff + bH / 4, y: yC, label: '5' }, p6: { x: bOff - bce, y: yH + bce * 0.35, label: '6' },
    p7: { x: bOff + bH / 2, y: yC, label: '7' }, p8: { x: bOff - bce * 0.3, y: (yH + yC) / 2, label: '8' },
    p10: { x: bFold - KW * 1.1, y: yK, label: '10' }, p11: { x: bFold + KW * 1.1, y: yK, label: '11' },
    p13: { x: bFold - BW * 1.05, y: yA, label: '13' }, p14: { x: bFold + BW * 1.05, y: yA, label: '14' },
    p15: { x: bOff, y: yH, label: '15' }, p16: { x: bOff, y: yW, label: '16' },
    p17: { x: bOff + bH * 0.38, y: yW - bWR * 0.38, label: '17' },
    p18: { x: bOff + bH * 0.19, y: yW - bWR * 0.19, label: '18' },
  };
  const fPath = [
    `M ${fp.p16.x} ${fp.p16.y}`,
    `Q ${fp.p18.x} ${fp.p18.y - 4} ${fp.p17.x} ${fp.p17.y}`,
    `Q ${fp.p17.x + 8} ${fp.p17.y - 2} ${fp.p19.x} ${fp.p19.y}`,
    `L ${fp.p1.x} ${fp.p1.y}`,
    `Q ${fp.p1.x + 7} ${(fp.p1.y + fp.p3.y) / 2} ${fp.p3.x} ${fp.p3.y}`,
    `L ${fp.p11.x} ${fp.p11.y} L ${fp.p14.x} ${fp.p14.y} L ${fp.p13.x} ${fp.p13.y} L ${fp.p10.x} ${fp.p10.y} L ${fp.p5.x} ${fp.p5.y}`,
    `C ${fp.p5.x - 20} ${fp.p5.y + 8} ${fp.p8.x} ${fp.p8.y - 14} ${fp.p8.x} ${fp.p8.y}`,
    `Q ${fp.p8.x - 14} ${fp.p8.y + 22} ${fp.p6.x} ${fp.p6.y}`,
    `L ${fp.p15.x} ${fp.p15.y} Q ${fp.p15.x - 3} ${(fp.p15.y + fp.p16.y) / 2} ${fp.p16.x} ${fp.p16.y} Z`
  ].join(' ');
  const bPath = [
    `M ${bk.p16.x} ${bk.p16.y}`,
    `Q ${bk.p18.x} ${bk.p18.y - 3} ${bk.p17.x} ${bk.p17.y}`,
    `L ${bk.p1.x} ${bk.p1.y}`,
    `Q ${bk.p1.x + 9} ${(bk.p1.y + bk.p3.y) / 2} ${bk.p3.x} ${bk.p3.y}`,
    `L ${bk.p11.x} ${bk.p11.y} L ${bk.p14.x} ${bk.p14.y} L ${bk.p13.x} ${bk.p13.y} L ${bk.p10.x} ${bk.p10.y} L ${bk.p5.x} ${bk.p5.y}`,
    `C ${bk.p5.x - 28} ${bk.p5.y + 10} ${bk.p8.x} ${bk.p8.y - 20} ${bk.p8.x} ${bk.p8.y}`,
    `Q ${bk.p8.x - 20} ${bk.p8.y + 30} ${bk.p6.x} ${bk.p6.y}`,
    `L ${bk.p15.x} ${bk.p15.y} Q ${bk.p15.x - 4} ${(bk.p15.y + bk.p16.y) / 2} ${bk.p16.x} ${bk.p16.y} Z`
  ].join(' ');
  const allPts = [...Object.values(fp), ...Object.values(bk)];
  const minY = Math.min(...allPts.map(p => p.y));
  const maxY = Math.max(...allPts.map(p => p.y));
  const maxX = Math.max(...allPts.map(p => p.x));
  const yOff = minY < 0 ? -minY + mg : mg;
  const sh = (path: string, yo: number) =>
    path.replace(/([-]?\d+\.?\d*)\s+([-]?\d+\.?\d*)/g, (_: string, x: string, y: string) =>
      `${parseFloat(x).toFixed(1)} ${(parseFloat(y) + yo).toFixed(1)}`);
  const sp = (pts: PatternPoint[], yo: number): PatternPoint[] =>
    pts.map(p => ({ ...p, y: +(p.y + yo).toFixed(1) }));
  return {
    front: sp(Object.values(fp), yOff), back: sp(Object.values(bk), yOff),
    frontSvgPath: sh(fPath, yOff), backSvgPath: sh(bPath, yOff),
    grainLineFront: { x1: fFold, y1: yW + yOff + 2*C, x2: fFold, y2: yA + yOff - 2*C },
    grainLineBack: { x1: bFold, y1: yW + yOff + 2*C, x2: bFold, y2: yA + yOff - 2*C },
    notches: [
      { x: fp.p3.x, y: yH + yOff }, { x: fp.p15.x, y: yH + yOff },
      { x: fp.p10.x, y: yK + yOff }, { x: fp.p11.x, y: yK + yOff },
      { x: bk.p3.x, y: yH + yOff }, { x: bk.p15.x, y: yH + yOff },
      { x: bk.p10.x, y: yK + yOff }, { x: bk.p11.x, y: yK + yOff },
    ],
    dimensions: { width: maxX + mg * 2, height: (maxY - minY) + mg * 3 },
    labelPoints: { front: sp(Object.values(fp), yOff), back: sp(Object.values(bk), yOff) }
  };
}

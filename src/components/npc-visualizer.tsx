import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Ruler, Weight, Info, Palette, ChevronRight } from 'lucide-react';

interface NpcVisualizerProps {
  userHeight: number;
  userWeight: number;
  selectedSilhouette: string;
  onSilhouetteChange: (sil: string) => void;
  onHeightChange: (h: number) => void;
  onWeightChange: (w: number) => void;
}

const SKIN_TONES = [
  {
    id: 'claro',
    name: 'Claro',
    hex: '#F5C29D',
    shade: '#E8A87A',
    lipHex: '#C47B60',
    advice: 'Tu piel clara contrasta mejor con tonos **profundos y saturados**: azul marino, burdeos, verde botella y negro. Evita el beige claro, ya que se pierde en tu tono de piel.',
    paletteSwatch: ['#1E293B', '#7F1D1D', '#14532D', '#1C1916']
  },
  {
    id: 'trigueño',
    name: 'Trigueño',
    hex: '#D4A373',
    shade: '#B8895A',
    lipHex: '#A0603A',
    advice: 'Los tonos **tierra y cálidos** son tus aliados naturales: terracota, ocre, café espresso y verde oliva. Tu piel brilla con texturas y colores que evocan la naturaleza.',
    paletteSwatch: ['#9C3A10', '#78350F', '#3B3A1A', '#5C4033']
  },
  {
    id: 'moreno',
    name: 'Moreno',
    hex: '#8C6239',
    shade: '#6B4A28',
    lipHex: '#7A3B2A',
    advice: 'Tu piel morena luce espectacular con **colores vibrantes y cálidos**: naranja, amarillo oro, fucsia y blanco crudo. El contraste alto es tu superpoder estético.',
    paletteSwatch: ['#EA580C', '#CA8A04', '#BE185D', '#F5F0E8']
  },
  {
    id: 'oscuro',
    name: 'Oscuro',
    hex: '#4A3120',
    shade: '#3B2516',
    lipHex: '#6B3A28',
    advice: 'Las pieles oscuras hacen que **cualquier color destaque** con presencia y poderío. Apuesta sin miedo por: blanco puro, amarillo eléctrico, verde neón suave y rojo brillante.',
    paletteSwatch: ['#FFFFFF', '#EAB308', '#16A34A', '#DC2626']
  }
];

const SILHOUETTES_LIST = [
  { id: 'baggy', name: 'Baggy / Wide' },
  { id: 'straight', name: 'Recto Clásico' },
  { id: 'cargo', name: 'Cargo Sastre' },
  { id: 'flare', name: 'Campana / Flare' },
  { id: 'jogger', name: 'Jogger Urbano' }
];

const FABRICS = [
  { id: 'denim', name: 'Denim Rígido', desc: 'Mezclilla 14oz. Estructura firme con costuras naranjas.', stitchColor: '#E28743' },
  { id: 'lino', name: 'Lino Fluido', desc: 'Tejido abierto y caída orgánica con pliegues suaves.', stitchColor: 'rgba(255,255,255,0.3)' },
  { id: 'sarga', name: 'Gabardina Sarga', desc: 'Diagonal de algodón, caída media y aplomo definido.', stitchColor: 'rgba(0,0,0,0.2)' },
  { id: 'lana', name: 'Lana Sastrera', desc: 'Textura premium y pesada. Drapeado elegante.', stitchColor: 'rgba(255,255,255,0.15)' }
];

const TEXTILE_COLORS = [
  { name: 'Negro Sombra',   hex: '#111318' },
  { name: 'Verde Oliva',    hex: '#3B4136' },
  { name: 'Naranja Urban',  hex: '#FF5A1F' },
  { name: 'Azul Índigo',    hex: '#1E3A5F' },
  { name: 'Arena Tostada',  hex: '#C5A882' },
  { name: 'Hueso Crudo',    hex: '#F0EBE0' }
];

export default function NpcVisualizer({
  userHeight,
  userWeight,
  selectedSilhouette,
  onSilhouetteChange,
  onHeightChange,
  onWeightChange
}: NpcVisualizerProps) {
  const [npcName, setNpcName] = useState('Mi Avatar');
  const [selectedFabric, setSelectedFabric] = useState(FABRICS[0]);
  const [fabricColor, setFabricColor] = useState(TEXTILE_COLORS[0].hex);
  const [selectedSkin, setSelectedSkin] = useState(SKIN_TONES[1]);

  // ── Cálculo de proporciones corporales ──
  const heightFactor = userHeight / 175;
  const bmi = userWeight / ((userHeight / 100) ** 2);
  const widthFactor = Math.max(0.7, Math.min(1.6, (userWeight / 70) / (userHeight / 175)));

  let bodyType = 'Atlético';
  if (bmi < 18.5)        bodyType = 'Ectomorfo';
  else if (bmi < 25)     bodyType = 'Mesomorfo';
  else if (bmi < 30)     bodyType = 'Endomorfo';
  else                   bodyType = 'Robusto Plus';

  // ── Constantes del canvas ──
  const cx = 120; // Centro horizontal del SVG (viewBox 0 0 240 500)

  // Escalar altura total del personaje
  const totalH = 440 * Math.min(1.15, Math.max(0.88, heightFactor));

  // Proporciones: cabeza 1/8 de la altura total
  const headR    = totalH / 8;
  const headCY   = 18 + headR;
  const neckTop  = headCY + headR;
  const neckBot  = neckTop + headR * 0.45;
  const neckW    = 9 * widthFactor;

  // Hombros y torso
  const shoulderY = neckBot;
  const shoulderW = 40 * widthFactor;
  const chestW    = 36 * widthFactor;
  const waistW    = 26 * widthFactor;
  const waistY    = shoulderY + totalH * 0.23;
  const hipW      = 32 * widthFactor;
  const hipY      = waistY + totalH * 0.08;

  // Piernas
  const crotchY   = hipY + totalH * 0.04;
  const kneeY     = crotchY + totalH * 0.24;
  const ankleY    = crotchY + totalH * 0.47;

  // Brazos
  const elbowY    = shoulderY + totalH * 0.18;
  const wristY    = shoulderY + totalH * 0.34;

  // ── Silueta del pantalón ──
  let thighW = 14 * widthFactor;
  let botW   = 13 * widthFactor;
  let flare  = 0;
  switch (selectedSilhouette) {
    case 'baggy':    thighW = 24 * widthFactor; botW = 22 * widthFactor; break;
    case 'flare':    thighW = 13 * widthFactor; botW = 22 * widthFactor; flare = 6; break;
    case 'jogger':   thighW = 16 * widthFactor; botW = 6.5 * widthFactor; break;
    case 'cargo':    thighW = 18 * widthFactor; botW = 16 * widthFactor; break;
    case 'straight': thighW = 15 * widthFactor; botW = 14.5 * widthFactor; break;
  }

  const kneeLOut = cx - thighW * 0.95;
  const kneeROut = cx + thighW * 0.95;
  const botLOut  = cx - botW - flare;
  const botROut  = cx + botW + flare;

  // Paths anatómicos con curvas Bézier
  // Torso superior
  const torsoPath = `
    M ${cx - neckW} ${neckBot}
    C ${cx - neckW - 4} ${neckBot + 4} ${cx - shoulderW} ${shoulderY + 4} ${cx - shoulderW} ${shoulderY + 8}
    C ${cx - shoulderW - 2} ${shoulderY + 22} ${cx - chestW} ${waistY - 16} ${cx - waistW} ${waistY}
    C ${cx - waistW - 2} ${waistY + 8} ${cx - hipW} ${hipY - 6} ${cx - hipW} ${hipY}
    L ${cx + hipW} ${hipY}
    C ${cx + hipW} ${hipY - 6} ${cx + waistW + 2} ${waistY + 8} ${cx + waistW} ${waistY}
    C ${cx + chestW} ${waistY - 16} ${cx + shoulderW + 2} ${shoulderY + 22} ${cx + shoulderW} ${shoulderY + 8}
    C ${cx + shoulderW} ${shoulderY + 4} ${cx + neckW + 4} ${neckBot + 4} ${cx + neckW} ${neckBot}
    Z
  `;

  // Brazo izquierdo
  const armLPath = `
    M ${cx - shoulderW + 4} ${shoulderY + 6}
    C ${cx - shoulderW - 8} ${shoulderY + 10} ${cx - shoulderW - 10} ${elbowY - 10} ${cx - shoulderW - 6} ${elbowY}
    C ${cx - shoulderW - 8} ${elbowY + 6} ${cx - shoulderW - 6} ${wristY - 10} ${cx - shoulderW - 3} ${wristY}
    L ${cx - shoulderW + 6} ${wristY}
    C ${cx - shoulderW + 4} ${wristY - 10} ${cx - shoulderW + 6} ${elbowY + 6} ${cx - shoulderW + 4} ${elbowY}
    C ${cx - shoulderW + 8} ${elbowY - 10} ${cx - shoulderW + 6} ${shoulderY + 12} ${cx - shoulderW + 4} ${shoulderY + 6}
    Z
  `;

  // Brazo derecho (espejo)
  const armRPath = `
    M ${cx + shoulderW - 4} ${shoulderY + 6}
    C ${cx + shoulderW + 8} ${shoulderY + 10} ${cx + shoulderW + 10} ${elbowY - 10} ${cx + shoulderW + 6} ${elbowY}
    C ${cx + shoulderW + 8} ${elbowY + 6} ${cx + shoulderW + 6} ${wristY - 10} ${cx + shoulderW + 3} ${wristY}
    L ${cx + shoulderW - 6} ${wristY}
    C ${cx + shoulderW - 4} ${wristY - 10} ${cx + shoulderW - 6} ${elbowY + 6} ${cx + shoulderW - 4} ${elbowY}
    C ${cx + shoulderW - 8} ${elbowY - 10} ${cx + shoulderW - 6} ${shoulderY + 12} ${cx + shoulderW - 4} ${shoulderY + 6}
    Z
  `;

  // Pierna izquierda del pantalón
  const legLPath = `
    M ${cx - waistW} ${waistY}
    C ${cx - hipW} ${hipY - 4} ${cx - hipW} ${crotchY - 4} ${cx - hipW + 2} ${crotchY}
    C ${cx - hipW * 0.9} ${crotchY + 8} ${kneeLOut} ${kneeY - 20} ${kneeLOut + flare * 0.5} ${kneeY}
    C ${kneeLOut} ${kneeY + 10} ${botLOut + flare * 0.3} ${ankleY - 14} ${botLOut} ${ankleY}
    L ${cx - 3} ${ankleY}
    L ${cx - 2} ${crotchY + 8}
    C ${cx - hipW * 0.1} ${crotchY + 2} ${cx - hipW * 0.05} ${hipY} ${cx - waistW * 0.05} ${waistY}
    Z
  `;

  // Pierna derecha del pantalón
  const legRPath = `
    M ${cx + waistW} ${waistY}
    C ${cx + hipW} ${hipY - 4} ${cx + hipW} ${crotchY - 4} ${cx + hipW - 2} ${crotchY}
    C ${cx + hipW * 0.9} ${crotchY + 8} ${kneeROut} ${kneeY - 20} ${kneeROut - flare * 0.5} ${kneeY}
    C ${kneeROut} ${kneeY + 10} ${botROut - flare * 0.3} ${ankleY - 14} ${botROut} ${ankleY}
    L ${cx + 3} ${ankleY}
    L ${cx + 2} ${crotchY + 8}
    C ${cx + hipW * 0.1} ${crotchY + 2} ${cx + hipW * 0.05} ${hipY} ${cx + waistW * 0.05} ${waistY}
    Z
  `;

  // ── Cuello ──
  const neckPath = `
    M ${cx - neckW} ${neckTop}
    C ${cx - neckW} ${neckBot - 4} ${cx - neckW + 2} ${neckBot} ${cx - neckW + 2} ${neckBot}
    L ${cx + neckW - 2} ${neckBot}
    C ${cx + neckW - 2} ${neckBot} ${cx + neckW} ${neckBot - 4} ${cx + neckW} ${neckTop}
    Z
  `;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.8rem', alignItems: 'start' }}>

      {/* ── Panel de controles ── */}
      <div className="glass-panel" style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

        {/* Nombre */}
        <div>
          <label className="field-label">Nombre del Avatar</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <User size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={npcName}
              onChange={(e) => setNpcName(e.target.value)}
              className="field-input"
              style={{ paddingLeft: '34px' }}
              maxLength={24}
            />
          </div>
        </div>

        {/* Biometría sincronizada */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Ruler size={15} color="var(--accent-gold)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>Biometría del Avatar</span>
          </div>

          {/* Estatura */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="field-label" style={{ marginBottom: 0 }}>Estatura</label>
              <motion.span
                key={userHeight}
                initial={{ scale: 1.2, color: 'var(--accent-gold)' }}
                animate={{ scale: 1, color: 'var(--text-primary)' }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
              >
                {userHeight} cm
              </motion.span>
            </div>
            <input
              type="range" min="150" max="205"
              value={userHeight}
              onChange={(e) => onHeightChange(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Peso */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="field-label" style={{ marginBottom: 0 }}>Peso</label>
              <motion.span
                key={userWeight}
                initial={{ scale: 1.2, color: 'var(--accent-gold)' }}
                animate={{ scale: 1, color: 'var(--text-primary)' }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
              >
                {userWeight} kg
              </motion.span>
            </div>
            <input
              type="range" min="45" max="125"
              value={userWeight}
              onChange={(e) => onWeightChange(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* IMC tag */}
          <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Biotipo IMC</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>{bodyType} — {bmi.toFixed(1)}</span>
          </div>
        </div>

        {/* Silueta */}
        <div>
          <span className="field-label">Silueta del Pantalón</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.4rem' }}>
            {SILHOUETTES_LIST.map((sil) => {
              const isSelected = selectedSilhouette === sil.id;
              return (
                <button
                  key={sil.id}
                  onClick={() => onSilhouetteChange(sil.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: isSelected ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-medium)',
                    background: isSelected ? 'var(--accent-light)' : 'var(--bg-secondary)',
                    color: isSelected ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 120ms',
                    textAlign: 'left',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}
                >
                  {sil.name}
                  {isSelected && <ChevronRight size={11} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Color de Tela */}
        <div>
          <span className="field-label">Color del Textil</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '0.35rem', marginTop: '0.4rem' }}>
            {TEXTILE_COLORS.map((col, i) => (
              <button
                key={i}
                title={col.name}
                onClick={() => setFabricColor(col.hex)}
                style={{
                  height: '30px',
                  borderRadius: '7px',
                  background: col.hex,
                  border: fabricColor === col.hex ? '2px solid var(--accent-gold)' : '1.5px solid rgba(255,255,255,0.1)',
                  boxShadow: fabricColor === col.hex ? `0 0 0 2px var(--bg-primary), 0 0 8px rgba(255,90,31,0.4)` : 'none',
                  cursor: 'pointer',
                  transition: 'all 120ms'
                }}
              />
            ))}
          </div>
        </div>

        {/* Tipo de Tela */}
        <div>
          <span className="field-label">Material y Textura</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
            {FABRICS.map((fab) => {
              const isSelected = selectedFabric.id === fab.id;
              return (
                <button
                  key={fab.id}
                  onClick={() => setSelectedFabric(fab)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: isSelected ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-secondary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 150ms'
                  }}
                >
                  <span style={{ fontSize: '0.81rem', fontWeight: 700, color: isSelected ? 'var(--accent-gold)' : 'var(--text-primary)', display: 'block' }}>{fab.name}</span>
                  <span style={{ fontSize: '0.71rem', color: 'var(--text-muted)' }}>{fab.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tono de Piel */}
        <div>
          <span className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Palette size={12} /> Tono de Piel
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.5rem', marginTop: '0.4rem' }}>
            {SKIN_TONES.map((tone) => {
              const isSelected = selectedSkin.id === tone.id;
              return (
                <button
                  key={tone.id}
                  title={tone.name}
                  onClick={() => setSelectedSkin(tone)}
                  style={{
                    padding: '6px 4px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid var(--accent-gold)' : '1.5px solid var(--border-medium)',
                    background: tone.hex,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '3px',
                    boxShadow: isSelected ? `0 0 0 2px var(--bg-primary), 0 0 10px rgba(255,90,31,0.5)` : 'none',
                    transition: 'all 150ms'
                  }}
                >
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: isSelected ? '#0C0D12' : 'rgba(0,0,0,0.6)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {tone.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── Panel de visualización ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

        {/* Escenario del NPC */}
        <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="eyebrow">Probador Virtual</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
                {npcName}
              </h3>
            </div>
            <div style={{ background: 'var(--accent-light)', border: '1px solid var(--border-accent)', borderRadius: '8px', padding: '4px 10px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                {userHeight}cm · {userWeight}kg
              </span>
            </div>
          </div>

          {/* Escenario SVG */}
          <div className="npc-stage" style={{ width: '100%', minHeight: '520px', padding: '1.5rem' }}>
            <div className="npc-backdrop-grid" />
            {/* Sombra proyectada en el suelo */}
            <div style={{
              position: 'absolute', bottom: '18px', left: '50%', transform: 'translateX(-50%)',
              width: `${100 * widthFactor}px`, height: '10px',
              background: 'rgba(0,0,0,0.35)', borderRadius: '50%', filter: 'blur(6px)'
            }} />

            <svg
              className="npc-avatar"
              width="240"
              height="480"
              viewBox="0 0 240 480"
              xmlns="http://www.w3.org/2000/svg"
              style={{ overflow: 'visible' }}
            >
              {/* ── Sombras internas (profundidad corporal) ── */}
              <defs>
                <radialGradient id="bodyShade" cx="50%" cy="40%" r="55%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.20)" />
                </radialGradient>
                <radialGradient id="headShade" cx="40%" cy="35%" r="60%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.22)" />
                </radialGradient>
                <radialGradient id="pantsShade" cx="50%" cy="20%" r="70%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
                </radialGradient>
              </defs>

              {/* Brazos (atrás del torso) */}
              <path d={armLPath} fill={selectedSkin.hex} />
              <path d={armLPath} fill="url(#bodyShade)" />
              <path d={armRPath} fill={selectedSkin.hex} />
              <path d={armRPath} fill="url(#bodyShade)" />

              {/* Pierna izquierda */}
              <motion.path
                key={`legL-${selectedSilhouette}-${fabricColor}`}
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                d={legLPath}
                fill={fabricColor}
              />
              <motion.path
                key={`legLShade-${selectedSilhouette}`}
                d={legLPath}
                fill="url(#pantsShade)"
              />

              {/* Pierna derecha */}
              <motion.path
                key={`legR-${selectedSilhouette}-${fabricColor}`}
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                d={legRPath}
                fill={fabricColor}
              />
              <motion.path
                key={`legRShade-${selectedSilhouette}`}
                d={legRPath}
                fill="url(#pantsShade)"
              />

              {/* Texturas de tela */}
              {selectedFabric.id === 'denim' && (
                <g stroke={selectedFabric.stitchColor} strokeWidth="0.8" strokeDasharray="3 2" fill="none" opacity="0.8">
                  <path d={`M ${cx - hipW + 2} ${hipY} L ${kneeLOut + 4} ${kneeY} L ${botLOut + 4} ${ankleY}`} />
                  <path d={`M ${cx + hipW - 2} ${hipY} L ${kneeROut - 4} ${kneeY} L ${botROut - 4} ${ankleY}`} />
                  <circle cx={cx - hipW + 4} cy={waistY + 5} r="1.5" fill={selectedFabric.stitchColor} />
                  <circle cx={cx + hipW - 4} cy={waistY + 5} r="1.5" fill={selectedFabric.stitchColor} />
                </g>
              )}

              {selectedFabric.id === 'lino' && (
                <g stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" fill="none">
                  <path d={`M ${cx - hipW / 2} ${hipY + 10} Q ${cx - thighW / 2 - 4} ${crotchY + 30} ${cx - thighW / 2} ${kneeY}`} />
                  <path d={`M ${cx + hipW / 2} ${hipY + 10} Q ${cx + thighW / 2 + 4} ${crotchY + 30} ${cx + thighW / 2} ${kneeY}`} />
                </g>
              )}

              {selectedFabric.id === 'sarga' && (
                <g stroke="rgba(0,0,0,0.15)" strokeWidth="0.9" fill="none">
                  <line x1={cx - thighW * 0.4} y1={hipY + 15} x2={botLOut + botW * 0.5} y2={ankleY - 3} strokeDasharray="60 2 3 2" />
                  <line x1={cx + thighW * 0.4} y1={hipY + 15} x2={botROut - botW * 0.5} y2={ankleY - 3} strokeDasharray="60 2 3 2" />
                </g>
              )}

              {selectedSilhouette === 'cargo' && (
                <g fill={fabricColor} stroke="rgba(255,255,255,0.12)" strokeWidth="0.5">
                  <rect x={cx - hipW + 1} y={kneeY - 28} width={hipW * 0.35} height={18} rx="2" transform={`rotate(-4 ${cx - hipW + 1} ${kneeY - 28})`} />
                  <line x1={cx - hipW + 1} y1={kneeY - 19} x2={cx - hipW + hipW * 0.36} y2={kneeY - 19} stroke="rgba(255,255,255,0.2)" />
                  <rect x={cx + hipW * 0.65} y={kneeY - 28} width={hipW * 0.35} height={18} rx="2" transform={`rotate(4 ${cx + hipW * 0.65} ${kneeY - 28})`} />
                  <line x1={cx + hipW * 0.65} y1={kneeY - 19} x2={cx + hipW} y2={kneeY - 19} stroke="rgba(255,255,255,0.2)" />
                </g>
              )}

              {selectedSilhouette === 'jogger' && (
                <g fill="rgba(0,0,0,0.2)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5">
                  <rect x={botLOut} y={ankleY - 5} width={cx - 3 - botLOut} height="6" rx="2" />
                  <rect x={cx + 3} y={ankleY - 5} width={botROut - (cx + 3)} height="6" rx="2" />
                </g>
              )}

              {/* Torso (encima de piernas) */}
              <path d={torsoPath} fill={selectedSkin.hex} />
              <path d={torsoPath} fill="url(#bodyShade)" />

              {/* Cuello */}
              <path d={neckPath} fill={selectedSkin.shade} />

              {/* Cabeza con curvas anatómicas */}
              <ellipse cx={cx} cy={headCY} rx={headR * 0.82} ry={headR} fill={selectedSkin.hex} />
              <ellipse cx={cx} cy={headCY} rx={headR * 0.82} ry={headR} fill="url(#headShade)" />

              {/* Oídos */}
              <ellipse cx={cx - headR * 0.8} cy={headCY + headR * 0.1} rx={headR * 0.13} ry={headR * 0.2} fill={selectedSkin.shade} />
              <ellipse cx={cx + headR * 0.8} cy={headCY + headR * 0.1} rx={headR * 0.13} ry={headR * 0.2} fill={selectedSkin.shade} />

              {/* Rasgos faciales */}
              {/* Cejas */}
              <path d={`M ${cx - headR * 0.38} ${headCY - headR * 0.18} Q ${cx - headR * 0.2} ${headCY - headR * 0.24} ${cx - headR * 0.05} ${headCY - headR * 0.18}`}
                stroke="rgba(0,0,0,0.55)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
              <path d={`M ${cx + headR * 0.05} ${headCY - headR * 0.18} Q ${cx + headR * 0.2} ${headCY - headR * 0.24} ${cx + headR * 0.38} ${headCY - headR * 0.18}`}
                stroke="rgba(0,0,0,0.55)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
              {/* Ojos */}
              <ellipse cx={cx - headR * 0.22} cy={headCY - headR * 0.06} rx={headR * 0.13} ry={headR * 0.1} fill="rgba(0,0,0,0.75)" />
              <ellipse cx={cx + headR * 0.22} cy={headCY - headR * 0.06} rx={headR * 0.13} ry={headR * 0.1} fill="rgba(0,0,0,0.75)" />
              {/* Brillo ojos */}
              <circle cx={cx - headR * 0.19} cy={headCY - headR * 0.09} r={headR * 0.03} fill="rgba(255,255,255,0.85)" />
              <circle cx={cx + headR * 0.25} cy={headCY - headR * 0.09} r={headR * 0.03} fill="rgba(255,255,255,0.85)" />
              {/* Nariz */}
              <path d={`M ${cx} ${headCY + headR * 0.04} L ${cx - headR * 0.06} ${headCY + headR * 0.2} Q ${cx} ${headCY + headR * 0.24} ${cx + headR * 0.06} ${headCY + headR * 0.2}`}
                stroke={selectedSkin.shade} strokeWidth="1.2" fill="none" strokeLinecap="round" />
              {/* Boca */}
              <path d={`M ${cx - headR * 0.18} ${headCY + headR * 0.32} Q ${cx} ${headCY + headR * 0.42} ${cx + headR * 0.18} ${headCY + headR * 0.32}`}
                stroke={selectedSkin.lipHex} strokeWidth="1.4" fill="none" strokeLinecap="round" />

              {/* Zapatos */}
              <g fill="#111318">
                <path d={`M ${botLOut} ${ankleY} C ${botLOut - 5} ${ankleY + 3} ${botLOut - 4} ${ankleY + 10} ${cx - 2} ${ankleY + 9} L ${cx - 3} ${ankleY} Z`} />
                <path d={`M ${botROut} ${ankleY} C ${botROut + 5} ${ankleY + 3} ${botROut + 4} ${ankleY + 10} ${cx + 2} ${ankleY + 9} L ${cx + 3} ${ankleY} Z`} />
              </g>

              {/* Tag de nombre */}
              <text x={cx} y={totalH + 28} textAnchor="middle" fontSize="9" fill="rgba(255,90,31,0.7)" fontFamily="var(--font-mono)" fontWeight="700" letterSpacing="0.05em">
                {npcName.toUpperCase()}
              </text>
            </svg>
          </div>
        </div>

        {/* Panel de teoría del color personal */}
        <motion.div
          key={selectedSkin.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-panel"
          style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: selectedSkin.hex, border: '2px solid var(--border-medium)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-gold)', fontWeight: 700 }}>
              Colorimetría Personal — Piel {selectedSkin.name}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}
            dangerouslySetInnerHTML={{ __html: selectedSkin.advice.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>') }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Paleta ideal:</span>
            {selectedSkin.paletteSwatch.map((hex, i) => (
              <div key={i} style={{ width: '20px', height: '20px', borderRadius: '5px', background: hex, border: '1px solid rgba(255,255,255,0.08)' }} />
            ))}
          </div>
        </motion.div>
      </div>

    </div>
  );
}

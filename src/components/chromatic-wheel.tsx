import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Sparkles, Check, Info } from 'lucide-react';

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export interface HarmonizedPalette {
  name: string;
  harmonyType: 'monochromatic' | 'complementary' | 'analogous' | 'triadic';
  description: string;
  top: { name: string; hex: string; role: 'primary' | 'secondary' | 'accent' | 'neutral'; description: string };
  bottom: { name: string; hex: string; role: 'primary' | 'secondary' | 'accent' | 'neutral'; description: string };
  footwear: { name: string; hex: string; role: 'primary' | 'secondary' | 'accent' | 'neutral'; description: string };
  accessory: { name: string; hex: string; role: 'primary' | 'secondary' | 'accent' | 'neutral'; description: string };
}

interface ChromaticWheelProps {
  onPaletteSelect: (palette: HarmonizedPalette) => void;
  activeColorHex?: string;
}

export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

export function getHueName(h: number): string {
  if (h >= 345 || h < 15) return 'Rojo Carmesí';
  if (h >= 15 && h < 45) return 'Terracota / Naranja';
  if (h >= 45 && h < 75) return 'Ocre / Mostaza';
  if (h >= 75 && h < 115) return 'Verde Lima / Oliva';
  if (h >= 115 && h < 165) return 'Verde Esmeralda / Salvia';
  if (h >= 165 && h < 195) return 'Turquesa / Aqua';
  if (h >= 195 && h < 225) return 'Azul Celeste / Cobalto';
  if (h >= 225 && h < 255) return 'Azul Prusia / Marino';
  if (h >= 255 && h < 285) return 'Índigo / Violeta';
  if (h >= 285 && h < 315) return 'Púrpura / Malva';
  return 'Magenta / Buganvilla';
}

export default function ChromaticWheel({ onPaletteSelect }: ChromaticWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [selectedHsl, setSelectedHsl] = useState<HslColor>({ h: 22, s: 78, l: 48 }); // Terracota cálido base
  const [pointerPos, setPointerPos] = useState({ x: 190, y: 145 });
  const [activeHarmonyTab, setActiveHarmonyTab] = useState<'monochromatic' | 'complementary' | 'analogous' | 'triadic'>('monochromatic');
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);

  const calculateColorFromCoords = useCallback((clientX: number, clientY: number) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = clientX - rect.left - centerX;
    const y = clientY - rect.top - centerY;

    let angleRad = Math.atan2(y, x);
    let angleDeg = angleRad * (180 / Math.PI);
    if (angleDeg < 0) angleDeg += 360;

    const distance = Math.sqrt(x * x + y * y);
    const maxRadius = rect.width / 2;
    const saturation = Math.min(100, Math.max(15, Math.round((distance / maxRadius) * 100)));

    const newHsl: HslColor = {
      h: Math.round(angleDeg),
      s: saturation,
      l: 48
    };

    setSelectedHsl(newHsl);

    // Ajustar posición visual del puntero
    const clampedDistance = Math.min(maxRadius - 4, Math.max(0, distance));
    const pointerX = centerX + clampedDistance * Math.cos(angleRad);
    const pointerY = centerY + clampedDistance * Math.sin(angleRad);
    setPointerPos({ x: pointerX, y: pointerY });
  }, []);

  const handlePointerInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    let clientX: number, clientY: number;
    if ('touches' in e && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return;
    }
    calculateColorFromCoords(clientX, clientY);
  };

  const handleMouseMoveOrHover = (e: React.MouseEvent) => {
    // Permite interacción tanto al arrastrar como al mover el mouse
    if (e.buttons === 1 || e.type === 'click') {
      handlePointerInteraction(e);
    }
  };

  const { h, s } = selectedHsl;
  const hexSelected = hslToHex(h, s, selectedHsl.l);
  const hueName = getHueName(h);

  // Armonía Monocromática: Mismo tono, variación de claridad y saturación sastrera
  const monoPalette: HarmonizedPalette = {
    name: `Monocromático ${hueName}`,
    harmonyType: 'monochromatic',
    description: `Degradación armónica del mismo tinte en diferentes niveles de claridad y saturación. Genera una silueta esbelta, limpia y de gran sofisticación editorial.`,
    top: {
      name: `${hueName} Luz Suave`,
      hex: hslToHex(h, Math.max(15, s - 40), 86),
      role: 'primary',
      description: 'Camisa de lino o buzo ligero con tinte suave.'
    },
    bottom: {
      name: `${hueName} Sastre Profundo`,
      hex: hslToHex(h, Math.min(85, s + 5), 26),
      role: 'secondary',
      description: 'Pantalón en corte de sastrería estructurada con peso visual.'
    },
    footwear: {
      name: `Hueso Mineral`,
      hex: hslToHex(h, 10, 93),
      role: 'neutral',
      description: 'Zapatos o sneakers crudos con subtono del mismo espectro.'
    },
    accessory: {
      name: `${hueName} Puro`,
      hex: hexSelected,
      role: 'accent',
      description: 'Cinturón, pañuelo de solapa o reloj como toque distintivo.'
    }
  };

  // Armonía Complementaria: Tono opuesto a 180°
  const compHue = (h + 180) % 360;
  const compName = getHueName(compHue);
  const compPalette: HarmonizedPalette = {
    name: `Complementario ${hueName} & ${compName}`,
    harmonyType: 'complementary',
    description: `Contraste máximo de 180° en la rueda cromática. Aplica la regla sartorial: una prenda neutra/dominante y el complemento en accesorio o detalle de impacto visual.`,
    top: {
      name: `${hueName} Textil Medio`,
      hex: hslToHex(h, Math.max(25, s - 20), 45),
      role: 'primary',
      description: 'Chaqueta sastre o prenda principal visible.'
    },
    bottom: {
      name: `Gris Grafito Neutro`,
      hex: '#2B2B28',
      role: 'neutral',
      description: 'Pantalón en base neutra oscura para anclar el contraste.'
    },
    footwear: {
      name: 'Negro Azabache',
      hex: '#141412',
      role: 'neutral',
      description: 'Calzado sobrio para equilibrar el conjunto.'
    },
    accessory: {
      name: `${compName} de Contraste`,
      hex: hslToHex(compHue, 80, 52),
      role: 'accent',
      description: `Pieza focal en ${compName} que hace vibrar la armonía.`
    }
  };

  // Armonía Análoga: Vecinos a ±30°
  const anaHue1 = (h + 330) % 360;
  const anaHue2 = (h + 30) % 360;
  const anaPalette: HarmonizedPalette = {
    name: `Análogo Orgánico ${hueName}`,
    harmonyType: 'analogous',
    description: `Combinación de tonos vecinos contiguos (a 30° de distancia). Brinda una transición natural que emula texturas orgánicas otoñales o botánicas.`,
    top: {
      name: getHueName(anaHue1),
      hex: hslToHex(anaHue1, Math.max(30, s - 15), 58),
      role: 'primary',
      description: 'Prenda superior en matiz adyacente fluido.'
    },
    bottom: {
      name: `${hueName} Terrestre`,
      hex: hslToHex(h, Math.max(30, s - 10), 32),
      role: 'secondary',
      description: 'Pantalón con tinte base sutil.'
    },
    footwear: {
      name: getHueName(anaHue2),
      hex: hslToHex(anaHue2, 35, 78),
      role: 'neutral',
      description: 'Calzado en cuero o lona con tonalidad vecina clara.'
    },
    accessory: {
      name: `${hueName} Acento`,
      hex: hexSelected,
      role: 'accent',
      description: 'Complemento focal en tono primario.'
    }
  };

  // Armonía Triádica: A 120° y 240°
  const triHue1 = (h + 120) % 360;
  const triHue2 = (h + 240) % 360;
  const triPalette: HarmonizedPalette = {
    name: `Tríada Dinámica ${hueName}`,
    harmonyType: 'triadic',
    description: `Tres colores equidistantes a 120°. Aporta riqueza y vivacidad controlada manteniendo siempre uno como protagonista y los otros dos como soporte y acento.`,
    top: {
      name: getHueName(triHue1),
      hex: hslToHex(triHue1, 40, 72),
      role: 'primary',
      description: 'Tono claro y suave para la parte superior.'
    },
    bottom: {
      name: `${hueName} Profundo`,
      hex: hslToHex(h, 45, 28),
      role: 'secondary',
      description: 'Pantalón en la base cromática elegida.'
    },
    footwear: {
      name: 'Blanco Lino',
      hex: '#FAF6F0',
      role: 'neutral',
      description: 'Calzado neutral para reposar la vista.'
    },
    accessory: {
      name: getHueName(triHue2),
      hex: hslToHex(triHue2, 75, 48),
      role: 'accent',
      description: 'Detalle de impacto en el tercer eje de la tríada.'
    }
  };

  const palettesMap = {
    monochromatic: monoPalette,
    complementary: compPalette,
    analogous: anaPalette,
    triadic: triPalette
  };

  const currentActivePalette = palettesMap[activeHarmonyTab];

  const handleApplyPalette = (palette: HarmonizedPalette) => {
    onPaletteSelect(palette);
    setAppliedFeedback(palette.name);
    setTimeout(() => setAppliedFeedback(null), 2500);
  };

  return (
    <div className="color-wheel-wrapper" style={{ gap: '1.4rem' }}>
      
      {/* Encabezado descriptivo */}
      <div style={{ textAlign: 'center', maxWidth: '440px' }}>
        <span className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <Palette size={13} /> Rueda Cromática Espectral
        </span>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 400, marginTop: '0.2rem' }}>
          Círculo Cromático Interactivo
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.3rem', lineHeight: '1.4' }}>
          Pasa el cursor o haz clic en cualquier zona de la rueda para extraer instantáneamente sus fórmulas de combinación textil.
        </p>
      </div>

      {/* Círculo cromático físico */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          ref={wheelRef}
          className="chromatic-wheel-container"
          onClick={handlePointerInteraction}
          onMouseMove={handleMouseMoveOrHover}
          onTouchStart={handlePointerInteraction}
          onTouchMove={handlePointerInteraction}
        >
          <div className="chromatic-wheel-surface" />
          
          {/* Puntero reactivo */}
          <div
            className="chromatic-pointer"
            style={{
              left: `${pointerPos.x}px`,
              top: `${pointerPos.y}px`,
              backgroundColor: hexSelected
            }}
          />
        </div>

        {/* Indicador del color seleccionado en tiempo real */}
        <div style={{
          marginTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          padding: '0.55rem 1.1rem',
          borderRadius: '100px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 2px 10px rgba(28,25,22,0.06)'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: hexSelected,
            border: '2px solid white',
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)'
          }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {hueName}
          </span>
          <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            {hexSelected} · {selectedHsl.h}°
          </span>
        </div>
      </div>

      {/* Selector de tipo de armonía */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div style={{
          display: 'flex',
          gap: '0.35rem',
          background: 'var(--bg-secondary)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)'
        }}>
          {[
            { id: 'monochromatic', label: 'Monocromático' },
            { id: 'complementary', label: 'Complementario' },
            { id: 'analogous',     label: 'Análogo' },
            { id: 'triadic',       label: 'Tríada' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveHarmonyTab(tab.id as any)}
              style={{
                flex: 1,
                padding: '7px 8px',
                borderRadius: '8px',
                border: 'none',
                background: activeHarmonyTab === tab.id ? 'var(--bg-card)' : 'transparent',
                color: activeHarmonyTab === tab.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontWeight: activeHarmonyTab === tab.id ? 700 : 500,
                fontSize: '0.76rem',
                cursor: 'pointer',
                boxShadow: activeHarmonyTab === tab.id ? '0 2px 6px rgba(28,25,22,0.06)' : 'none',
                transition: 'all 150ms var(--ease-out)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tarjeta detallada de la armonía activa */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeHarmonyTab + hexSelected}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="glass-panel"
            style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.8rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {currentActivePalette.name}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: '1.4' }}>
                  {currentActivePalette.description}
                </p>
              </div>

              <button
                onClick={() => handleApplyPalette(currentActivePalette)}
                className="btn-primary"
                style={{ padding: '8px 14px', fontSize: '0.78rem', flexShrink: 0 }}
              >
                {appliedFeedback ? (
                  <>
                    <Check size={14} /> Aplicada
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> Aplicar Armonía
                  </>
                )}
              </button>
            </div>

            {/* Muestras de prendas en la armonía */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
              {[
                { label: 'Superior / Top', item: currentActivePalette.top },
                { label: 'Pantalón / Bottom', item: currentActivePalette.bottom },
                { label: 'Calzado', item: currentActivePalette.footwear },
                { label: 'Accesorio', item: currentActivePalette.accessory }
              ].map(({ label, item }, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px',
                    borderRadius: '10px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                      {label}
                    </span>
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '4px',
                        background: item.hex,
                        border: '1px solid rgba(0,0,0,0.15)'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>
                    {item.hex}
                  </span>
                </div>
              ))}
            </div>

            {/* Explicación de sastrería */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(193, 68, 14, 0.05)',
              border: '1px solid rgba(193, 68, 14, 0.15)'
            }}>
              <Info size={14} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <strong>Regla de proporción 60-30-10:</strong> Viste el 60% con el pantalón ({currentActivePalette.bottom.name}), 30% prenda superior ({currentActivePalette.top.name}), y 10% accesorio de acento.
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}

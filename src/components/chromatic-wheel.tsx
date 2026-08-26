import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Palette, RefreshCw } from 'lucide-react';

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

interface ChromaticWheelProps {
  onPaletteSelect: (palette: {
    name: string;
    harmonyType: string;
    description: string;
    top: { name: string; hex: string; role: 'primary' | 'secondary' | 'accent' | 'neutral'; description: string };
    bottom: { name: string; hex: string; role: 'primary' | 'secondary' | 'accent' | 'neutral'; description: string };
    footwear: { name: string; hex: string; role: 'primary' | 'secondary' | 'accent' | 'neutral'; description: string };
    accessory: { name: string; hex: string; role: 'primary' | 'secondary' | 'accent' | 'neutral'; description: string };
  }) => void;
}

export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function getHueName(h: number): string {
  if (h >= 345 || h < 15) return 'Rojo Carmesí';
  if (h >= 15 && h < 45) return 'Terracota / Naranja';
  if (h >= 45 && h < 75) return 'Ocre / Amarillo';
  if (h >= 75 && h < 105) return 'Verde Lima';
  if (h >= 105 && h < 165) return 'Verde Salvia';
  if (h >= 165 && h < 195) return 'Verde Oliva';
  if (h >= 195 && h < 225) return 'Azul Celeste';
  if (h >= 225 && h < 255) return 'Azul Prusia';
  if (h >= 255 && h < 285) return 'Índigo / Azul Profundo';
  if (h >= 285 && h < 315) return 'Violeta / Amatista';
  return 'Lila / Fucsia';
}

export default function ChromaticWheel({ onPaletteSelect }: ChromaticWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [selectedHsl, setSelectedHsl] = useState<HslColor>({ h: 15, s: 75, l: 50 });
  const [pointerPos, setPointerPos] = useState({ x: 130 + 60, y: 130 + 16 });
  const [isDragging, setIsDragging] = useState(false);

  const calculateColorFromCoords = (clientX: number, clientY: number) => {
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
    const saturation = Math.min(100, Math.round((distance / maxRadius) * 100));

    // Mantener la luminosidad en 50 para el círculo cromático general
    const newHsl = {
      h: Math.round(angleDeg),
      s: Math.round(saturation),
      l: 50
    };

    setSelectedHsl(newHsl);

    // Guardar posición relativa del puntero
    const clampedDistance = Math.min(maxRadius - 4, distance);
    const pointerX = centerX + clampedDistance * Math.cos(angleRad);
    const pointerY = centerY + clampedDistance * Math.sin(angleRad);
    setPointerPos({ x: pointerX, y: pointerY });

    triggerPaletteChange(newHsl);
  };

  const triggerPaletteChange = (color: HslColor) => {
    const { h } = color;
    const baseName = getHueName(h);

    // Generar gradientes monocromáticos sutiles para moda
    const topHsl = { h, s: 20, l: 85 }; // Suéter o playera ligera
    const bottomHsl = { h, s: 40, l: 30 }; // Pantalón sastrero oscuro
    const footwearHsl = { h, s: 8, l: 94 }; // Sneakers color tiza / crudo con tinte
    const accessoryHsl = { h, s: 75, l: 50 }; // Acento vibrante

    const topHex = hslToHex(topHsl.h, topHsl.s, topHsl.l);
    const bottomHex = hslToHex(bottomHsl.h, bottomHsl.s, bottomHsl.l);
    const footwearHex = hslToHex(footwearHsl.h, footwearHsl.s, footwearHsl.l);
    const accessoryHex = hslToHex(accessoryHsl.h, accessoryHsl.s, accessoryHsl.l);

    onPaletteSelect({
      name: `Armonía Monocromática ${baseName}`,
      harmonyType: 'monochromatic',
      description: `Paleta premium de bajo contraste basada en diferentes matices de luminosidad y saturación del tono ${baseName}.`,
      top: {
        name: `${baseName} Suave`,
        hex: topHex,
        role: 'primary',
        description: 'Buzo de hilo fino o playera de corte relajado'
      },
      bottom: {
        name: `${baseName} Sastrero`,
        hex: bottomHex,
        role: 'secondary',
        description: 'Pantalón a medida o silueta Baggy estructurada'
      },
      footwear: {
        name: `Hueso Tintado ${baseName.split('/')[0].trim()}`,
        hex: footwearHex,
        role: 'neutral',
        description: 'Zapatos o tenis minimalistas con sub-tono armonioso'
      },
      accessory: {
        name: `${baseName} Enérgico`,
        hex: accessoryHex,
        role: 'accent',
        description: 'Accesorio de piel, bolso bandolera o joyería de acento'
      }
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    calculateColorFromCoords(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    calculateColorFromCoords(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches[0]) {
      calculateColorFromCoords(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    if (e.touches[0]) {
      calculateColorFromCoords(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const hexSelected = hslToHex(selectedHsl.h, selectedHsl.s, selectedHsl.l);

  return (
    <div className="color-wheel-wrapper">
      <div style={{ textAlign: 'center', maxWidth: '320px' }}>
        <span className="chip" style={{ marginBottom: '0.5rem' }}>
          <Palette size={12} /> Círculo Cromático Interactivo
        </span>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Arrastra o haz clic en la rueda para extraer de forma matemática la armonía monocromática perfecta.
        </p>
      </div>

      <div 
        ref={wheelRef}
        className="chromatic-circle"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        <div 
          className="chromatic-pointer"
          style={{ 
            left: `${pointerPos.x}px`, 
            top: `${pointerPos.y}px`,
            backgroundColor: hexSelected
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1.2rem', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: hexSelected, border: '1.5px solid white' }} />
        <span style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
          Tono: {selectedHsl.h}° ({getHueName(selectedHsl.h)})
        </span>
        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          | HSL({selectedHsl.h}, {selectedHsl.s}%, {selectedHsl.l}%)
        </span>
      </div>
    </div>
  );
}

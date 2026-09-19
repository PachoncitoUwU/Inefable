import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, AlertCircle, Shirt, Palette } from 'lucide-react';
import type { HarmonizedPalette } from './chromatic-wheel';

interface PersonalColorimetryProps {
  onApplyPalette: (palette: HarmonizedPalette) => void;
}

export interface SkinToneProfile {
  id: string;
  name: string;
  subtitle: string;
  swatchHex: string;
  undertone: 'Frío' | 'Cálido' | 'Neutro';
  description: string;
  bestColors: { name: string; hex: string; role: string }[];
  avoidColors: { name: string; hex: string; reason: string }[];
  outfitFormula: HarmonizedPalette;
}

const SKIN_PROFILES: SkinToneProfile[] = [
  {
    id: 'clara-fria',
    name: 'Piel Clara Porcelana',
    subtitle: 'Subtono Frío / Rosado',
    swatchHex: '#F6D2C4',
    undertone: 'Frío',
    description: 'Tu tez clara destaca de forma deslumbrante con contrastes profundos y tonos de base fría (azul marino, verde bosque, burdeos y carbón). Estos colores aportan definición angular y realzan la luminosidad del rostro.',
    bestColors: [
      { name: 'Azul Marino Prusia', hex: '#16253D', role: 'Base sastre' },
      { name: 'Burdeos / Borgoña', hex: '#631D2A', role: 'Acento noble' },
      { name: 'Verde Bosque', hex: '#1B382B', role: 'Equilibrio' },
      { name: 'Blanco Nieve', hex: '#F8FAFC', role: 'Luz superior' }
    ],
    avoidColors: [
      { name: 'Beige Pálido', hex: '#E5DFD3', reason: 'Se funde con tu piel y deslava facciones' },
      { name: 'Amarillo Mostaza Apagado', hex: '#C29F47', reason: 'Puede aportar un aspecto cansado' }
    ],
    outfitFormula: {
      name: 'Contraste Noble (Piel Clara)',
      harmonyType: 'complementary',
      description: 'Prenda superior en blanco nítido para aportar frescura al rostro, combinada con un pantalón azul marino oscuro para una silueta estilizada.',
      top: { name: 'Blanco Hielo Lino', hex: '#F4F6F8', role: 'primary', description: 'Camisa o buzo liviano que ilumina el rostro' },
      bottom: { name: 'Azul Marino Sastre', hex: '#16253D', role: 'secondary', description: 'Pantalón estructurado con aplomo visual' },
      footwear: { name: 'Cuero Negro Glaseado', hex: '#1A1A1A', role: 'neutral', description: 'Zapatos sobrios de terminación pulida' },
      accessory: { name: 'Borgoña Carmín', hex: '#631D2A', role: 'accent', description: 'Bufanda, cinturón o detalle en piel' }
    }
  },
  {
    id: 'clara-calida',
    name: 'Piel Clara Dorada',
    subtitle: 'Subtono Cálido / Durazno',
    swatchHex: '#EFC19B',
    undertone: 'Cálido',
    description: 'Tu matiz posee reflejos dorados y cálidos. Los tonos tierra suaves, el verde salvia, el terracota empolvado y los tonos crema tostados potencian un brillo saludable y natural.',
    bestColors: [
      { name: 'Terracota Empolvado', hex: '#B85D36', role: 'Calidez sutil' },
      { name: 'Verde Salvia Oliva', hex: '#586A51', role: 'Armonía orgánica' },
      { name: 'Arena Crema', hex: '#E8DCB8', role: 'Luz cálida' },
      { name: 'Marrón Caramelo', hex: '#7A4A28', role: 'Base sólida' }
    ],
    avoidColors: [
      { name: 'Negro Plano Puro', hex: '#000000', reason: 'Puede endurecer en exceso tus facciones' },
      { name: 'Gris Plomo Frío', hex: '#5C6370', reason: 'Opaca la calidez natural de la tez' }
    ],
    outfitFormula: {
      name: 'Salvia & Terracota (Piel Cálida)',
      harmonyType: 'analogous',
      description: 'Armonía análoga sutil entre verde salvia en la prenda superior y pantalón arena tostada, con acentos terracota.',
      top: { name: 'Verde Salvia Orgánico', hex: '#586A51', role: 'primary', description: 'Suéter fino de lana merino o sobrecamisa' },
      bottom: { name: 'Marrón Caramelo Sastre', hex: '#54321A', role: 'secondary', description: 'Pantalón chino o sastre de pinzas' },
      footwear: { name: 'Arena Tostada Gamuza', hex: '#C5A882', role: 'neutral', description: 'Botines o zapatillas de ante neutro' },
      accessory: { name: 'Terracota Cálido', hex: '#B85D36', role: 'accent', description: 'Pañuelo, reloj o bolso de cuero' }
    }
  },
  {
    id: 'triguena-oliva',
    name: 'Piel Trigueña / Neutra',
    subtitle: 'Subtono Neutro / Oliva Suave',
    swatchHex: '#D29C6B',
    undertone: 'Neutro',
    description: 'La piel trigueña es extraordinariamente versátil. Sus mayores aliados son los tonos tierra ricos (terracota quemado, verde militar profundo, café espresso y ocre mostaza). Te permiten vestir tanto contrastes altos como armonías monocromáticas.',
    bestColors: [
      { name: 'Terracota de Molde', hex: '#C1440E', role: 'Acento estelar' },
      { name: 'Café Espresso', hex: '#3B271A', role: 'Base de lujo' },
      { name: 'Verde Militar Oliva', hex: '#3A422D', role: 'Estructura' },
      { name: 'Lino Hueso Crudo', hex: '#ECE4D4', role: 'Frescura neutra' }
    ],
    avoidColors: [
      { name: 'Verde Flúor / Neón', hex: '#39FF14', reason: 'Satura y desentona con los subtonos oliva' },
      { name: 'Morado Muy Frío', hex: '#4A0E4E', reason: 'Puede acentuar ojeras o sombras faciales' }
    ],
    outfitFormula: {
      name: 'Sastrería Lino & Terracota (Piel Trigueña)',
      harmonyType: 'monochromatic',
      description: 'Combinación icónica de sastrería: camisa en tono hueso lino, pantalón terracota quemado y calzado en espresso oscuro.',
      top: { name: 'Lino Crudo Textil', hex: '#EBE3D3', role: 'primary', description: 'Guayabera o camisa sastre de lino puro' },
      bottom: { name: 'Terracota Quemado Sastre', hex: '#C1440E', role: 'secondary', description: 'Pantalón Baggy con pinzas o corte Recto' },
      footwear: { name: 'Café Espresso Cuero', hex: '#342013', role: 'neutral', description: 'Mocasines o derbies de piel curtida' },
      accessory: { name: 'Latón Envejecido / Ámbar', hex: '#D4600A', role: 'accent', description: 'Cinturón sastre con hebilla dorada mate' }
    }
  },
  {
    id: 'morena-canela',
    name: 'Piel Morena Canela',
    subtitle: 'Subtono Cálido Intenso',
    swatchHex: '#9E6438',
    undertone: 'Cálido',
    description: 'Tu tono de piel morena proyecta fuerza y presencia. El contraste de alto valor con blanco marfil, azul cobalto, mostaza brillante y naranja óxido crea combinaciones vibrantes y elegantes con gran dinamismo visual.',
    bestColors: [
      { name: 'Azul Cobalto Real', hex: '#1E40AF', role: 'Contraste poderoso' },
      { name: 'Naranja Quemado', hex: '#EA580C', role: 'Energía cálida' },
      { name: 'Blanco Crudo Escultura', hex: '#F9F6F0', role: 'Máximo realce' },
      { name: 'Ocre Dorado', hex: '#CA8A04', role: 'Acento refinado' }
    ],
    avoidColors: [
      { name: 'Marrón Grisáceo Apagado', hex: '#635952', reason: 'Se confunde con la piel sin aportar contraste' },
      { name: 'Beige Ceniza Desvaído', hex: '#9E9A8E', reason: 'Resta vivacidad a la complexión' }
    ],
    outfitFormula: {
      name: 'Cobalto & Marfil (Piel Morena)',
      harmonyType: 'complementary',
      description: 'Fuerte presencia con prenda superior en azul cobalto intenso y pantalón en tono hueso marfil estructurado.',
      top: { name: 'Cobalto Real Profundo', hex: '#1E3A8A', role: 'primary', description: 'Buzo de cuello alto o polo tejido' },
      bottom: { name: 'Marfil Piedra Sastre', hex: '#EDE6DA', role: 'secondary', description: 'Pantalón de caída fluida en sarga clara' },
      footwear: { name: 'Café Caramelo Oscuro', hex: '#452A18', role: 'neutral', description: 'Calzado en piel con pátina artesanal' },
      accessory: { name: 'Naranja Óxido de Acento', hex: '#C2410C', role: 'accent', description: 'Gafas de sol de carey o pulsera de cuero' }
    }
  },
  {
    id: 'oscura-ebano',
    name: 'Piel Oscura Ébano',
    subtitle: 'Subtono Profundo Magnético',
    swatchHex: '#472B1B',
    undertone: 'Frío',
    description: 'La piel oscura profunda es el mejor lienzo del diseño de moda. Puedes llevar colores ultrabrillantes, blanco puro inmaculado, amarillos solares, verde esmeralda y rojos carmesí con una elegancia inigualable.',
    bestColors: [
      { name: 'Blanco Puro Inmaculado', hex: '#FFFFFF', role: 'Impacto escultórico' },
      { name: 'Amarillo Azafrán Solar', hex: '#EAB308', role: 'Luz radiante' },
      { name: 'Verde Esmeralda Joya', hex: '#059669', role: 'Lujo distinguido' },
      { name: 'Rojo Carmesí Profundo', hex: '#B91C1C', role: 'Presencia solemne' }
    ],
    avoidColors: [
      { name: 'Negro Carbón Total Opaco', hex: '#121212', reason: 'Puede absorber la luz sin generar volumen' },
      { name: 'Marrón Muy Oscuro Plano', hex: '#2A1B12', reason: 'Falta de definición geométrica' }
    ],
    outfitFormula: {
      name: 'Blanco Escultura & Esmeralda (Piel Oscura)',
      harmonyType: 'complementary',
      description: 'Impacto total: blazer o camisa en blanco níveo que enmarca el rostro con pantalón verde esmeralda joya.',
      top: { name: 'Blanco Nieve Escultórico', hex: '#FFFFFF', role: 'primary', description: 'Camisa estructurada con popelín de algodón' },
      bottom: { name: 'Verde Esmeralda Sastre', hex: '#064E3B', role: 'secondary', description: 'Pantalón sastre con raya marcada impecable' },
      footwear: { name: 'Blanco Óptico Minimal', hex: '#F8FAFC', role: 'neutral', description: 'Tenis de piel italiana o derbies marfil' },
      accessory: { name: 'Amarillo Azafrán Real', hex: '#EAB308', role: 'accent', description: 'Pañuelo de seda o anillo de oro amarillo' }
    }
  }
];

export default function PersonalColorimetry({ onApplyPalette }: PersonalColorimetryProps) {
  const [selectedProfile, setSelectedProfile] = useState<SkinToneProfile>(SKIN_PROFILES[2]); // Trigueña por defecto
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    onApplyPalette(selectedProfile.outfitFormula);
    setApplied(true);
    setTimeout(() => setApplied(false), 2400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
      
      {/* Selector de tonos de piel */}
      <div>
        <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Palette size={13} color="var(--accent-gold)" />
          Selecciona tu Tono de Piel y Subtono
        </label>
        
        <div className="skin-tones-grid">
          {SKIN_PROFILES.map((profile) => {
            const isSelected = selectedProfile.id === profile.id;
            return (
              <motion.button
                key={profile.id}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedProfile(profile)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid var(--accent-gold)' : '1px solid var(--border-medium)',
                  background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                  boxShadow: isSelected ? '0 0 0 3px var(--accent-light), 0 4px 16px var(--accent-glow)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  textAlign: 'left',
                  transition: 'all 160ms var(--ease-out)'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: profile.swatchHex,
                  border: '2px solid white',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                  flexShrink: 0
                }} />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: isSelected ? 'var(--accent-gold)' : 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  }}>
                    {profile.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {profile.undertone}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tarjeta de diagnóstico y paleta recomendada */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedProfile.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          className="glass-panel"
          style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.3rem' }}
        >
          {/* Header de la tarjeta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: selectedProfile.swatchHex,
                border: '3px solid white',
                boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                flexShrink: 0
              }} />
              <div>
                <span className="eyebrow">{selectedProfile.undertone}</span>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 400, marginTop: '0.1rem' }}>
                  {selectedProfile.name}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedProfile.subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={handleApply}
              className="btn-primary"
              style={{ padding: '10px 18px', fontSize: '0.84rem' }}
            >
              {applied ? (
                <>
                  <Check size={16} /> ¡Paleta Asignada al Outfit!
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Aplicar Paleta Recomendada
                </>
              )}
            </button>
          </div>

          {/* Diagnóstico */}
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
            {selectedProfile.description}
          </p>

          {/* Grid de colores favorecedores vs a evitar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
            
            {/* Colores estrella */}
            <div style={{
              padding: '1rem',
              borderRadius: '12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={13} /> Colores Estrella que te Favorecen
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {selectedProfile.bestColors.map((col, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: col.hex, border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{col.name}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{col.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Colores a evitar */}
            <div style={{
              padding: '1rem',
              borderRadius: '12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <AlertCircle size={13} /> Tonos a Tratar con Precaución
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {selectedProfile.avoidColors.map((col, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-card)', padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: col.hex, border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-primary)' }}>{col.name}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>{col.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Fórmula recomendada de prendas */}
          <div style={{
            padding: '1rem 1.2rem',
            borderRadius: '12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Shirt size={14} color="var(--accent-gold)" /> Fórmula de Armonía de Prendas: {selectedProfile.outfitFormula.name}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                {selectedProfile.outfitFormula.harmonyType.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem', marginTop: '0.2rem' }}>
              {[
                { label: 'Top', item: selectedProfile.outfitFormula.top },
                { label: 'Pantalón', item: selectedProfile.outfitFormula.bottom },
                { label: 'Calzado', item: selectedProfile.outfitFormula.footwear },
                { label: 'Accesorio', item: selectedProfile.outfitFormula.accessory }
              ].map(({ label, item }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '6px 10px', borderRadius: '8px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: item.hex, border: '1px solid rgba(0,0,0,0.2)', flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)' }}>{label}</div>
                    <div style={{ fontSize: '0.73rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      </AnimatePresence>

    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { 
  Scissors, 
  Sparkles, 
  Palette, 
  Layers, 
  Download, 
  Sliders, 
  Eye, 
  TrendingUp, 
  Shirt, 
  Check,
  RotateCcw
} from 'lucide-react';

import { 
  calculatePantsPattern, 
  SILHOUETTES, 
  type SilhouetteType, 
  type PatternMeasurements 
} from './lib/pattern-math';

import { 
  OUTFIT_PALETTES, 
  getProportionAdvice, 
  type OutfitPalette 
} from './lib/color-theory';

import { exportPatternToPdf } from './lib/pdf-generator';

const springTransition = {
  type: "spring" as const,
  damping: 24,
  stiffness: 260
};

const tabVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.28, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.18, ease: "easeIn" } }
};

function App() {
  const [activeTab, setActiveTab] = useState<'pattern' | 'advisor' | 'color'>('pattern');

  // Estado del Generador de Patrones
  const [selectedSilhouette, setSelectedSilhouette] = useState<SilhouetteType>('baggy');
  const [measurements, setMeasurements] = useState<PatternMeasurements>(
    SILHOUETTES['baggy'].defaultMeasurements
  );
  const [showGuides, setShowGuides] = useState(true);

  // Estado del Asesor de Proporciones
  const [userHeight, setUserHeight] = useState<number>(175);
  const [userWeight, setUserWeight] = useState<number>(70);
  const [fitPreference, setFitPreference] = useState<'oversize' | 'relaxed' | 'fitted'>('oversize');

  // Estado del Círculo Cromático
  const [selectedPalette, setSelectedPalette] = useState<OutfitPalette>(OUTFIT_PALETTES[0]);

  const currentPreset = SILHOUETTES[selectedSilhouette];
  const patternData = calculatePantsPattern(measurements, selectedSilhouette);
  const proportionAdvice = getProportionAdvice(userHeight, fitPreference);

  const handleSilhouetteChange = (sil: SilhouetteType) => {
    setSelectedSilhouette(sil);
    setMeasurements(SILHOUETTES[sil].defaultMeasurements);
    toast.success(`Silueta ${SILHOUETTES[sil].name} activada`, {
      description: SILHOUETTES[sil].tagline
    });
  };

  const handleMeasurementChange = (key: keyof PatternMeasurements, val: number) => {
    setMeasurements(prev => ({ ...prev, [key]: val }));
  };

  const handleDownloadPdf = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          exportPatternToPdf(measurements, selectedSilhouette);
          resolve(true);
        }, 400);
      }),
      {
        loading: 'Compilando geometrías vectoriales a escala real...',
        success: '¡Molde PDF descargado! Listo para imprimir en escala 100%.',
        error: 'Error al generar el archivo PDF.'
      }
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Toaster richColors position="top-right" theme="dark" closeButton />

      {/* HEADER PRINCIPAL APPLE-STYLE GLASS */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(8, 9, 12, 0.75)',
          backdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.85rem 1.5rem'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f3cc8a 0%, #e2b774 50%, #b8863b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(226, 183, 116, 0.3)'
              }}
            >
              <Scissors size={22} color="#08090c" strokeWidth={2.4} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '0.06em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                INEFABLE
              </h1>
              <span style={{ fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 600 }}>
                Haute Couture & Motion Studio
              </span>
            </div>
          </motion.div>

          {/* Navegación por Pestañas con Indicador Animado */}
          <nav style={{ display: 'flex', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.35rem', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
            {[
              { id: 'pattern', label: 'Estudio de Moldes', icon: Layers },
              { id: 'advisor', label: 'Asesor de Fit', icon: Sparkles },
              { id: 'color', label: 'Círculo Cromático', icon: Palette }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    padding: '0.55rem 1.15rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'transparent',
                    color: isActive ? '#08090c' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.88rem',
                    zIndex: 1,
                    transition: 'color 180ms ease'
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #f3cc8a 0%, #e2b774 100%)',
                        boxShadow: '0 2px 12px rgba(226, 183, 116, 0.35)',
                        zIndex: -1
                      }}
                    />
                  )}
                  <Icon size={16} strokeWidth={isActive ? 2.4 : 2} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </motion.header>

      {/* CONTENIDO PRINCIPAL CON TRANSICIÓN SUAVE */}
      <main style={{ flex: 1, maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>
        <AnimatePresence mode="wait">
          
          {/* PESTAÑA 1: CREAR MOLDES */}
          {activeTab === 'pattern' && (
            <motion.div
              key="pattern-tab"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
            >
              {/* Catálogo de Siluetas */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 800 }}>
                      1. Silueta & Proporción Base
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      Elige el corte de pantalón. Los cálculos anatómicos de holgura se aplican automáticamente.
                    </p>
                  </div>
                  <motion.span 
                    animate={{ scale: [1, 1.03, 1] }} 
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="glass-pill" 
                    style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600 }}
                  >
                    ✦ {currentPreset.category}
                  </motion.span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  {(Object.keys(SILHOUETTES) as SilhouetteType[]).map((key) => {
                    const preset = SILHOUETTES[key];
                    const isSelected = selectedSilhouette === key;
                    return (
                      <motion.div
                        key={key}
                        whileHover={{ y: -4, transition: { duration: 0.18 } }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSilhouetteChange(key)}
                        className="glass-panel"
                        style={{
                          padding: '1.3rem',
                          cursor: 'pointer',
                          border: isSelected ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                          background: isSelected ? 'rgba(226, 183, 116, 0.09)' : 'var(--bg-card)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {isSelected && (
                          <motion.div 
                            layoutId="selectedBorder"
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--accent-gold)' }} 
                          />
                        )}
                        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em', fontWeight: 600 }}>
                          {preset.category}
                        </span>
                        <h3 style={{ fontSize: '1.12rem', fontWeight: 700, color: isSelected ? 'var(--accent-gold)' : 'var(--text-primary)', marginTop: '0.25rem' }}>
                          {preset.name}
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.4' }}>
                          {preset.tagline}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Editor de Medidas & Canvas SVG */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '1.8rem', alignItems: 'start' }}>
                
                {/* Sliders de Medidas */}
                <motion.div layout className="glass-panel" style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Sliders size={19} color="#e2b774" />
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Dimensiones Corporales (cm)</h3>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMeasurements(currentPreset.defaultMeasurements)}
                      className="glass-pill"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.8rem', fontSize: '0.75rem', color: 'var(--text-secondary)', border: 'none' }}
                    >
                      <RotateCcw size={12} />
                      Reset
                    </motion.button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {[
                      { key: 'waist' as const, label: 'Contorno de Cintura', min: 60, max: 120 },
                      { key: 'hip' as const, label: 'Contorno de Cadera', min: 80, max: 135 },
                      { key: 'crotchDepth' as const, label: 'Altura / Profundidad de Tiro', min: 20, max: 38 },
                      { key: 'legLength' as const, label: 'Largo Total de Pierna', min: 85, max: 125 },
                      { key: 'kneeWidth' as const, label: 'Ancho de Rodilla', min: 16, max: 36 },
                      { key: 'bottomWidth' as const, label: 'Ancho de Bota / Bajo', min: 14, max: 42 }
                    ].map((item) => (
                      <div key={item.key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{item.label}</span>
                          <motion.span 
                            key={measurements[item.key]}
                            initial={{ scale: 1.2, color: '#f3cc8a' }}
                            animate={{ scale: 1, color: '#e2b774' }}
                            style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}
                          >
                            {measurements[item.key]} cm
                          </motion.span>
                        </div>
                        <input
                          type="range"
                          min={item.min}
                          max={item.max}
                          value={measurements[item.key]}
                          onChange={(e) => handleMeasurementChange(item.key, Number(e.target.value))}
                          style={{ width: '100%' }}
                        />
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(226, 183, 116, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownloadPdf}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.65rem',
                      background: 'linear-gradient(135deg, #f3cc8a 0%, #e2b774 50%, #c49752 100%)',
                      color: '#08090c',
                      fontWeight: 800,
                      fontSize: '0.96rem',
                      padding: '1rem',
                      borderRadius: '14px',
                      border: 'none',
                      marginTop: '0.5rem',
                      boxShadow: '0 4px 18px rgba(226, 183, 116, 0.25)',
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={19} />
                    Descargar Molde PDF a Escala 100%
                  </motion.button>
                </motion.div>

                {/* Vista Previa Vectorial con Animación SVG */}
                <motion.div layout className="glass-panel" style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Layers size={19} color="#e2b774" />
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Trazado Técnico Digital</h3>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowGuides(!showGuides)}
                      className="glass-pill"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.8rem', fontSize: '0.75rem', color: 'var(--text-secondary)', border: 'none' }}
                    >
                      <Eye size={14} />
                      {showGuides ? 'Ocultar Piquetes' : 'Ver Piquetes'}
                    </motion.button>
                  </div>

                  <div
                    style={{
                      background: '#06070a',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      padding: '1.5rem',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: '420px',
                      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
                    }}
                  >
                    <svg
                      viewBox={`0 0 ${patternData.dimensions.width} ${patternData.dimensions.height}`}
                      style={{ width: '100%', maxHeight: '460px' }}
                    >
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />

                      {/* Molde Delantero con transición suave */}
                      <g>
                        <motion.path
                          d={patternData.frontSvgPath}
                          fill="rgba(226, 183, 116, 0.09)"
                          stroke="#e2b774"
                          strokeWidth="2.2"
                          strokeLinejoin="round"
                          initial={false}
                          animate={{ d: patternData.frontSvgPath }}
                          transition={springTransition}
                        />
                        <line
                          x1={patternData.grainLineFront.x1}
                          y1={patternData.grainLineFront.y1}
                          x2={patternData.grainLineFront.x2}
                          y2={patternData.grainLineFront.y2}
                          stroke="#f43f5e"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />
                        <text x="160" y="25" fill="#f8fafc" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="0.05em">
                          DELANTERO (1/4)
                        </text>
                      </g>

                      {/* Molde Trasero */}
                      <g>
                        <motion.path
                          d={patternData.backSvgPath}
                          fill="rgba(99, 102, 241, 0.09)"
                          stroke="#818cf8"
                          strokeWidth="2.2"
                          strokeLinejoin="round"
                          initial={false}
                          animate={{ d: patternData.backSvgPath }}
                          transition={springTransition}
                        />
                        <line
                          x1={patternData.grainLineBack.x1}
                          y1={patternData.grainLineBack.y1}
                          x2={patternData.grainLineBack.x2}
                          y2={patternData.grainLineBack.y2}
                          stroke="#f43f5e"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />
                        <text x="440" y="25" fill="#f8fafc" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="0.05em">
                          TRASERO (1/4)
                        </text>
                      </g>

                      {/* Piquetes de costura */}
                      {showGuides && patternData.notches.map((notch, idx) => (
                        <circle key={idx} cx={notch.x} cy={notch.y} r="3.5" fill="#f43f5e" />
                      ))}
                    </svg>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>• Línea discontinua: Aplomo e Hilo de Tela</span>
                    <span>• Puntos rojos: Piquetes de coincidencia</span>
                  </div>
                </motion.div>

              </div>
            </motion.div>
          )}

          {/* PESTAÑA 2: ASESOR DE PROPORCIONES */}
          {activeTab === 'advisor' && (
            <motion.div
              key="advisor-tab"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
            >
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 800 }}>
                  Asesor de Proporciones & Fit Inteligente
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Ajuste de volúmenes y proporciones de sastrería para optimizar tu silueta visual.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '1.8rem', alignItems: 'start' }}>
                {/* Entradas del usuario */}
                <div className="glass-panel" style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <Shirt size={19} color="#e2b774" />
                    Parámetros Antropométricos
                  </h3>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Estatura</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>{userHeight} cm</span>
                    </div>
                    <input
                      type="range"
                      min="150"
                      max="205"
                      value={userHeight}
                      onChange={(e) => setUserHeight(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Peso Aproximado</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>{userWeight} kg</span>
                    </div>
                    <input
                      type="range"
                      min="45"
                      max="125"
                      value={userWeight}
                      onChange={(e) => setUserWeight(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.55rem', fontWeight: 500 }}>
                      Preferencia de Holgura (Fit)
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      {(['oversize', 'relaxed', 'fitted'] as const).map((mode) => {
                        const isChosen = fitPreference === mode;
                        return (
                          <motion.button
                            key={mode}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setFitPreference(mode)}
                            style={{
                              padding: '0.65rem 0.4rem',
                              borderRadius: '12px',
                              border: isChosen ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                              background: isChosen ? 'rgba(226, 183, 116, 0.15)' : 'var(--bg-glass)',
                              color: isChosen ? 'var(--accent-gold)' : 'var(--text-secondary)',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              textTransform: 'capitalize',
                              cursor: 'pointer'
                            }}
                          >
                            {mode}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resumen del Fit */}
                  <div style={{ padding: '1.2rem', borderRadius: '14px', background: 'rgba(226, 183, 116, 0.04)', border: '1px solid rgba(226, 183, 116, 0.2)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Fórmula de Estilo Recomendada:
                    </span>
                    <p style={{ fontSize: '0.94rem', color: 'var(--text-primary)', fontWeight: 700, marginTop: '0.3rem' }}>
                      {userHeight >= 178 ? 'Pantalón Baggy Full-Break + Buzo Boxy Cropped' : 'Pantalón Tiro Alto No-Break + Prenda Superior Entallada'}
                    </p>
                  </div>
                </div>

                {/* Tarjetas de Recomendaciones con Animaciones de Entrada */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  {proportionAdvice.map((rule, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.3 }}
                      className="glass-panel"
                      style={{ padding: '1.4rem' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.4rem' }}>
                        <TrendingUp size={17} color="#e2b774" />
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{rule.ruleName}</h4>
                      </div>
                      <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                        {rule.guideline}
                      </p>
                      <div style={{ marginTop: '0.85rem', padding: '0.8rem', borderRadius: '10px', background: 'rgba(226, 183, 116, 0.07)', borderLeft: '3px solid var(--accent-gold)' }}>
                        <p style={{ fontSize: '0.84rem', color: '#f8fafc', fontWeight: 600 }}>
                          ✦ {rule.recommendation}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* PESTAÑA 3: CÍRCULO CROMÁTICO */}
          {activeTab === 'color' && (
            <motion.div
              key="color-tab"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
            >
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 800 }}>
                  Estudio Cromático & Armonías de Vestuario
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Paletas calibradas con teoría del color para combinar prendas superiores, inferiores y calzado.
                </p>
              </div>

              {/* Selector de Paletas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.1rem' }}>
                {OUTFIT_PALETTES.map((pal) => {
                  const isSelected = selectedPalette.id === pal.id;
                  return (
                    <motion.div
                      key={pal.id}
                      whileHover={{ y: -4, transition: { duration: 0.18 } }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedPalette(pal)}
                      className="glass-panel"
                      style={{
                        padding: '1.3rem',
                        cursor: 'pointer',
                        border: isSelected ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                        background: isSelected ? 'rgba(226, 183, 116, 0.08)' : 'var(--bg-card)'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '0.85rem' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: pal.top.hex, border: '1px solid rgba(255,255,255,0.25)' }} />
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: pal.bottom.hex, border: '1px solid rgba(255,255,255,0.25)' }} />
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: pal.footwear.hex, border: '1px solid rgba(255,255,255,0.25)' }} />
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: pal.accessory.hex, border: '1px solid rgba(255,255,255,0.25)' }} />
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: isSelected ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                        {pal.name}
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: '1.4' }}>
                        {pal.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Desglose de la Paleta Seleccionada */}
              <motion.div layout className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-gold)', letterSpacing: '0.1em', fontWeight: 700 }}>
                      Armonía: {selectedPalette.harmonyType}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, marginTop: '0.2rem' }}>
                      {selectedPalette.name}
                    </h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toast.success('¡Paleta guardada en tu sesión!')}
                    className="glass-pill"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 1rem', fontSize: '0.82rem', color: 'var(--text-primary)', border: 'none' }}
                  >
                    <Check size={15} color="var(--accent-gold)" />
                    Guardar Paleta
                  </motion.button>
                </div>

                {/* Bloques de Prendas con Tarjetas Elevadas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.2rem' }}>
                  {[
                    { label: 'Prenda Superior', item: selectedPalette.top },
                    { label: 'Pantalón / Inferior', item: selectedPalette.bottom },
                    { label: 'Calzado', item: selectedPalette.footwear },
                    { label: 'Accesorio / Acento', item: selectedPalette.accessory }
                  ].map((entry, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -3 }}
                      style={{
                        padding: '1.3rem',
                        borderRadius: '16px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <motion.div
                        initial={false}
                        animate={{ background: entry.item.hex }}
                        transition={{ duration: 0.3 }}
                        style={{
                          width: '100%',
                          height: '56px',
                          borderRadius: '10px',
                          marginBottom: '0.9rem',
                          border: '1px solid rgba(255,255,255,0.1)',
                          boxShadow: `0 4px 16px ${entry.item.hex}33`
                        }}
                      />
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {entry.label}
                      </span>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginTop: '0.1rem' }}>{entry.item.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: '1.35' }}>
                        {entry.item.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;



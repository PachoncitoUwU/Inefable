import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { 
  Scissors, 
  Sparkles, 
  Palette, 
  Layers, 
  Download, 
  RotateCcw,
  Ruler,
  ArrowRight,
  Check
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

import ChromaticWheel from './components/chromatic-wheel';
import PersonalColorimetry from './components/personal-colorimetry';
import StyleAssistant from './components/style-assistant';
import NpcVisualizer from './components/npc-visualizer';

// ── EASING (segun skill animate/Emil) ──
const EASE_OUT  = [0.23, 1, 0.32, 1] as const;
const EASE_SPRING = { type: 'spring', damping: 22, stiffness: 280 } as const;

const tabContentVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, y: 0,
    transition: { duration: 0.26, ease: EASE_OUT }
  },
  exit: { 
    opacity: 0, y: -6,
    transition: { duration: 0.18, ease: 'easeIn' }
  }
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } }
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE_OUT } }
};


const POINT_NAMES: Record<string, string> = {
  '1': 'Vértice cintura costado',
  '2': 'Vértice bota costado',
  '3': 'Altura de cadera costado',
  '4': 'Altura de rodilla costado',
  '5': 'Cruce de entrepierna / tiro',
  '6': 'Punta gancho de tiro anatómico',
  '7': 'Centro línea de tiro / eje aplomo',
  '8': 'Curvatura profundidad de tiro',
  '9': 'Centro de rodilla',
  '10': 'Ancho rodilla entrepierna',
  '11': 'Ancho rodilla costado',
  '12': 'Centro de bota / bajo',
  '13': 'Ancho bota entrepierna',
  '14': 'Ancho bota costado',
  '15': 'Altura cadera centro frente',
  '16': 'Vértice cintura centro frente / tiro',
  '17': 'Caída y desvío de cintura / pinza',
  '18': 'Centro cintura / eje de pinza',
  '19': 'Curvatura de cadera costado'
};

function App() {
  const [activeTab, setActiveTab] = useState<'pattern' | 'advisor' | 'color' | 'npc'>('pattern');

  const [selectedSilhouette, setSelectedSilhouette] = useState<SilhouetteType>('baggy');
  const [measurements, setMeasurements] = useState<PatternMeasurements>(
    SILHOUETTES['baggy'].defaultMeasurements
  );
  const [showGuides, setShowGuides] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [pieceView, setPieceView] = useState<'both' | 'front' | 'back'>('both');
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  const [userHeight, setUserHeight] = useState<number>(175);
  const [userWeight, setUserWeight] = useState<number>(70);
  const [fitPreference, setFitPreference] = useState<'oversize' | 'relaxed' | 'fitted'>('oversize');

  const [selectedPalette, setSelectedPalette] = useState<OutfitPalette>(OUTFIT_PALETTES[0]);

  const currentPreset = SILHOUETTES[selectedSilhouette];
  const patternData = calculatePantsPattern(measurements, selectedSilhouette);
  const proportionAdvice = getProportionAdvice(userHeight, fitPreference);

  const handleSilhouetteChange = (sil: SilhouetteType) => {
    setSelectedSilhouette(sil);
    setMeasurements(SILHOUETTES[sil].defaultMeasurements);
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <Toaster 
        richColors 
        position="bottom-right" 
        theme="light"
        duration={1600}
        closeButton
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)'
          }
        }}
      />

      {/* === HEADER EDITORIAL === */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        className="app-header"
        style={{ padding: '0.8rem 1.5rem' }}
      >
        <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          
          {/* Logo + marca */}
          <motion.div 
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.97 }}
            transition={EASE_SPRING}
            style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'var(--accent-gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 16px rgba(193, 68, 14, 0.35)'
            }}>
              <Scissors size={20} color="#F4EFE9" strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.45rem',
                fontWeight: 800,
                letterSpacing: '-0.01em',
                color: 'var(--text-primary)',
                lineHeight: 1.0,
                textTransform: 'uppercase'
              }}>
                Inefable
              </h1>
              <span style={{
                fontSize: '0.6rem', letterSpacing: '0.2em',
                textTransform: 'uppercase', color: 'var(--accent-gold)',
                fontWeight: 600, fontFamily: 'var(--font-mono)'
              }}>
                Estudio de Patronaje
              </span>
            </div>
          </motion.div>

          {/* NAV TABS con indicador deslizante */}
          <nav className="nav-pill" style={{ display: 'flex', gap: 0 }}>
            {([
              { id: 'pattern', label: 'Moldes CAD', icon: Layers },
              { id: 'advisor', label: 'Fit & Proporciones', icon: Sparkles },
              { id: 'color',   label: 'Color & Paletas', icon: Palette },
              { id: 'npc',     label: 'Silueta & Textil', icon: Scissors }
            ] as const).map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ position: 'relative', zIndex: 1 }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    className="nav-tab-bg"
                    layoutId="nav-indicator"
                    transition={EASE_SPRING}
                    style={{ zIndex: -1 }}
                  />
                )}
                <tab.icon size={14} strokeWidth={2} style={{ flexShrink: 0 }} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </motion.header>

      {/* === CONTENIDO PRINCIPAL === */}
      <main style={{ flex: 1, maxWidth: '1300px', margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>
        <AnimatePresence mode="wait">

          
          {/* === TAB: MOLDES === */}
          {activeTab === 'pattern' && (
            <motion.div
              key="pattern-tab"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
            >
              {/* Encabezado de sección */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="eyebrow">Generador de Moldes</span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, lineHeight: 1.05, marginTop: '0.25rem' }}>
                    Patronaje técnico de pantalón
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.4rem', maxWidth: '480px' }}>
                    19 puntos técnicos. Curvas de Bézier en el tiro. Escala real para impresión.
                  </p>
                </div>
                <span className="chip">
                  ✦ {currentPreset.category}
                </span>
              </div>

              {/* Grid de siluetas */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}
              >
                {(Object.keys(SILHOUETTES) as SilhouetteType[]).map((key) => {
                  const preset = SILHOUETTES[key];
                  const isSelected = selectedSilhouette === key;
                  return (
                    <motion.div
                      key={key}
                      variants={staggerItem}
                      whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
                      onClick={() => handleSilhouetteChange(key)}
                      className={`silhouette-card ${isSelected ? 'selected' : ''}`}
                      style={{ position: 'relative', overflow: 'hidden' }}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="card-accent"
                          style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                            background: 'var(--accent-gold)',
                            borderRadius: '14px 14px 0 0'
                          }}
                        />
                      )}
                      <span style={{ fontSize: '0.69rem', textTransform: 'uppercase', letterSpacing: '0.09em', color: isSelected ? 'var(--accent-gold)' : 'var(--text-muted)', fontWeight: 700 }}>
                        {preset.category}
                      </span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.3rem', lineHeight: 1.2 }}>
                        {preset.name}
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.45rem', lineHeight: '1.45' }}>
                        {preset.tagline}
                      </p>
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '12px', right: '12px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={11} color="white" strokeWidth={3} />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Editor + Canvas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

                {/* Panel de medidas */}
                <motion.div layout className="glass-panel" style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Ruler size={18} color="var(--accent-gold)" />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Medidas Corporales (cm)</h3>
                    </div>
                    <button
                      className="btn-secondary"
                      onClick={() => setMeasurements(currentPreset.defaultMeasurements)}
                      style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '4px' }}
                    >
                      <RotateCcw size={12} />
                      Reset
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    {([
                      { key: 'waist' as const, label: 'Contorno de Cintura', min: 60, max: 120 },
                      { key: 'hip' as const, label: 'Contorno de Cadera', min: 80, max: 135 },
                      { key: 'crotchDepth' as const, label: 'Profundidad de Tiro', min: 20, max: 38 },
                      { key: 'legLength' as const, label: 'Largo de Pierna', min: 85, max: 125 },
                      { key: 'kneeWidth' as const, label: 'Ancho de Rodilla', min: 16, max: 36 },
                      { key: 'bottomWidth' as const, label: 'Ancho de Bajo / Bota', min: 14, max: 42 }
                    ]).map((item) => (
                      <div key={item.key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                          <label className="field-label" style={{ marginBottom: 0 }}>{item.label}</label>
                          <motion.span
                            key={measurements[item.key]}
                            initial={{ scale: 1.15, color: 'var(--accent-gold)' }}
                            animate={{ scale: 1, color: 'var(--text-primary)' }}
                            transition={{ duration: 0.25 }}
                            style={{ fontSize: '0.88rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
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
                          style={{
                            width: '100%', height: '5px', borderRadius: '4px',
                            appearance: 'none', WebkitAppearance: 'none',
                            background: `linear-gradient(to right, var(--accent-gold) 0%, var(--accent-gold) ${((measurements[item.key] - item.min) / (item.max - item.min)) * 100}%, var(--border-medium) ${((measurements[item.key] - item.min) / (item.max - item.min)) * 100}%, var(--border-medium) 100%)`,
                            outline: 'none', cursor: 'pointer'
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(193, 68, 14, 0.3)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDownloadPdf}
                    className="btn-primary"
                    style={{ justifyContent: 'center', padding: '13px', marginTop: '0.3rem', fontSize: '0.92rem' }}
                  >
                    <Download size={17} />
                    Descargar Molde PDF — Escala Real
                  </motion.button>
                </motion.div>

                {/* Canvas SVG del patrón con herramientas de inspección */}
                <motion.div layout className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Layers size={18} color="var(--accent-gold)" />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Plano Técnico — 19 Puntos</h3>
                    </div>

                    {/* Selector de pieza activa */}
                    <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-medium)' }}>
                      {(['both', 'front', 'back'] as const).map((pv) => (
                        <button
                          key={pv}
                          onClick={() => setPieceView(pv)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '0.74rem',
                            fontWeight: pieceView === pv ? 700 : 500,
                            background: pieceView === pv ? 'var(--bg-card)' : 'transparent',
                            color: pieceView === pv ? 'var(--text-primary)' : 'var(--text-muted)',
                            boxShadow: pieceView === pv ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 150ms'
                          }}
                        >
                          {pv === 'both' ? 'Ambos' : pv === 'front' ? 'Delantero' : 'Trasero'}
                        </button>
                      ))}
                    </div>

                    {/* Toggles de visualización */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => setShowGuides(!showGuides)}
                        style={{ padding: '5px 10px', fontSize: '0.74rem' }}
                      >
                        {showGuides ? 'Guías ON' : 'Guías OFF'}
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => setShowLabels(!showLabels)}
                        style={{ padding: '5px 10px', fontSize: '0.74rem' }}
                      >
                        {showLabels ? 'Números ON' : 'Números OFF'}
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => setShowDimensions(!showDimensions)}
                        style={{ padding: '5px 10px', fontSize: '0.74rem' }}
                      >
                        {showDimensions ? 'Cotas ON' : 'Cotas OFF'}
                      </button>
                    </div>
                  </div>

                  {/* Barra de información del punto hovereado */}
                  <div style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', fontSize: '0.76rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '32px' }}>
                    {hoveredPoint ? (
                      <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
                        Punto {hoveredPoint}: {POINT_NAMES[hoveredPoint] || 'Punto anatómico'}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>
                        Pasa el cursor sobre cualquier punto (1–19) para ver su función técnica anatómica.
                      </span>
                    )}
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                      Escala 1:10
                    </span>
                  </div>

                  {/* SVG del patrón con los 19 puntos */}
                  <motion.div
                    key={`${selectedSilhouette}-${pieceView}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35, ease: EASE_OUT }}
                    className="pattern-canvas"
                    style={{ width: '100%', overflow: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}
                  >
                    <svg
                      viewBox={
                        pieceView === 'front'
                          ? `20 0 ${patternData.gridBoxes.front.x + patternData.gridBoxes.front.width + 60} ${patternData.dimensions.height}`
                          : pieceView === 'back'
                          ? `${patternData.gridBoxes.back.x - 90} 0 ${patternData.gridBoxes.back.width + 160} ${patternData.dimensions.height}`
                          : `0 0 ${patternData.dimensions.width} ${patternData.dimensions.height}`
                      }
                      width="100%"
                      height="auto"
                      style={{ display: 'block', minHeight: '520px', maxHeight: '720px' }}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Fondo de papel milimetrado suave */}
                      <rect width="2000" height="2000" fill="#FFFFFF" />
                      
                      {/* Cuadrícula técnica suave */}
                      {showGuides && (
                        <g opacity="0.12">
                          {Array.from({ length: 40 }).map((_, i) => (
                            <line key={`vg${i}`} x1={i * 40} y1="0" x2={i * 40} y2={patternData.dimensions.height} stroke="#0ea5e9" strokeWidth="0.5" />
                          ))}
                          {Array.from({ length: 40 }).map((_, i) => (
                            <line key={`hg${i}`} x1="0" y1={i * 40} x2={patternData.dimensions.width} y2={i * 40} stroke="#0ea5e9" strokeWidth="0.5" />
                          ))}
                        </g>
                      )}

                      {/* LÍNEAS GUÍA TÉCNICAS EN CYAN / TURQUESA */}
                      {showGuides && (
                        <g stroke="#0284c7" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.75">
                          {(pieceView === 'both' || pieceView === 'front') && (
                            <>
                              <line x1={patternData.labelPoints.front[5].x - 10} y1={patternData.labelPoints.front[2].y} x2={patternData.labelPoints.front[0].x + 10} y2={patternData.labelPoints.front[2].y} />
                              <line x1={patternData.labelPoints.front[9].x - 10} y1={patternData.labelPoints.front[3].y} x2={patternData.labelPoints.front[0].x + 10} y2={patternData.labelPoints.front[3].y} />
                              <line x1={patternData.labelPoints.front[12].x - 10} y1={patternData.labelPoints.front[1].y} x2={patternData.labelPoints.front[0].x + 10} y2={patternData.labelPoints.front[1].y} />
                              <line x1={patternData.labelPoints.front[0].x} y1={patternData.labelPoints.front[0].y} x2={patternData.labelPoints.front[1].x} y2={patternData.labelPoints.front[1].y} />
                            </>
                          )}

                          {(pieceView === 'both' || pieceView === 'back') && (
                            <>
                              <line x1={patternData.labelPoints.back[5].x - 10} y1={patternData.labelPoints.back[2].y} x2={patternData.labelPoints.back[0].x + 10} y2={patternData.labelPoints.back[2].y} />
                              <line x1={patternData.labelPoints.back[9].x - 10} y1={patternData.labelPoints.back[3].y} x2={patternData.labelPoints.back[0].x + 10} y2={patternData.labelPoints.back[3].y} />
                              <line x1={patternData.labelPoints.back[12].x - 10} y1={patternData.labelPoints.back[1].y} x2={patternData.labelPoints.back[0].x + 10} y2={patternData.labelPoints.back[1].y} />
                              <line x1={patternData.labelPoints.back[0].x} y1={patternData.labelPoints.back[0].y} x2={patternData.labelPoints.back[1].x} y2={patternData.labelPoints.back[1].y} />
                            </>
                          )}
                        </g>
                      )}

                      {/* LÍNEAS DE APLOMO / HILO DE TELA */}
                      {showGuides && (
                        <g stroke="#0284c7" strokeWidth="1" strokeDasharray="4 3" opacity="0.85">
                          {(pieceView === 'both' || pieceView === 'front') && (
                            <line x1={patternData.grainLineFront.x1} y1={patternData.grainLineFront.y1} x2={patternData.grainLineFront.x2} y2={patternData.grainLineFront.y2} />
                          )}
                          {(pieceView === 'both' || pieceView === 'back') && (
                            <line x1={patternData.grainLineBack.x1} y1={patternData.grainLineBack.y1} x2={patternData.grainLineBack.x2} y2={patternData.grainLineBack.y2} />
                          )}
                        </g>
                      )}

                      {/* DELANTERO */}
                      {(pieceView === 'both' || pieceView === 'front') && (
                        <g>
                          <path d={patternData.frontDartPath} fill="none" stroke="var(--bg-dark)" strokeWidth="1.2" />
                          <motion.path
                            key={`front-${selectedSilhouette}`}
                            d={patternData.frontSvgPath}
                            fill="rgba(28, 25, 22, 0.02)"
                            stroke="var(--bg-dark)"
                            strokeWidth="2"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            initial={{ opacity: 0, pathLength: 0 }}
                            animate={{ opacity: 1, pathLength: 1 }}
                            transition={{ duration: 1, ease: EASE_OUT }}
                          />

                          {/* Cotas métricas en delantero */}
                          {showDimensions && (
                            <g fontSize="7.5" fill="#64748b" fontFamily="var(--font-mono)">
                              <text x={patternData.grainLineFront.x1} y={patternData.labelPoints.front[2].y - 5} textAnchor="middle">
                                Tiro: {measurements.crotchDepth}cm
                              </text>
                              <text x={patternData.grainLineFront.x1} y={patternData.labelPoints.front[3].y - 5} textAnchor="middle">
                                Rodilla: {measurements.kneeWidth}cm
                              </text>
                              <text x={patternData.grainLineFront.x1} y={patternData.labelPoints.front[1].y - 5} textAnchor="middle">
                                Bajo: {measurements.bottomWidth}cm
                              </text>
                            </g>
                          )}

                          {/* Puntos 1 a 19 Delantero */}
                          {showLabels && patternData.labelPoints.front.map((pt) => {
                            const isHovered = hoveredPoint === pt.label;
                            return (
                              <g 
                                key={`fp-${pt.label}`} 
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={() => setHoveredPoint(pt.label || null)}
                                onMouseLeave={() => setHoveredPoint(null)}
                              >
                                <circle 
                                  cx={pt.x} 
                                  cy={pt.y} 
                                  r={isHovered ? 5 : 3.2} 
                                  fill={isHovered ? 'var(--accent-gold)' : 'var(--bg-dark)'} 
                                  stroke="white" 
                                  strokeWidth="1" 
                                />
                                <text
                                  x={pt.x < patternData.grainLineFront.x1 ? pt.x - 7 : pt.x + 7}
                                  y={pt.y + 3.5}
                                  fontSize={isHovered ? "10" : "8.5"}
                                  fill={isHovered ? 'var(--accent-gold)' : 'var(--bg-dark)'}
                                  fontFamily="var(--font-mono)"
                                  fontWeight="700"
                                  textAnchor={pt.x < patternData.grainLineFront.x1 ? 'end' : 'start'}
                                >
                                  {pt.label}
                                </text>
                              </g>
                            );
                          })}

                          <text x={patternData.grainLineFront.x1} y="24" fontSize="12" fill="var(--bg-dark)" fontFamily="var(--font-sans)" fontWeight="700" textAnchor="middle" letterSpacing="0.1em">
                            DELANTERO
                          </text>
                        </g>
                      )}

                      {/* TRASERO */}
                      {(pieceView === 'both' || pieceView === 'back') && (
                        <g>
                          <path d={patternData.backDartPath} fill="none" stroke="var(--accent-gold)" strokeWidth="1.2" />
                          <motion.path
                            key={`back-${selectedSilhouette}`}
                            d={patternData.backSvgPath}
                            fill="rgba(193, 68, 14, 0.03)"
                            stroke="var(--accent-gold)"
                            strokeWidth="2"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            initial={{ opacity: 0, pathLength: 0 }}
                            animate={{ opacity: 1, pathLength: 1 }}
                            transition={{ duration: 1, ease: EASE_OUT, delay: 0.15 }}
                          />

                          {/* Cotas métricas en trasero */}
                          {showDimensions && (
                            <g fontSize="7.5" fill="#c1440e" fontFamily="var(--font-mono)" opacity="0.85">
                              <text x={patternData.grainLineBack.x1} y={patternData.labelPoints.back[2].y - 5} textAnchor="middle">
                                Gancho trasero extendido
                              </text>
                            </g>
                          )}

                          {/* Puntos 1 a 19 Trasero */}
                          {showLabels && patternData.labelPoints.back.map((pt) => {
                            const isHovered = hoveredPoint === pt.label;
                            return (
                              <g 
                                key={`bp-${pt.label}`} 
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={() => setHoveredPoint(pt.label || null)}
                                onMouseLeave={() => setHoveredPoint(null)}
                              >
                                <circle 
                                  cx={pt.x} 
                                  cy={pt.y} 
                                  r={isHovered ? 5 : 3.2} 
                                  fill={isHovered ? 'var(--bg-dark)' : 'var(--accent-gold)'} 
                                  stroke="white" 
                                  strokeWidth="1" 
                                />
                                <text
                                  x={pt.x < patternData.grainLineBack.x1 ? pt.x - 7 : pt.x + 7}
                                  y={pt.y + 3.5}
                                  fontSize={isHovered ? "10" : "8.5"}
                                  fill={isHovered ? 'var(--bg-dark)' : 'var(--accent-gold)'}
                                  fontFamily="var(--font-mono)"
                                  fontWeight="700"
                                  textAnchor={pt.x < patternData.grainLineBack.x1 ? 'end' : 'start'}
                                >
                                  {pt.label}
                                </text>
                              </g>
                            );
                          })}

                          <text x={patternData.grainLineBack.x1} y="24" fontSize="12" fill="var(--accent-gold)" fontFamily="var(--font-sans)" fontWeight="700" textAnchor="middle" letterSpacing="0.1em">
                            TRASERO
                          </text>
                        </g>
                      )}

                      {/* Piquetes de ensamble */}
                      {showGuides && patternData.notches.map((n, i) => (
                        <g key={`notch-${i}`}>
                          <circle cx={n.x} cy={n.y} r="2.5" fill="var(--accent-gold)" />
                          <line x1={n.x - 3} y1={n.y} x2={n.x + 3} y2={n.y} stroke="white" strokeWidth="0.8" />
                        </g>
                      ))}
                    </svg>
                  </motion.div>

                  {/* Leyenda */}
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      <div style={{ width: '20px', height: '2px', background: 'var(--bg-dark)' }} />
                      Delantero
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      <div style={{ width: '20px', height: '2px', background: 'var(--accent-gold)', borderTop: '2px dashed var(--accent-gold)' }} />
                      Trasero
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      <div style={{ width: '4px', height: '14px', background: 'var(--bg-dark)', opacity: 0.5 }} />
                      Piquetes
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      <ArrowRight size={12} />
                      Hilo de tela (aplomo)
                    </div>
                  </div>
                </motion.div>
              </div>


            </motion.div>
          )}


          {activeTab === 'advisor' && (
            <motion.div
              key="advisor-tab"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ display: 'flex', flexDirection: 'column', gap: '2.8rem' }}
            >
              <div>
                <span className="eyebrow">Asesor de Fit & Sastrería</span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.1rem', fontWeight: 400, lineHeight: 1.05, marginTop: '0.25rem' }}>
                  Proporciones Corporales & Asistente IA
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                  Calibra tu silueta visual mediante reglas áureas de sastrería y consulta a nuestro asistente de estilo inteligente en tiempo real.
                </p>
              </div>

              {/* APARTADO 1: PARÁMETROS CORPORALES & REGLAS DE VOLUMEN */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.8rem', alignItems: 'start' }}>
                
                {/* Entradas del usuario */}
                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Sparkles size={18} color="var(--accent-gold)" />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Parámetros Corporales</h3>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <label className="field-label" style={{ marginBottom: 0 }}>Estatura</label>
                      <span style={{ fontWeight: 700, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
                        {userHeight} cm
                      </span>
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
                      <label className="field-label" style={{ marginBottom: 0 }}>Peso Aproximado</label>
                      <span style={{ fontWeight: 700, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
                        {userWeight} kg
                      </span>
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
                              padding: '0.75rem 0.5rem',
                              borderRadius: '12px',
                              border: isChosen ? '2px solid var(--accent-gold)' : '1.5px solid var(--border-medium)',
                              background: isChosen ? 'var(--accent-light)' : 'var(--bg-secondary)',
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
                  <div style={{ padding: '1.2rem', borderRadius: '14px', background: 'var(--accent-light)', border: '1px solid var(--border-accent)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      Fórmula de Estilo Recomendada:
                    </span>
                    <p style={{ fontSize: '0.94rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.3rem' }}>
                      {userHeight >= 178 ? 'Pantalón Baggy Full-Break + Buzo Boxy Cropped' : 'Pantalón Tiro Alto No-Break + Prenda Superior Entallada'}
                    </p>
                  </div>
                </div>

                {/* Tarjetas de Recomendaciones con Animaciones de Entrada */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {proportionAdvice.map((rule, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08, duration: 0.28, ease: EASE_OUT }}
                      className="glass-panel"
                      style={{ padding: '1.6rem' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.4rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-gold)', flexShrink: 0 }} />
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{rule.ruleName}</h4>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        {rule.guideline}
                      </p>
                      <div style={{ marginTop: '0.85rem', padding: '0.85rem 1rem', borderRadius: '10px', background: 'var(--accent-light)', borderLeft: '3px solid var(--accent-gold)' }}>
                        <p style={{ fontSize: '0.84rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                          {'\u2192'} {rule.recommendation}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* APARTADO 2 DEDICADO: ASISTENTE SASTRERO CON IA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span className="eyebrow">Consultor de Imagen Virtual</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.55rem', fontWeight: 400, marginTop: '0.15rem' }}>
                    Asistente Sastrero Inteligente (IA)
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Tu consultor privado de alta sastrería. Pregúntale cómo combinar prendas, elegir calzado o sacarle el máximo partido a tu estatura.
                  </p>
                </div>

                <StyleAssistant
                  userHeight={userHeight}
                  userWeight={userWeight}
                  selectedSilhouette={selectedSilhouette}
                />
              </div>

            </motion.div>
          )}

          {/* PESTAÑA 3: COLOR & PALETAS (ORGANIZADO EN 3 APARTADOS CON ESPACIOS AMPLIOS) */}
          {activeTab === 'color' && (
            <motion.div
              key="color-tab"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}
            >
              <div>
                <span className="eyebrow">Laboratorio de Teoría del Color</span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.1rem', fontWeight: 400, lineHeight: 1.05, marginTop: '0.25rem' }}>
                  Colorimetría, Círculo Cromático & Paletas
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                  Sistema integral de armonización cromática: análisis personal según tono de piel, rueda cromática interactiva de 360° y catálogo editorial.
                </p>
              </div>

              {/* ── APARTADO 1: COLORIMETRÍA PERSONAL SEGÚN TONO DE PIEL ── */}
              <div className="glass-panel" style={{ padding: '2.4rem' }}>
                <div style={{ marginBottom: '1.4rem' }}>
                  <span className="eyebrow">1. Análisis Cutáneo</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.55rem', fontWeight: 400, marginTop: '0.15rem' }}>
                    Colorimetría Personal
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Selecciona tu tono y subtono de piel para descubrir los colores estrella que realzan tu rostro y las prendas sugeridas para tu fisonomía.
                  </p>
                </div>

                <PersonalColorimetry
                  onApplyPalette={(pal) => {
                    setSelectedPalette(pal as any);
                  }}
                />
              </div>

              {/* ── APARTADO 2: CÍRCULO CROMÁTICO INTERACTIVO & ARMONÍAS ── */}
              <div className="glass-panel" style={{ padding: '2.4rem' }}>
                <div style={{ marginBottom: '1.4rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto 1.8rem auto' }}>
                  <span className="eyebrow">2. Espectro Óptico Continuo</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.55rem', fontWeight: 400, marginTop: '0.15rem' }}>
                    Círculo Cromático Interactivo
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.5' }}>
                    Mueve el mouse o pulsa sobre la rueda cromática para aislar cualquier tinte textil y descubrir de inmediato sus fórmulas monocromáticas, complementarias, análogas y triádicas.
                  </p>
                </div>

                <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%' }}>
                  <ChromaticWheel onPaletteSelect={(pal) => {
                    setSelectedPalette(pal as any);
                  }} />
                </div>
              </div>

              {/* ── APARTADO 3: PALETAS DE SASTRERÍA CURADAS & DESGLOSE DE PRENDAS ── */}
              <div className="glass-panel" style={{ padding: '2.4rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                <div>
                  <span className="eyebrow">3. Catálogo de Moda</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.55rem', fontWeight: 400, marginTop: '0.15rem' }}>
                    Paletas Editoriales Curadas &amp; Coordinación de Prendas
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Combinaciones de sastrería pre-calibradas para eventos formales, estilo urbano y ocasiones de alta costura.
                  </p>
                </div>

                {/* Grid espacioso de Paletas Curadas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
                  {OUTFIT_PALETTES.map((pal) => {
                    const isSelected = selectedPalette.id === pal.id;
                    return (
                      <motion.div
                        key={pal.id}
                        whileHover={{ y: -3, transition: { duration: 0.18 } }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPalette(pal)}
                        style={{
                          padding: '1.3rem 1.5rem',
                          borderRadius: '16px',
                          cursor: 'pointer',
                          border: isSelected ? '2px solid var(--accent-gold)' : '1px solid var(--border-medium)',
                          background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-secondary)',
                          boxShadow: isSelected ? '0 0 0 3px var(--accent-light), 0 6px 20px rgba(193, 68, 14, 0.08)' : 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.85rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: isSelected ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                            {pal.name}
                          </h4>
                          <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: pal.top.hex, border: '1px solid rgba(0,0,0,0.15)' }} />
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: pal.bottom.hex, border: '1px solid rgba(0,0,0,0.15)' }} />
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: pal.footwear.hex, border: '1px solid rgba(0,0,0,0.15)' }} />
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: pal.accessory.hex, border: '1px solid rgba(0,0,0,0.15)' }} />
                          </div>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          {pal.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Desglose de Prendas de la Paleta Activa */}
                <div style={{
                  padding: '1.6rem',
                  borderRadius: '16px',
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-medium)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.3rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-gold)', letterSpacing: '0.08em', fontWeight: 700 }}>
                        Armonía Activa: {selectedPalette.harmonyType.toUpperCase()}
                      </span>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700, marginTop: '0.15rem' }}>
                        {selectedPalette.name}
                      </h4>
                    </div>

                    <button
                      onClick={() => toast.success('¡Paleta guardada en tu sesión!')}
                      className="btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                    >
                      <Check size={15} color="var(--accent-gold)" />
                      Guardar Paleta
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {[
                      { label: 'Prenda Superior', item: selectedPalette.top },
                      { label: 'Pantalón / Inferior', item: selectedPalette.bottom },
                      { label: 'Calzado', item: selectedPalette.footwear },
                      { label: 'Accesorio / Acento', item: selectedPalette.accessory }
                    ].map((entry, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '1.1rem',
                          borderRadius: '12px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: '42px',
                            borderRadius: '8px',
                            background: entry.item.hex,
                            marginBottom: '0.75rem',
                            border: '1px solid rgba(0,0,0,0.08)',
                            boxShadow: `0 3px 12px ${entry.item.hex}33`
                          }}
                        />
                        <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                          {entry.label}
                        </span>
                        <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '0.1rem', color: 'var(--text-primary)' }}>
                          {entry.item.name}
                        </h5>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.35' }}>
                          {entry.item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* PESTAÑA 4: SILUETA & RECOMENDACIÓN ANTROPOMÉTRICA (SIN DIBUJO) */}
          {activeTab === 'npc' && (
            <motion.div
              key="npc-tab"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ display: 'flex', flexDirection: 'column', gap: '2.4rem' }}
            >
              <div>
                <span className="eyebrow">Asesor Antropométrico de Sastrería</span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.1rem', fontWeight: 400, lineHeight: 1.05, marginTop: '0.25rem' }}>
                  Recomendador de Silueta según Peso &amp; Estatura
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                  Calcula con precisión cuál corte de pantalón potencia tu estatura y complexión, con selección de color textil y composiciones de fibra.
                </p>
              </div>

              <NpcVisualizer
                userHeight={userHeight}
                userWeight={userWeight}
                selectedSilhouette={selectedSilhouette}
                onSilhouetteChange={(sil) => handleSilhouetteChange(sil as any)}
                onHeightChange={(h) => setUserHeight(h)}
                onWeightChange={(w) => setUserWeight(w)}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;



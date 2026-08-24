import { useState } from 'react';
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
    toast.success(`Silueta cambiada a ${SILHOUETTES[sil].name}`, {
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
        loading: 'Generando archivo de patronaje a escala...',
        success: '¡Molde PDF descargado! Listo para impresión y ensamble.',
        error: 'Error al exportar el molde PDF'
      }
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toaster richColors position="top-right" theme="dark" />

      {/* HEADER PRINCIPAL */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(10, 10, 12, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.9rem 1.5rem'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #e2b774 0%, #c49752 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(226, 183, 116, 0.3)'
              }}
            >
              <Scissors size={20} color="#0a0a0c" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
                INEFABLE
              </h1>
              <span style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-gold)' }}>
                Sartorial Intelligence & Motion
              </span>
            </div>
          </div>

          {/* Navegación por Pestañas */}
          <nav style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.3rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setActiveTab('pattern')}
              className="btn-touch"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'pattern' ? 'var(--accent-gold)' : 'transparent',
                color: activeTab === 'pattern' ? '#0a0a0c' : 'var(--text-secondary)',
                fontWeight: activeTab === 'pattern' ? 700 : 500,
                fontSize: '0.88rem'
              }}
            >
              <Layers size={16} />
              Crear Moldes
            </button>

            <button
              onClick={() => setActiveTab('advisor')}
              className="btn-touch"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'advisor' ? 'var(--accent-gold)' : 'transparent',
                color: activeTab === 'advisor' ? '#0a0a0c' : 'var(--text-secondary)',
                fontWeight: activeTab === 'advisor' ? 700 : 500,
                fontSize: '0.88rem'
              }}
            >
              <Sparkles size={16} />
              Asesor de Proporción
            </button>

            <button
              onClick={() => setActiveTab('color')}
              className="btn-touch"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'color' ? 'var(--accent-gold)' : 'transparent',
                color: activeTab === 'color' ? '#0a0a0c' : 'var(--text-secondary)',
                fontWeight: activeTab === 'color' ? 700 : 500,
                fontSize: '0.88rem'
              }}
            >
              <Palette size={16} />
              Círculo Cromático
            </button>
          </nav>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ flex: 1, maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>
        
        {/* PESTAÑA 1: CREAR MOLDES */}
        {activeTab === 'pattern' && (
          <div className="animate-entrance" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Siluetas */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>1. Catálogo de Siluetas de Pantalón</h2>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Cortes pre-calculados con holgura anatómica profesional para sastrería.
                  </p>
                </div>
                <span className="glass-pill" style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem', color: 'var(--accent-gold)' }}>
                  {currentPreset.category}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {(Object.keys(SILHOUETTES) as SilhouetteType[]).map((key) => {
                  const preset = SILHOUETTES[key];
                  const isSelected = selectedSilhouette === key;
                  return (
                    <div
                      key={key}
                      onClick={() => handleSilhouetteChange(key)}
                      className="glass-panel clickable btn-touch"
                      style={{
                        padding: '1.2rem',
                        border: isSelected ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                        background: isSelected ? 'rgba(226, 183, 116, 0.09)' : 'var(--bg-card)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {isSelected && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--accent-gold)' }} />
                      )}
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                        {preset.category}
                      </span>
                      <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: isSelected ? 'var(--accent-gold)' : 'var(--text-primary)', marginTop: '0.2rem' }}>
                        {preset.name}
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.4' }}>
                        {preset.tagline}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Editor de Medidas & Canvas SVG */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
              
              {/* Sliders de Medidas */}
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Sliders size={18} color="#e2b774" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Parámetros de Medida (cm)</h3>
                  </div>
                  <button
                    onClick={() => setMeasurements(currentPreset.defaultMeasurements)}
                    className="glass-pill btn-touch"
                    style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', border: 'none' }}
                  >
                    Restablecer
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Contorno de Cintura</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{measurements.waist} cm</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="120"
                      value={measurements.waist}
                      onChange={(e) => handleMeasurementChange('waist', Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Contorno de Cadera</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{measurements.hip} cm</span>
                    </div>
                    <input
                      type="range"
                      min="80"
                      max="135"
                      value={measurements.hip}
                      onChange={(e) => handleMeasurementChange('hip', Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Altura / Profundidad de Tiro</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{measurements.crotchDepth} cm</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="38"
                      value={measurements.crotchDepth}
                      onChange={(e) => handleMeasurementChange('crotchDepth', Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Largo Total de Pierna</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{measurements.legLength} cm</span>
                    </div>
                    <input
                      type="range"
                      min="85"
                      max="125"
                      value={measurements.legLength}
                      onChange={(e) => handleMeasurementChange('legLength', Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Ancho a la Rodilla</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{measurements.kneeWidth} cm</span>
                    </div>
                    <input
                      type="range"
                      min="16"
                      max="36"
                      value={measurements.kneeWidth}
                      onChange={(e) => handleMeasurementChange('kneeWidth', Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Ancho de Bota / Bajo</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{measurements.bottomWidth} cm</span>
                    </div>
                    <input
                      type="range"
                      min="14"
                      max="42"
                      value={measurements.bottomWidth}
                      onChange={(e) => handleMeasurementChange('bottomWidth', Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleDownloadPdf}
                  className="btn-touch"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    background: 'linear-gradient(135deg, #e2b774 0%, #c49752 100%)',
                    color: '#0a0a0c',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    padding: '0.9rem',
                    borderRadius: '12px',
                    border: 'none',
                    marginTop: '0.5rem',
                    boxShadow: '0 4px 18px rgba(226, 183, 116, 0.25)'
                  }}
                >
                  <Download size={18} />
                  Descargar Molde PDF a Escala Real
                </button>
              </div>

              {/* Vista Previa Vectorial */}
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Layers size={18} color="#e2b774" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Trazado Técnico Digital</h3>
                  </div>
                  <button
                    onClick={() => setShowGuides(!showGuides)}
                    className="glass-pill btn-touch"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', border: 'none' }}
                  >
                    <Eye size={14} />
                    {showGuides ? 'Ocultar Piquetes' : 'Ver Piquetes'}
                  </button>
                </div>

                <div
                  style={{
                    background: '#090a0f',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '1.2rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '380px'
                  }}
                >
                  <svg
                    viewBox={`0 0 ${patternData.dimensions.width} ${patternData.dimensions.height}`}
                    style={{ width: '100%', maxHeight: '420px', transition: 'all 200ms var(--ease-out)' }}
                  >
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Delantero */}
                    <g>
                      <path
                        d={patternData.frontSvgPath}
                        fill="rgba(226, 183, 116, 0.08)"
                        stroke="#e2b774"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <line
                        x1={patternData.grainLineFront.x1}
                        y1={patternData.grainLineFront.y1}
                        x2={patternData.grainLineFront.x2}
                        y2={patternData.grainLineFront.y2}
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      <text x="160" y="25" fill="#f8fafc" fontSize="11" fontWeight="700" textAnchor="middle">
                        DELANTERO (1/4)
                      </text>
                    </g>

                    {/* Trasero */}
                    <g>
                      <path
                        d={patternData.backSvgPath}
                        fill="rgba(99, 102, 241, 0.08)"
                        stroke="#818cf8"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <line
                        x1={patternData.grainLineBack.x1}
                        y1={patternData.grainLineBack.y1}
                        x2={patternData.grainLineBack.x2}
                        y2={patternData.grainLineBack.y2}
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      <text x="440" y="25" fill="#f8fafc" fontSize="11" fontWeight="700" textAnchor="middle">
                        TRASERO (1/4)
                      </text>
                    </g>

                    {/* Piquetes */}
                    {showGuides && patternData.notches.map((notch, idx) => (
                      <circle key={idx} cx={notch.x} cy={notch.y} r="3.5" fill="#ef4444" />
                    ))}
                  </svg>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>• Línea discontinua: Aplomo e Hilo de Tela</span>
                  <span>• Puntos rojos: Piquetes de unión</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PESTAÑA 2: ASESOR DE PROPORCIONES */}
        {activeTab === 'advisor' && (
          <div className="animate-entrance" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Asesoría Inteligente de Proporciones y Fit</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Equilibrio visual según tu estatura, contextura y preferencia de holgura (evitando buzos o pantalones desproporcionados).
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
              {/* Entradas del usuario */}
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shirt size={18} color="#e2b774" />
                  Tus Parámetros de Silueta
                </h3>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Estatura</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{userHeight} cm</span>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Peso Aproximado</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{userWeight} kg</span>
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
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                    Preferencia de Holgura (Fit)
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {(['oversize', 'relaxed', 'fitted'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setFitPreference(mode)}
                        className="btn-touch"
                        style={{
                          padding: '0.6rem 0.4rem',
                          borderRadius: '10px',
                          border: fitPreference === mode ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                          background: fitPreference === mode ? 'rgba(226, 183, 116, 0.15)' : 'var(--bg-glass)',
                          color: fitPreference === mode ? 'var(--accent-gold)' : 'var(--text-secondary)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resumen del Fit */}
                <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Proporción Recomendada:</span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.2rem' }}>
                    {userHeight >= 178 ? 'Pantalón Baggy con Full Break + Buzo Boxy' : 'Pantalón Tiro Alto con No-Break + Prenda Superior Cropped'}
                  </p>
                </div>
              </div>

              {/* Tarjetas de Recomendaciones de Proporción */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {proportionAdvice.map((rule, idx) => (
                  <div key={idx} className="glass-panel" style={{ padding: '1.3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <TrendingUp size={16} color="#e2b774" />
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{rule.ruleName}</h4>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {rule.guideline}
                    </p>
                    <div style={{ marginTop: '0.8rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(226, 183, 116, 0.06)', borderLeft: '3px solid var(--accent-gold)' }}>
                      <p style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 500 }}>
                        💡 {rule.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: CÍRCULO CROMÁTICO */}
        {activeTab === 'color' && (
          <div className="animate-entrance" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Estudio Cromático & Armonía de Atuendos</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Paletas calibradas con teoría del color para combinar prendas superiores, inferiores y accesorios.
              </p>
            </div>

            {/* Selector de Paletas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {OUTFIT_PALETTES.map((pal) => {
                const isSelected = selectedPalette.id === pal.id;
                return (
                  <div
                    key={pal.id}
                    onClick={() => setSelectedPalette(pal)}
                    className="glass-panel clickable btn-touch"
                    style={{
                      padding: '1.2rem',
                      border: isSelected ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(226, 183, 116, 0.08)' : 'var(--bg-card)'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: pal.top.hex, border: '1px solid rgba(255,255,255,0.2)' }} />
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: pal.bottom.hex, border: '1px solid rgba(255,255,255,0.2)' }} />
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: pal.footwear.hex, border: '1px solid rgba(255,255,255,0.2)' }} />
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: pal.accessory.hex, border: '1px solid rgba(255,255,255,0.2)' }} />
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: isSelected ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                      {pal.name}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                      {pal.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Desglose de la Paleta Seleccionada */}
            <div className="glass-panel" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-gold)', letterSpacing: '0.08em' }}>
                    Armonía: {selectedPalette.harmonyType}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.2rem' }}>{selectedPalette.name}</h3>
                </div>
                <button
                  onClick={() => toast.success('¡Paleta copiada al portapapeles!')}
                  className="glass-pill btn-touch"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.9rem', fontSize: '0.8rem', color: 'var(--text-primary)', border: 'none' }}
                >
                  <Check size={14} color="var(--accent-gold)" />
                  Guardar Paleta
                </button>
              </div>

              {/* Bloques de Prendas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1.2rem', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: '100%', height: '50px', borderRadius: '8px', background: selectedPalette.top.hex, marginBottom: '0.8rem' }} />
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Prenda Superior</span>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{selectedPalette.top.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>{selectedPalette.top.description}</p>
                </div>

                <div style={{ padding: '1.2rem', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: '100%', height: '50px', borderRadius: '8px', background: selectedPalette.bottom.hex, marginBottom: '0.8rem' }} />
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Prenda Inferior / Pantalón</span>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{selectedPalette.bottom.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>{selectedPalette.bottom.description}</p>
                </div>

                <div style={{ padding: '1.2rem', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: '100%', height: '50px', borderRadius: '8px', background: selectedPalette.footwear.hex, marginBottom: '0.8rem' }} />
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Calzado</span>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{selectedPalette.footwear.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>{selectedPalette.footwear.description}</p>
                </div>

                <div style={{ padding: '1.2rem', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: '100%', height: '50px', borderRadius: '8px', background: selectedPalette.accessory.hex, marginBottom: '0.8rem' }} />
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Acento / Accesorio</span>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{selectedPalette.accessory.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>{selectedPalette.accessory.description}</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;


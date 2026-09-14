import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Ruler, Sparkles, Check, ArrowUpRight, Scale } from 'lucide-react';

interface NpcVisualizerProps {
  userHeight: number;
  userWeight: number;
  selectedSilhouette: string;
  onSilhouetteChange: (sil: string) => void;
  onHeightChange?: (h: number) => void;
  onWeightChange?: (w: number) => void;
}

interface SilhouetteProfile {
  id: string;
  name: string;
  tagline: string;
  breakType: string;
  waistRise: string;
  legCut: string;
  idealFor: string;
  avoidIf: string;
  sartorialSecret: string;
  recommendedFabrics: string[];
}

const SILHOUETTES_DATA: SilhouetteProfile[] = [
  {
    id: 'baggy',
    name: 'Baggy / Wide Leg',
    tagline: 'Volumen envolvente, estructura contemporánea y caída con quiebre completo.',
    breakType: 'Full Break (Pliegue Quebrado sobre el empeine)',
    waistRise: 'Tiro Medio a Medio-Alto',
    legCut: 'Perímetro amplio desde muslo hasta el ruedo (28-32 cm)',
    idealFor: 'Estatura media-alta (> 174 cm) y complexiones atléticas o delgadas que buscan generar peso visual equilibrado.',
    avoidIf: 'Estatura menor a 165 cm combinada con calzado muy plano, salvo que se use tiro muy alto.',
    sartorialSecret: 'Al usar calzado voluminoso (chunky sneakers o botas), la bota ancha descansa sin arrugarse en el suelo.',
    recommendedFabrics: ['Denim Rígido 14oz', 'Gabardina Sarga', 'Lana Pesada']
  },
  {
    id: 'straight',
    name: 'Recto Clásico Sastrero',
    tagline: 'Línea perpendicular impecable, atemporal y universalmente estilizadora.',
    breakType: 'Medium Break (Medio quiebre elegante)',
    waistRise: 'Tiro Alto Sastrero',
    legCut: 'Caída paralela continua de cadera a botamanga (20-23 cm)',
    idealFor: 'Cualquier estatura y peso. Es la silueta más favorecedora del mundo de la moda: alarga las piernas un +15%.',
    avoidIf: 'Casi no tiene contraindicaciones. Si buscas estética streetwear ultra-ancha, puede sentirse formal.',
    sartorialSecret: 'La raya de planchado frontal divide cada pierna verticalmente, guiando el ojo de arriba abajo.',
    recommendedFabrics: ['Lana Sastrera Super 120s', 'Gabardina Sarga', 'Lino Puro']
  },
  {
    id: 'cargo',
    name: 'Cargo Sastre de Bolsillo Fuelle',
    tagline: 'Utilidad táctica reinterpretada con aplomo y costuras de alta confección.',
    breakType: 'Medium a Slight Break',
    waistRise: 'Tiro Medio',
    legCut: 'Volumen compensado con bolsillos geométricos laterales',
    idealFor: 'Complexiones mesomorfas y espaldas anchas. Añade dimensión tridimensional a los laterales de los muslos.',
    avoidIf: 'Caderas muy prominentes si los bolsillos se ubican exactamente sobre el trocánter mayor.',
    sartorialSecret: 'Los bolsillos deben situarse 5 cm por encima de la rodilla para no arrastrar la silueta hacia abajo.',
    recommendedFabrics: ['Gabardina Sarga de Algodón', 'Denim Rígido', 'Ripstop Técnico']
  },
  {
    id: 'flare',
    name: 'Campana / Bootcut Flare',
    tagline: 'Ajuste esculpido en muslos con apertura progresiva desde la rodilla.',
    breakType: 'Floor Touch / Full Break sobre botines',
    waistRise: 'Tiro Alto Pronunciado',
    legCut: 'Ceñido en rodilla (18 cm) y apertura a 26-30 cm en bota',
    idealFor: 'Personas que buscan alargar al máximo la línea de pierna y compensar el ancho de hombros.',
    avoidIf: 'Piernas muy cortas en combinación con calzado plano deportivo.',
    sartorialSecret: 'Combínalo con botines de tacón cubano de 4 cm para ganar una elongación óptica de hasta 8 cm.',
    recommendedFabrics: ['Denim con 2% Elasthanne', 'Pana Acanalada', 'Gabardina Elástica']
  },
  {
    id: 'jogger',
    name: 'Jogger Urbano a Medida',
    tagline: 'Comodidad atlética con puño acanalado que despeja y resalta el calzado.',
    breakType: 'No Break (Tobillero descubierto)',
    waistRise: 'Tiro Medio con cinturilla elástica',
    legCut: 'Cónico progresivo que remata en puño ceñido',
    idealFor: 'Looks dinámicos, zapatillas protagonistas y complexiones atléticas con gemelos definidos.',
    avoidIf: 'Eventos de etiqueta sastrera formal o personas que deseen disimular tobillos delgados.',
    sartorialSecret: 'El puño debe descansar 2 cm por encima del hueso maleolar del tobillo para lucir estilizado.',
    recommendedFabrics: ['Algodón Francés Pesado', 'Gabardina Liviana', 'Nailon Técnico']
  }
];

const FABRICS = [
  {
    id: 'denim',
    name: 'Denim Rígido 14oz',
    desc: 'Mezclilla de algodón puro con estructura firme, costuras naranjas reforzadas y gran resistencia al desgaste.',
    weight: '14 oz (Pesado)',
    idealSeason: 'Todo el año / Urbano'
  },
  {
    id: 'lino',
    name: 'Lino Puro Fluido',
    desc: 'Tejido abierto de fibra vegetal con drapeado fresco, textura ligeramente rústica y arrugado noble.',
    weight: '220 g/m² (Liviano)',
    idealSeason: 'Primavera - Verano'
  },
  {
    id: 'sarga',
    name: 'Gabardina Sarga de Algodón',
    desc: 'Tejido diagonal de sastre con raya de planchado frontal nítida, caída limpia y tacto sedoso.',
    weight: '310 g/m² (Medio)',
    idealSeason: 'Formal / Casual Elegante'
  },
  {
    id: 'lana',
    name: 'Lana Sastrera Super 120s',
    desc: 'Fibra peinada de máxima elegancia. Caída pesada de lujo, transpirabilidad térmica y pliegues impecables.',
    weight: '280 g/m² (Medio)',
    idealSeason: 'Sastrería de Gala / Trabajo'
  },
  {
    id: 'pana',
    name: 'Pana Acanalada Fina',
    desc: 'Cordoncillo aterciopelado con reflejos de luz y sombra. Aporta calidez y rica dimensión táctil.',
    weight: '340 g/m² (Cálido)',
    idealSeason: 'Otoño - Invierno'
  }
];

const TEXTILE_COLORS = [
  { name: 'Negro Azabache', hex: '#1C1917', tone: 'Oscuro' },
  { name: 'Azul Marino Índigo', hex: '#1E293B', tone: 'Profundo' },
  { name: 'Terracota Sastre', hex: '#C1440E', tone: 'Acento' },
  { name: 'Verde Oliva Militar', hex: '#37412A', tone: 'Tierra' },
  { name: 'Arena Tostada', hex: '#C5A882', tone: 'Neutro' },
  { name: 'Lino Hueso Crudo', hex: '#EBE4D5', tone: 'Luz' },
  { name: 'Gris Marengo Sastre', hex: '#4B5563', tone: 'Neutro' },
  { name: 'Borgoña Carmín', hex: '#5B1A24', tone: 'Noble' }
];

export default function NpcVisualizer({
  userHeight,
  userWeight,
  selectedSilhouette,
  onSilhouetteChange,
  onHeightChange,
  onWeightChange
}: NpcVisualizerProps) {
  const [selectedFabric, setSelectedFabric] = useState(FABRICS[2]); // Gabardina Sarga
  const [fabricColor, setFabricColor] = useState(TEXTILE_COLORS[2].hex); // Terracota
  const [appliedNotification, setAppliedNotification] = useState(false);

  // ── CÁLCULO BIOMÉTRICO Y RECOMENDACIÓN INTELIGENTE DE PANTALÓN ──
  const recommendation = useMemo(() => {
    const heightM = userHeight / 100;
    const bmi = userWeight / (heightM * heightM);

    let bodyType = 'Mesomorfo Equilibrado';
    if (bmi < 19.5) bodyType = 'Ectomorfo Esbelto';
    else if (bmi < 25.5) bodyType = 'Mesomorfo Atlético';
    else if (bmi < 30) bodyType = 'Endomorfo / Robusto';
    else bodyType = 'Robusto Plus';

    let bestSilId = 'straight';
    let affinity = 98;
    let rationale = '';
    let breakTip = '';
    let suggestedFabricName = 'Gabardina Sarga de Algodón';

    // Reglas antropométricas avanzadas de sastrería:
    if (userHeight >= 180) {
      if (bmi < 24) {
        bestSilId = 'baggy';
        affinity = 99;
        rationale = `Con tu estatura de **${userHeight} cm** y complexión estilizada, el corte **Baggy / Wide Leg** es tu aliado magistral: añade volumen tridimensional y presencia visual equilibrada, evitando que las piernas luzcan excesivamente delgadas o desproporcionadas respecto al torso.`;
        breakTip = 'Full Break (que caiga quebrado sobre el empeine con 1 o 2 pliegues naturales).';
        suggestedFabricName = 'Denim Rígido 14oz o Gabardina Sarga';
      } else {
        bestSilId = 'straight';
        affinity = 97;
        rationale = `Tu estatura de **${userHeight} cm** con contextura sólida luce impecable con un corte **Recto Clásico Sastrero**: proporciona una línea limpia, simétrica y vertical que canaliza tu porte con autoridad y elegancia natural.`;
        breakTip = 'Medium Break con raya de planchado frontal bien marcada.';
        suggestedFabricName = 'Lana Sastrera Super 120s';
      }
    } else if (userHeight <= 169) {
      if (bmi < 23) {
        bestSilId = 'flare';
        affinity = 96;
        rationale = `Para tu estatura de **${userHeight} cm**, el corte **Campana / Flare** o **Recto de Tiro Alto** genera una ilusión de alargamiento vertical continuo. Al ceñirse en el muslo y abrirse en la bota, engaña al ojo haciendo que las piernas parezcan un 15% más largas.`;
        breakTip = 'Slight Break rozando la parte superior del calzado para no acortar la figura.';
        suggestedFabricName = 'Gabardina Sarga o Pana Fina';
      } else {
        bestSilId = 'straight';
        affinity = 98;
        rationale = `Con **${userHeight} cm** y complexión robusta, el **Recto Clásico de Tiro Alto** es la opción dorada: estiliza y adelgaza la silueta mediante líneas perpendiculares limpias, sin abultar los costados ni cortar la continuidad vertical.`;
        breakTip = 'Slight to Medium Break. Evita el arrastre de tela en el suelo.';
        suggestedFabricName = 'Gabardina Sarga o Lino Pesado';
      }
    } else {
      // Estatura media (170 - 179 cm)
      if (bmi >= 26) {
        bestSilId = 'straight';
        affinity = 98;
        rationale = `Para tu rango de **${userHeight} cm**, el pantalón **Recto Clásico** equilibra tu cadera y muslos creando una silueta armónica, fluida y estilizada de pies a cabeza.`;
        breakTip = 'Medium Break limpio con caída vertical continua.';
        suggestedFabricName = 'Gabardina Sarga o Lana Sastrera';
      } else if (bmi < 21) {
        bestSilId = 'baggy';
        affinity = 97;
        rationale = `Con **${userHeight} cm** y contextura esbelta, el **Baggy / Wide Leg** aporta estructura visual y dinamismo contemporáneo a tu guardarropa.`;
        breakTip = 'Full Break quebrado con sneakers de suela ancha.';
        suggestedFabricName = 'Denim Rígido o Gabardina Sarga';
      } else {
        bestSilId = 'cargo';
        affinity = 97;
        rationale = `Con tu físico equilibrado de **${userHeight} cm** y **${userWeight} kg**, el **Cargo Sastre** o **Recto Clásico** te sientan a la perfección: añaden carácter utilitario y detalles de sastre sin sobrecargar tus proporciones anatómicas.`;
        breakTip = 'Medium Break sobre zapatos o botines.';
        suggestedFabricName = 'Gabardina Sarga o Denim Rígido';
      }
    }

    const bestSilProfile = SILHOUETTES_DATA.find(s => s.id === bestSilId) || SILHOUETTES_DATA[1];

    return {
      bmi: bmi.toFixed(1),
      bodyType,
      bestSilProfile,
      affinity,
      rationale,
      breakTip,
      suggestedFabricName
    };
  }, [userHeight, userWeight]);

  const handleApplyRecommended = () => {
    onSilhouetteChange(recommendation.bestSilProfile.id);
    setAppliedNotification(true);
    setTimeout(() => setAppliedNotification(false), 2600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* ── APARTADO 1: AJUSTE ANTROPOMÉTRICO DE MEDIDAS ── */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.4rem' }}>
          <div>
            <span className="eyebrow">Diagnóstico Biomecánico</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 400, marginTop: '0.15rem' }}>
              Ajuste Antropométrico de Medidas
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Modifica tu estatura y peso corporal para que el sistema calcule tu índice biomecánico y deduzca qué pantalón te favorece más.
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            background: 'var(--bg-secondary)',
            padding: '8px 16px',
            borderRadius: '100px',
            border: '1px solid var(--border-medium)'
          }}>
            <Scale size={16} color="var(--accent-gold)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              IMC: {recommendation.bmi} · {recommendation.bodyType}
            </span>
          </div>
        </div>

        {/* Sliders de Estatura y Peso */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.8rem' }}>
          
          {/* Estatura */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <label className="field-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Ruler size={13} color="var(--accent-gold)" /> Estatura
              </label>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>
                {userHeight} cm
              </span>
            </div>
            <input
              type="range"
              min="150"
              max="205"
              value={userHeight}
              onChange={(e) => onHeightChange && onHeightChange(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>150 cm</span>
              <span>175 cm (Media)</span>
              <span>205 cm</span>
            </div>
          </div>

          {/* Peso */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <label className="field-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Scale size={13} color="var(--accent-gold)" /> Peso Corporal
              </label>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>
                {userWeight} kg
              </span>
            </div>
            <input
              type="range"
              min="45"
              max="125"
              value={userWeight}
              onChange={(e) => onWeightChange && onWeightChange(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>45 kg</span>
              <span>70 kg</span>
              <span>125 kg</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── APARTADO 2: RECOMENDACIÓN INTELIGENTE DE QUÉ PANTALÓN USAR ── */}
      <motion.div
        key={`rec-${userHeight}-${userWeight}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="glass-panel"
        style={{
          padding: '2.2rem',
          border: '2px solid var(--accent-gold)',
          boxShadow: '0 12px 36px rgba(193, 68, 14, 0.12)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Banner superior decorativo */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.4rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="chip" style={{ background: 'var(--accent-gold)', color: 'white', border: 'none', padding: '4px 12px', fontSize: '0.75rem' }}>
              <Sparkles size={12} /> Silueta Ganadora Recomendada
            </span>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Calibrada para {userHeight} cm y {userWeight} kg
            </span>
          </div>

          <div style={{
            padding: '5px 14px',
            borderRadius: '100px',
            background: 'rgba(193, 68, 14, 0.1)',
            border: '1px solid rgba(193, 68, 14, 0.25)',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--accent-gold)'
          }}>
            {recommendation.affinity}% Afinidad Antropométrica
          </div>
        </div>

        {/* Nombre destacado y botón aplicar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.2rem',
          paddingBottom: '1.4rem',
          borderBottom: '1px solid var(--border-medium)'
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {recommendation.bestSilProfile.name}
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              {recommendation.bestSilProfile.tagline}
            </p>
          </div>

          <button
            onClick={handleApplyRecommended}
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: '0.92rem' }}
          >
            {appliedNotification || selectedSilhouette === recommendation.bestSilProfile.id ? (
              <>
                <Check size={18} /> ¡Silueta Activada en Moldes!
              </>
            ) : (
              <>
                <ArrowUpRight size={18} /> Aplicar Silueta Recomendada
              </>
            )}
          </button>
        </div>

        {/* Explicación sartorial profunda de por qué le queda mejor */}
        <div style={{ marginTop: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <div style={{ background: 'var(--bg-secondary)', padding: '1.3rem', borderRadius: '14px', borderLeft: '4px solid var(--accent-gold)' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: '0.07em', display: 'block', marginBottom: '0.3rem' }}>
              ¿Por qué este pantalón es tu mejor opción?
            </span>
            <p
              style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: '1.6' }}
              dangerouslySetInnerHTML={{ __html: recommendation.rationale.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--accent-gold)">$1</strong>') }}
            />
          </div>

          {/* Fichas técnicas de la silueta ganadora */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <span className="field-label" style={{ fontSize: '0.68rem' }}>Caída / Break Óptimo</span>
              <p style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                {recommendation.breakTip}
              </p>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <span className="field-label" style={{ fontSize: '0.68rem' }}>Corte de Pierna y Tiro</span>
              <p style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                {recommendation.bestSilProfile.waistRise} · {recommendation.bestSilProfile.legCut}
              </p>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <span className="field-label" style={{ fontSize: '0.68rem' }}>Tejido Ideal Recomendado</span>
              <p style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--accent-gold)', marginTop: '2px' }}>
                {recommendation.suggestedFabricName}
              </p>
            </div>

          </div>

        </div>

      </motion.div>

      {/* ── APARTADO 3: CATÁLOGO Y SELECTOR DE SILUETAS ── */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.4rem' }}>
          <span className="eyebrow">Comparativa de Cortes</span>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 400, marginTop: '0.15rem' }}>
            Explorador de Siluetas y Desempeño
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Selecciona libremente cualquier silueta para comparar cómo interactúa con tu morfología corporal.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {SILHOUETTES_DATA.map((sil) => {
            const isSelected = selectedSilhouette === sil.id;
            const isBest = recommendation.bestSilProfile.id === sil.id;

            return (
              <motion.div
                key={sil.id}
                whileHover={{ y: -3, transition: { duration: 0.16 } }}
                onClick={() => onSilhouetteChange(sil.id)}
                style={{
                  padding: '1.3rem',
                  borderRadius: '16px',
                  border: isSelected ? '2px solid var(--accent-gold)' : isBest ? '1.5px solid rgba(193, 68, 14, 0.4)' : '1px solid var(--border-medium)',
                  background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                  boxShadow: isSelected ? '0 0 0 3px var(--accent-light), 0 6px 20px rgba(193, 68, 14, 0.1)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem',
                  position: 'relative'
                }}
              >
                {/* Badge recomendada */}
                {isBest && (
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'var(--accent-gold)',
                    color: 'white',
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '100px',
                    textTransform: 'uppercase'
                  }}>
                    ★ Recomendado
                  </span>
                )}

                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: isSelected ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                    {sil.name}
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {sil.breakType.split('(')[0]}
                  </span>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {sil.tagline}
                </p>

                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <strong>Ideal para:</strong> {sil.idealFor.slice(0, 75)}...
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── APARTADO 4: COLOR TEXTIL & MATERIALES ── */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.4rem' }}>
          <span className="eyebrow">Composición Material</span>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 400, marginTop: '0.15rem' }}>
            Color Textil &amp; Materiales de Confección
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Elige el gramaje, peso y color de la tela para definir la estructura y caída final de la prenda.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* Selector de Color Textil */}
          <div>
            <label className="field-label" style={{ marginBottom: '0.6rem' }}>
              Color del Textil Sastrero
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
              {TEXTILE_COLORS.map((col) => {
                const isSelected = fabricColor === col.hex;
                return (
                  <button
                    key={col.hex}
                    onClick={() => setFabricColor(col.hex)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.7rem',
                      textAlign: 'left',
                      transition: 'all 140ms var(--ease-out)'
                    }}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: col.hex,
                      border: '1.5px solid white',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      flexShrink: 0
                    }} />
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: isSelected ? 700 : 600, color: isSelected ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                        {col.name}
                      </div>
                      <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {col.hex}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector de Material y Textura */}
          <div>
            <label className="field-label" style={{ marginBottom: '0.6rem' }}>
              Material, Tejido y Gramaje
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {FABRICS.map((fab) => {
                const isSelected = selectedFabric.id === fab.id;
                return (
                  <button
                    key={fab.id}
                    onClick={() => setSelectedFabric(fab)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      transition: 'all 140ms var(--ease-out)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: isSelected ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                        {fab.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {fab.desc}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)', fontWeight: 700, flexShrink: 0, marginLeft: '10px' }}>
                      {fab.weight.split('(')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

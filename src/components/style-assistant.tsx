import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, User, Bot, Shirt, Compass, Lightbulb, MessageSquareQuote } from 'lucide-react';

interface AdviceResult {
  top: string;
  shoes: string;
  cap: string;
  tip: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  advice?: AdviceResult;
  timestamp?: string;
}

interface StyleAssistantProps {
  userHeight?: number;
  userWeight?: number;
  selectedSilhouette?: string;
}

const COLOR_ADVICE: Record<string, AdviceResult> = {
  verde: {
    top: 'Camisa o buzo oversized en color Crema, Beige o Blanco Hueso para equilibrar los tonos orgánicos.',
    shoes: 'Sneakers minimalistas en cuero blanco o mocasines de gamuza café.',
    cap: 'Gorra deportiva estructurada en tono Marrón Chocolate o Arena.',
    tip: 'El verde oliva o militar resalta increíblemente al jugar con accesorios de cuero café o detalles metálicos dorados.'
  },
  azul: {
    top: 'Suéter de punto en color Gris Melange, o sobrecamisa Ocre/Mostaza si buscas un contraste complementario moderno.',
    shoes: 'Tenis retro de perfil bajo en color blanco con detalles azules, o botas tipo Desert de cuero ante.',
    cap: 'Gorra tipo "Dad hat" en color Hueso o Azul Marino sólido para un look monocromático.',
    tip: 'El azul combina de manera excelente con tonos arena y accesorios metálicos plateados.'
  },
  negro: {
    top: 'Playera pesada en color Gris Grafito (bajo contraste) o una camisa abierta en Lino color Blanco Hueso (alto contraste).',
    shoes: 'Zapatos derby negros de suela tractorada o botines Chelsea negros.',
    cap: 'Gorra negra con bordado minimalista blanco.',
    tip: 'Para romper el look monocromático negro total sin saturar, añade joyería plateada o un reloj con correa de cuero marrón.'
  },
  blanco: {
    top: 'Camisa relajada en color Verde Salvia, Azul Cobalto o una chaqueta utilitaria tipo cazadora color Ocre.',
    shoes: 'Sneakers limpios color blanco o sandalias de cuero marrón.',
    cap: 'Gorra de sarga color Verde Bosque o Azul Marino.',
    tip: 'El blanco actúa como un lienzo puro. Contrasta el volumen con prendas inferiores oscuras y mantén los accesorios en tonos neutrales cálidos.'
  },
  cafe: {
    top: 'Playera pesada o buzo cropped color Arena, Crema o Azul Celeste (un contraste clásico sastrero).',
    shoes: 'Botas sastreras en gamuza café o sneakers blancos con suela de goma color caramelo.',
    cap: 'Gorra tipo vintage color Crema o Verde Oliva.',
    tip: 'Los tonos tierra lucen mejor cuando mezclas diferentes texturas: corduroy abajo, y lana o lino arriba.'
  },
  marron: {
    top: 'Playera pesada o buzo cropped color Arena, Crema o Azul Celeste (un contraste clásico sastrero).',
    shoes: 'Botas sastreras en gamuza café o sneakers blancos con suela de goma color caramelo.',
    cap: 'Gorra tipo vintage color Crema o Verde Oliva.',
    tip: 'Los tonos tierra lucen mejor cuando mezclas diferentes texturas: corduroy abajo, y lana o lino arriba.'
  },
  gris: {
    top: 'Buzo tipo hoodie color Negro lavado, o una camisa fluida color Rosa Viejo / Salmón claro para un look de pasarela.',
    shoes: 'Chunky sneakers blancos o botas de cuero negro.',
    cap: 'Gorra gris a tono o gorra negra minimalista.',
    tip: 'El gris es altamente versátil; funciona excelente tanto en un enfoque deportivo (Athleisure) como en sastrería tradicional.'
  },
  rojo: {
    top: 'Playera básica color Blanco Crudo o una sudadera negra con detalles grises.',
    shoes: 'Zapatillas deportivas en color blanco o negro.',
    cap: 'Gorra color negro mate o beige.',
    tip: 'El rojo es un color muy activo visualmente. Deja que sea el protagonista manteniendo la parte superior y el calzado en tonos neutros apagados.'
  },
  terracota: {
    top: 'Camisa de lino en color Hueso Crudo o buzo fino en Azul Índigo para un contraste de alta costura.',
    shoes: 'Mocasines de piel café espresso o tenis minimalistas de suela caramelo.',
    cap: 'Gorra de sarga color Arena Tostada o Café Moka.',
    tip: 'La terracota es el color emblema de la sastrería contemporánea. Luce impecable con texturas de lino y joyería en latón o plata envejecida.'
  },
  beige: {
    top: 'Chaqueta de mezclilla azul (Denim) sobre una playera blanca, o buzo de cuello alto color Café Espresso.',
    shoes: 'Mocasines de gamuza marrón o tenis blancos clásicos.',
    cap: 'Gorra en color Azul Marino o Café Tostado.',
    tip: 'Combina el beige con otros tonos tierra para crear un atuendo minimalista y elegante de "Quiet Luxury".'
  },
  arena: {
    top: 'Chaqueta de mezclilla azul (Denim) sobre una playera blanca, o buzo de cuello alto color Café Espresso.',
    shoes: 'Mocasines de gamuza marrón o tenis blancos clásicos.',
    cap: 'Gorra en color Azul Marino o Café Tostado.',
    tip: 'Combina el beige con otros tonos tierra para crear un atuendo minimalista y elegante de "Quiet Luxury".'
  }
};

const SUGGESTIONS = [
  '¿Cómo combino un pantalón verde oliva? 🟢',
  'Outfit elegante para pantalón terracota 🏺',
  '¿Qué prendas usar con pantalón negro? ⚫',
  'Combinación con pantalón café o beige 🤎',
  '¿Cómo alargar mi estatura con ropa? 📏'
];

export default function StyleAssistant({ userHeight = 175, userWeight = 70, selectedSilhouette = 'baggy' }: StyleAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `¡Saludos! Soy tu **Asistente Sastrero con IA de Inefable**. Conozco tus medidas actuales (${userHeight} cm, ${userWeight} kg) y tu corte seleccionado (*${selectedSilhouette}*). Dime qué prenda o color tienes en mente y te asesoraré con combinaciones de alta costura, calzado, accesorios y reglas de proporción.`,
      timestamp: 'Ahora'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const processResponse = (userInput: string) => {
    setIsTyping(true);
    const normalized = normalizeText(userInput);

    setTimeout(() => {
      let aiText = '';
      let advice: AdviceResult | undefined;

      // Consulta de estatura/proporción
      if (normalized.includes('estatura') || normalized.includes('altura') || normalized.includes('alargar') || normalized.includes('bajito') || normalized.includes('alto')) {
        aiText = `Para una estatura de **${userHeight} cm** y peso de **${userWeight} kg**, la regla de oro es el **balance vertical de 1/3 a 2/3**: mantén la cintura del pantalón en tiro medio-alto y usa una prenda superior entallada o cropped para que las piernas parezcan un 20% más largas visualmente.`;
        advice = {
          top: 'Camisa o buzo con corte Boxy Cropped (justo a la altura de la pretina).',
          shoes: 'Calzado que comparta un tono similar al pantalón para no cortar la línea de la pierna.',
          cap: 'Gorra o sombrero de copa media para sumar 3-4 cm de elongación natural.',
          tip: 'Evita prendas superiores extra largas que tapen la cadera, ya que dividen el cuerpo al 50-50 y acortan la figura.'
        };
      } else {
        // Buscar coincidencia de color
        let matchedColor = '';
        const colorsKeys = Object.keys(COLOR_ADVICE);
        for (const key of colorsKeys) {
          if (normalized.includes(key)) {
            matchedColor = key;
            break;
          }
        }

        if (matchedColor) {
          advice = COLOR_ADVICE[matchedColor];
          aiText = `He analizado tu prenda color **${matchedColor.toUpperCase()}** teniendo en cuenta tu complexión de **${userHeight} cm** y corte **${selectedSilhouette}**. Esta es la fórmula de coordinación recomendada:`;
        } else {
          aiText = `Entiendo tu consulta sobre *"${userInput}"*. Para darte la fórmula exacta de sastrería, indícame un color predominante (como verde, azul, terracota, negro, café, beige, gris, blanco) o pregúntame por proporciones según tus medidas.`;
        }
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: aiText,
          advice,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 900);
  };

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    processResponse(textToSend);
  };

  return (
    <div className="glass-panel" style={{
      padding: '0',
      overflow: 'hidden',
      border: '1.5px solid var(--border-accent)',
      boxShadow: '0 12px 40px rgba(193, 68, 14, 0.08)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* ── HEADER DEL ASISTENTE IA (Diseño llamativo) ── */}
      <div style={{
        padding: '1.2rem 1.6rem',
        background: 'linear-gradient(135deg, rgba(28, 25, 22, 0.96) 0%, rgba(45, 38, 32, 0.98) 100%)',
        color: 'var(--text-inverse)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          {/* Avatar IA con pulso interactivo */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-gold) 0%, #D4600A 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(193, 68, 14, 0.4)'
            }}>
              <Bot size={22} color="white" />
            </div>
            <span style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#10B981',
              border: '2px solid #1C1916'
            }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'white', letterSpacing: '0.01em' }}>
                Asistente Sastrero IA
              </h3>
              <span className="chip" style={{
                background: 'rgba(193, 68, 14, 0.25)',
                color: '#FF9068',
                borderColor: 'rgba(255, 144, 104, 0.3)',
                fontSize: '0.65rem',
                padding: '2px 8px'
              }}>
                <Sparkles size={10} /> IA Activa
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: '#B3AAA0', marginTop: '2px' }}>
              Consultor de estilo, proporciones de corte y teoría del color en tiempo real
            </p>
          </div>
        </div>

        {/* Badge con parámetros sincronizados */}
        <div style={{
          display: 'none',
          padding: '6px 12px',
          borderRadius: '100px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          fontSize: '0.74rem',
          fontFamily: 'var(--font-mono)',
          color: '#E5DFD7'
        }} className="sm:flex">
          {userHeight}cm · {userWeight}kg · {selectedSilhouette.toUpperCase()}
        </div>
      </div>

      {/* ── VENTANA DE MENSAJES (con scroll suave y espacio amplio) ── */}
      <div style={{
        padding: '1.5rem',
        height: '380px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
        background: 'linear-gradient(180deg, rgba(255, 252, 249, 0.7) 0%, rgba(244, 239, 233, 0.9) 100%)'
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: '0.4rem'
            }}
          >
            {/* Burbuja de mensaje */}
            <div style={{
              maxWidth: '85%',
              padding: '0.9rem 1.2rem',
              borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.sender === 'user' ? 'var(--accent-gold)' : 'var(--bg-card)',
              color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
              border: msg.sender === 'user' ? 'none' : '1px solid var(--border-medium)',
              boxShadow: msg.sender === 'user' ? '0 4px 14px rgba(193, 68, 14, 0.25)' : '0 2px 10px rgba(28, 25, 22, 0.05)',
              fontSize: '0.88rem',
              lineHeight: '1.5'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.68rem',
                opacity: 0.75,
                fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: '0.35rem'
              }}>
                {msg.sender === 'user' ? <User size={11} /> : <Bot size={11} />}
                <span>{msg.sender === 'user' ? 'Tú' : 'Sastre IA Inefable'}</span>
                {msg.timestamp && <span style={{ opacity: 0.6 }}>· {msg.timestamp}</span>}
              </div>
              <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong style="color:inherit; font-weight:700;">$1</strong>') }} />
            </div>

            {/* Ficha técnica estructurada de la recomendación */}
            {msg.advice && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                style={{
                  maxWidth: '85%',
                  padding: '1.2rem',
                  borderRadius: '16px',
                  background: 'var(--bg-card-hover)',
                  border: '1.5px solid var(--border-accent)',
                  boxShadow: '0 6px 20px rgba(193, 68, 14, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  
                  {/* Prenda Superior */}
                  <div style={{ background: 'var(--bg-secondary)', padding: '9px 12px', borderRadius: '10px' }}>
                    <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Shirt size={12} /> Prenda Superior
                    </span>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '2px', lineHeight: '1.35' }}>
                      {msg.advice.top}
                    </p>
                  </div>

                  {/* Calzado */}
                  <div style={{ background: 'var(--bg-secondary)', padding: '9px 12px', borderRadius: '10px' }}>
                    <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Compass size={12} /> Calzado Coordinado
                    </span>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '2px', lineHeight: '1.35' }}>
                      {msg.advice.shoes}
                    </p>
                  </div>

                  {/* Gorra / Accesorio */}
                  <div style={{ background: 'var(--bg-secondary)', padding: '9px 12px', borderRadius: '10px' }}>
                    <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MessageSquareQuote size={12} /> Accesorio Focal
                    </span>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '2px', lineHeight: '1.35' }}>
                      {msg.advice.cap}
                    </p>
                  </div>

                </div>

                {/* Tip Sastrero */}
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(193, 68, 14, 0.08)',
                  borderLeft: '3px solid var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <Lightbulb size={15} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Consejo de Sastre
                    </span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '1px', lineHeight: '1.4' }}>
                      {msg.advice.tip}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ))}

        {/* Indicador de escritura animado */}
        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start', padding: '0.6rem 1rem', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-medium)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>El Sastre IA está confeccionando tu respuesta</span>
            <div style={{ display: 'flex', gap: '3px' }}>
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-gold)' }} />
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-gold)' }} />
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-gold)' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── SUGERENCIAS RÁPIDAS EN CHIPS ── */}
      <div style={{
        padding: '0.75rem 1.4rem',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', flexShrink: 0 }}>
          Sugerencias:
        </span>
        {SUGGESTIONS.map((sug, i) => (
          <button
            key={i}
            onClick={() => handleSend(sug)}
            style={{
              padding: '5px 12px',
              borderRadius: '100px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              fontSize: '0.74rem',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 140ms var(--ease-out)'
            }}
            className="clickable"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* ── ENTRADA DE TEXTO CON BOTÓN ENVIAR ── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputValue);
        }}
        style={{
          padding: '1rem 1.4rem',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '0.8rem'
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Pregúntale al Sastre IA: ej. '¿Cómo combino un pantalón terracota?' o '¿Qué me favorece con 175cm?'..."
          className="field-input"
          style={{ flex: 1, padding: '11px 16px', borderRadius: '12px' }}
        />
        <button
          type="submit"
          className="btn-primary"
          style={{ padding: '11px 20px', borderRadius: '12px', flexShrink: 0 }}
        >
          <Send size={15} />
          <span>Preguntar</span>
        </button>
      </form>

    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, User, Bot, HelpCircle } from 'lucide-react';

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
  'Tengo un pantalón verde 🟢',
  'Outfit con camisa azul 🔵',
  '¿Cómo combino jeans negros? ⚫',
  'Prenda café para look casual 🤎'
];

export default function StyleAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: '¡Hola! Soy tu asistente de estilo personal de **Inefable**. Dime qué prenda tienes (ej: pantalón verde, camisa azul, buzo negro) y te recomendaré la combinación perfecta de ropa, calzado, gorra y tips sastreros.'
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
      .replace(/[\u0300-\u036f]/g, ''); // Quita acentos y diacríticos
  };

  const processResponse = (userInput: string) => {
    setIsTyping(true);
    const normalized = normalizeText(userInput);

    // Buscar coincidencia de color
    let matchedColor = '';
    const colorsKeys = Object.keys(COLOR_ADVICE);
    for (const key of colorsKeys) {
      if (normalized.includes(key)) {
        matchedColor = key;
        break;
      }
    }

    setTimeout(() => {
      let aiText = '';
      let advice: AdviceResult | undefined;

      if (matchedColor) {
        advice = COLOR_ADVICE[matchedColor];
        aiText = `He analizado tu prenda color **${matchedColor.toUpperCase()}**. Aquí tienes una propuesta de combinación estilística diseñada para destacar:`;
      } else {
        aiText = 'No he logrado identificar un color específico en tu mensaje (como verde, azul, negro, café, beige, gris, rojo). Prueba escribiendo algo como: *"Tengo un pantalón verde"* o elige uno de las sugerencias rápidas abajo.';
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: aiText,
          advice
        }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Agregar mensaje del usuario
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    processResponse(textToSend);
  };

  return (
    <div className="chat-container">
      {/* Cabecera del Chat */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.9rem 1.2rem', background: 'var(--bg-dark)', color: 'var(--text-inverse)' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={14} color="white" />
        </div>
        <div>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.03em', color: 'var(--text-inverse)' }}>Asistente Sastrero IA</h3>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Asesor de fit &amp; volumen</span>
        </div>
      </div>

      {/* Ventana de mensajes */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div 
              className={`chat-bubble ${msg.sender}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.1rem' }}>
                {msg.sender === 'user' ? <User size={10} /> : <Bot size={10} />}
                {msg.sender === 'user' ? 'Tú' : 'Inefable AI'}
              </div>
              <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </div>

            {/* Ficha de Asesoría de Estilo Detallada si existe coincidencia */}
            {msg.advice && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  margin: '0.2rem 0 0.8rem 1.2rem',
                  padding: '1.2rem',
                  borderRadius: '14px',
                  background: 'var(--bg-card-hover)',
                  border: '1.5px solid var(--border-medium)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem',
                  maxWidth: '85%'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.7rem' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>👕 Prenda Superior Recomendada</span>
                    <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '0.15rem' }}>{msg.advice.top}</p>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem' }}>
                    <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>👟 Calzado Coordinado</span>
                    <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '0.15rem' }}>{msg.advice.shoes}</p>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem' }}>
                    <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>🧢 Gorra / Accesorio de Cabeza</span>
                    <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '0.15rem' }}>{msg.advice.cap}</p>
                  </div>
                </div>

                <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--accent-light)', borderLeft: '3px solid var(--accent-gold)', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: '0.06em', display: 'block' }}>💡 Tip de Estilo Sastrero</span>
                  <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-primary)', marginTop: '0.15rem', lineHeight: '1.4' }}>{msg.advice.tip}</p>
                </div>
              </motion.div>
            )}
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', gap: '0.35rem', alignSelf: 'flex-start' }}>
            <div className="chat-bubble ai" style={{ padding: '0.6rem 1rem' }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '14px' }}>
                <motion.div animate={{ scale: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                <motion.div animate={{ scale: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                <motion.div animate={{ scale: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sugerencias Rápidas */}
      <div style={{ display: 'flex', gap: '0.45rem', padding: '0.6rem 1rem', background: 'var(--bg-secondary)', overflowX: 'auto', borderTop: '1px solid var(--border-subtle)', flexWrap: 'nowrap', whiteSpace: 'nowrap' }} className="no-scrollbar">
        {SUGGESTIONS.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sug.replace(/[🟢🔵⚫🤎]/g, '').trim())}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border-medium)',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'all 150ms'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-gold)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-medium)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Caja de entrada */}
      <div className="chat-input-area">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
          placeholder="Ej: Tengo un pantalón verde oscuro para ir elegante..."
          className="field-input"
          style={{ flex: 1, padding: '10px 14px' }}
        />
        <button
          onClick={() => handleSend(inputValue)}
          className="btn-primary"
          style={{ padding: '10px 14px', borderRadius: '10px' }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

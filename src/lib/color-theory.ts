export interface ColorSwatch {
  name: string;
  hex: string;
  role: 'primary' | 'secondary' | 'accent' | 'neutral';
  description: string;
}

export interface OutfitPalette {
  id: string;
  name: string;
  harmonyType: 'monochromatic' | 'complementary' | 'analogous' | 'triadic' | 'earthy';
  description: string;
  top: ColorSwatch;
  bottom: ColorSwatch;
  footwear: ColorSwatch;
  accessory: ColorSwatch;
}

export const OUTFIT_PALETTES: OutfitPalette[] = [
  {
    id: 'monochrome-noir',
    name: 'Minimalismo Urbano / Noir & Charcoal',
    harmonyType: 'monochromatic',
    description: 'Elegancia sobria de bajo contraste con texturas visuales limpias. Ideal para siluetas Baggy o Straight.',
    top: { name: 'Gris Grafito Suave', hex: '#27272a', role: 'primary', description: 'Buzo oversized o playera heavy-weight' },
    bottom: { name: 'Negro Azabache Mate', hex: '#09090b', role: 'secondary', description: 'Pantalón Baggy o Denim deslavado' },
    footwear: { name: 'Blanco Crudo / Chalk', hex: '#f4f4f5', role: 'accent', description: 'Sneakers minimalistas o mocasines' },
    accessory: { name: 'Plata Pulida', hex: '#94a3b8', role: 'neutral', description: 'Joyería o bolso crossbody técnico' }
  },
  {
    id: 'earth-warmth',
    name: 'Tierra Cálida / Café Moca & Arena',
    harmonyType: 'earthy',
    description: 'Tonos naturales y acogedores que aportan calidez y presencia orgánica sofisticada.',
    top: { name: 'Arena Tostada', hex: '#d4b996', role: 'primary', description: 'Camisa relajada de lino o knitwear' },
    bottom: { name: 'Café Espresso Profundo', hex: '#382216', role: 'secondary', description: 'Pantalón Wide Leg o Cargo sastre' },
    footwear: { name: 'Cuero Miel', hex: '#9c6644', role: 'accent', description: 'Botas Chelsea o mocasines de ante' },
    accessory: { name: 'Dorado Antiguo', hex: '#c69c6d', role: 'neutral', description: 'Reloj o hebilla de cinturón sastre' }
  },
  {
    id: 'deep-contrast',
    name: 'Contraste Náutico / Azul Noche & Ocre',
    harmonyType: 'complementary',
    description: 'Armonía complementaria de alto impacto visual. Equilibra la sobriedad del marino con el dinamismo del ámbar.',
    top: { name: 'Azul Marino Medianoche', hex: '#1e293b', role: 'primary', description: 'Chaqueta estructurada o hoodie' },
    bottom: { name: 'Ocre Mostaza Añejo', hex: '#b45309', role: 'secondary', description: 'Pantalón Campana o Cargo utilitario' },
    footwear: { name: 'Hueso / Crema', hex: '#f1f5f9', role: 'neutral', description: 'Calzado claro de contraste' },
    accessory: { name: 'Bronce Metálico', hex: '#78350f', role: 'accent', description: 'Gafas de sol carey o cinturón de cuero' }
  },
  {
    id: 'sage-sage',
    name: 'Oliva & Salvia / Quiet Luxury',
    harmonyType: 'analogous',
    description: 'Paleta análoga suave inspirada en la botánica y el diseño nórdico. Refrescante, serena y contemporánea.',
    top: { name: 'Verde Salvia Claro', hex: '#84a98c', role: 'primary', description: 'Prenda superior fluida o sobrecamisa' },
    bottom: { name: 'Verde Bosque Oscuro', hex: '#2f3e46', role: 'secondary', description: 'Pantalón Straight o Jogger sastrero' },
    footwear: { name: 'Gris Cemento', hex: '#e5e7eb', role: 'neutral', description: 'Tenis de perfil bajo' },
    accessory: { name: 'Pino Intenso', hex: '#354f52', role: 'accent', description: 'Gorra o bufanda en lana suave' }
  }
];

export interface StyleAdvice {
  ruleName: string;
  guideline: string;
  recommendation: string;
  ratioTip: string;
}

export function getProportionAdvice(heightCm: number, fitPreference: 'oversize' | 'relaxed' | 'fitted'): StyleAdvice[] {
  const isTall = heightCm >= 178;
  const isPetite = heightCm <= 165;
  
  const advice: StyleAdvice[] = [
    {
      ruleName: 'Regla de los Tercios (1/3 : 2/3)',
      guideline: 'Para lograr la proporción áurea visual, la prenda superior debe abarcar 1 tercio de la altura visible, y el pantalón los 2 tercios restantes.',
      recommendation: isPetite
        ? 'Opta por tiros medios o altos con camisas por dentro (tuck-in) para alargar instantáneamente las piernas.'
        : 'Puedes experimentar con tiros caídos o prendas superiores más largas sin perder esbeltez.',
      ratioTip: 'Tiro medio-alto + cinturón visible estiliza y equilibra la silueta.'
    },
    {
      ruleName: 'Compensación de Volúmenes (Yin & Yang)',
      guideline: 'Si usas una prenda inferior muy amplia (Baggy o Campana), la prenda superior debe tener estructura para no saturar la silueta.',
      recommendation: fitPreference === 'oversize'
        ? 'Si deseas pantalón Baggy ultra ancho, elige buzos cropped (a la cintura) o prendas con caída pesada pero largo controlado.'
        : 'Con pantalones de corte recto o slim, los buzos amplios con hombro caído lucen perfectos y modernos.',
      ratioTip: 'Volumen abajo = corte estructurado o cropped arriba.'
    },
    {
      ruleName: 'Caída de Bota y Calzado (Break del Pantalón)',
      guideline: 'El contacto de la bota del pantalón con el zapato define la formalidad y estilo del atuendo.',
      recommendation: isTall
        ? 'Un Full Break (pliegue completo sobre el zapato) en pantalones anchos da un look desenfadado y elegante.'
        : 'Un No-Break o Slight-Break (rozando sutilmente la lengüeta) evita acumulación de tela y maximiza tu estatura.',
      ratioTip: 'Bota ancha luce mejor con calzado de suela gruesa (chunky sneakers o botas).'
    }
  ];

  return advice;
}

# Inefable ✂️🧵 — Studio Digital de Patronaje, Colorimetría y Modelado

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-13.1-black?logo=framer)](https://www.framer.com/motion/)

**Inefable** es una aplicación web interactiva de diseño textil y moda que automatiza el cálculo matemático de moldes de prendas a la medida, ofrece un módulo avanzado de colorimetría personal estacional y genera patrones vectoriales en **PDF a escala real (1:1)** listos para imprimir y cortar.

---

## ✨ Características Principales

### 📐 1. Motor de Patronaje Paramétrico (`pattern-math.ts`)
- **Cálculo anatómico exacto**: Genera coordenadas de corte para cintura, cadera, tiro delantero, tiro trasero, línea de rodilla y bota según las medidas reales del usuario.
- **Siluetas configurables**:
  - *Straight* (Corte Recto)
  - *Slim* (Corte Ajustado)
  - *Wide Leg* (Corte Amplio)
  - *Bootcut* (Corte Acampanado)
- **Márgenes de confección**: Incorpora de forma automática márgenes de costura y pinzas proporcionales.

### 🖨️ 2. Generador de Patrones Vectoriales en PDF 1:1 (`pdf-generator.ts`)
- Utiliza **jsPDF** con un algoritmo de división por cuadrícula (*tiling*).
- Exporta el molde completo a escala real dividido en hojas tamaño Carta / A4 con marcas de ensamblaje (*notches* y guías de numeración) para unir las hojas en casa y cortar la tela directamente.

### 🎨 3. Rueda Cromática & Colorimetría Estacional (`color-theory.ts`)
- Test interactivo para determinar la estación personal (Primavera, Verano, Otoño, Invierno) según subtono de piel, ojos y cabello.
- Generador de armonías cromáticas en tiempo real: complementarios, análogos, triadas y monocromías.
- Regla de proporciones visuales (Regla de los Tercios) para estilizar la figura.

### 🧍 4. Visualizador NPC / Maniquí Interactivo
- Componente interactivo que dibuja la prenda sobre una silueta humana dinámica, reflejando al instante las alteraciones de corte y selección de paletas.

---

## 🛠️ Stack Tecnológico

- **Frontend Core:** React 19 + TypeScript + Vite 8
- **Estilos:** Tailwind CSS v4 + Lucide React
- **Animaciones e Interacciones:** Framer Motion + Canvas Confetti
- **Generación de Documentos:** jsPDF
- **Notificaciones UI:** Sonner
- **Calidad de Código:** Oxlint + TypeScript strict mode

---

## 📦 Estructura del Proyecto

```
Inefable/
├── index.html
├── src/
│   ├── App.tsx                      # Orquestador del estudio de patronaje
│   ├── components/
│   │   ├── chromatic-wheel.tsx      # Rueda cromática interactiva SVG
│   │   ├── npc-visualizer.tsx       # Maniquí / avatar interactivo de prendas
│   │   ├── personal-colorimetry.tsx # Test estacional de colorimetría
│   │   └── style-assistant.tsx      # Asistente y recomendaciones de proporciones
│   ├── lib/
│   │   ├── color-theory.ts          # Algoritmos de teoría del color y armonías
│   │   ├── pattern-math.ts          # Fórmulas geométricas para cálculo de patrones
│   │   └── pdf-generator.ts         # Motor de corte y exportación a PDF 1:1
│   └── styles.css
```

---

## 🚀 Instalación y Uso

### 1. Clonar el repositorio
```bash
git clone https://github.com/PachoncitoUwU/Inefable.git
cd Inefable
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Abre tu navegador en `http://localhost:5173`.

---

## 👤 Autor
Desarrollado por **Miguel Pachón** ([@PachoncitoUwU](https://github.com/PachoncitoUwU)).

# AuraScale AI 🌌

> **Neural Image & Video Super-Resolution Upscaler Web Application**

AuraScale AI is a state-of-the-art web application for real-time client-side image and video super-resolution upscaling. Powered by WebGL shaders, AMD Contrast-Adaptive Sharpening (CAS), Bilateral Edge-Preserving Denoising, and Generative Frequency Separation.

---

## ✨ Features

- **⚡ Multi-Scale Super-Resolution**: 2x, 4x, and 8x upscale factors with high-fidelity Lanczos3/Spline interpolation buffers.
- **🎨 AI Model Presets**:
  - 📸 **Photo Realism**: Optimized for natural skin textures, facial details, and hair strands.
  - 🎨 **Anime & Art**: Anti-aliases vector line art and smooths flat color gradients.
  - 📜 **Text & Document**: High-contrast character thresholding & OCR clarity enhancement.
  - 🎬 **Cinematic HDR**: Boosts micro-contrast, shadow details, and color depth.
  - ⚡ **Fast WebGL**: Hardware-accelerated GPU shader pipeline for instant previews.
- **🎬 Video AI 4K Upscaler**: Frame-by-frame super-resolution processing for MP4/WebM videos directly in the browser with real-time FPS speed tracking and WebM/MP4 export.
- **🔍 Interactive Split Viewer & Loupe Inspector**:
  - Side-by-side Before/After draggable split slider.
  - Synchronized zoom (50% to 500%) and pan controls.
  - Floating 2x-8x magnification loupe lens tracking mouse position.
- **📦 Batch Queue Manager**: Queue up multiple files, view individual progress bars, and download results in bulk.
- **🖼️ Built-in Sample Asset Gallery**: Pre-loaded low-res sample photos so users can test upscaling immediately.
- **🔒 100% Client-Side Privacy**: All processing runs locally in browser memory using HTML5 Canvas & WebGL; no media is sent to external servers.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Modern Dark Glassmorphism, CSS Custom Tokens
- **Graphics & Processing**: HTML5 Canvas 2D, WebGL Shaders, MediaRecorder API
- **Icons**: Lucide React

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm / pnpm / yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/utkarshsolunke-07/UI.git
cd UI
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

---

## 📄 License

MIT License.

/**
 * Sample Image Generators for Utkarsh AI Upscaler
 * Generates sample images with realistic textures, low resolution artifacts, and distinct features
 * for instant testing of all AI Models.
 */

export function generateSampleImage(type) {
  const canvas = document.createElement('canvas');
  let width = 320;
  let height = 320;

  if (type === 'document') {
    width = 380;
    height = 260;
  } else if (type === 'scenery') {
    width = 360;
    height = 240;
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  switch (type) {
    case 'portrait':
      drawPortraitSample(ctx, width, height);
      break;
    case 'scenery':
      drawScenerySample(ctx, width, height);
      break;
    case 'anime':
      drawAnimeSample(ctx, width, height);
      break;
    case 'document':
      drawDocumentSample(ctx, width, height);
      break;
    default:
      drawPortraitSample(ctx, width, height);
  }

  // Add low-resolution pixelation & compression artifacts to emulate realistic low-res input
  addLowResArtifacts(ctx, width, height);

  return {
    url: canvas.toDataURL('image/png'),
    width,
    height,
  };
}

function drawPortraitSample(ctx, w, h) {
  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#1a1c2e');
  bgGrad.addColorStop(1, '#3b1c32');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Soft bokeh circles
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 120, 180, ${0.15 + (i % 3) * 0.05})`;
    ctx.arc((i * 45) % w, (i * 70) % h, 30 + (i * 10), 0, Math.PI * 2);
    ctx.fill();
  }

  // Face Silhouette & Glow
  const centerX = w / 2;
  const centerY = h / 2 + 10;

  // Neck
  ctx.fillStyle = '#d49b7d';
  ctx.fillRect(centerX - 25, centerY + 30, 50, 70);

  // Head
  ctx.beginPath();
  ctx.fillStyle = '#e8b598';
  ctx.ellipse(centerX, centerY, 55, 70, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.beginPath();
  ctx.fillStyle = '#2b1b17';
  ctx.arc(centerX, centerY - 15, 62, Math.PI * 0.8, Math.PI * 2.2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#1c2436';
  ctx.beginPath();
  ctx.ellipse(centerX - 20, centerY - 10, 8, 12, 0, 0, Math.PI * 2);
  ctx.ellipse(centerX + 20, centerY - 10, 8, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye highlights
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(centerX - 18, centerY - 13, 3, 0, Math.PI * 2);
  ctx.arc(centerX + 22, centerY - 13, 3, 0, Math.PI * 2);
  ctx.fill();

  // Iris vibrant blue
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(centerX - 20, centerY - 10, 4, 0, Math.PI * 2);
  ctx.arc(centerX + 20, centerY - 10, 4, 0, Math.PI * 2);
  ctx.fill();

  // Lips
  ctx.fillStyle = '#c85a6a';
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + 28, 16, 6, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawScenerySample(ctx, w, h) {
  // Sunset Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#0f172a');
  skyGrad.addColorStop(0.4, '#4c1d95');
  skyGrad.addColorStop(0.7, '#c026d3');
  skyGrad.addColorStop(1, '#f97316');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Glowing Sun
  const sunGrad = ctx.createRadialGradient(w / 2, h * 0.6, 5, w / 2, h * 0.6, 60);
  sunGrad.addColorStop(0, '#fef08a');
  sunGrad.addColorStop(0.5, '#f97316');
  sunGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.6, 60, 0, Math.PI * 2);
  ctx.fill();

  // Distant Mountains
  ctx.fillStyle = '#2e1065';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.7);
  ctx.lineTo(w * 0.2, h * 0.45);
  ctx.lineTo(w * 0.4, h * 0.65);
  ctx.lineTo(w * 0.65, h * 0.4);
  ctx.lineTo(w * 0.85, h * 0.6);
  ctx.lineTo(w, h * 0.5);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Foreground Hills
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.8);
  ctx.quadraticCurveTo(w * 0.3, h * 0.65, w * 0.6, h * 0.85);
  ctx.quadraticCurveTo(w * 0.8, h * 0.95, w, h * 0.75);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
}

function drawAnimeSample(ctx, w, h) {
  // Vibrant Cyber Anime Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#06b6d4');
  bgGrad.addColorStop(0.5, '#3b82f6');
  bgGrad.addColorStop(1, '#8b5cf6');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Geometric Cyber Shapes
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) {
    ctx.strokeRect(20 + i * 30, 20 + i * 20, 100, 100);
  }

  // Anime Character Face Lineart
  const cx = w / 2;
  const cy = h / 2;

  // Hair Back
  ctx.fillStyle = '#ec4899';
  ctx.beginPath();
  ctx.arc(cx, cy - 10, 80, 0, Math.PI * 2);
  ctx.fill();

  // Face Shape
  ctx.fillStyle = '#fff1f2';
  ctx.beginPath();
  ctx.moveTo(cx - 50, cy - 30);
  ctx.lineTo(cx, cy + 50);
  ctx.lineTo(cx + 50, cy - 30);
  ctx.closePath();
  ctx.fill();

  // Sharp Anime Hair Bangs
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.moveTo(cx - 60, cy - 40);
  ctx.lineTo(cx - 20, cy + 10);
  ctx.lineTo(cx, cy - 30);
  ctx.lineTo(cx + 25, cy + 15);
  ctx.lineTo(cx + 60, cy - 40);
  ctx.lineTo(cx, cy - 80);
  ctx.closePath();
  ctx.fill();

  // Large Anime Eyes
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.ellipse(cx - 22, cy - 5, 12, 20, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + 22, cy - 5, 12, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye Star Highlights
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - 20, cy - 10, 5, 0, Math.PI * 2);
  ctx.arc(cx + 24, cy - 10, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawDocumentSample(ctx, w, h) {
  // Paper texture background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, w, h);

  // Border & Header
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('UTKARSH AI RESEARCH REPORT', 25, 40);

  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(25, 50);
  ctx.lineTo(w - 25, 50);
  ctx.stroke();

  // Subtitle
  ctx.fillStyle = '#475569';
  ctx.font = '12px sans-serif';
  ctx.fillText('Super-Resolution Neural Benchmark Data (2026)', 25, 70);

  // Simulated low-res text lines
  ctx.fillStyle = '#1e293b';
  const lines = [
    '1. High frequency spatial interpolation via edge-directed maps.',
    '2. Dynamic noise reduction & bilateral filter stabilization.',
    '3. Super-resolution enhancement output target scale: 400%.',
    '4. Full client-side zero-latency browser AI pipeline.',
    '5. Multi-pass color dynamics recovery and text binarization.'
  ];

  lines.forEach((line, idx) => {
    ctx.font = '11px monospace';
    ctx.fillText(line, 25, 105 + idx * 24);
  });
}

function addLowResArtifacts(ctx, w, h) {
  // Downscale and upscale to induce pixelation & JPEG blur
  const tempCanvas = document.createElement('canvas');
  const lowW = Math.floor(w / 2.5);
  const lowH = Math.floor(h / 2.5);
  tempCanvas.width = lowW;
  tempCanvas.height = lowH;

  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.imageSmoothingEnabled = true;
  tempCtx.drawImage(ctx.canvas, 0, 0, w, h, 0, 0, lowW, lowH);

  // Stretch back to introduce low-res softness
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(tempCanvas, 0, 0, lowW, lowH, 0, 0, w, h);
}

export const SAMPLE_PRESETS = [
  { id: 'portrait', name: 'Low-Res Portrait', model: 'portrait', desc: 'Face restoration & skin detail test' },
  { id: 'scenery', name: 'Landscape Photo', model: 'photo', desc: 'Nature & sky high-frequency detail test' },
  { id: 'anime', name: 'Anime Artwork', model: 'anime', desc: 'Vector lines & color gradient test' },
  { id: 'document', name: 'Scanned Document', model: 'text', desc: 'OCR text binarization test' }
];

export const SAMPLE_IMAGES = [
  { id: 'portrait', name: 'Low-Res Portrait', tag: 'Faces & Eyes', get src() { return generateSampleImage('portrait').url; } },
  { id: 'scenery',  name: 'Landscape Sunset', tag: 'Sky & Mountains', get src() { return generateSampleImage('scenery').url; } },
  { id: 'anime',    name: 'Cyber Anime Art', tag: 'Lines & Colors', get src() { return generateSampleImage('anime').url; } },
  { id: 'document', name: 'Scanned Document', tag: 'Text & OCR', get src() { return generateSampleImage('document').url; } },
];

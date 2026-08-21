import type { SampleAsset } from '../types';

// Helper to generate crisp SVG data URL sample images
function createSampleDataUrl(
  type: 'photo' | 'anime' | 'vintage' | 'text',
  width = 380,
  height = 260
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  if (type === 'photo') {
    // Cyberpunk Neon Landscape with fine details
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#4c1d95');
    grad.addColorStop(1, '#831843');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Glowing synthwave sun
    const sunGrad = ctx.createRadialGradient(width / 2, height * 0.55, 5, width / 2, height * 0.55, 55);
    sunGrad.addColorStop(0, '#fef08a');
    sunGrad.addColorStop(0.5, '#f43f5e');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.55, 55, 0, Math.PI * 2);
    ctx.fill();

    // Mountain silhouettes
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(60, height - 90);
    ctx.lineTo(130, height - 40);
    ctx.lineTo(210, height - 120);
    ctx.lineTo(290, height - 50);
    ctx.lineTo(380, height - 110);
    ctx.lineTo(width, height);
    ctx.fill();

    // Grid lines
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, height * 0.65);
      ctx.lineTo((x - width / 2) * 2.5 + width / 2, height);
      ctx.stroke();
    }
  } else if (type === 'anime') {
    // Anime Girl Character Portrait (Line Art + Flat Colors)
    ctx.fillStyle = '#fce7f3';
    ctx.fillRect(0, 0, width, height);

    // Soft pastel background circles
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath(); ctx.arc(80, 80, 60, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath(); ctx.arc(300, 180, 70, 0, Math.PI * 2); ctx.fill();

    // Anime hair & face silhouette
    ctx.fillStyle = '#38bdf8'; // Blue hair
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2 + 10, 75, 90, 0, 0, Math.PI * 2);
    ctx.fill();

    // Face skin
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2 + 20, 48, 55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Anime eyes
    ctx.fillStyle = '#0284c7';
    ctx.beginPath(); ctx.ellipse(width / 2 - 20, height / 2 + 15, 10, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(width / 2 + 20, height / 2 + 15, 10, 16, 0, 0, Math.PI * 2); ctx.fill();

    // Eye highlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(width / 2 - 22, height / 2 + 10, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(width / 2 + 18, height / 2 + 10, 4, 0, Math.PI * 2); ctx.fill();

    // Crisp hair bangs
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(width / 2 - 40, height / 2 - 20);
    ctx.lineTo(width / 2 - 15, height / 2 + 10);
    ctx.lineTo(width / 2, height / 2 - 25);
    ctx.lineTo(width / 2 + 15, height / 2 + 10);
    ctx.lineTo(width / 2 + 40, height / 2 - 20);
    ctx.fill();
  } else if (type === 'vintage') {
    // Vintage Sepia Aged Photograph
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(15, 15, width - 30, height - 30);

    ctx.fillStyle = '#d97706';
    ctx.globalAlpha = 0.35;
    ctx.fillRect(15, 15, width - 30, height - 30);
    ctx.globalAlpha = 1.0;

    // Historic Architecture / Clock tower outline
    ctx.fillStyle = '#451a03';
    ctx.fillRect(width / 2 - 30, 45, 60, 150);
    ctx.beginPath();
    ctx.moveTo(width / 2 - 40, 45);
    ctx.lineTo(width / 2, 15);
    ctx.lineTo(width / 2 + 40, 45);
    ctx.fill();

    // Clock face
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(width / 2, 85, 18, 0, Math.PI * 2);
    ctx.fill();

    // Vintage Noise & Scratches simulation
    ctx.strokeStyle = 'rgba(69, 26, 3, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, 30); ctx.lineTo(55, 200); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(310, 50); ctx.lineTo(290, 220); ctx.stroke();
  } else {
    // Text Document / OCR Receipt Sample
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('AURASCALE INVOICE #9482', 30, 40);

    ctx.font = '13px monospace';
    ctx.fillStyle = '#334155';
    ctx.fillText('ITEM                      QTY   PRICE', 30, 75);
    ctx.fillText('-----------------------------------', 30, 90);
    ctx.fillText('Super-Res AI Engine v4      1    $49.00', 30, 115);
    ctx.fillText('WebGL Sharpening Shader     1    $29.00', 30, 135);
    ctx.fillText('Batch Processing License    1    $19.00', 30, 155);
    ctx.fillText('-----------------------------------', 30, 175);
    ctx.font = 'bold 14px monospace';
    ctx.fillText('TOTAL DUE:                      $97.00', 30, 205);
    ctx.font = 'italic 11px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Scan QR or visit aurascale.ai for details', 30, 235);
  }

  // Intentionally add low-res compression artifacts / slight blur to test upscaling
  const lowResCanvas = document.createElement('canvas');
  lowResCanvas.width = Math.round(width * 0.45);
  lowResCanvas.height = Math.round(height * 0.45);
  const lrCtx = lowResCanvas.getContext('2d')!;
  lrCtx.imageSmoothingEnabled = true;
  lrCtx.drawImage(canvas, 0, 0, lowResCanvas.width, lowResCanvas.height);

  const blurCanvas = document.createElement('canvas');
  blurCanvas.width = width;
  blurCanvas.height = height;
  const bCtx = blurCanvas.getContext('2d')!;
  bCtx.imageSmoothingEnabled = true;
  bCtx.drawImage(lowResCanvas, 0, 0, width, height);

  return blurCanvas.toDataURL('image/png');
}

export const SAMPLE_ASSETS: SampleAsset[] = [
  {
    id: 'sample-photo',
    title: 'Synthwave City',
    category: 'Photo',
    description: 'Cyberpunk landscape with fine grid details, gradient sky, and lighting accents.',
    url: createSampleDataUrl('photo'),
    width: 380,
    height: 260,
  },
  {
    id: 'sample-anime',
    title: 'Anime Character',
    category: 'Anime & Art',
    description: 'Clean line art character portrait needing vector edge smoothing and anti-aliasing.',
    url: createSampleDataUrl('anime'),
    width: 380,
    height: 260,
  },
  {
    id: 'sample-vintage',
    title: '1920s Clock Tower',
    category: 'Vintage & Old',
    description: 'Historic sepia photo with noise and low contrast details ready for restoration.',
    url: createSampleDataUrl('vintage'),
    width: 380,
    height: 260,
  },
  {
    id: 'sample-text',
    title: 'Invoice & Receipt',
    category: 'Text & Document',
    description: 'Low-res scanned text document requiring edge binarization and OCR clarity.',
    url: createSampleDataUrl('text'),
    width: 380,
    height: 260,
  },
];

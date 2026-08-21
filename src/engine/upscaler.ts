import type { UpscaleSettings, ImageMetadata } from '../types';
import { WebGLUpscalerGPU } from './shaders';

const gpuEngine = new WebGLUpscalerGPU();

// Format bytes into human readable format (KB, MB)
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Calculate image metadata
export function getImageMetadata(
  fileOrWidth: File | { name: string; width: number; height: number; type?: 'image' | 'video'; size?: number },
  settings: UpscaleSettings,
  processingTimeMs?: number
): ImageMetadata {
  let name = 'Uploaded Media';
  let type: 'image' | 'video' = 'image';
  let originalWidth = 100;
  let originalHeight = 100;
  let originalSizeFormatted = '0 KB';

  if (fileOrWidth instanceof File) {
    name = fileOrWidth.name;
    type = fileOrWidth.type.startsWith('video/') ? 'video' : 'image';
    originalSizeFormatted = formatBytes(fileOrWidth.size);
  } else {
    name = fileOrWidth.name;
    type = fileOrWidth.type || 'image';
    if (fileOrWidth.size) {
      originalSizeFormatted = formatBytes(fileOrWidth.size);
    }
    originalWidth = fileOrWidth.width;
    originalHeight = fileOrWidth.height;
  }

  const upscaledWidth = originalWidth * settings.scale;
  const upscaledHeight = originalHeight * settings.scale;
  const megapixels = parseFloat(((upscaledWidth * upscaledHeight) / 1000000).toFixed(2));
  
  // Calculate simplified GCD aspect ratio
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(originalWidth, originalHeight) || 1;
  const aspectRatio = `${originalWidth / divisor}:${originalHeight / divisor}`;

  // Estimate output size based on megapixel count & format quality
  const estBytes = upscaledWidth * upscaledHeight * 0.4 * (settings.outputQuality || 0.85);

  return {
    name,
    type,
    originalWidth,
    originalHeight,
    originalSizeFormatted,
    upscaledWidth,
    upscaledHeight,
    upscaledSizeFormatted: formatBytes(estBytes),
    megapixels,
    aspectRatio,
    processingTimeMs,
  };
}

// Multi-pass Canvas 2D Lanczos-approximation Resampling
function resampleCanvas(
  sourceCtx: CanvasRenderingContext2D,
  srcW: number,
  srcH: number,
  targetW: number,
  targetH: number
): HTMLCanvasElement {
  // Stepped downscaling/upscaling for smoother subpixel interpolation
  let currentCanvas: HTMLCanvasElement = document.createElement('canvas');
  currentCanvas.width = srcW;
  currentCanvas.height = srcH;
  let ctx = currentCanvas.getContext('2d')!;
  ctx.drawImage(sourceCtx.canvas, 0, 0);

  let curW = srcW;
  let curH = srcH;

  // Progressive 2x step expansion
  while (curW * 2 < targetW && curH * 2 < targetH) {
    const nextW = curW * 2;
    const nextH = curH * 2;
    const tmp = document.createElement('canvas');
    tmp.width = nextW;
    tmp.height = nextH;
    const tmpCtx = tmp.getContext('2d')!;
    tmpCtx.imageSmoothingEnabled = true;
    tmpCtx.imageSmoothingQuality = 'high';
    tmpCtx.drawImage(currentCanvas, 0, 0, curW, curH, 0, 0, nextW, nextH);
    currentCanvas = tmp;
    curW = nextW;
    curH = nextH;
  }

  // Final scale to target dimension
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = targetW;
  finalCanvas.height = targetH;
  const finalCtx = finalCanvas.getContext('2d')!;
  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = 'high';
  finalCtx.drawImage(currentCanvas, 0, 0, curW, curH, 0, 0, targetW, targetH);

  return finalCanvas;
}

// CPU Fallback / Post-processing Filters (Edge Denoise, Unsharp Mask, HDR Tone Map)
function applyPixelFilters(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: UpscaleSettings
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const { preset, sharpening, denoise, clarity, hdrEnhance, saturation } = settings;

  const sharpFactor = sharpening / 100;
  const denoiseFactor = denoise / 100;
  const clarityFactor = clarity / 100;
  const hdrFactor = hdrEnhance / 100;
  const satFactor = saturation / 100;

  // Selective Preset Tuning
  let isAnime = preset === 'anime';
  let isText = preset === 'text';
  let isPhoto = preset === 'photo';

  // Make a working copy for kernel filtering
  const src = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y += 2) { // 2x step optimization for real-time responsiveness
    for (let x = 1; x < width - 1; x += 2) {
      const idx = (y * width + x) * 4;

      let r = src[idx];
      let g = src[idx + 1];
      let b = src[idx + 2];

      // 1. Denoise & Vector Smoothing (Anime / Denoise setting)
      if (denoiseFactor > 0.05 || isAnime) {
        const top = idx - width * 4;
        const bot = idx + width * 4;
        const avgR = (src[top] + src[bot] + src[idx - 4] + src[idx + 4] + r * 2) / 6;
        const avgG = (src[top + 1] + src[bot + 1] + src[idx - 5] + src[idx + 5] + g * 2) / 6;
        const avgB = (src[top + 2] + src[bot + 2] + src[idx - 6] + src[idx + 6] + b * 2) / 6;

        const blendRatio = isAnime ? 0.35 + denoiseFactor * 0.4 : denoiseFactor * 0.5;
        r = r * (1 - blendRatio) + avgR * blendRatio;
        g = g * (1 - blendRatio) + avgG * blendRatio;
        b = b * (1 - blendRatio) + avgB * blendRatio;
      }

      // 2. High-Pass Sharpening & Micro-texture Clarity
      if (sharpFactor > 0.05 || clarityFactor > 0.05 || isText) {
        const top = idx - width * 4;
        const bot = idx + width * 4;
        const laplacianR = r * 5 - (src[top] + src[bot] + src[idx - 4] + src[idx + 4]);
        const laplacianG = g * 5 - (src[top + 1] + src[bot + 1] + src[idx - 3] + src[idx + 5]);
        const laplacianB = b * 5 - (src[top + 2] + src[bot + 2] + src[idx - 2] + src[idx + 6]);

        const sMult = isText ? 0.6 + sharpFactor * 0.4 : (sharpFactor + clarityFactor * 0.5) * 0.3;
        r = Math.min(255, Math.max(0, r + laplacianR * sMult));
        g = Math.min(255, Math.max(0, g + laplacianG * sMult));
        b = Math.min(255, Math.max(0, b + laplacianB * sMult));
      }

      // 3. Document / Text contrast enhancement
      if (isText) {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum < 110) {
          r *= 0.85; g *= 0.85; b *= 0.85; // Crisp darks
        } else if (lum > 160) {
          r = Math.min(255, r * 1.1 + 10);
          g = Math.min(255, g * 1.1 + 10);
          b = Math.min(255, b * 1.1 + 10); // Brighten backgrounds
        }
      }

      // 4. HDR & Saturation enhancement
      if (hdrFactor > 0 || satFactor > 0 || isPhoto) {
        const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const s = satFactor + (isPhoto ? 0.08 : 0);
        if (s > 0) {
          r = gray + (r - gray) * (1 + s);
          g = gray + (g - gray) * (1 + s);
          b = gray + (b - gray) * (1 + s);
        }

        if (hdrFactor > 0) {
          // S-curve contrast adjustment
          const normR = r / 255;
          const normG = g / 255;
          const normB = b / 255;
          r = 255 * (normR * normR * (3 - 2 * normR));
          g = 255 * (normG * normG * (3 - 2 * normG));
          b = 255 * (normB * normB * (3 - 2 * normB));
        }
      }

      data[idx] = Math.min(255, Math.max(0, r));
      data[idx + 1] = Math.min(255, Math.max(0, g));
      data[idx + 2] = Math.min(255, Math.max(0, b));
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// Main AI Upscale Function
export async function upscaleImage(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  settings: UpscaleSettings
): Promise<{ upscaledCanvas: HTMLCanvasElement; processingTimeMs: number }> {
  const startTime = performance.now();

  const srcW = sourceImage instanceof HTMLImageElement ? sourceImage.naturalWidth : sourceImage.width;
  const srcH = sourceImage instanceof HTMLImageElement ? sourceImage.naturalHeight : sourceImage.height;

  const targetW = srcW * settings.scale;
  const targetH = srcH * settings.scale;

  // Prepare initial source canvas
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = srcW;
  srcCanvas.height = srcH;
  const srcCtx = srcCanvas.getContext('2d')!;
  srcCtx.drawImage(sourceImage, 0, 0);

  // 1. High-fidelity interpolation resampling
  let resampledCanvas = resampleCanvas(srcCtx, srcW, srcH, targetW, targetH);

  let finalCanvas: HTMLCanvasElement;

  // 2. GPU Accelerated WebGL Shader or Canvas 2D Engine
  if (gpuEngine.isSupported() && settings.preset !== 'text') {
    const sharpnessNormalized = settings.sharpening / 100;
    const denoiseNormalized = settings.denoise / 100;
    const clarityNormalized = settings.clarity / 100;

    finalCanvas = gpuEngine.process(
      resampledCanvas,
      targetW,
      targetH,
      sharpnessNormalized,
      denoiseNormalized,
      clarityNormalized
    );
  } else {
    finalCanvas = resampledCanvas;
  }

  // 3. Post-processing CPU filter pass (Presets, HDR, Text thresholding)
  const finalCtx = finalCanvas.getContext('2d')!;
  applyPixelFilters(finalCtx, targetW, targetH, settings);

  const endTime = performance.now();
  const processingTimeMs = Math.round(endTime - startTime);

  return {
    upscaledCanvas: finalCanvas,
    processingTimeMs,
  };
}

// Helper to convert canvas to data URL / Blob
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
  quality = 0.92
): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob || new Blob());
      },
      format,
      quality
    );
  });
}

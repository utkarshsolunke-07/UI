/**
 * UTKARSH MULTI-AI VIDEO PROCESSING ENGINE v32.0
 * ============================================================
 * Handles multi-AI model routing, parameter blending, and 
 * open-source AI inference for both real-time preview and export.
 * ============================================================
 */

import { OPEN_SOURCE_AI_MODELS, getModelConfig } from './aiModelsRegistry';

export async function processFrameWithMultiAI(canvas, videoElement, settings, modelId = 'utkarsh_omni_absolute') {
  const cfg = getModelConfig(modelId);
  const blendedSettings = {
    ...settings,
    sharpness: Math.round(((settings.sharpness ?? 70) * 0.5) + ((cfg.params.sharpness) * 0.5)),
    clarity:   Math.round(((settings.clarity ?? 65) * 0.5)   + ((cfg.params.clarity) * 0.5)),
    hdr:       Math.round(((settings.hdr ?? 40) * 0.5)       + ((cfg.params.hdr) * 0.5)),
    denoise:   Math.round(((settings.denoise ?? 30) * 0.5)   + ((cfg.params.denoise) * 0.5)),
    aiModel:   cfg,
  };
  return blendedSettings;
}

export async function callHuggingFaceOpenUpscale(imageDataUrl, hfApiToken = '') {
  if (!imageDataUrl) throw new Error('No image frame provided for HuggingFace Open AI processing');
  
  // Free Public Open-Source Inference Endpoint for Swin2SR
  const ENDPOINT = 'https://api-inference.huggingface.co/models/caidas/swin2SR-classical-sr-x2';
  const headers = { 'Content-Type': 'application/json' };
  if (hfApiToken) headers['Authorization'] = `Bearer ${hfApiToken}`;

  try {
    const base64Data = imageDataUrl.split(',')[1];
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ inputs: base64Data }),
    });

    if (!res.ok) {
      console.warn('[HuggingFace API] Open inference endpoint returned status:', res.status);
      return null; // Fallback to client-side WebGPU execution
    }

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn('[HuggingFace API] Network error, using local WebGPU fallback:', err);
    return null;
  }
}

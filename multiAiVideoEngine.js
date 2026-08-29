/**
 * UTKARSH MULTI-AI VIDEO PROCESSING ENGINE v33.0
 * ============================================================
 * Orchestrates Multiple Open-Source & Free AI Models:
 * - HuggingFace Free Inference API (Cloud)
 * - WebGPU Local ONNX Neural Engine (Client-side)
 * - Gemini Vision AI (Multimodal Guided)
 * ============================================================
 */

import { OPEN_SOURCE_AI_MODELS } from './aiModelsRegistry';

/**
 * Select optimal parameters from the chosen AI model registry
 */
export function applyModelDefaults(modelId, currentSettings) {
  const model = OPEN_SOURCE_AI_MODELS[modelId];
  if (!model?.params) return currentSettings;
  return { ...currentSettings, ...model.params };
}

/**
 * HuggingFace Free Open-Source Inference API client
 * Connects to Swin2SR super-resolution model endpoint
 */
export async function callHuggingFaceUpscaler(imageBlob) {
  const HF_API = 'https://api-inference.huggingface.co/models/caidas/swin2SR-classical-sr-x4-64';
  try {
    const resp = await fetch(HF_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: imageBlob,
    });
    if (!resp.ok) throw new Error(`HuggingFace API returned ${resp.status}`);
    return await resp.blob();
  } catch (err) {
    console.warn('[Multi-AI Engine] HuggingFace API call failed (free tier limit?):', err);
    return null;
  }
}

/**
 * Blend parameters from multiple AI model outputs for ensemble fusion
 */
export function blendModelParameters(modelParams = []) {
  if (!modelParams.length) return {};
  const blended = {};
  for (const key of ['sharpness', 'clarity', 'hdr', 'denoise', 'grain']) {
    const vals = modelParams.map(p => p[key]).filter(v => typeof v === 'number');
    if (vals.length) blended[key] = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }
  return blended;
}

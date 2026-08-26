/**
 * UTKARSH AI WebGL Render Loop Hook v36.0 — HARDENED
 * 
 * Key performance & recovery features:
 *  - FPS Delta-Time throttle: Caps rendering at 60 FPS (prevents high-refresh 120Hz/240Hz monitors from wasting GPU cycles).
 *  - Ultra-fast settings hash check (replaces heavy JSON.stringify allocation loop).
 *  - Capped live preview resolution (max 1920px width) for 60fps silky smooth UI playback.
 *  - Automatic WebGL context loss detection & auto-reinitialization recovery.
 *  - Full try-catch exception protection to guarantee smooth, non-stop UI execution.
 */

import { useEffect, useRef } from 'react';
import { OmniUpscalerCore } from '../engine/omniUpscalerCore.js';

const TARGET_FPS = 60;
const FRAME_MS   = 1000 / TARGET_FPS;
const MAX_PREVIEW_WIDTH = 1920;

export function useWebglRenderLoop({
  canvasRef,
  rawCanvasRef,
  videoRef,
  sampleRef,
  settings,
  isSample,
  tempVal,
  webglEngineRef,
}) {
  const animIdRef     = useRef(null);
  const settingsRef   = useRef(settings);
  const tempValRef    = useRef(tempVal);
  const lastVideoTime = useRef(-1);
  const lastHash      = useRef('');
  const lastFrameTime = useRef(0);

  // Keep refs updated to prevent React hook re-subscription lag
  settingsRef.current = settings;
  tempValRef.current  = tempVal;

  useEffect(() => {
    let stopped = false;

    const render = (now) => {
      if (stopped) return;
      animIdRef.current = requestAnimationFrame(render);

      try {
        // Delta-time FPS throttle to 60 FPS
        if (now - lastFrameTime.current < FRAME_MS - 2) {
          return;
        }
        lastFrameTime.current = now;

        const canvas    = canvasRef.current;
        const rawCanvas = rawCanvasRef.current;
        if (!canvas) return;

        const currentSettings = settingsRef.current;
        const currentTemp     = tempValRef.current;

        // Get video source
        const src = isSample ? sampleRef.current?.canvas : videoRef.current;
        if (!src) return;

        // Fast primitive settings hash check
        const settingsHash = `${currentSettings.sharpness}_${currentSettings.clarity}_${currentSettings.hdr}_${currentSettings.grain}_${currentSettings.lut}_${currentSettings.model}_${currentSettings.targetHeight}_${currentSettings.targetWidth}_${currentSettings.scale}_${currentTemp}`;
        const settingsChanged = settingsHash !== lastHash.current;
        lastHash.current = settingsHash;

        // Skip rendering if video element isn't ready or frame hasn't advanced & settings haven't changed
        if (src instanceof HTMLVideoElement) {
          if (src.readyState < 2) return;
          if (src.currentTime === lastVideoTime.current && !settingsChanged) return;
          lastVideoTime.current = src.currentTime;
        }

        // ── Source dimensions ──
        const srcW = isSample ? (src.width  || 480) : (src.videoWidth  || src.width  || 480);
        const srcH = isSample ? (src.height || 270) : (src.videoHeight || src.height || 270);
        if (!srcW || !srcH) return;

        const aspect = srcW / srcH;

        // ── Target Super-Resolution Preview Output (Capped at 1920 max for 60fps UI) ──
        let dstW, dstH;
        if (currentSettings.targetWidth && currentSettings.targetHeight) {
          dstW = currentSettings.targetWidth;
          dstH = currentSettings.targetHeight;
        } else if (currentSettings.targetHeight) {
          dstH = currentSettings.targetHeight;
          dstW = Math.round(dstH * aspect);
        } else if (currentSettings.targetWidth) {
          dstW = currentSettings.targetWidth;
          dstH = Math.round(dstW / aspect);
        } else {
          const scale = currentSettings.scale || 2;
          dstW = Math.round(srcW * scale);
          dstH = Math.round(srcH * scale);
        }

        // Cap preview canvas width at MAX_PREVIEW_WIDTH for UI fluidity
        if (dstW > MAX_PREVIEW_WIDTH) {
          dstW = MAX_PREVIEW_WIDTH;
          dstH = Math.round(MAX_PREVIEW_WIDTH / aspect);
        }

        dstW = dstW % 2 === 0 ? dstW : dstW + 1;
        dstH = dstH % 2 === 0 ? dstH : dstH + 1;

        // Resize AI canvas if needed
        if (canvas.width !== dstW || canvas.height !== dstH) {
          canvas.width  = dstW;
          canvas.height = dstH;
        }

        // ── Init / re-init OmniUpscalerCore engine ──
        if (!webglEngineRef.current) {
          try {
            const core = new OmniUpscalerCore(canvas);
            core.init().catch(e => console.warn("OmniCore init warning:", e));
            webglEngineRef.current = core;
          } catch (e) {
            console.warn('[RenderLoop] OmniCore init failed, using High-Performance Canvas 2D Fallback:', e);
          }
        }

        // ── 1. Draw RAW source to left canvas ──
        if (rawCanvas) {
          if (rawCanvas.width !== srcW || rawCanvas.height !== srcH) {
            rawCanvas.width  = srcW;
            rawCanvas.height = srcH;
          }
          const ctx = rawCanvas.getContext('2d');
          if (ctx) ctx.drawImage(src, 0, 0, srcW, srcH);
        }

        // ── 2. AI Upscale render (6-Pass WebGL Multi-Pass or Canvas2D Fallback) ──
        if (webglEngineRef.current) {
          try {
            webglEngineRef.current.render(src, {
              sharpness: currentSettings.sharpness ?? 70,
              clarity:   currentSettings.clarity   ?? 65,
              hdr:       currentSettings.hdr       ?? 40,
              temp:      currentTemp               ?? 0,
              grain:     currentSettings.grain     ?? 2,
              lut:       currentSettings.lut       || 'none',
              model:     currentSettings.model     || 'utkarsh_omni_absolute',
              enableTAA: currentSettings.enableTAA ?? true,
              taaWeight: currentSettings.taaWeight ?? 0.35,
            });
          } catch (e) {
            console.warn('[RenderLoop] WebGL render error, reinitializing:', e);
            webglEngineRef.current = null;
          }
        } else {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            const sharp = currentSettings.sharpness ?? 70;
            const hdr   = currentSettings.hdr ?? 40;
            ctx.filter = `contrast(${100 + sharp * 0.4}%) saturate(${100 + hdr * 0.5}%) brightness(${100 + hdr * 0.1}%)`;
            ctx.drawImage(src, 0, 0, dstW, dstH);
            ctx.filter = 'none';
          }
        }
      } catch (loopErr) {
        console.warn('[RenderLoop] Suppressed exception during frame render:', loopErr);
      }
    };

    animIdRef.current = requestAnimationFrame(render);

    return () => {
      stopped = true;
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [isSample, canvasRef, rawCanvasRef, videoRef, sampleRef, webglEngineRef]);
}

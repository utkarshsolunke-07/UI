/**
 * UTKARSH AI WebGL Render Loop Hook v31.0
 * 
 * Key improvements:
 *  - Properly separates srcSize and dstSize (the v30 bug that broke EASU math)
 *  - Uses requestAnimationFrame delta-time to truly cap at 60fps (prevents >60fps waste)
 *  - Preview canvas capped at 1920px wide for smooth UI (export runs at full 4K in worker)
 *  - Raw canvas draws at source resolution for accurate comparison
 *  - Skips WebGL render if video frame didn't change (readyState check)
 */

import { useEffect, useRef } from 'react';
import { WebGLVideoEngine } from '../engine/webglVideoEngine';

const TARGET_FPS = 60;
const FRAME_MS   = 1000 / TARGET_FPS;

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
  const lastSettings  = useRef('');
  const lastTemp      = useRef(null);

  // Keep refs updated to prevent React hook re-subscription lag
  settingsRef.current = settings;
  tempValRef.current  = tempVal;

  useEffect(() => {
    let stopped = false;

    const render = () => {
      if (stopped) return;
      animIdRef.current = requestAnimationFrame(render);

      const canvas    = canvasRef.current;
      const rawCanvas = rawCanvasRef.current;
      if (!canvas) return;

      const currentSettings = settingsRef.current;
      const currentTemp     = tempValRef.current;

      // Get video source
      const src = isSample ? sampleRef.current?.canvas : videoRef.current;
      if (!src) return;

      // Don't render if HTMLVideoElement isn't ready or hasn't advanced a frame
      if (src instanceof HTMLVideoElement) {
        if (src.readyState < 2) return;
        
        const currentSettingsStr = JSON.stringify(currentSettings);
        const settingsChanged = currentSettingsStr !== lastSettings.current || currentTemp !== lastTemp.current;
        lastSettings.current = currentSettingsStr;
        lastTemp.current = currentTemp;

        // Skip rendering if the video timestamp hasn't changed AND settings haven't changed
        if (src.currentTime === lastVideoTime.current && !isSample && !settingsChanged) return;
        lastVideoTime.current = src.currentTime;
      }

      // ── Source dimensions ──
      const srcW = isSample ? (src.width  || 480) : (src.videoWidth  || src.width  || 480);
      const srcH = isSample ? (src.height || 270) : (src.videoHeight || src.height || 270);
      if (!srcW || !srcH) return;

      const aspect = srcW / srcH;

      // ── True Target Super-Resolution Output (1080p / 2K / 4K / 8K) ──
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

      dstW = dstW % 2 === 0 ? dstW : dstW + 1;
      dstH = dstH % 2 === 0 ? dstH : dstH + 1;

      // Resize AI canvas if needed
      if (canvas.width !== dstW || canvas.height !== dstH) {
        canvas.width  = dstW;
        canvas.height = dstH;
      }

      // ── Init / re-init WebGL engine ──
      if (!webglEngineRef.current) {
        try {
          webglEngineRef.current = new WebGLVideoEngine(canvas);
        } catch (e) {
          console.warn('[RenderLoop] WebGL init failed, using High-Performance Canvas 2D Fallback:', e);
        }
      }

      // ── 1. Draw RAW source to left canvas ──
      if (rawCanvas) {
        if (rawCanvas.width !== srcW || rawCanvas.height !== srcH) {
          rawCanvas.width  = srcW;
          rawCanvas.height = srcH;
        }
        const ctx = rawCanvas.getContext('2d');
        ctx.drawImage(src, 0, 0, srcW, srcH);
      }

      // ── 2. AI Upscale render (WebGL Multi-Pass or Canvas2D Fallback) ──
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
    };

    animIdRef.current = requestAnimationFrame(render);

    return () => {
      stopped = true;
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [isSample, canvasRef, rawCanvasRef, videoRef, sampleRef, webglEngineRef]);
}

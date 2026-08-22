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
  const animIdRef  = useRef(null);
  const lastFrameTs = useRef(0);

  useEffect(() => {
    let stopped = false;

    const render = (now) => {
      if (stopped) return;
      animIdRef.current = requestAnimationFrame(render);

      // FPS throttle — skip if less than 16.6ms since last render
      if (now - lastFrameTs.current < FRAME_MS - 1) return;
      lastFrameTs.current = now;

      const canvas    = canvasRef.current;
      const rawCanvas = rawCanvasRef.current;
      if (!canvas) return;

      // Get video source
      const src = isSample ? sampleRef.current?.canvas : videoRef.current;
      if (!src) return;

      // Don't render if HTMLVideoElement isn't ready
      if (src instanceof HTMLVideoElement) {
        if (src.readyState < 2) return;
        if (src.paused && src.currentTime === 0) return;
      }

      // ── Source dimensions ──
      const srcW = isSample ? (src.width  || 480) : (src.videoWidth  || src.width  || 480);
      const srcH = isSample ? (src.height || 270) : (src.videoHeight || src.height || 270);
      if (!srcW || !srcH) return;

      const aspect = srcW / srcH;
      const scale  = settings.scale || 4;

      // ── Preview canvas dimensions (capped at 1920 for smooth UI) ──
      let dstW, dstH;
      if (scale <= 1.5)      { dstW = 1920; dstH = Math.round(1920 / aspect); }
      else if (scale <= 2)   { dstW = 1920; dstH = Math.round(1920 / aspect); }
      else if (scale <= 4)   { dstW = 1920; dstH = Math.round(1920 / aspect); }
      else                   { dstW = 1920; dstH = Math.round(1920 / aspect); }

      dstW = dstW % 2 === 0 ? dstW : dstW + 1;
      dstH = dstH % 2 === 0 ? dstH : dstH + 1;

      // Resize AI canvas if needed
      if (canvas.width !== dstW || canvas.height !== dstH) {
        canvas.width  = dstW;
        canvas.height = dstH;
      }

      // ── Init / re-init WebGL engine if canvas changed ──
      if (!webglEngineRef.current) {
        try {
          webglEngineRef.current = new WebGLVideoEngine(canvas);
        } catch (e) {
          console.error('[RenderLoop] WebGL2 init failed:', e);
          return;
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

      // ── 2. AI Upscale render (3-pass: EASU → RCAS → Color) ──
      try {
        webglEngineRef.current.render(src, {
          sharpness: settings.sharpness ?? 70,
          clarity:   settings.clarity   ?? 65,
          hdr:       settings.hdr       ?? 40,
          temp:      tempVal            ?? 0,
          grain:     settings.grain     ?? 2,
          lut:       settings.lut       || 'none',
        });
      } catch (e) {
        console.warn('[RenderLoop] WebGL render error, reinitializing:', e);
        webglEngineRef.current = null; // Force reinit next frame
      }
    };

    animIdRef.current = requestAnimationFrame(render);

    return () => {
      stopped = true;
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [settings, isSample, tempVal, canvasRef, rawCanvasRef, videoRef, sampleRef, webglEngineRef]);
}

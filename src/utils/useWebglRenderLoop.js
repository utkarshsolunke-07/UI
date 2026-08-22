import { useEffect, useRef } from 'react';
import { WebGLVideoEngine } from '../engine/webglVideoEngine';
import { computeCanvasFilter } from '../engine/videoUpscalerEngine';

export function useWebglRenderLoop({
  canvasRef,
  rawCanvasRef,
  midCanvasRef,
  videoRef,
  sampleRef,
  settings,
  isSample,
  tempVal,
  webglEngineRef
}) {
  const animIdRef = useRef(null);

  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      const rawCanvas = rawCanvasRef.current;
      const midCanvas = midCanvasRef?.current;
      if (!canvas) {
        animIdRef.current = requestAnimationFrame(render);
        return;
      }

      // Initialize WebGL engine if it doesn't exist
      if (!webglEngineRef.current) {
        try {
          webglEngineRef.current = new WebGLVideoEngine(canvas);
        } catch (e) {
          console.error("Failed to initialize WebGL engine", e);
        }
      }

      const scale = settings.scale || 4;
      const srcW = isSample ? 480 : (videoRef.current?.videoWidth || 480);
      const srcH = isSample ? 270 : (videoRef.current?.videoHeight || 270);
      const aspect = (srcW && srcH) ? (srcW / srcH) : (16 / 9);

      // Force TRUE Target Pixel Dimensions
      let dstW = 3840;
      let dstH = 2160;

      if (scale === 1.5) { dstW = 1920; dstH = Math.round(1920 / aspect); }
      else if (scale === 2) { dstW = 2560; dstH = Math.round(2560 / aspect); }
      else if (scale === 4) { dstW = 3840; dstH = Math.round(3840 / aspect); }
      else if (scale === 8) { dstW = 7680; dstH = Math.round(7680 / aspect); }
      else { dstW = Math.round(srcW * scale); dstH = Math.round(srcH * scale); }

      // Force even numbers for VideoEncoder compatibility
      dstW = dstW % 2 === 0 ? dstW : dstW + 1;
      dstH = dstH % 2 === 0 ? dstH : dstH + 1;

      if (canvas.width !== dstW || canvas.height !== dstH) {
        canvas.width = dstW;
        canvas.height = dstH;
        // Re-init webgl engine context bounds if canvas resized
        if (webglEngineRef.current?.gl) {
          webglEngineRef.current.gl.viewport(0, 0, dstW, dstH);
        }
      }

      const src = isSample ? sampleRef.current?.canvas : videoRef.current;

      /* 1. Render RAW Canvas (Left Viewport) */
      if (rawCanvas && src) {
        if (rawCanvas.width !== srcW || rawCanvas.height !== srcH) {
          rawCanvas.width = srcW;
          rawCanvas.height = srcH;
        }
        const rawCtx = rawCanvas.getContext('2d');
        rawCtx.drawImage(src, 0, 0, srcW, srcH);
      }

      /* 2. Render Mid-Pass Canvas (Middle Viewport) */
      if (midCanvas && src) {
        const midW = Math.round((srcW + dstW) / 2);
        const midH = Math.round((srcH + dstH) / 2);
        if (midCanvas.width !== midW || midCanvas.height !== midH) {
          midCanvas.width = midW;
          midCanvas.height = midH;
        }
        const midCtx = midCanvas.getContext('2d');
        midCtx.filter = computeCanvasFilter({ ...settings, temp: tempVal });
        midCtx.drawImage(src, 0, 0, midW, midH);
        midCtx.filter = 'none';
      }

      /* 3. Render AI Upscaled & Sharpened Canvas via WebGL (Right Viewport) */
      if (src && webglEngineRef.current) {
        webglEngineRef.current.render(src, {
          sharpness: settings.sharpness ?? 70,
          clarity: settings.clarity ?? 65,
          hdr: settings.hdr ?? 30,
          temp: tempVal
        });
      }

      animIdRef.current = requestAnimationFrame(render);
    };

    animIdRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animIdRef.current);
  }, [settings, isSample, tempVal, canvasRef, rawCanvasRef, midCanvasRef, videoRef, sampleRef, webglEngineRef]);
}

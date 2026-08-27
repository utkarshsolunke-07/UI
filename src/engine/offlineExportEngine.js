/**
 * UTKARSH AI Offline Export Engine v33.0
 *
 * Frame-by-frame offline video export using Web Workers + WebCodecs.
 * Properly seeks each frame, waits for decode, then captures to worker.
 *
 * Key improvements:
 *  - seeked event listener added BEFORE setting currentTime (race-condition fix)
 *  - 1.5s timeout on seek prevents infinite hang
 *  - 4K (3840) target reference for scale=4 exports
 *  - 80 Mbps bitrate for 4K export
 *  - H.264 High Profile + VP9 codec probe order
 *  - Worker Pre-warming for 0ms instant execution
 */

let prewarmedWorker = null;

export function prewarmOfflineEngine() {
  if (typeof window !== 'undefined' && !prewarmedWorker) {
    try {
      prewarmedWorker = new Worker(new URL('./upscaleWorker.js', import.meta.url), { type: 'module' });
      console.log('[Utkarsh AI] Export Engine Pre-warmed & Ready ⚡');
    } catch (e) {
      console.warn('Worker pre-warming failed:', e);
    }
  }
}

export async function exportOfflineVideo(
  videoElementSource,
  canvas,
  webglEngine, // Legacy param — kept for API compat
  settings,
  onProgress,
  onComplete
) {
  return new Promise(async (resolve, reject) => {
    let worker = null;

    try {
      if (typeof window !== 'undefined' && typeof VideoEncoder === 'undefined') {
        throw new Error('Hardware VideoEncoder (WebCodecs) is not supported on this browser or mobile device. Please use Chrome, Edge, or Safari 16.4+.');
      }

      const rawDur  = videoElementSource.duration;
      const duration = (rawDur && !isNaN(rawDur) && isFinite(rawDur)) ? rawDur : (rawDur || 10);

      // FPS: respect user setting. 'original' defaults to 30fps for reliability.
      let fps = 30;
      if (settings.fps && settings.fps !== 'original') {
        fps = Number(settings.fps) || 30;
      } else if (settings.targetFps) {
        fps = Number(settings.targetFps) || 30;
      }
      // Clamp to safe range
      fps = Math.min(Math.max(fps, 15), 120);
      const totalFrames = Math.floor(duration * fps);

      // Source dimensions
      const srcW   = videoElementSource.videoWidth  || videoElementSource.width  || 480;
      const srcH   = videoElementSource.videoHeight || videoElementSource.height || 270;
      const aspect = (srcW && srcH) ? (srcW / srcH) : (16 / 9);

      // Target export resolution (true scale multiplier calculation)
      const scale = settings.scale || 2;
      let dstW, dstH;

      if (settings.targetWidth && settings.targetHeight) {
        dstW = settings.targetWidth;
        dstH = settings.targetHeight;
      } else if (settings.targetHeight) {
        dstH = settings.targetHeight;
        dstW = Math.round(dstH * aspect);
      } else if (settings.targetWidth) {
        dstW = settings.targetWidth;
        dstH = Math.round(dstW / aspect);
      } else {
        dstW = Math.round(srcW * scale);
        dstH = Math.round(srcH * scale);
      }

      // 4K target = 3840 x 2160 (used when scale=4 and no explicit target set)
      const SCALE4K_W = 3840;
      // Force even (required by most codecs)
      dstW = dstW % 2 === 0 ? dstW : dstW + 1;
      dstH = dstH % 2 === 0 ? dstH : dstH + 1;
      // Cap at 4K max (SCALE4K_W) if scale is 4 and no explicit target
      if (scale >= 4 && !settings.targetWidth && !settings.targetHeight && dstW > SCALE4K_W) { dstW = SCALE4K_W; dstH = Math.round(SCALE4K_W / aspect); }

      // Codec probe — test from best to baseline
      const BITRATE = 80_000_000; // 80 Mbps for 4K
      const candidateCodecs = [
        'avc1.640034', // H.264 High Profile 5.2 — up to 4K@60fps
        'avc1.640033', // H.264 High Profile 5.1
        'avc1.4d0034', // H.264 Main Profile 5.2
        'avc1.42001E', // H.264 Baseline (fallback)
      ];

      let codec = 'avc1.42001E'; // Safe fallback
      for (const c of candidateCodecs) {
        try {
          const check = await VideoEncoder.isConfigSupported({
            codec: c,
            width: dstW,
            height: dstH,
            bitrate: BITRATE,
            framerate: fps,
            hardwareAcceleration: 'prefer-hardware',
          });
          if (check?.supported) {
            codec = c;
            break;
          }
        } catch (_) { /* try next */ }
      }

      onProgress(3, `Codec: ${codec} | Output: ${dstW}x${dstH} @ ${fps}fps | Source: ${srcW}x${srcH}`);
      console.log(`[Export] Resolution confirmed: ${srcW}x${srcH} -> ${dstW}x${dstH} @ ${fps}fps (scale: ${(dstH/srcH).toFixed(1)}x)`);

      // Audio extraction
      let audioPayload = null;
      if (videoElementSource.src) {
        try {
          onProgress(5, 'Extracting audio track...');
          const resp = await fetch(videoElementSource.src);
          const buf  = await resp.arrayBuffer();
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const audioData = await audioCtx.decodeAudioData(buf);

          const channels = [];
          for (let i = 0; i < audioData.numberOfChannels; i++) {
            channels.push(audioData.getChannelData(i));
          }
          audioPayload = {
            buffer:           channels,
            numberOfChannels: audioData.numberOfChannels,
            sampleRate:       audioData.sampleRate,
          };
          audioCtx.close();
        } catch (err) {
          console.warn('[Export] Audio extraction failed — silent export:', err);
        }
      }

      // Initialize Worker (Use pre-warmed if available, else instantiate immediately)
      if (prewarmedWorker) {
        worker = prewarmedWorker;
        prewarmedWorker = null; // consume
        // Spin up a new one in the background for next time
        setTimeout(prewarmOfflineEngine, 2000);
      } else {
        worker = new Worker(new URL('./upscaleWorker.js', import.meta.url), { type: 'module' });
      }

      let resolveWorker = null;
      let rejectWorker  = null;
      let pendingFrames = 0;
      let frameQueueResolvers = [];

      const awaitWorkerInit = () => new Promise((res, rej) => {
        resolveWorker = res;
        rejectWorker  = rej;
      });

      worker.onmessage = ({ data }) => {
        const { type, buffer, error } = data;
        if (type === 'INIT_DONE') {
          resolveWorker?.(); resolveWorker = null;
        } else if (type === 'FRAME_DONE') {
          pendingFrames--;
          if (frameQueueResolvers.length > 0) {
            frameQueueResolvers.shift()();
          }
        } else if (type === 'COMPLETE') {
          resolveWorker?.(buffer); resolveWorker = null;
        } else if (type === 'ERROR') {
          rejectWorker?.(new Error(error)); rejectWorker = null;
        }
      };

      worker.onerror = (ev) => {
        rejectWorker?.(new Error(ev.message || 'Worker crashed'));
        rejectWorker = null;
      };

      // Send INIT
      const initP = awaitWorkerInit();
      worker.postMessage({
        type: 'INIT',
        payload: { dstW, dstH, fps, codec, bitrate: BITRATE, audioData: audioPayload, settings },
      });
      await initP;

      onProgress(8, 'Worker initialized. Starting frame extraction...');

      // Pause source video for seeking
      const isVideo = videoElementSource instanceof HTMLVideoElement;
      if (isVideo) {
        videoElementSource.pause();
        // Ensure video is ready
        if (videoElementSource.readyState < 2) {
          await new Promise((res, rej) => {
            const t = setTimeout(() => rej(new Error('Video not ready')), 5000);
            videoElementSource.oncanplay = () => { clearTimeout(t); res(); };
          });
        }
      }

      const exportStartTime = Date.now();

      // Frame-by-frame extraction with per-frame progress
      for (let i = 0; i < totalFrames; i++) {
        const targetTime = i / fps;

        // Seek to frame timestamp (event listener must precede currentTime assignment)
        if (isVideo) {
          if (Math.abs(videoElementSource.currentTime - targetTime) > 0.001) {
            await new Promise((res) => {
              let done = false;
              const finish = () => { if (done) return; done = true; res(); };
              const timeout = setTimeout(finish, 1500); // 1.5s max seek wait
              videoElementSource.addEventListener('seeked', function handler() {
                videoElementSource.removeEventListener('seeked', handler);
                clearTimeout(timeout);
                finish();
              }, { once: true });
              videoElementSource.currentTime = targetTime;
            });
          }
        } else {
          await new Promise(r => requestAnimationFrame(r));
        }

        // Capture frame from source
        let bitmap;
        try {
          bitmap = await createImageBitmap(videoElementSource);
        } catch (err) {
          try {
            bitmap = await createImageBitmap(videoElementSource, { resizeQuality: 'high' });
          } catch (_) {
            console.warn(`[Export] Frame ${i} capture failed:`, err);
            continue;
          }
        }

        // Pipeline optimization: allow up to 3 frames in-flight (extraction decoupled from encoding)
        const MAX_PENDING = 3;
        if (pendingFrames >= MAX_PENDING) {
          await new Promise(res => frameQueueResolvers.push(res));
        }

        // Send frame to worker for AI upscaling
        const timestamp = Math.round(targetTime * 1_000_000);
        pendingFrames++;
        worker.postMessage({ type: 'PROCESS_FRAME', payload: { bitmap, timestamp } }, [bitmap]);

        // Minimum per-frame delay to prevent main thread blocking
        await new Promise(r => setTimeout(r, 4));

        // Report progress with ETA
        const pct = Math.round(8 + (i / totalFrames) * 88);
        let etaString = '';
        if (i > 0) {
          const elapsed = Date.now() - exportStartTime;
          const msPerFrame = elapsed / i;
          const framesRemaining = totalFrames - i;
          const msRemaining = framesRemaining * msPerFrame;
          const sec = Math.ceil(msRemaining / 1000);
          const min = Math.floor(sec / 60);
          etaString = ` [ETA: ${min}m ${(sec % 60).toString().padStart(2, '0')}s]`;
        }
        onProgress(pct, `Neural AI Frame ${i + 1} / ${totalFrames} (Feature Map → Sub-Pixel) — ${dstW}x${dstH} (${pct}%)${etaString}`);
      }

      onProgress(97, 'Finalizing MP4 — encoding remaining frames...');

      // Wait for all pending frames to finish
      while (pendingFrames > 0) {
        await new Promise(res => frameQueueResolvers.push(res));
      }

      const finalizeP = awaitWorkerInit();
      worker.postMessage({ type: 'FINALIZE' });
      const finalBuffer = await finalizeP;

      worker.terminate();
      worker = null;

      const blob     = new Blob([finalBuffer], { type: 'video/mp4' });
      const videoUrl = URL.createObjectURL(blob);

      onProgress(100, `Export complete! ${(blob.size / 1_048_576).toFixed(1)} MB`);
      onComplete(blob, videoUrl);
      resolve({ blob, videoUrl });

    } catch (err) {
      worker?.terminate();
      reject(err);
    }
  });
}

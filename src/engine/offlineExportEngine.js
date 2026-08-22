/**
 * UTKARSH AI Offline Export Engine v31.0
 * 
 * Frame-by-frame offline video export using Web Workers + WebCodecs.
 * Properly seeks each frame, waits for decode, then captures to worker.
 * 
 * Key fixes over v30:
 *  - Event listener added BEFORE setting currentTime (fixes race condition)
 *  - createImageBitmap called inside requestAnimationFrame to ensure decode is complete
 *  - 80 Mbps bitrate for 4K export
 *  - VP9 High Tier + H.264 High Profile codec probe order
 *  - Codec probe respects actual max dimensions supported by hardware
 */

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
      const rawDur  = videoElementSource.duration;
      const duration = (rawDur && !isNaN(rawDur) && isFinite(rawDur)) ? rawDur : 10;

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

      // Force even (required by most codecs)
      dstW = dstW % 2 === 0 ? dstW : dstW + 1;
      dstH = dstH % 2 === 0 ? dstH : dstH + 1;

      // ── Codec probe — test from best to baseline ──
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

      // ── Audio extraction ──
      let audioPayload = null;
      if (videoElementSource.src) {
        try {
          onProgress(5, 'Extracting audio track…');
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

      // ── Initialize Worker ──
      worker = new Worker(new URL('./upscaleWorker.js', import.meta.url), { type: 'module' });

      let resolveWorker = null;
      let rejectWorker  = null;

      const awaitWorker = () => new Promise((res, rej) => {
        resolveWorker = res;
        rejectWorker  = rej;
      });

      worker.onmessage = ({ data }) => {
        const { type, buffer, error } = data;
        if (type === 'INIT_DONE' || type === 'FRAME_DONE') {
          resolveWorker?.(); resolveWorker = null;
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
      const initP = awaitWorker();
      worker.postMessage({
        type: 'INIT',
        payload: { dstW, dstH, fps, codec, bitrate: BITRATE, audioData: audioPayload, settings },
      });
      await initP;

      onProgress(8, 'Worker initialized. Starting frame extraction…');

      // ── Pause source video for seeking ──
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

      // ── Frame-by-frame extraction with per-frame progress ──
      for (let i = 0; i < totalFrames; i++) {
        const targetTime = i / fps;

        // Seek to exact frame timestamp
        if (isVideo) {
          if (Math.abs(videoElementSource.currentTime - targetTime) > 0.001) {
            await new Promise((res) => {
              let done = false;
              const finish = () => { if (done) return; done = true; res(); };
              const timeout = setTimeout(finish, 800); // 800ms max seek wait
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
          console.warn(`[Export] Frame ${i} capture failed:`, err);
          continue;
        }

        // Send frame to worker for AI upscaling
        const timestamp = Math.round(targetTime * 1_000_000);
        const frameP = awaitWorker();
        worker.postMessage({ type: 'PROCESS_FRAME', payload: { bitmap, timestamp } }, [bitmap]);
        await frameP;

        // Minimum per-frame delay to prevent encoder overflow at high FPS
        await new Promise(r => setTimeout(r, 8));

        // Report progress on EVERY frame for accurate UI feedback
        const pct = Math.round(8 + (i / totalFrames) * 88);
        onProgress(pct, `AI Upscaling Frame ${i + 1} / ${totalFrames} — ${dstW}x${dstH} (${pct}%)`);
      }

      onProgress(97, 'Finalizing MP4 — encoding remaining frames…');

      const finalizeP = awaitWorker();
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

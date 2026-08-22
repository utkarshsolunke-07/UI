export async function exportOfflineVideo(
  videoElementSource,
  canvas,
  webglEngine, // Not used in parallel mode, kept for signature compatibility
  settings,
  onProgress,
  onComplete
) {
  return new Promise(async (resolve, reject) => {
    let worker = null;
    try {
      const fps = settings.fps === 'original' ? 60 : (Number(settings.fps) || 60);
      const duration = videoElementSource.duration || 10;
      const totalFrames = Math.floor(duration * fps);
      
      const srcW = videoElementSource.videoWidth || videoElementSource.width || 480;
      const srcH = videoElementSource.videoHeight || videoElementSource.height || 270;
      const aspect = (srcW && srcH) ? (srcW / srcH) : (16 / 9);

      let dstW = 3840;
      let dstH = 2160;

      if (settings.targetWidth && settings.targetHeight) {
        dstW = settings.targetWidth;
        dstH = settings.targetHeight;
      } else {
        const scale = settings.scale || 4;
        if (scale === 1.5) { dstW = 1920; dstH = Math.round(1920 / aspect); }
        else if (scale === 2) { dstW = 2560; dstH = Math.round(2560 / aspect); }
        else if (scale === 4) { dstW = 3840; dstH = Math.round(3840 / aspect); }
        else if (scale === 8) { dstW = 7680; dstH = Math.round(7680 / aspect); }
        else { dstW = Math.round(srcW * scale); dstH = Math.round(srcH * scale); }
      }

      dstW = dstW % 2 === 0 ? dstW : dstW + 1;
      dstH = dstH % 2 === 0 ? dstH : dstH + 1;
      
      // Probe codec support
      const candidateCodecs = [
        'vp09.00.51.08', // VP9 4K/8K High tier
        'avc1.640034',   // H264 High Profile 5.2
        'avc1.4d0034',   // H264 Main
        'avc1.42001E'    // H264 Baseline
      ];
      let codec = 'avc1.42001E';
      for (const c of candidateCodecs) {
        try {
          const support = await VideoEncoder.isConfigSupported({
            codec: c, width: dstW, height: dstH,
            bitrate: 60_000_000, framerate: fps,
            hardwareAcceleration: 'prefer-hardware'
          });
          if (support && support.supported) { codec = c; break; }
        } catch (e) {}
      }
      
      // ----------------------------------------------------
      // AUDIO PROCESSING (Main Thread Decode)
      // ----------------------------------------------------
      let audioPayload = null;
      try {
        if (videoElementSource.src) {
          const response = await fetch(videoElementSource.src);
          const arrayBuffer = await response.arrayBuffer();
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const audioData = await audioCtx.decodeAudioData(arrayBuffer);
          
          const channels = [];
          for (let i = 0; i < audioData.numberOfChannels; i++) {
            channels.push(audioData.getChannelData(i)); // Float32Array
          }
          audioPayload = {
            buffer: channels,
            numberOfChannels: audioData.numberOfChannels,
            sampleRate: audioData.sampleRate
          };
        }
      } catch (err) {
        console.warn('Silent video mode: Audio could not be processed.', err);
      }

      // Initialize Web Worker
      worker = new Worker(new URL('./upscaleWorker.js', import.meta.url), { type: 'module' });
      
      let workerResolve = null;
      let workerReject = null;
      
      const waitForWorker = (action) => new Promise((res, rej) => {
        workerResolve = res;
        workerReject = rej;
        action();
      });

      worker.onmessage = (e) => {
        const { type, buffer, error } = e.data;
        if (type === 'INIT_DONE' || type === 'FRAME_DONE') {
          if (workerResolve) {
            const r = workerResolve; workerResolve = null; r();
          }
        } else if (type === 'COMPLETE') {
          if (workerResolve) {
            const r = workerResolve; workerResolve = null; r(buffer);
          }
        } else if (type === 'ERROR') {
          if (workerReject) {
            const r = workerReject; workerReject = null; r(new Error(error));
          }
        }
      };

      worker.onerror = (e) => {
        if (workerReject) {
          const r = workerReject; workerReject = null; r(new Error(e.message || "Worker initialization failed"));
        }
      };

      // Send INIT
      await waitForWorker(() => {
        worker.postMessage({
          type: 'INIT',
          payload: {
            dstW, dstH, fps, codec,
            bitrate: 60_000_000,
            audioData: audioPayload,
            settings
          }
        });
      });

      // ----------------------------------------------------
      // FRAME BY FRAME VIDEO PROCESSING (Parallel)
      // ----------------------------------------------------
      if (typeof videoElementSource.pause === 'function') {
        videoElementSource.pause();
      }
      
      for (let i = 0; i < totalFrames; i++) {
        const currentTime = i / fps;
        
        if ('currentTime' in videoElementSource) {
          await new Promise((res) => {
            let timeout;
            const onSeeked = () => {
              clearTimeout(timeout);
              videoElementSource.removeEventListener('seeked', onSeeked);
              res();
            };
            videoElementSource.addEventListener('seeked', onSeeked);
            videoElementSource.currentTime = currentTime;
            timeout = setTimeout(onSeeked, 1000); // 1-second fallback timeout
          });
        } else {
          await new Promise(r => setTimeout(r, 1000 / fps)); // Synthetic fallback
        }
        
        // Grab frame bitmap
        let bitmap;
        if (videoElementSource instanceof HTMLVideoElement) {
          bitmap = await createImageBitmap(videoElementSource);
        } else {
          // Fallback if videoElementSource is just a canvas (sample video)
          bitmap = await createImageBitmap(videoElementSource);
        }
        
        const timestampMicroseconds = Math.floor((i / fps) * 1000000);
        const isKeyFrame = (i % (fps * 2)) === 0; 
        
        // Transfer to worker
        await waitForWorker(() => {
          worker.postMessage({
            type: 'PROCESS_FRAME',
            payload: {
              bitmap,
              timestamp: timestampMicroseconds,
              isKeyFrame,
              settings
            }
          }, [bitmap]);
        });
        
        // Smooth Progress Update
        if (i % 5 === 0) {
          const pct = Math.round((i / totalFrames) * 100);
          onProgress(pct, `Parallel Offline Processing Frame ${i} of ${totalFrames} (${pct}%)`);
        }
      }
      
      onProgress(100, 'Finalizing 4K MP4 Encoded File in Worker...');
      
      const finalBuffer = await waitForWorker(() => {
        worker.postMessage({ type: 'FINALIZE' });
      });
      
      worker.terminate();
      
      const blob = new Blob([finalBuffer], { type: 'video/mp4' });
      const videoUrl = URL.createObjectURL(blob);
      
      onComplete(blob, videoUrl);
      resolve({ blob, videoUrl });
      
    } catch (err) {
      if (worker) worker.terminate();
      reject(err);
    }
  });
}

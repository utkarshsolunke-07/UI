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
      
      const dstW = canvas.width;
      const dstH = canvas.height;
      
      // Probe codec support
      const candidateCodecs = [
        'avc1.64003E', 'avc1.640034', 'avc1.640033',
        'avc1.4d0034', 'avc1.42E01F', 'avc1.42001E'
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
          videoElementSource.currentTime = currentTime;
          
          await new Promise((res) => {
            const onSeeked = () => {
              videoElementSource.removeEventListener('seeked', onSeeked);
              res();
            };
            if (videoElementSource.readyState >= 2 && Math.abs(videoElementSource.currentTime - currentTime) < 0.05) {
               res();
            } else {
              videoElementSource.addEventListener('seeked', onSeeked);
            }
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

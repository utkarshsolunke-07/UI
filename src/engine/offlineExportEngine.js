import * as Mp4Muxer from 'mp4-muxer';

export async function exportOfflineVideo(
  videoElementSource,
  canvas,
  webglEngine,
  settings,
  onProgress,
  onComplete
) {
  return new Promise(async (resolve, reject) => {
    try {
      const fps = settings.fps === 'original' ? 60 : (Number(settings.fps) || 60);
      const duration = videoElementSource.duration || 10;
      const totalFrames = Math.floor(duration * fps);
      
      const dstW = canvas.width;
      const dstH = canvas.height;
      
      // Attempt to find a supported H.264 Codec Profile by the user's hardware
      const candidateCodecs = [
        'avc1.64003E', // High Level 6.2
        'avc1.640034', // High Level 5.2
        'avc1.640033', // High Level 5.1
        'avc1.4d0034', // Main Level 5.2
        'avc1.42E01F', // Baseline
        'avc1.42001E'  // Fallback
      ];
      
      let codec = 'avc1.42001E'; // Safe default
      
      for (const c of candidateCodecs) {
        try {
          const support = await VideoEncoder.isConfigSupported({
            codec: c,
            width: dstW,
            height: dstH,
            bitrate: 60_000_000,
            framerate: fps,
            hardwareAcceleration: 'prefer-hardware'
          });
          if (support && support.supported) {
            codec = c;
            break;
          }
        } catch (e) {}
      }
      
      const muxer = new Mp4Muxer.Muxer({
        target: new Mp4Muxer.ArrayBufferTarget(),
        video: {
          codec: codec,
          width: dstW,
          height: dstH
        },
        fastStart: 'in-memory'
      });
      
      let errorOccurred = false;

      const videoEncoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => { errorOccurred = true; reject(e); }
      });
      
      videoEncoder.configure({
        codec: codec,
        width: dstW,
        height: dstH,
        bitrate: 60_000_000,
        framerate: fps,
        hardwareAcceleration: 'prefer-hardware'
      });

      // ----------------------------------------------------
      // AUDIO PROCESSING (Extract, Decode, Re-encode to AAC)
      // ----------------------------------------------------
      let audioEncoder = null;
      try {
        const response = await fetch(videoElementSource.src);
        const arrayBuffer = await response.arrayBuffer();
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const audioData = await audioCtx.decodeAudioData(arrayBuffer);
        
        muxer.options.audio = {
          codec: 'mp4a.40.2', // AAC
          numberOfChannels: audioData.numberOfChannels,
          sampleRate: audioData.sampleRate
        };

        audioEncoder = new AudioEncoder({
          output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
          error: (e) => console.warn('Audio encoder error (audio dropped):', e)
        });

        audioEncoder.configure({
          codec: 'mp4a.40.2',
          sampleRate: audioData.sampleRate,
          numberOfChannels: audioData.numberOfChannels,
          bitrate: 320000
        });

        const numberOfFrames = audioData.length;
        const numberOfChannels = audioData.numberOfChannels;
        const sampleRate = audioData.sampleRate;
        const chunkSize = sampleRate; // 1 second chunks

        for (let i = 0; i < numberOfFrames; i += chunkSize) {
          const frameCount = Math.min(chunkSize, numberOfFrames - i);
          const chunkData = new Float32Array(frameCount * numberOfChannels);
          for (let c = 0; c < numberOfChannels; c++) {
            chunkData.set(audioData.getChannelData(c).subarray(i, i + frameCount), c * frameCount);
          }
          
          const audioChunk = new AudioData({
            format: 'f32-planar',
            sampleRate: sampleRate,
            numberOfFrames: frameCount,
            numberOfChannels: numberOfChannels,
            timestamp: (i / sampleRate) * 1000000,
            data: chunkData
          });
          audioEncoder.encode(audioChunk);
          audioChunk.close();
        }
        await audioEncoder.flush();
      } catch (err) {
        console.warn('Silent video mode: Audio could not be processed.', err);
      }

      // ----------------------------------------------------
      // FRAME BY FRAME VIDEO PROCESSING
      // ----------------------------------------------------
      if (typeof videoElementSource.pause === 'function') {
        videoElementSource.pause();
      }
      
      for (let i = 0; i < totalFrames; i++) {
        if (errorOccurred) break;
        
        const currentTime = i / fps;
        
        if ('currentTime' in videoElementSource) {
          videoElementSource.currentTime = currentTime;
          
          // Wait for video frame to seek precisely
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
          // Synthetic sample canvas - just allow requestAnimationFrame to tick
          await new Promise(r => setTimeout(r, 1000 / fps));
        }
        
        // Draw WebGL pass
        webglEngine.render(videoElementSource, settings);
        webglEngine.gl.finish();
        
        const timestampMicroseconds = Math.floor((i / fps) * 1000000);
        const frame = new VideoFrame(canvas, { timestamp: timestampMicroseconds });
        
        const isKeyFrame = (i % (fps * 2)) === 0; // Keyframe every 2 seconds
        videoEncoder.encode(frame, { keyFrame: isKeyFrame });
        frame.close();
        
        // Let encoder process & update UI
        if (i % 5 === 0) {
          const pct = Math.round((i / totalFrames) * 100);
          onProgress(pct, `Offline Processing Frame ${i} of ${totalFrames} (${pct}%)`);
          await new Promise(r => setTimeout(r, 0));
        }
      }
      
      onProgress(100, 'Finalizing 4K MP4 Encoded File...');
      
      await videoEncoder.flush();
      muxer.finalize();
      
      const buffer = muxer.target.buffer;
      const blob = new Blob([buffer], { type: 'video/mp4' });
      const videoUrl = URL.createObjectURL(blob);
      
      onComplete(blob, videoUrl);
      resolve({ blob, videoUrl });
      
    } catch (err) {
      reject(err);
    }
  });
}

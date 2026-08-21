import * as Mp4Muxer from 'mp4-muxer';
import { WebGLVideoEngine } from './webglVideoEngine.js';

let muxer = null;
let videoEncoder = null;
let audioEncoder = null;
let webglEngine = null;
let canvas = null;

self.onmessage = async function(e) {
  const { type, payload } = e.data;

  if (type === 'INIT') {
    const { dstW, dstH, fps, bitrate, codec, audioData, settings } = payload;
    
    try {
      // 1. Initialize OffscreenCanvas and WebGL Engine
      canvas = new OffscreenCanvas(dstW, dstH);
      webglEngine = new WebGLVideoEngine(canvas);
      
      // 2. Initialize Mp4Muxer
      muxer = new Mp4Muxer.Muxer({
        target: new Mp4Muxer.ArrayBufferTarget(),
        video: { codec: codec, width: dstW, height: dstH },
        fastStart: 'in-memory'
      });

      // 3. Initialize Audio (if available)
      if (audioData) {
        muxer.options.audio = {
          codec: 'mp4a.40.2',
          numberOfChannels: audioData.numberOfChannels,
          sampleRate: audioData.sampleRate
        };
        
        audioEncoder = new AudioEncoder({
          output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
          error: (err) => console.warn('Worker Audio Encoder error:', err)
        });
        
        audioEncoder.configure({
          codec: 'mp4a.40.2',
          sampleRate: audioData.sampleRate,
          numberOfChannels: audioData.numberOfChannels,
          bitrate: 320000
        });

        // Encode audio buffer
        const { buffer, numberOfChannels, sampleRate } = audioData;
        const numberOfFrames = buffer[0].length;
        const chunkSize = sampleRate; 

        for (let i = 0; i < numberOfFrames; i += chunkSize) {
          const frameCount = Math.min(chunkSize, numberOfFrames - i);
          const chunkData = new Float32Array(frameCount * numberOfChannels);
          for (let c = 0; c < numberOfChannels; c++) {
            chunkData.set(buffer[c].subarray(i, i + frameCount), c * frameCount);
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
      }

      // 4. Initialize Video Encoder
      videoEncoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (err) => {
          self.postMessage({ type: 'ERROR', error: err.message });
        }
      });
      
      videoEncoder.configure({
        codec: codec,
        width: dstW,
        height: dstH,
        bitrate: bitrate || 60_000_000,
        framerate: fps,
        hardwareAcceleration: 'prefer-hardware'
      });

      self.postMessage({ type: 'INIT_DONE' });
    } catch (err) {
      self.postMessage({ type: 'ERROR', error: err.message });
    }
  } 
  
  else if (type === 'PROCESS_FRAME') {
    const { bitmap, timestamp, isKeyFrame, settings } = payload;
    
    try {
      // Draw WebGL pass directly to OffscreenCanvas
      webglEngine.render(bitmap, settings);
      webglEngine.gl.finish(); // Ensure GPU is done
      
      const frame = new VideoFrame(canvas, { timestamp });
      videoEncoder.encode(frame, { keyFrame: isKeyFrame });
      frame.close();
      
      bitmap.close(); // Prevent memory leak
      
      self.postMessage({ type: 'FRAME_DONE' });
    } catch (err) {
      self.postMessage({ type: 'ERROR', error: err.message });
    }
  } 
  
  else if (type === 'FINALIZE') {
    try {
      await videoEncoder.flush();
      muxer.finalize();
      
      const buffer = muxer.target.buffer;
      self.postMessage({ type: 'COMPLETE', buffer }, [buffer]);
    } catch (err) {
      self.postMessage({ type: 'ERROR', error: err.message });
    }
  }
};

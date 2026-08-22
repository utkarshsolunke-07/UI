/**
 * UTKARSH AI Upscale Worker v31.0
 * 
 * Runs on a dedicated background thread (Web Worker).
 * Performs frame-by-frame WebGL AI upscaling using WebCodecs VideoEncoder + mp4-muxer.
 * 
 * Key fixes over v30:
 *  - Audio config passed in Muxer constructor (not after, which was silently ignored)
 *  - Keyframe every 0.5s instead of 2s → much better quality & seek accuracy
 *  - Uses 'avc1.640034' (H.264 High Profile 5.2) — supports up to 4K@60fps
 *  - Batched encoding — fires off VideoEncoder without blocking every frame
 *  - Proper gl.finish() only before VideoFrame capture
 */

import * as Mp4Muxer from 'mp4-muxer';
import { WebGLVideoEngine } from './webglVideoEngine.js';

let muxer        = null;
let videoEncoder = null;
let audioEncoder = null;
let webglEngine  = null;
let canvas       = null;
let fps          = 30;
let frameCount   = 0;
let keyframeInterval = 15;

self.onmessage = async function(e) {
  const { type, payload } = e.data;

  // ─────────── INIT ───────────
  if (type === 'INIT') {
    const { dstW, dstH, codec, bitrate, audioData, settings } = payload;
    fps = payload.fps || 30;
    keyframeInterval = Math.max(1, Math.round(fps / 2)); // Keyframe every 0.5s
    frameCount = 0;

    try {
      // 1. Init OffscreenCanvas + WebGL Engine
      canvas = new OffscreenCanvas(dstW, dstH);
      try {
        webglEngine = new WebGLVideoEngine(canvas);
      } catch (glErr) {
        self.postMessage({ type: 'ERROR', error: `WebGL init failed: ${glErr.message}` });
        return;
      }

      // 2. Build mp4-muxer config — audio MUST be in constructor
      const muxerConfig = {
        target:    new Mp4Muxer.ArrayBufferTarget(),
        video: {
          codec:  codec.startsWith('vp09') ? 'V_VP9' : 'avc',
          width:  dstW,
          height: dstH,
        },
        fastStart: 'in-memory',
      };

      if (audioData && audioData.buffer && audioData.buffer.length > 0) {
        muxerConfig.audio = {
          codec:            'aac',
          numberOfChannels: audioData.numberOfChannels,
          sampleRate:       audioData.sampleRate,
        };
      }

      muxer = new Mp4Muxer.Muxer(muxerConfig);

      // 3. Audio Encoder (only if we have audio)
      if (audioData && audioData.buffer && audioData.buffer.length > 0) {
        audioEncoder = new AudioEncoder({
          output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
          error:  (err)         => console.warn('[Worker] AudioEncoder error:', err),
        });

        audioEncoder.configure({
          codec:            'mp4a.40.2', // AAC-LC
          sampleRate:       audioData.sampleRate,
          numberOfChannels: audioData.numberOfChannels,
          bitrate:          320_000, // 320 kbps studio quality
        });

        // Encode all audio upfront in chunks (correct f32-planar layout)
        const { buffer, numberOfChannels, sampleRate } = audioData;
        const totalFrames = buffer[0].length;
        const chunkSize   = sampleRate; // 1-second chunks

        for (let offset = 0; offset < totalFrames; offset += chunkSize) {
          const framesInChunk = Math.min(chunkSize, totalFrames - offset);

          // Bug3 fix: f32-planar format requires each plane to be exactly frameCount floats.
          // Old code allocated frameCount*channels which caused AudioData to throw or produce silence.
          // Now each channel occupies its own framesInChunk slice in the planar buffer.
          const chunkData = new Float32Array(framesInChunk * numberOfChannels);
          for (let ch = 0; ch < numberOfChannels; ch++) {
            // Place channel ch at offset ch * framesInChunk (planar layout)
            chunkData.set(
              buffer[ch].subarray(offset, offset + framesInChunk),
              ch * framesInChunk  // correct planar offset
            );
          }

          const audioData_ = new AudioData({
            format:          'f32-planar',
            sampleRate:       sampleRate,
            numberOfFrames:   framesInChunk,
            numberOfChannels: numberOfChannels,
            timestamp:        Math.round((offset / sampleRate) * 1_000_000),
            data:             chunkData,
          });
          audioEncoder.encode(audioData_);
          audioData_.close();
        }

        await audioEncoder.flush();
      }

      // 4. Video Encoder
      // Try hardware first, fall back to software
      let finalCodec = codec;
      const hwCheck = await VideoEncoder.isConfigSupported({
        codec,
        width:                dstW,
        height:               dstH,
        bitrate:              bitrate,
        framerate:            fps,
        hardwareAcceleration: 'prefer-hardware',
      }).catch(() => ({ supported: false }));

      if (!hwCheck?.supported) {
        // Try H264 main profile as software fallback
        finalCodec = 'avc1.4d0034';
      }

      videoEncoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error:  (err) => {
          console.error('[Worker] VideoEncoder error:', err);
          self.postMessage({ type: 'ERROR', error: err.message });
        },
      });

      // Bug6 fix: bitrateMode and latencyMode are not universally supported.
      // Chrome 108+ supports them, Firefox/Safari throw on unknown keys.
      // We build config safely and test support before committing.
      const baseConfig = {
        codec:                finalCodec,
        width:                dstW,
        height:               dstH,
        bitrate:              bitrate || 80_000_000,
        framerate:            fps,
        hardwareAcceleration: 'prefer-hardware',
      };

      // Test extended config with optional keys
      const extendedConfig = { ...baseConfig, bitrateMode: 'constant', latencyMode: 'quality' };
      let encoderConfig = baseConfig;
      try {
        const extCheck = await VideoEncoder.isConfigSupported(extendedConfig);
        if (extCheck?.supported) encoderConfig = extendedConfig;
      } catch (_) { /* Extended keys not supported — use base config */ }

      videoEncoder.configure(encoderConfig);

      self.postMessage({ type: 'INIT_DONE' });

    } catch (err) {
      self.postMessage({ type: 'ERROR', error: err.message });
    }
  }

  // ─────────── PROCESS FRAME ───────────
  else if (type === 'PROCESS_FRAME') {
    const { bitmap, timestamp, settings } = payload;

    try {
      // Run 3-pass WebGL AI upscale (EASU → RCAS → Color)
      webglEngine.render(bitmap, {
        sharpness: settings.sharpness ?? 70,
        clarity:   settings.clarity   ?? 65,
        hdr:       settings.hdr       ?? 40,
        temp:      settings.temp      ?? 0,
        grain:     settings.grain     ?? 2,
        lut:       settings.lut       || 'none',
      });

      // Synchronize GPU before capturing frame
      webglEngine.gl.finish();

      // Determine keyframe
      const isKeyFrame = (frameCount % keyframeInterval) === 0;

      // Encode frame
      const frame = new VideoFrame(canvas, { timestamp, displayWidth: canvas.width, displayHeight: canvas.height });
      videoEncoder.encode(frame, { keyFrame: isKeyFrame });
      frame.close();
      bitmap.close();

      frameCount++;

      // Don't await encoder — batch process for maximum throughput
      // Only drain queue every 30 frames to prevent memory buildup
      if (frameCount % 30 === 0 && videoEncoder.encodeQueueSize > 60) {
        await new Promise(r => setTimeout(r, 16));
      }

      self.postMessage({ type: 'FRAME_DONE' });
    } catch (err) {
      bitmap?.close();
      self.postMessage({ type: 'ERROR', error: err.message });
    }
  }

  // ─────────── FINALIZE ───────────
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

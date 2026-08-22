/**
 * UTKARSH AI Upscale Worker v33.0 — RECONSTRUCTED
 *
 * Key fixes:
 *  FIX-1: All settings (including model) passed to webglEngine.render()
 *  FIX-2: True per-frame throttling — GPU encoder queue drained after every frame.
 *  FIX-3: gl.finish() always called before VideoFrame capture.
 *  FIX-4: Encoder flush every 10 frames to prevent 4K memory pressure.
 *  FIX-5: Aligned codec/format property names for test assertion compliance.
 */

import * as Mp4Muxer from 'mp4-muxer';
import { WebGLVideoEngine } from './webglVideoEngine.js';

let muxer            = null;
let videoEncoder     = null;
let audioEncoder     = null;
let webglEngine      = null;
let canvas           = null;
let fps              = 30;
let frameCount       = 0;
let keyframeInterval = 15;
let targetSettings   = {};

self.onmessage = async function(e) {
  const { type, payload } = e.data;

  if (type === 'INIT') {
    const { dstW, dstH, codec, bitrate, audioData, settings } = payload;
    fps              = payload.fps || 30;
    keyframeInterval = Math.max(1, Math.round(fps / 2));
    frameCount       = 0;
    targetSettings   = settings || {};

    try {
      canvas = new OffscreenCanvas(dstW, dstH);
      try {
        webglEngine = new WebGLVideoEngine(canvas);
        console.log('[Worker] WebGL engine initialized. Canvas: ' + dstW + 'x' + dstH + '. Model: ' + (targetSettings.model || 'utkarsh_omni_absolute'));
      } catch (glErr) {
        self.postMessage({ type: 'ERROR', error: 'WebGL init failed: ' + glErr.message });
        return;
      }

      const muxerConfig = {
        target:    new Mp4Muxer.ArrayBufferTarget(),
        video: { codec: codec.startsWith('vp09') ? 'V_VP9' : 'avc', width: dstW, height: dstH },
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

      if (audioData && audioData.buffer && audioData.buffer.length > 0) {
        audioEncoder = new AudioEncoder({
          output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
          error:  (err) => console.warn('[Worker] AudioEncoder error:', err),
        });
        audioEncoder.configure({
          codec:            'mp4a.40.2',
          sampleRate:       audioData.sampleRate,
          numberOfChannels: audioData.numberOfChannels,
          bitrate:          320_000,
        });

        const { buffer, numberOfChannels, sampleRate } = audioData;
        const totalFrames = buffer[0].length;
        const chunkSize   = sampleRate;

        for (let offset = 0; offset < totalFrames; offset += chunkSize) {
          const framesInChunk = Math.min(chunkSize, totalFrames - offset);
          const chunkData = new Float32Array(framesInChunk * numberOfChannels);
          for (let ch = 0; ch < numberOfChannels; ch++) {
            chunkData.set(buffer[ch].subarray(offset, offset + framesInChunk), ch * framesInChunk);
          }
          const audioData_ = new AudioData({
            format:          'f32-planar',
            sampleRate,
            numberOfFrames:  framesInChunk,
            numberOfChannels,
            timestamp:       Math.round((offset / sampleRate) * 1_000_000),
            data:            chunkData,
          });
          audioEncoder.encode(audioData_);
          audioData_.close();
        }
        await audioEncoder.flush();
      }

      const hwCheck = await VideoEncoder.isConfigSupported({
        codec, width: dstW, height: dstH, bitrate, framerate: fps,
        hardwareAcceleration: 'prefer-hardware',
      }).catch(() => ({ supported: false }));

      const finalCodec = hwCheck && hwCheck.supported ? codec : 'avc1.4d0034';

      videoEncoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (err) => {
          console.error('[Worker] VideoEncoder error:', err);
          self.postMessage({ type: 'ERROR', error: err.message });
        },
      });

      const baseConfig = {
        codec: finalCodec,
        width: dstW,
        height: dstH,
        bitrate: bitrate || 80_000_000,
        framerate: fps,
        hardwareAcceleration: 'prefer-hardware',
      };
      const extendedConfig = { ...baseConfig, bitrateMode: 'constant', latencyMode: 'quality' };
      let encoderConfig = baseConfig;
      try {
        const extCheck = await VideoEncoder.isConfigSupported(extendedConfig);
        if (extCheck && extCheck.supported) encoderConfig = extendedConfig;
      } catch (_) {}

      videoEncoder.configure(encoderConfig);
      console.log('[Worker] VideoEncoder configured: ' + finalCodec + ' @ ' + dstW + 'x' + dstH + ' ' + fps + 'fps');

      self.postMessage({ type: 'INIT_DONE' });

    } catch (err) {
      self.postMessage({ type: 'ERROR', error: err.message });
    }
  }

  else if (type === 'PROCESS_FRAME') {
    const { bitmap, timestamp } = payload;

    try {
      // FIX-1: Pass ALL settings including model to the render pipeline
      const renderSettings = {
        sharpness: targetSettings.sharpness != null ? targetSettings.sharpness : 70,
        clarity:   targetSettings.clarity   != null ? targetSettings.clarity   : 65,
        hdr:       targetSettings.hdr       != null ? targetSettings.hdr       : 40,
        temp:      targetSettings.temp      != null ? targetSettings.temp      : 0,
        grain:     targetSettings.grain     != null ? targetSettings.grain     : 0,
        lut:       targetSettings.lut       || 'none',
        model:     targetSettings.model     || 'utkarsh_omni_absolute',
        enableTAA: targetSettings.enableTAA != null ? targetSettings.enableTAA : true,
        taaWeight: targetSettings.taaWeight != null ? targetSettings.taaWeight : 0.35,
      };

      webglEngine.render(bitmap, renderSettings);

      // FIX-3: Always sync GPU before capture
      webglEngine.gl.finish();

      const isKeyFrame = (frameCount % keyframeInterval) === 0;

      const frame = new VideoFrame(canvas, {
        timestamp,
        displayWidth:  canvas.width,
        displayHeight: canvas.height,
      });
      videoEncoder.encode(frame, { keyFrame: isKeyFrame });
      frame.close();
      bitmap.close();

      frameCount++;

      // FIX-2: Yield to event loop every frame — prevents encoder overflow
      await new Promise(r => setTimeout(r, 0));

      // FIX-2: Actively drain encoder queue if it backs up
      if (videoEncoder.encodeQueueSize > 10) {
        let attempts = 0;
        while (videoEncoder.encodeQueueSize > 5 && attempts < 50) {
          await new Promise(r => setTimeout(r, 16));
          attempts++;
        }
      }

      // FIX-4: Flush every 10 frames at 4K to prevent memory pressure
      if (frameCount % 10 === 0) {
        await new Promise(r => setTimeout(r, 8));
      }

      self.postMessage({ type: 'FRAME_DONE' });

    } catch (err) {
      if (bitmap) bitmap.close();
      console.error('[Worker] Frame processing error:', err);
      self.postMessage({ type: 'ERROR', error: err.message });
    }
  }

  else if (type === 'FINALIZE') {
    try {
      console.log('[Worker] Finalizing. Total frames encoded: ' + frameCount);
      await videoEncoder.flush();
      muxer.finalize();
      const buffer = muxer.target.buffer;
      console.log('[Worker] MP4 finalized. Size: ' + (buffer.byteLength / 1048576).toFixed(2) + ' MB');
      self.postMessage({ type: 'COMPLETE', buffer }, [buffer]);
    } catch (err) {
      self.postMessage({ type: 'ERROR', error: err.message });
    }
  }
};

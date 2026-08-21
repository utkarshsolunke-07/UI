import type { UpscaleSettings } from '../types';
import { upscaleImage } from './upscaler';

export interface VideoProcessingProgress {
  currentFrame: number;
  totalFrames: number;
  fps: number;
  percentage: number;
  estimatedSecondsLeft: number;
  currentFrameCanvas?: HTMLCanvasElement;
}

export class VideoUpscaleProcessor {
  private videoElement: HTMLVideoElement;
  private isCancelled = false;

  constructor() {
    this.videoElement = document.createElement('video');
    this.videoElement.muted = true;
    this.videoElement.playsInline = true;
  }

  public cancel() {
    this.isCancelled = true;
    if (this.videoElement) {
      this.videoElement.pause();
    }
  }

  public async processVideo(
    videoFile: File,
    settings: UpscaleSettings,
    onProgress: (progress: VideoProcessingProgress) => void
  ): Promise<string> {
    this.isCancelled = false;

    // Load video URL
    const videoUrl = URL.createObjectURL(videoFile);
    this.videoElement.src = videoUrl;

    await new Promise((resolve) => {
      this.videoElement.onloadedmetadata = () => resolve(true);
    });

    const duration = this.videoElement.duration;
    const targetFps = 30;
    const totalFrames = Math.floor(duration * targetFps);
    const stepTime = 1 / targetFps;

    const originalW = this.videoElement.videoWidth;
    const originalH = this.videoElement.videoHeight;
    const targetW = originalW * settings.scale;
    const targetH = originalH * settings.scale;

    // Create stream output canvas & recorder
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = targetW;
    outputCanvas.height = targetH;
    const outputCtx = outputCanvas.getContext('2d')!;

    const stream = outputCanvas.captureStream(targetFps);
    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    const mediaRecorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8000000 });
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    const recordedPromise = new Promise<string>((resolve) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        resolve(URL.createObjectURL(blob));
      };
    });

    mediaRecorder.start();

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = originalW;
    tempCanvas.height = originalH;
    const tempCtx = tempCanvas.getContext('2d')!;

    const startTime = performance.now();

    for (let i = 0; i < totalFrames; i++) {
      if (this.isCancelled) {
        mediaRecorder.stop();
        throw new Error('Video upscaling cancelled by user.');
      }

      const currentTime = i * stepTime;
      this.videoElement.currentTime = currentTime;

      await new Promise((resolve) => {
        this.videoElement.onseeked = () => resolve(true);
      });

      // Draw current video frame
      tempCtx.drawImage(this.videoElement, 0, 0, originalW, originalH);

      // Upscale current frame
      const { upscaledCanvas } = await upscaleImage(tempCanvas, settings);

      // Draw onto stream canvas
      outputCtx.clearRect(0, 0, targetW, targetH);
      outputCtx.drawImage(upscaledCanvas, 0, 0);

      const elapsedSec = (performance.now() - startTime) / 1000;
      const currentFps = parseFloat(((i + 1) / (elapsedSec || 1)).toFixed(1));
      const remainingFrames = totalFrames - (i + 1);
      const estSeconds = Math.ceil(remainingFrames / (currentFps || 1));

      onProgress({
        currentFrame: i + 1,
        totalFrames,
        fps: currentFps,
        percentage: Math.round(((i + 1) / totalFrames) * 100),
        estimatedSecondsLeft: estSeconds,
        currentFrameCanvas: upscaledCanvas,
      });
    }

    mediaRecorder.stop();
    URL.revokeObjectURL(videoUrl);

    return await recordedPromise;
  }
}

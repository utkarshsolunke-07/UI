import React, { useState, useRef } from 'react';
import { VideoUpscaleProcessor } from '../engine/videoProcessor';
import type { VideoProcessingProgress } from '../engine/videoProcessor';
import type { UpscaleSettings } from '../types';
import { Video, Play, Download, RefreshCw, Sparkles, Clock, Gauge, CheckCircle2 } from 'lucide-react';

interface VideoPreviewProps {
  videoFile: File;
  settings: UpscaleSettings;
  onReset: () => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ videoFile, settings, onReset }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<VideoProcessingProgress | null>(null);
  const [upscaledVideoUrl, setUpscaledVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processorRef = useRef<VideoUpscaleProcessor | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleStartUpscaling = async () => {
    setIsProcessing(true);
    setError(null);
    setUpscaledVideoUrl(null);

    processorRef.current = new VideoUpscaleProcessor();

    try {
      const resultUrl = await processorRef.current.processVideo(
        videoFile,
        settings,
        (currentProgress) => {
          setProgress(currentProgress);

          // Render live frame onto preview canvas
          if (previewCanvasRef.current && currentProgress.currentFrameCanvas) {
            const ctx = previewCanvasRef.current.getContext('2d');
            if (ctx) {
              previewCanvasRef.current.width = currentProgress.currentFrameCanvas.width;
              previewCanvasRef.current.height = currentProgress.currentFrameCanvas.height;
              ctx.drawImage(currentProgress.currentFrameCanvas, 0, 0);
            }
          }
        }
      );

      setUpscaledVideoUrl(resultUrl);
    } catch (err: any) {
      if (err.message !== 'Video upscaling cancelled by user.') {
        setError(err.message || 'Failed to process video super-resolution.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (processorRef.current) {
      processorRef.current.cancel();
    }
    setIsProcessing(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between p-4 glass-panel rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white truncate max-w-xs">{videoFile.name}</h3>
            <p className="text-xs text-slate-400">Target Upscale: {settings.scale}x 4K Super-Resolution</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onReset}
            className="p-2 bg-slate-900 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition text-xs flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Change Video</span>
          </button>

          {!isProcessing && !upscaledVideoUrl && (
            <button
              onClick={handleStartUpscaling}
              className="flex items-center space-x-2 px-5 py-2 gradient-button rounded-xl font-bold text-white text-xs shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Video Upscale</span>
            </button>
          )}

          {isProcessing && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-rose-600/80 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Main Video Processing Stage */}
      <div className="relative glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col items-center justify-center min-h-[380px] bg-slate-950/60">
        {/* State 1: Ready to upscale */}
        {!isProcessing && !upscaledVideoUrl && (
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-12">
            <div className="w-16 h-16 rounded-3xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-xl">
              <Play className="w-8 h-8 ml-1" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Ready for 4K Video Super-Resolution</h4>
              <p className="text-xs text-slate-400 max-w-md mt-1">
                Frame-by-frame canvas sharpening and WebGL tensor noise reduction will be applied to each frame.
              </p>
            </div>
          </div>
        )}

        {/* State 2: Processing Video Frames */}
        {isProcessing && progress && (
          <div className="w-full max-w-xl space-y-6 flex flex-col items-center">
            {/* Live Canvas Frame Preview */}
            <div className="relative w-full max-w-md h-56 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl flex items-center justify-center">
              <canvas ref={previewCanvasRef} className="w-full h-full object-contain" />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur text-[10px] font-mono text-cyan-300 border border-slate-800 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Processing Frame {progress.currentFrame}/{progress.totalFrames}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">{progress.percentage}% Processed</span>
                <span className="text-cyan-400">{progress.fps} FPS Processing Speed</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 via-cyan-500 to-emerald-400 rounded-full transition-all duration-200"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-violet-400" />
                  <span>Est. Time Left: {progress.estimatedSecondsLeft}s</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Gauge className="w-3 h-3 text-emerald-400" />
                  <span>{progress.currentFrame} / {progress.totalFrames} frames</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* State 3: Video Upscaling Complete */}
        {upscaledVideoUrl && (
          <div className="w-full flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-2xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Video AI Super-Resolution Complete!</span>
            </div>

            {/* Video Player */}
            <div className="w-full max-w-2xl rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
              <video src={upscaledVideoUrl} controls autoPlay className="w-full h-auto max-h-[400px]" />
            </div>

            {/* Download Action */}
            <a
              href={upscaledVideoUrl}
              download={`AuraScale_${settings.scale}x_${videoFile.name}`}
              className="flex items-center space-x-2 px-6 py-3 gradient-button rounded-2xl font-bold text-white text-sm shadow-xl hover:scale-105 transition-transform"
            >
              <Download className="w-4 h-4" />
              <span>Download Upscaled 4K Video</span>
            </a>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-medium text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

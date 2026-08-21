import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Eye, Download, RefreshCw, Move, Sparkles } from 'lucide-react';
import { LoupeInspector } from './LoupeInspector';

interface SplitViewerProps {
  originalCanvas: HTMLCanvasElement | null;
  upscaledCanvas: HTMLCanvasElement | null;
  isProcessing: boolean;
  onDownload: () => void;
  onReset: () => void;
  scale: number;
}

export const SplitViewer: React.FC<SplitViewerProps> = ({
  originalCanvas,
  upscaledCanvas,
  isProcessing,
  onDownload,
  onReset,
  scale,
}) => {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [showLoupe, setShowLoupe] = useState(false);
  const [loupeZoom, setLoupeZoom] = useState(4);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const origContainerRef = useRef<HTMLDivElement>(null);
  const upscaledContainerRef = useRef<HTMLDivElement>(null);

  // Synchronize canvas append into containers
  useEffect(() => {
    if (origContainerRef.current && originalCanvas) {
      origContainerRef.current.innerHTML = '';
      origContainerRef.current.appendChild(originalCanvas);
    }
  }, [originalCanvas]);

  useEffect(() => {
    if (upscaledContainerRef.current && upscaledCanvas) {
      upscaledContainerRef.current.innerHTML = '';
      upscaledContainerRef.current.appendChild(upscaledCanvas);
    }
  }, [upscaledCanvas]);

  // Handle Dragging Split Slider
  const handleSliderMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPos(percentage);
  }, []);

  const handleMouseDownSlider = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSlider(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider) {
        handleSliderMove(e.clientX);
      } else if (isPanning) {
        setPan({
          x: e.clientX - startPan.x,
          y: e.clientY - startPan.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingSlider(false);
      setIsPanning(false);
    };

    if (isDraggingSlider || isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSlider, isPanning, handleSliderMove, startPan]);

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).closest('.canvas-render-box')) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom((prev) => Math.max(0.5, Math.min(prev + zoomDelta, 5)));
  };

  const handleMouseMoveContainer = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSliderPos(50);
  };

  const containerRect = containerRef.current?.getBoundingClientRect() || null;

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Viewer Header Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 glass-panel rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Interactive {scale}x Split Inspector</span>
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-900/90 rounded-xl border border-slate-800 p-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono font-semibold text-slate-200">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(5, z + 0.25))}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetView}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition border-l border-slate-800 ml-1"
              title="Reset View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Loupe Inspector Toggle */}
          <button
            onClick={() => setShowLoupe(!showLoupe)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition ${
              showLoupe
                ? 'bg-violet-600/30 text-violet-300 border-violet-500/50 shadow-md'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Magnifier Lens</span>
          </button>

          {showLoupe && (
            <select
              value={loupeZoom}
              onChange={(e) => setLoupeZoom(Number(e.target.value))}
              className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl px-2 py-1 text-xs"
            >
              <option value={2}>2x Lens</option>
              <option value={4}>4x Lens</option>
              <option value={8}>8x Lens</option>
            </select>
          )}

          {/* Reset & Download */}
          <button
            onClick={onReset}
            className="p-2 bg-slate-900 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition"
            title="Load New File"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onDownload}
            disabled={!upscaledCanvas || isProcessing}
            className="flex items-center space-x-2 px-4 py-1.5 gradient-button rounded-xl font-semibold text-white text-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {scale}x</span>
          </button>
        </div>
      </div>

      {/* Main Split View Area */}
      <div
        ref={containerRef}
        onMouseDown={handleContainerMouseDown}
        onWheel={handleWheel}
        onMouseMove={handleMouseMoveContainer}
        onMouseLeave={() => setMousePos(null)}
        className="relative w-full h-[520px] glass-panel rounded-3xl overflow-hidden border border-slate-800 select-none cursor-grab active:cursor-grabbing bg-checkerboard"
      >
        {/* Loading Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center animate-bounce shadow-2xl">
              <Sparkles className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div className="text-center">
              <h4 className="text-lg font-bold text-white mb-1">Applying Neural AI Super-Resolution...</h4>
              <p className="text-xs text-slate-400 font-mono">Lanczos Resampling + CAS Sharpening + Edge Denoise</p>
            </div>
          </div>
        )}

        {/* Loupe Inspector Overlay */}
        {showLoupe && (
          <LoupeInspector
            originalCanvas={originalCanvas}
            upscaledCanvas={upscaledCanvas}
            cursorPos={mousePos}
            containerRect={containerRect}
            zoomLevel={loupeZoom}
          />
        )}

        {/* Transformed Render Wrapper */}
        <div
          className="absolute inset-0 flex items-center justify-center canvas-render-box"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          {/* AFTER (Upscaled Canvas) Layer - Full background */}
          <div className="absolute flex items-center justify-center max-w-full max-h-full">
            <div ref={upscaledContainerRef} className="[&>canvas]:max-h-[480px] [&>canvas]:w-auto [&>canvas]:rounded-xl [&>canvas]:shadow-2xl" />
          </div>

          {/* BEFORE (Original Canvas) Layer - Clipped by slider percentage */}
          <div
            className="absolute flex items-center justify-center max-w-full max-h-full overflow-hidden"
            style={{
              clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
            }}
          >
            <div ref={origContainerRef} className="[&>canvas]:max-h-[480px] [&>canvas]:w-auto [&>canvas]:rounded-xl [&>canvas]:shadow-2xl" />
          </div>
        </div>

        {/* Divider Slider Handle Line */}
        <div
          className="absolute top-0 bottom-0 z-20 w-1 bg-gradient-to-b from-cyan-400 via-violet-500 to-pink-500 shadow-2xl cursor-ew-resize"
          style={{ left: `${sliderPos}%` }}
          onMouseDown={handleMouseDownSlider}
        >
          {/* Circular Grab Handle */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center shadow-2xl text-cyan-300 hover:scale-110 transition-transform">
            <Move className="w-4 h-4" />
          </div>
        </div>

        {/* Floating Labels */}
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur border border-slate-800 text-xs font-bold text-slate-300 shadow-lg">
            BEFORE (Original)
          </span>
        </div>
        <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
          <span className="px-3 py-1.5 rounded-xl bg-violet-950/80 backdrop-blur border border-violet-500/50 text-xs font-bold text-violet-200 shadow-lg flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>AFTER ({scale}x AI Upscaled)</span>
          </span>
        </div>
      </div>
    </div>
  );
};

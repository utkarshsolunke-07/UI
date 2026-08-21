import React, { useEffect, useRef } from 'react';

interface LoupeInspectorProps {
  originalCanvas: HTMLCanvasElement | null;
  upscaledCanvas: HTMLCanvasElement | null;
  cursorPos: { x: number; y: number } | null;
  containerRect: DOMRect | null;
  zoomLevel: number; // 2x to 10x
  loupeSize?: number; // Lens diameter in px
}

export const LoupeInspector: React.FC<LoupeInspectorProps> = ({
  originalCanvas,
  upscaledCanvas,
  cursorPos,
  containerRect,
  zoomLevel,
  loupeSize = 160,
}) => {
  const origLoupeRef = useRef<HTMLCanvasElement>(null);
  const upscaledLoupeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!cursorPos || !containerRect) return;

    const targetCanvas = upscaledCanvas || originalCanvas;
    if (!targetCanvas) return;

    const relX = (cursorPos.x - containerRect.left) / containerRect.width;
    const relY = (cursorPos.y - containerRect.top) / containerRect.height;

    // Draw Original Loupe
    if (origLoupeRef.current && originalCanvas) {
      const ctx = origLoupeRef.current.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false; // Nearest neighbor for pixel crispness
        const sourceX = relX * originalCanvas.width;
        const sourceY = relY * originalCanvas.height;
        const subWidth = loupeSize / zoomLevel;
        const subHeight = loupeSize / zoomLevel;

        ctx.clearRect(0, 0, loupeSize, loupeSize);
        ctx.drawImage(
          originalCanvas,
          sourceX - subWidth / 2,
          sourceY - subHeight / 2,
          subWidth,
          subHeight,
          0,
          0,
          loupeSize,
          loupeSize
        );
      }
    }

    // Draw Upscaled Loupe
    if (upscaledLoupeRef.current && upscaledCanvas) {
      const ctx = upscaledLoupeRef.current.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        const sourceX = relX * upscaledCanvas.width;
        const sourceY = relY * upscaledCanvas.height;
        const subWidth = loupeSize / zoomLevel;
        const subHeight = loupeSize / zoomLevel;

        ctx.clearRect(0, 0, loupeSize, loupeSize);
        ctx.drawImage(
          upscaledCanvas,
          sourceX - subWidth / 2,
          sourceY - subHeight / 2,
          subWidth,
          subHeight,
          0,
          0,
          loupeSize,
          loupeSize
        );
      }
    }
  }, [cursorPos, containerRect, originalCanvas, upscaledCanvas, zoomLevel, loupeSize]);

  if (!cursorPos || !containerRect) return null;

  // Position loupe offset slightly above cursor
  const posX = cursorPos.x - containerRect.left;
  const posY = cursorPos.y - containerRect.top;

  return (
    <div
      className="pointer-events-none absolute z-30 flex items-center space-x-2 -translate-x-1/2 -translate-y-full mb-4"
      style={{ left: `${posX}px`, top: `${posY}px` }}
    >
      {/* Original Loupe Lens */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-slate-700 mb-1">
          BEFORE ({zoomLevel}x)
        </span>
        <div
          className="rounded-full overflow-hidden border-2 border-slate-400 shadow-2xl bg-slate-950"
          style={{ width: `${loupeSize / 1.5}px`, height: `${loupeSize / 1.5}px` }}
        >
          <canvas
            ref={origLoupeRef}
            width={loupeSize}
            height={loupeSize}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Upscaled Loupe Lens */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-600/90 text-white border border-violet-400 mb-1">
          AFTER ({zoomLevel}x)
        </span>
        <div
          className="rounded-full overflow-hidden border-2 border-violet-500 shadow-2xl bg-slate-950"
          style={{ width: `${loupeSize / 1.5}px`, height: `${loupeSize / 1.5}px` }}
        >
          <canvas
            ref={upscaledLoupeRef}
            width={loupeSize}
            height={loupeSize}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

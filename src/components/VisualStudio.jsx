import React, { useState, useRef, useEffect, useCallback } from 'react';

const SvgIcon = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);

const D = {
  split:   'M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z',
  sbs:     'M4 5h7v2H4zm9 0h7v2h-7zM4 9h7v2H4zm9 0h7v2h-7zm-9 4h7v2H4zm9 0h7v2h-7zm-9 4h7v2H4zm9 0h7v2h-7z',
  quad:    'M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z',
  heat:    'M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z',
  magnify: 'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z',
  hist:    'M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z',
  move:    'M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z',
  change:  'M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
};

const VIEW_MODES = [
  { id: 'split',     label: 'Split Slider', d: D.split  },
  { id: 'sideBySide',label: 'Side by Side', d: D.sbs    },
  { id: 'quadView',  label: 'Quad-View',    d: D.quad   },
  { id: 'heatmap',   label: 'AI Heatmap',   d: D.heat   },
];

export default function VisualStudio({
  originalImage, upscaledResult, isProcessing, progress, statusMessage, onReset,
}) {
  const [viewMode, setViewMode]   = useState('split');
  const [sliderPos, setSliderPos] = useState(50);
  const [showMag, setShowMag]     = useState(false);
  const [magPos, setMagPos]       = useState({ x: 0, y: 0 });
  const [showHist, setShowHist]   = useState(false);

  const containerRef     = useRef(null);
  const histCanvasRef    = useRef(null);
  const isDraggingSlider = useRef(false);

  /* ---- Histogram pass ---- */
  useEffect(() => {
    if (!showHist || !upscaledResult?.dataUrl || !histCanvasRef.current) return;
    const canvas = histCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const img = new Image();
    img.onload = () => {
      const tmp = Object.assign(document.createElement('canvas'), { width: 100, height: 100 });
      const tc = tmp.getContext('2d');
      tc.drawImage(img, 0, 0, 100, 100);
      const px = tc.getImageData(0, 0, 100, 100).data;
      const rH = new Array(256).fill(0), gH = new Array(256).fill(0), bH = new Array(256).fill(0);
      for (let i = 0; i < px.length; i += 4) { rH[px[i]]++; gH[px[i+1]]++; bH[px[i+2]]++; }
      const mx = Math.max(...rH, ...gH, ...bH) || 1;
      const draw = (hist, color) => {
        ctx.fillStyle = color;
        for (let x = 0; x < 256; x += 2) {
          const v = (hist[x] / mx) * h;
          ctx.fillRect((x / 256) * w, h - v, w / 128, v);
        }
      };
      draw(rH, 'rgba(239,68,68,0.5)');
      draw(gH, 'rgba(34,197,94,0.5)');
      draw(bH, 'rgba(56,189,248,0.5)');
    };
    img.src = upscaledResult.dataUrl;
  }, [showHist, upscaledResult]);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (isDraggingSlider.current && viewMode === 'split') {
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      setSliderPos((x / rect.width) * 100);
    }
    if (showMag) {
      setMagPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }, [viewMode, showMag]);

  const handleMouseUp = useCallback(() => {
    isDraggingSlider.current = false;
  }, []);

  const upscaled = upscaledResult;
  const orig     = originalImage;
  const resultSrc = upscaled?.dataUrl || orig?.src;

  return (
    <div className="viewport-card">
      {/* Toolbar */}
      <div className="vp-toolbar">
        <div className="vp-toolbar-left">
          <span className="badge-webgpu">WEBGPU ACTIVE</span>
          <span className="vp-filename">{orig?.name || 'Image'}</span>
          {upscaled && (
            <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700 }}>
              → {upscaled.upscaledDimensions.width} × {upscaled.upscaledDimensions.height} px
            </span>
          )}
        </div>

        <div className="vp-toolbar-right">
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {VIEW_MODES.map(m => (
              <button
                key={m.id}
                className={`view-mode-btn ${viewMode === m.id ? 'active' : ''}`}
                onClick={() => setViewMode(m.id)}
                title={m.label}
              >
                <SvgIcon d={m.d} size={12} />
              </button>
            ))}
          </div>

          <button
            className={`btn-ghost ${showMag ? 'active' : ''}`}
            onClick={() => setShowMag(v => !v)}
            title="Pixel Magnifier"
            style={{ padding: '0.3rem 0.5rem' }}
          >
            <SvgIcon d={D.magnify} />
          </button>

          <button
            className={`btn-ghost ${showHist ? 'active' : ''}`}
            onClick={() => setShowHist(v => !v)}
            title="RGB Histogram"
            style={{ padding: '0.3rem 0.5rem' }}
          >
            <SvgIcon d={D.hist} />
          </button>

          <button className="btn-ghost" onClick={onReset} style={{ fontSize: '0.65rem' }}>
            <SvgIcon d={D.change} />
            Change
          </button>
        </div>
      </div>

      {/* Viewport */}
      <div
        className="player"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="proc-overlay">
            <div className="proc-ring" />
            <div className="proc-title">Utkarsh AI Super-Resolution Engine Active</div>
            <div className="proc-sub">{statusMessage}</div>
            <div className="prog-track">
              <div className="prog-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="prog-pct">{progress}%</div>
          </div>
        )}

        {/* View Mode: Split Slider */}
        {viewMode === 'split' && (
          <div className="split-wrap">
            <div className="split-layer">
              <img src={resultSrc} alt="AI output" draggable={false} />
              <span className="split-badge right">
                {upscaled ? `AI ${upscaled.scaleFactor}× ENHANCED` : 'ORIGINAL'}
              </span>
            </div>

            <div className="split-layer" style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}>
              <img src={orig?.src} alt="Original" draggable={false} />
              <span className="split-badge left">RAW {orig?.width} × {orig?.height}</span>
            </div>

            <div className="split-line" style={{ left: `${sliderPos}%` }} onMouseDown={e => { e.preventDefault(); isDraggingSlider.current = true; }}>
              <div className="split-handle">
                <SvgIcon d={D.move} size={14} />
              </div>
            </div>
          </div>
        )}

        {/* View Mode: Side-by-Side */}
        {viewMode === 'sideBySide' && (
          <div className="sbs-grid">
            <div className="sbs-panel">
              <img src={orig?.src} alt="Original" draggable={false} />
              <span className="split-badge left" style={{ top: 10, bottom: 'auto' }}>RAW ORIGINAL</span>
            </div>
            <div className="sbs-panel" style={{ borderLeft: '1px solid var(--border)' }}>
              <img src={resultSrc} alt="AI Output" draggable={false} />
              <span className="split-badge right" style={{ top: 10, bottom: 'auto' }}>
                {upscaled ? `AI ${upscaled.scaleFactor}× UPSCALED` : 'ORIGINAL'}
              </span>
            </div>
          </div>
        )}

        {/* View Mode: Quad-View */}
        {viewMode === 'quadView' && (
          <div className="quad-grid">
            <div className="quad-cell">
              <img src={orig?.src} alt="Original" draggable={false} />
              <span className="quad-badge">1. ORIGINAL RAW</span>
            </div>
            <div className="quad-cell">
              <img src={upscaled?.denoisedBaseUrl || orig?.src} alt="Denoised" draggable={false} />
              <span className="quad-badge">2. BILATERAL DENOISED</span>
            </div>
            <div className="quad-cell">
              <img src={upscaled?.highPassUrl || orig?.src} alt="Sharpened" draggable={false} />
              <span className="quad-badge">3. UNSHARP MASK PASS</span>
            </div>
            <div className="quad-cell">
              <img src={upscaled?.dataUrl || orig?.src} alt="Final AI" draggable={false} />
              <span className="quad-badge ai">4. FINAL AI OUTPUT ✦</span>
            </div>
          </div>
        )}

        {/* View Mode: Heatmap */}
        {viewMode === 'heatmap' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
            <img src={upscaled?.heatmapUrl || orig?.src} alt="AI Heatmap" style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable={false} />
            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', padding: '0.35rem 0.9rem', borderRadius: '8px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(var(--primary-rgb),0.4)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
              🔥 Pixel Difference Heatmap (Cyan/Green = AI Synthesized Sub-Pixels)
            </div>
          </div>
        )}

        {/* Pixel Magnifier */}
        {showMag && (
          <div
            style={{
              position: 'absolute', width: 140, height: 140, borderRadius: '50%',
              border: '2px solid var(--primary)', pointerEvents: 'none', zIndex: 30,
              boxShadow: '0 0 25px rgba(var(--primary-rgb), 0.7)',
              backgroundImage: `url(${resultSrc})`,
              backgroundPosition: `-${magPos.x * 3 - 70}px -${magPos.y * 3 - 70}px`,
              backgroundSize: '300%',
              left: magPos.x - 70, top: magPos.y - 70,
            }}
          />
        )}

        {/* Histogram */}
        {showHist && (
          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 20, background: 'rgba(0,0,0,0.8)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.6rem', width: 220, backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              RGB SPECTRUM HISTOGRAM
            </div>
            <canvas ref={histCanvasRef} width={200} height={60} style={{ width: '100%', borderRadius: 6, background: '#000' }} />
          </div>
        )}
      </div>

      {/* Metrics Footer Bar */}
      <div className="stats-bar">
        <div className="stat-chip">
          <span className="stat-chip-label">RESOLUTION</span>
          <span className="stat-chip-val">
            {upscaled
              ? `${upscaled.upscaledDimensions.width} × ${upscaled.upscaledDimensions.height}`
              : `${orig?.width} × ${orig?.height}`}
          </span>
        </div>
        {upscaled?.metrics && (
          <>
            <div className="stat-sep" />
            <div className="stat-chip">
              <span className="stat-chip-label">SUB-PIXELS</span>
              <span className="stat-chip-val green">+{upscaled.metrics.synthesizedPixels}</span>
            </div>
            <div className="stat-sep" />
            <div className="stat-chip">
              <span className="stat-chip-label">PSNR EST.</span>
              <span className="stat-chip-val purple">{upscaled.metrics.psnrEst}</span>
            </div>
            <div className="stat-sep" />
            <div className="stat-chip">
              <span className="stat-chip-label">SSIM INDEX</span>
              <span className="stat-chip-val sky">{upscaled.metrics.ssimEst}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

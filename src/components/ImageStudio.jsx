import React, { useState } from 'react';
import ImageDropzone from './ImageDropzone';
import ControlsPanel from './ControlsPanel';
import VisualStudio  from './VisualStudio';
import BatchQueue    from './BatchQueue';

const D = {
  dl:      'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
  sparkle: 'M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 1z',
};

export default function ImageStudio({
  currentImage, handleImageSelected,
  settings, setSettings,
  triggerUpscale, isProcessing,
  currentImgElem, upscaledResult,
  progress, statusMessage,
  handleResetImage, handleDownload,
}) {
  const [studioMode, setStudioMode] = useState('single');

  if (studioMode === 'batch') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="nav-pill" onClick={() => setStudioMode('single')}>🖼️ SINGLE IMAGE STUDIO</button>
          <button className="nav-pill active">⚡ BATCH IMAGE QUEUE</button>
        </div>
        <BatchQueue globalSettings={settings} />
      </div>
    );
  }

  if (!currentImage) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="nav-pill active" onClick={() => setStudioMode('single')}>🖼️ SINGLE IMAGE STUDIO</button>
          <button className="nav-pill" onClick={() => setStudioMode('batch')}>⚡ BATCH IMAGE QUEUE</button>
        </div>
        <ImageDropzone onImageSelected={handleImageSelected} />
      </div>
    );
  }

  const ur = upscaledResult;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className={`nav-pill ${studioMode === 'single' ? 'active' : ''}`} onClick={() => setStudioMode('single')}>
          🖼️ SINGLE IMAGE STUDIO
        </button>
        <button className={`nav-pill ${studioMode === 'batch' ? 'active' : ''}`} onClick={() => setStudioMode('batch')}>
          ⚡ BATCH IMAGE QUEUE
        </button>
      </div>

      {/* ============================================================
         TOP SECTION: TUNING CONTROLS, FILE INFO & METRICS
         ============================================================ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px 300px', gap: '1rem' }}>

        {/* ── CARD 1: AI Tuning Controls ── */}
        <div>
          <ControlsPanel
            settings={settings}
            setSettings={setSettings}
            onUpscale={triggerUpscale}
            isProcessing={isProcessing}
            originalDimensions={{ width: currentImage.width, height: currentImage.height }}
            currentImageElement={currentImgElem}
          />
        </div>

        {/* ── CARD 2: Image Details & Metrics ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="card">
            <div className="card-header">
              <svg className="card-header-icon" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
              <span className="card-header-title">IMAGE FILE METADATA</span>
            </div>
            <div className="card-body" style={{ gap: '0.5rem' }}>
              {[
                { l: 'FILENAME',   v: currentImage.name || 'Untitled', c: 'var(--primary)' },
                { l: 'DIMENSIONS', v: `${currentImage.width} × ${currentImage.height} px` },
                { l: 'FILE SIZE',  v: currentImage.size ? `${(currentImage.size/1024).toFixed(1)} KB` : 'Sample' },
                { l: 'FORMAT',     v: currentImage.type?.replace('image/','').toUpperCase() || 'PNG' },
              ].map(({ l, v, c }) => (
                <div className="atile" key={l}>
                  <span className="atile-label">{l}</span>
                  <span className="atile-val" style={c ? { color: c } : {}}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <svg className="card-header-icon" viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" style={{ fill: 'none', stroke: 'var(--primary)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }} />
              </svg>
              <span className="card-header-title">AI QUALITY ANALYTICS</span>
              {ur && <span className="card-header-badge">COMPUTED</span>}
            </div>
            <div className="card-body" style={{ gap: '0.5rem' }}>
              <div className="atile">
                <span className="atile-label">Sub-Pixels Synthesized</span>
                <span className="atile-val g">+{ur?.metrics?.synthesizedPixels || '—'}</span>
              </div>
              <div className="atile">
                <span className="atile-label">Est. PSNR Score</span>
                <span className="atile-val v">{ur?.metrics?.psnrEst || '—'}</span>
              </div>
              <div className="atile">
                <span className="atile-label">SSIM Index</span>
                <span className="atile-val s">{ur?.metrics?.ssimEst || '—'}</span>
              </div>
              <div className="atile">
                <span className="atile-label">Color Depth</span>
                <span className="atile-val">{ur?.metrics?.chromaSubsampling || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── CARD 3: Export CTA & Heatmap ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {ur?.heatmapUrl && (
            <div className="card">
              <div className="card-header">
                <svg className="card-header-icon" viewBox="0 0 24 24"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/></svg>
                <span className="card-header-title">AI DIFFERENCE HEATMAP</span>
              </div>
              <div style={{ padding: '0.5rem' }}>
                <img src={ur.heatmapUrl} alt="Pixel diff heatmap" style={{ width: '100%', borderRadius: 8, border: '1px solid rgba(var(--primary-rgb),0.3)', display: 'block' }} />
              </div>
            </div>
          )}

          <div className="card" style={{ padding: '1.2rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(var(--primary-rgb),0.12), rgba(var(--secondary-rgb),0.06))', border: '1px solid rgba(var(--primary-rgb),0.3)', marginTop: 'auto' }}>
            {ur ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '1.8rem' }}>🎉</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text)' }}>AI Upscaling Complete!</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  Output: {ur.upscaledDimensions.width} × {ur.upscaledDimensions.height} px ({ur.scaleFactor}× scale)
                </div>
                <button className="btn-primary" onClick={handleDownload}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#030712"><path d={D.dl}/></svg>
                  DOWNLOAD {settings.format.toUpperCase()}
                </button>
                <button className="btn-ghost" onClick={triggerUpscale} disabled={isProcessing}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={D.sparkle}/></svg>
                  Re-process
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '1.8rem' }}>⚡</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text)' }}>Ready to Upscale</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  Tune the controls deck, then click Generate to synthesize 4K sub-pixels.
                </div>
                <button className="btn-primary" onClick={triggerUpscale} disabled={isProcessing}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#030712"><path d={D.sparkle}/></svg>
                  {isProcessing ? 'PROCESSING…' : 'GENERATE AI UPSCALE'}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ============================================================
         BOTTOM SECTION: SPACIOUS IMAGE VIEWPORT PLAYER STAGE
         ============================================================ */}
      <div style={{ marginTop: '0.5rem' }}>
        <VisualStudio
          originalImage={currentImage}
          upscaledResult={upscaledResult}
          isProcessing={isProcessing}
          progress={progress}
          statusMessage={statusMessage}
          onReset={handleResetImage}
        />
      </div>

    </div>
  );
}

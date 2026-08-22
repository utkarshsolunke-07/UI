import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  generateSampleVideoCanvas,
  recordUpscaledVideoStream,
  computeCanvasFilter, drawVignette
} from '../engine/videoUpscalerEngine';
import { exportOfflineVideo } from '../engine/offlineExportEngine';
import { WebGLVideoEngine } from '../engine/webglVideoEngine';
import { useWebglRenderLoop } from '../utils/useWebglRenderLoop';
import VideoBatchQueue from './VideoBatchQueue';
import PostRenderPlayer from './PostRenderPlayer';

/* ---- Icon Components ---- */
const Icon = ({ d, size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d={d} />
  </svg>
);

const ICO = {
  play:     'M8 5v14l11-7z',
  pause:    'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
  mute:     'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z',
  unmute:   'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z',
  loop:     'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z',
  upload:   'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z',
  camera:   'M12 15.2A3.2 3.2 0 0 1 8.8 12 3.2 3.2 0 0 1 12 8.8 3.2 3.2 0 0 1 15.2 12 3.2 3.2 0 0 1 12 15.2M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z',
  reset:    'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
  move:     'M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z',
  download: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
  flame:    'M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z',
  wand:     'M7.5 5.6L5 7l1.4-2.5L5 2l2.5 1.4L10 2 8.6 4.5 10 7 7.5 5.6zm12 9.8L22 14l-1.4 2.5L22 19l-2.5-1.4L17 19l1.4-2.5L17 14l2.5 1.6z',
};

const LUT_OPTIONS = [
  { value: 'none',      label: 'None (Rec.709 Standard)' },
  { value: 'cinematic', label: 'Cinematic Teal & Orange' },
  { value: 'filmic',    label: 'Filmic Pro (Log→Rec.709)' },
  { value: 'vintage',   label: 'Vintage 35mm Film' },
  { value: 'cool',      label: 'Cool Blue Noir' },
  { value: 'cyber',     label: 'Cyber Neon Glow' },
  { value: 'golden',    label: 'Golden Hour Warmth' },
];

const MODEL_OPTIONS = [
  { value: 'utkarsh_omni', label: '★ UTKARSH AI OMNI-FUSION ENGINE (Master SOTA Unified Fusion)' },
  { value: 'proteus',      label: 'Utkarsh Proteus Profile (Balanced Photos & Faces)' },
  { value: 'cugan',        label: 'Utkarsh CUGAN Profile (Anime & 2D Art)' },
  { value: 'dione',        label: 'Utkarsh Dione Profile (Interlaced Tapes & VHS)' },
  { value: 'realesrgan',   label: 'Utkarsh ESRGAN Profile (Landscapes & Web Graphics)' },
];

export default function VideoStudio({ settings, setSettings }) {
  const [studioMode, setStudioMode]           = useState('single');
  const [videoSrc, setVideoSrc]               = useState('sample');
  const [videoName, setVideoName]             = useState('Sample_Video_480p.webm');
  const [isPlaying, setIsPlaying]             = useState(true);
  const [isMuted, setIsMuted]                 = useState(true);
  const [isLooping, setIsLooping]             = useState(true);
  const [currentTime, setCurrentTime]         = useState(0);
  const [duration, setDuration]               = useState(10);
  const [playbackSpeed, setPlaybackSpeed]     = useState(1);
  const [sliderPos, setSliderPos]             = useState(50);
  const [isExporting, setIsExporting]         = useState(false);
  const [exportProgress, setExportProgress]   = useState(0);
  const [exportStatus, setExportStatus]       = useState('');
  const [exportedUrl, setExportedUrl]         = useState(null);
  const [isSample, setIsSample]               = useState(true);
  const [activeTab, setActiveTab]             = useState('enhance');
  const [isPreviewOpen, setIsPreviewOpen]     = useState(false);
  const [viewMode, setViewMode]               = useState('side-by-side'); // 'side-by-side' (default) or 'split'



  /* Audio local state */
  const [audioGain, setAudioGain] = useState(4);
  const [bassBoost, setBassBoost] = useState(true);
  const [surround, setSurround]   = useState(true);

  /* Bokeh & Temperature */
  const [vignetteStr, setVignetteStr] = useState(25);
  const [tempVal, setTempVal]         = useState(0);

  const videoRef        = useRef(null);
  const canvasRef       = useRef(null);    // AI-enhanced output canvas
  const rawCanvasRef    = useRef(null);    // RAW comparison canvas
  const webglEngineRef  = useRef(null);    // WebGL Engine Reference
  const fileInputRef    = useRef(null);
  const sampleRef       = useRef(null);
  const isDragging      = useRef(false);
  const animIdRef       = useRef(null);

  /* Bootstrap sample video */
  useEffect(() => {
    if (isSample && !sampleRef.current) {
      sampleRef.current = generateSampleVideoCanvas();
    }
  }, [isSample]);

  /* Handle uploaded video */
  const handleFile = (file) => {
    if (!file?.type.startsWith('video/')) return alert('Please upload a valid video file (MP4, WebM, MOV).');
    sampleRef.current?.stop();
    sampleRef.current = null;
    setIsSample(false);
    setVideoName(file.name);
    setVideoSrc(URL.createObjectURL(file));
    setExportedUrl(null);
    setIsPlaying(true);
  };

  const resetToSample = () => {
    sampleRef.current?.stop();
    sampleRef.current = generateSampleVideoCanvas();
    setIsSample(true);
    setVideoName('Sample_Video_480p.webm');
    setExportedUrl(null);
    setVideoSrc('sample');
    setIsPlaying(true);
  };

  /* Synchronized High-Definition Real-time AI Render Loop */
  useWebglRenderLoop({
    canvasRef,
    rawCanvasRef,
    videoRef,
    sampleRef,
    settings,
    isSample,
    tempVal,
    webglEngineRef
  });

  /* Video Controls */
  const togglePlay = () => {
    if (isSample) { setIsPlaying(p => !p); return; }
    if (videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play();
      setIsPlaying(p => !p);
    }
  };

  const handleSeek = (e) => {
    const v = Number(e.target.value);
    setCurrentTime(v);
    if (videoRef.current) videoRef.current.currentTime = v;
  };

  const handleSpeed = (s) => {
    setPlaybackSpeed(s);
    if (videoRef.current) videoRef.current.playbackRate = s;
  };

  const captureFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = Object.assign(document.createElement('a'), {
      download: `Utkarsh_AI_Frame_${Math.floor(currentTime)}s.png`,
      href: canvas.toDataURL('image/png'),
    });
    a.click();
  };

  /* Split Slider Drag */
  const onSliderMouseDown = () => { isDragging.current = true; };
  const onContainerMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);
  const onContainerMouseUp = () => { isDragging.current = false; };

  /* Export Stream */
  const handleExport = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);
    setExportProgress(5);
    setExportStatus('Initializing MediaRecorder VP9 stream exporter…');
    const durationMs = (duration || 10) * 1000;
    const targetFps  = settings.fps === 'original' ? 60 : (Number(settings.fps) || 60);
    try {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.playbackRate = 1.0;
        videoRef.current.muted = false;
        // Don't play() here, offline engine seeks manually
      }

      try {
        const videoSource = isSample ? sampleRef.current?.canvas : videoRef.current;
        await exportOfflineVideo(
          videoSource, canvas, webglEngineRef.current, settings,
          (p, msg) => { setExportProgress(p); setExportStatus(msg); },
          (blob, url) => { 
            setExportedUrl(url); 
            setIsExporting(false); 
            setIsPreviewOpen(true); // Auto-open video player
          }
        );
      } catch (err) {
        console.warn('Offline export failed, falling back to real-time MediaRecorder', err);
        setExportStatus('Hardware encoder failed. Falling back to realtime VP9 encoding...');
        const videoSource = isSample ? sampleRef.current?.video || sampleRef.current?.canvas : videoRef.current;
        await recordUpscaledVideoStream(
          canvas, videoSource, durationMs, targetFps,
          (p, msg) => { setExportProgress(p); setExportStatus(msg); },
          (blob, url) => { 
            setExportedUrl(url); 
            setIsExporting(false); 
            setIsPreviewOpen(true); // Auto-open video player
          }
        );
      }
    } catch (fallbackErr) {
      setIsExporting(false);
      alert(`Export totally failed. Please lower resolution or try a different video. Error: ${fallbackErr.message}`);
    }
  };

  const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  if (studioMode === 'batch') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="nav-pill" onClick={() => setStudioMode('single')}>🎥 SINGLE VIDEO STUDIO</button>
          <button className="nav-pill active">⚡ BATCH VIDEO QUEUE</button>
        </div>
        <VideoBatchQueue globalSettings={settings} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

      {/* Mode Switcher Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className={`nav-pill ${studioMode === 'single' ? 'active' : ''}`} onClick={() => setStudioMode('single')}>
            🎥 SINGLE VIDEO STUDIO
          </button>
          <button className={`nav-pill ${studioMode === 'batch' ? 'active' : ''}`} onClick={() => setStudioMode('batch')}>
            ⚡ BATCH VIDEO QUEUE
          </button>
        </div>
      </div>

      {/* ============================================================
         TOP SECTION: CONTROLS & NEURAL TUNING MATRIX
         ============================================================ */}
      <div className="studio-grid-video">

        {/* ── CARD 1: 3D LUT Filters & Color Deck ── */}
        <div className="panel-card">
          <div className="panel-header">
            <svg className="panel-header-icon" viewBox="0 0 24 24" fill="currentColor"><path d={ICO.wand}/></svg>
            <span className="panel-title">COLOR & 3D LUT FILTERS DECK</span>
          </div>

          <div className="panel-body">
            <div className="section-title">COLOR & NOISE CONTROLS</div>
            
            <div className="ctrl-group">
              <div className="ctrl-label-row">
                <span className="ctrl-name">Color Temperature</span>
                <span className="ctrl-val">{tempVal > 0 ? `+${tempVal}K` : `${tempVal}K`}</span>
              </div>
              <input type="range" className="ctrl-slider" min="-50" max="50" value={tempVal} onChange={e => setTempVal(+e.target.value)} />
            </div>

            <div className="ctrl-group">
              <div className="ctrl-label-row">
                <span className="ctrl-name">Organic Film Grain</span>
                <span className="ctrl-val">{settings.grain}</span>
              </div>
              <input type="range" className="ctrl-slider" min="0" max="10" value={settings.grain} onChange={e => set('grain', +e.target.value)} />
            </div>

            <div className="divider" />
            <div className="section-title">3D LUT FILTERS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {LUT_OPTIONS.map(l => (
                <button 
                  key={l.value} 
                  className="btn-secondary" 
                  style={{ 
                    fontSize: '0.7rem', 
                    padding: '0.65rem 0.5rem', 
                    border: settings.lut === l.value ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                    background: settings.lut === l.value ? 'rgba(var(--primary-rgb),0.18)' : '',
                    color: settings.lut === l.value ? 'var(--primary)' : 'var(--text)',
                    fontWeight: 700
                  }}
                  onClick={() => set('lut', l.value)}
                >
                  {l.value === 'none' ? '🚫 ' : '🎨 '}{l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── CARD 2: Resolution & Quick Presets ── */}
        <div className="panel-card">
          <div className="panel-header">
            <svg className="panel-header-icon" viewBox="0 0 24 24" fill="currentColor"><path d={ICO.sparkles}/></svg>
            <span className="panel-title">MODEL & TARGET RESOLUTION</span>
          </div>

          <div className="panel-body">
            <div>
              <div className="section-title">NEURAL AI ENGINE</div>
              <div style={{ padding: '0.6rem 0.85rem', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(var(--primary-rgb),0.18), rgba(var(--secondary-rgb),0.12))', border: '1px solid rgba(var(--primary-rgb),0.4)', color: 'var(--primary)', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#fbbf24' }}>★</span>
                <span>UTKARSH MASTER ENGINE v30.0</span>
              </div>
            </div>

            <div>
              <div className="section-title">TARGET SCALE & RESOLUTION</div>
              <div className="pill-row">
                {[{l:'1080p FHD', s:1.5},{l:'2K 1440p', s:2},{l:'4K UHD', s:4},{l:'8K Ultra', s:8}].map(({l,s}) => (
                  <button key={s} className={`res-pill ${settings.scale === s ? 'active' : ''}`} onClick={() => set('scale', s)}>
                    {l} ({s}×)
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="section-title">TARGET OUTPUT FPS</div>
              <div className="pill-row">
                {[
                  { l: 'Original (Source)', f: 'original' },
                  { l: '24 FPS', f: 24 },
                  { l: '30 FPS', f: 30 },
                  { l: '60 FPS', f: 60 },
                  { l: '120 FPS', f: 120 }
                ].map(({ l, f }) => (
                  <button key={f} className={`res-pill ${settings.fps === f ? 'active' : ''}`} onClick={() => set('fps', f)}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="divider" />
            <div className="section-title">QUICK PRESET ACCELERATORS</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.4rem' }}>
              <button className="btn-ghost" onClick={() => setSettings(p => ({ ...p, sharpness: 80, clarity: 75, denoise: 15, scale: 4 }))}>
                🔪 Ultra Sharp 4K
              </button>
              <button className="btn-ghost" onClick={() => setSettings(p => ({ ...p, hdr: 65, clahe: 50, lut: 'cinematic' }))}>
                🌟 HDR Cinematic
              </button>
              <button className="btn-ghost" onClick={() => setSettings(p => ({ ...p, denoise: 30, faceRestore: 60, grain: 2 }))}>
                🎭 Face Smooth
              </button>
              <button className="btn-ghost" onClick={() => setSettings(p => ({ ...p, denoise: 50, sharpness: 35, grain: 0.5 }))}>
                ✨ Grain Fix
              </button>
            </div>
          </div>
        </div>

        {/* ── CARD 3: Video Export CTA & Actions ── */}
        <div className="panel-card">
          <div className="panel-header">
            <svg className="panel-header-icon" viewBox="0 0 24 24" fill="currentColor"><path d={ICO.flame}/></svg>
            <span className="panel-title">RENDER & EXPORT STUDIO</span>
          </div>

          <div className="panel-body" style={{ gap: '0.8rem' }}>
            {/* Primary Render & Export Button at Top */}
            <div style={{ background: 'linear-gradient(135deg, rgba(var(--primary-rgb),0.15), rgba(var(--secondary-rgb),0.08))', border: '1px solid rgba(var(--primary-rgb),0.35)', borderRadius: '12px', padding: '0.85rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
                EXPORT SPECIFICATIONS
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text)', fontWeight: 700, marginBottom: '0.75rem' }}>
                {settings.scale === 4 ? '4K UHD (3840×2160p)' : settings.scale === 8 ? '8K Ultra (7680×4320p)' : settings.scale === 2 ? '2K (2560×1440p)' : '1080p FHD'} • {settings.fps === 'original' ? 'Original Source FPS' : `${settings.fps} FPS`}
              </div>

              {exportedUrl ? (
                <div style={{ display: 'flex', gap: '0.4rem', flexDirection: 'column' }}>
                  <button className="btn-primary" onClick={() => setIsPreviewOpen(true)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d={ICO.play}/></svg>
                    OPEN RENDERED VIDEO PLAYER
                  </button>
                </div>
              ) : (
                <>
                  {!isSample ? (
                    <button className="btn-primary" onClick={handleExport} disabled={isExporting}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d={ICO.flame}/></svg>
                      {isExporting ? `EXPORTING… ${exportProgress}%` : 'RENDER & EXPORT OMNI 4K'}
                    </button>
                  ) : (
                    <button className="btn-secondary" style={{ opacity: 0.6, cursor: 'not-allowed' }} disabled>
                      UPLOAD A CUSTOM VIDEO TO EXPORT
                    </button>
                  )}
                </>
              )}
              
              {isExporting && (
                <div style={{ marginTop: '0.8rem', background: '#0f172a', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(var(--primary-rgb),0.3)' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div className="spinner-ring" style={{ width: '12px', height: '12px', borderWidth: '2px' }} />
                    SYNTHESIZING AI VIDEO STREAM...
                  </div>
                  <div className="progress-bar-track" style={{ width: '100%', marginBottom: '0.4rem' }}>
                    <div className="progress-bar-fill" style={{ width: `${exportProgress}%` }} />
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{exportStatus}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{exportProgress}%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="divider" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input type="file" ref={fileInputRef} className="hidden" accept="video/mp4,video/webm,video/quicktime" onChange={e => handleFile(e.target.files?.[0])} />
              <button className="btn-secondary w-full" onClick={() => fileInputRef.current?.click()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={ICO.upload}/></svg>
                Upload Custom Video
              </button>
              <button className="btn-secondary w-full" onClick={resetToSample}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={ICO.reset}/></svg>
                Reset Sample Demo
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================
         BOTTOM SECTION: 60 FPS WEBGPU STAGE VIEWPORT & SPLIT COMPARISON
         ============================================================ */}
      <div className="viewport-card" style={{ marginTop: '0.5rem' }}>
        {/* Toolbar */}
        <div className="viewport-toolbar">
          <div className="viewport-toolbar-left">
            <span className="badge-webgpu">⚡ WEBGPU 60 FPS HIGH-DEFINITION STAGE</span>
            <span className="vt-filename">{videoName}</span>
            <span className="vt-label" style={{ color: 'var(--primary)', fontWeight: 800 }}>
              → {settings.scale}× AI SUPER-RESOLUTION ({settings.fps === 'original' ? '60 FPS' : `${settings.fps} FPS`})
            </span>
          </div>
          <div className="viewport-toolbar-right">
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary)', padding: '0.35rem 0.85rem', background: 'rgba(var(--primary-rgb),0.12)', border: '1px solid rgba(var(--primary-rgb),0.3)', borderRadius: '99px', marginRight: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              🔳 DUAL SIDE-BY-SIDE COMPARISON STAGE
            </span>
            <button className="btn-secondary" style={{ fontSize: '0.68rem', padding: '0.35rem 0.75rem' }} onClick={captureFrame}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d={ICO.camera}/></svg>
              SNAP 4K FRAME
            </button>
          </div>
        </div>

        {/* Player Viewport Stage */}
        <div
          className="player-area"
          style={{ minHeight: '400px', position: 'relative' }}
        >
          {!isSample && (
            <video
              ref={videoRef}
              src={videoSrc}
              className="hidden"
              loop={isLooping}
              muted={true}
              autoPlay={isPlaying}
              playsInline={true}
              onLoadedMetadata={() => setDuration(videoRef.current?.duration || 10)}
              onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
            />
          )}

          {/* ── Side-by-Side Dual Viewport Grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', width: '100%', height: '100%', minHeight: '400px' }}>
            {/* Left Viewport: RAW Input */}
            <div style={{ background: '#090d16', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '0.5rem 0.8rem', background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                RAW LOW-RES SOURCE INPUT
              </div>
              <div style={{ flex: 1, position: 'relative', minHeight: '340px' }}>
                <canvas ref={rawCanvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>

            {/* Right Viewport: AI 4K Output */}
            <div style={{ background: '#090d16', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(var(--primary-rgb),0.35)', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 0 25px rgba(var(--primary-rgb),0.12)' }}>
              <div style={{ padding: '0.5rem 0.8rem', background: 'rgba(var(--primary-rgb),0.15)', borderBottom: '1px solid rgba(var(--primary-rgb),0.3)', fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: '#fbbf24' }}>★</span>
                UTKARSH AI {settings.scale}× 60-120 FPS ULTRA ENHANCED
              </div>
              <div style={{ flex: 1, position: 'relative', minHeight: '340px' }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Timeline & Playback Bar */}
        <div className="timeline-bar">
          <div className="timeline-row">
            <button className="icon-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d={isPlaying ? ICO.pause : ICO.play}/>
              </svg>
            </button>
            <input type="range" className="ctrl-slider" style={{ flex: 1 }} min="0" max={duration || 10} step="0.1" value={currentTime} onChange={handleSeek} />
            <button className="icon-btn" onClick={() => setIsMuted(m => !m)} aria-label="Toggle mute">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d={isMuted ? ICO.mute : ICO.unmute}/>
              </svg>
            </button>
            <button className={`icon-btn ${isLooping ? 'active' : ''}`} onClick={() => setIsLooping(l => !l)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={ICO.loop}/></svg>
            </button>
          </div>
          <div className="timeline-row" style={{ justifyContent: 'space-between' }}>
            <span className="playback-time">{Math.floor(currentTime)}s / {Math.floor(duration || 10)}s</span>
            <div className="speed-pills">
              {[0.5, 1, 1.5, 2].map(s => (
                <button key={s} className={`speed-pill ${playbackSpeed === s ? 'active' : ''}`} onClick={() => handleSpeed(s)}>
                  {s}×
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isPreviewOpen && exportedUrl && (
        <PostRenderPlayer 
          url={exportedUrl} 
          fps={settings.fps === 'original' ? 'Source FPS (approx 60)' : settings.fps} 
          resolutionLabel={settings.scale === 4 ? '4K UHD (3840×2160)' : settings.scale === 8 ? '8K Ultra (7680×4320)' : settings.scale === 2 ? '2K (2560×1440)' : '1080p FHD'}
          videoName={`Utkarsh_AI_${settings.scale}x_${videoName}`}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
}

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  generateSampleVideoCanvas,
  computeCanvasFilter, drawVignette
} from '../engine/videoUpscalerEngine';
import { exportOfflineVideo } from '../engine/offlineExportEngine';
import { OmniUpscalerCore } from '../engine/omniUpscalerCore';
import { globalAINeuralEngine } from '../engine/aiNeuralEngine';
import { useWebglRenderLoop } from '../utils/useWebglRenderLoop';
import { analyzeFrameWithGemini } from '../engine/geminiAiEngine';
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
  sparkles: 'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z',
};

const LUT_OPTIONS = [
  { value: 'none',      label: 'None (Rec.709 Standard)' },
  { value: 'cinematic', label: 'Cinematic Teal & Orange' },
  { value: 'filmic',    label: 'Filmic Pro (Log→Rec.709)' },
  { value: 'vintage',   label: 'Vintage 35mm Film' },
  { value: 'cool',      label: 'Cool Blue Noir' },
  { value: 'cyber',     label: 'Cyber Neon Glow' },
  { value: 'golden',    label: 'Golden Hour Warmth' },
  { value: 'sakuga',    label: 'Sakuga 2D Anime & Kinetic' },
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
  const [isDragOver, setIsDragOver]           = useState(false);



  /* Audio local state */
  const [audioGain, setAudioGain] = useState(4);
  const [bassBoost, setBassBoost] = useState(true);
  const [surround, setSurround]   = useState(true);

  /* Bokeh & Temperature */
  const [vignetteStr, setVignetteStr] = useState(25);
  const [tempVal, setTempVal]         = useState(0);

  /* Gemini Vision AI state */
  const [geminiStatus, setGeminiStatus]           = useState('');
  const [isGeminiAnalyzing, setIsGeminiAnalyzing] = useState(false);

  const runGeminiAutoOptimize = async () => {
    const src = isSample ? sampleRef.current?.canvas : videoRef.current;
    if (!src) return alert('No active video or canvas to analyze!');
    setIsGeminiAnalyzing(true);
    setGeminiStatus('Analyzing frame with Gemini 1.5 Vision AI...');
    try {
      const res = await analyzeFrameWithGemini(src);
      if (res && res.success) {
        setSettings(p => ({
          ...p,
          sharpness: res.sharpness ?? p.sharpness,
          clarity: res.clarity ?? p.clarity,
          hdr: res.hdr ?? p.hdr,
          denoise: res.denoise ?? p.denoise,
          grain: res.grain ?? p.grain,
          lut: res.lut ?? p.lut,
          model: res.recommendedModel ?? p.model,
        }));
        setGeminiStatus(`✨ Gemini AI Analyzed: ${res.sceneType} (${res.provider}) → Parameters Auto-Tuned!`);
      }
    } catch (err) {
      setGeminiStatus(`⚠️ Gemini analysis notice: ${err.message}`);
    } finally {
      setIsGeminiAnalyzing(false);
      setTimeout(() => setGeminiStatus(''), 7000);
    }
  };

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

  const activeBlobUrlRef = useRef(null);

  /* Clean up ObjectURL on unmount */
  useEffect(() => {
    return () => {
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
        activeBlobUrlRef.current = null;
      }
    };
  }, []);

  /* Handle uploaded video */
  const handleFile = (file) => {
    if (!file?.type.startsWith('video/')) return alert('Please upload a valid video file (MP4, WebM, MOV).');
    sampleRef.current?.stop();
    sampleRef.current = null;

    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
    }

    const newUrl = URL.createObjectURL(file);
    activeBlobUrlRef.current = newUrl;

    setIsSample(false);
    setVideoName(file.name);
    setVideoSrc(newUrl);
    setExportedUrl(null);
    setIsPlaying(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const resetToSample = () => {
    sampleRef.current?.stop();
    sampleRef.current = generateSampleVideoCanvas();

    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }

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

  /* Keyboard Shortcuts (Space = Play/Pause, M = Mute) */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        setIsMuted(m => !m);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isSample]);


  /* Video Controls */
  const togglePlay = () => {
    if (isSample) {
      setIsPlaying(p => !p);
      return;
    }
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.warn('Video playback interrupted:', err);
            setIsPlaying(false);
          });
      }
    }
  };

  const handleSeek = (e) => {
    const v = Number(e.target.value);
    setCurrentTime(v);
    if (!isSample && videoRef.current) {
      videoRef.current.currentTime = v;
    }
  };

  const handleSpeed = (s) => {
    setPlaybackSpeed(s);
    if (!isSample && videoRef.current) {
      videoRef.current.playbackRate = s;
    }
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
    if (exportedUrl) {
      setExportedUrl(null);
      setTimeout(() => startExportProcess(), 50);
      return;
    }
    startExportProcess();
  };

  const startExportProcess = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);
    setExportProgress(5);
    setExportStatus('Initializing AI Frame-by-Frame Exporter…');

    try {
      const videoSource = isSample ? sampleRef.current?.canvas : videoRef.current;
      await exportOfflineVideo(
        videoSource, canvas, webglEngineRef.current, settings,
        (p, msg) => { setExportProgress(p); setExportStatus(msg); },
        (blob, url) => { 
          setExportedUrl(url); 
          setIsExporting(false); 
        }
      );
    } catch (err) {
      setIsExporting(false);
      console.error('AI Export failed:', err);
      alert(`AI Frame-by-Frame Export failed. Error: ${err.message}`);
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
    <div
      style={{
        display: 'flex', flexDirection: 'column', gap: '1.2rem',
        borderRadius: '16px', transition: 'all 0.2s ease',
        outline: isDragOver ? '2px dashed var(--primary)' : 'none',
        outlineOffset: '4px',
        backgroundColor: isDragOver ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >

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

      {/* Prominent Active Uploaded File Name Banner */}
      <div style={{
        padding: '0.75rem 1.2rem', borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(var(--primary-rgb),0.18), rgba(var(--secondary-rgb),0.08))',
        border: '1px solid rgba(var(--primary-rgb),0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(var(--primary-rgb),0.2)', border: '1px solid rgba(var(--primary-rgb),0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
          }}>
            🎥
          </div>
          <div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.08em', display: 'block' }}>
              ACTIVE VIDEO FILE
            </span>
            <span style={{ fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 900 }}>
              {videoName}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, background: 'rgba(0,0,0,0.35)', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            🎬 {isSample ? 'Sample Video Demo' : 'Custom Uploaded Video'}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 800, background: 'rgba(var(--primary-rgb),0.12)', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(var(--primary-rgb),0.3)' }}>
            ⏱️ {duration ? `${duration.toFixed(1)}s` : '10.0s'}
          </span>
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
              <div className="section-title">OPEN SOURCE & FREE AI MODELS</div>
              <select
                className="ctrl-select"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.72rem', background: '#090d16', border: '1px solid rgba(var(--primary-rgb),0.4)', color: 'var(--primary)', marginBottom: '0.5rem' }}
                value={settings.model || 'utkarsh_omni_absolute'}
                onChange={e => set('model', e.target.value)}
              >
                <option value="utkarsh_omni_absolute">👑 Utkarsh Omni-Fusion Absolute v33.0 (Ultimate 5-Pass)</option>
                <option value="gemini_vision_ai">✨ Google Gemini 1.5/2.0 Vision AI Agent (Auto-Guided)</option>
                <option value="utkarsh_master_fusion">★ Utkarsh Master Multi-AI Fusion v32.0 (Legacy)</option>
                <option value="realesrgan_x4plus">⚡ Real-ESRGAN x4+ (Open Source BSD-3-Clause)</option>
                <option value="realesrgan_anime_v3">🌸 Real-ESRGAN Anime Video v3 (Open Source 2D)</option>
                <option value="codeformer_swinir">🎭 CodeFormer & SwinIR (Open Source Face Restoration)</option>
                <option value="waifu2x_cugan">🎨 Waifu2x CUGAN 2D Vectorizer (Open Source MIT)</option>
                <option value="huggingface_open_ai">🤗 HuggingFace Free Open Inference API (Cloud AI)</option>
                <option value="webgpu_onnx_local">⚡ WebGPU Local ONNX Neural Engine (100% Free Local)</option>
              </select>
              
              <div style={{ padding: '0.6rem 0.85rem', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(var(--primary-rgb),0.18), rgba(var(--secondary-rgb),0.12))', border: '1px solid rgba(var(--primary-rgb),0.4)', color: 'var(--primary)', fontWeight: 800, fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fbbf24' }}>{settings.model === 'realesrgan_x4plus' ? '⚡ BSD-3-Clause Open Source' : settings.model === 'huggingface_open_ai' ? '🤗 Free Cloud Inference' : settings.model === 'codeformer_swinir' ? '🎭 S-Lab Transformer' : '★ SOTA Multi-AI Engine'}</span>
                  <span style={{ fontSize: '0.62rem', opacity: 0.8, color: '#38bdf8' }}>Execution: {settings.model === 'huggingface_open_ai' ? 'Free Cloud API' : 'WebGPU / WebGL2'}</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 500, marginTop: '0.1rem' }}>
                  {settings.model === 'utkarsh_omni_absolute' ? 'Ultimate 5-Pass Engine: Combines EASU, Anime4K Vector Lines, RCAS Textures, HDR & Temporal Anti-Aliasing.' :
                   settings.model === 'realesrgan_x4plus' ? 'Real-ESRGAN x4+ convolutional residual neural network trained on synthetic degrades for photorealistic recovery.' :
                   settings.model === 'realesrgan_anime_v3' ? 'Real-ESRGAN Anime Video v3 compact network specialized for 2D animation, removing compression ringing.' :
                   settings.model === 'codeformer_swinir' ? 'CodeFormer codebook lookup transformer combined with SwinIR for high-fidelity blind face recovery.' :
                   settings.model === 'waifu2x_cugan' ? 'CUGAN deep learning model for clean 2D line art vectorization and edge sharpening.' :
                   settings.model === 'huggingface_open_ai' ? 'Free open-source inference endpoint connecting HuggingFace Swin2SR & Stable Diffusion Upscaler.' :
                   settings.model === 'webgpu_onnx_local' ? 'Zero-cost, zero-API-key in-browser neural tensor execution using WebGPU and ONNX runtime.' :
                   'Master Ensemble combining Lanczos-3, Sobel-Laplacian Edge Synthesis, and AMD RCAS.'}
                </div>
              </div>
            </div>

            <div>
              <div className="section-title">TARGET SCALE & RESOLUTION</div>
              <div className="pill-row">
                {[{l:'1080p FHD', h:1080},{l:'2K 1440p', h:1440},{l:'4K UHD', h:2160},{l:'8K Ultra', h:4320}].map(({l,h}) => (
                  <button
                    key={h}
                    className={`res-pill ${settings.targetHeight === h ? 'active' : ''}`}
                    onClick={() => setSettings(p => ({ ...p, targetHeight: h, targetWidth: null, scale: null }))}
                  >
                    {l}
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
            <div className="section-title">GEMINI MULTIMODAL VISION AI</div>
            <button
              className="btn-primary w-full"
              style={{ padding: '0.65rem', fontSize: '0.72rem', background: 'linear-gradient(135deg, #a855f7, #38bdf8)', border: 'none', color: '#fff', fontWeight: 800, cursor: 'pointer', borderRadius: '10px', marginBottom: '0.5rem' }}
              onClick={runGeminiAutoOptimize}
              disabled={isGeminiAnalyzing}
            >
              {isGeminiAnalyzing ? '🤖 GEMINI VISION AI ANALYZING FRAME…' : '🤖 GEMINI VISION AI AUTO-OPTIMIZE SCENE'}
            </button>
            {geminiStatus && (
              <div style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: 700, padding: '0.4rem 0.6rem', borderRadius: '8px', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', marginBottom: '0.5rem' }}>
                {geminiStatus}
              </div>
            )}

            <div className="divider" />
            <div className="section-title">QUICK PRESET ACCELERATORS</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.4rem' }}>
              <button className="btn-ghost" onClick={() => setSettings(p => ({ ...p, sharpness: 80, clarity: 75, denoise: 15, scale: 4, model: 'utkarsh_master_fusion' }))}>
                🔪 Ultra Sharp 4K
              </button>
              <button className="btn-ghost" onClick={() => setSettings(p => ({ ...p, hdr: 65, sharpness: 65, clarity: 85, lut: 'cinematic', model: 'realesrgan_x4plus' }))}>
                🌟 HDR Cinematic
              </button>
              <button className="btn-ghost" onClick={() => setSettings(p => ({ ...p, denoise: 40, sharpness: 60, clarity: 70, grain: 2, model: 'codeformer_swinir' }))}>
                🎭 Face Smooth
              </button>
              <button className="btn-ghost" onClick={() => setSettings(p => ({ ...p, denoise: 50, sharpness: 55, clarity: 95, grain: 0, model: 'realesrgan_anime_v3' }))}>
                ✨ 2D Anime/Clean
              </button>
            </div>
          </div>
        </div>

        {/* ── CARD 3: AI UPSCALE ENGINE MECHANISM & SERVICES ── */}
        <div className="panel-card">
          <div className="panel-header">
            <svg className="panel-header-icon" viewBox="0 0 24 24" fill="currentColor"><path d={ICO.flame}/></svg>
            <span className="panel-title">AI UPSCALE</span>
          </div>

          <div className="panel-body" style={{ gap: '0.8rem' }}>
            {/* Primary AI Upscale Specifications & Service Banner */}
            <div style={{ background: 'linear-gradient(135deg, rgba(var(--primary-rgb),0.18), rgba(var(--secondary-rgb),0.08))', border: '1px solid rgba(var(--primary-rgb),0.35)', borderRadius: '12px', padding: '0.85rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>
                AI UPSCALE MECHANISM & SERVICES
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text)', fontWeight: 800, marginBottom: '0.6rem' }}>
                {settings.targetHeight === 2160 ? '4K UHD (2160p)' : settings.targetHeight === 4320 ? '8K Ultra (4320p)' : settings.targetHeight === 1440 ? '2K (1440p)' : settings.targetHeight === 1080 ? '1080p FHD' : settings.scale ? `${settings.scale}x Scale` : 'Custom'} • {settings.fps === 'original' ? 'Source FPS (60FPS)' : `${settings.fps} FPS`}
              </div>

              {/* Service Badges — Cons → Pros Upgraded v32.0 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.75rem', fontSize: '0.62rem', textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.6rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>4-Pass FSR 1.0 + TAA Engine</span>
                  <span style={{ color: '#4ade80', fontWeight: 800 }}>● ONLINE (v32.0)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Temporal Anti-Flicker (TAA)</span>
                  <span style={{ color: '#a855f7', fontWeight: 800 }}>⚡ ACTIVE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Hardware GPU Acceleration</span>
                  <span style={{ color: '#38bdf8', fontWeight: 800 }}>WebGL2 / WebGL1 / Canvas2D</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>WebCodecs 80Mbps Muxer</span>
                  <span style={{ color: '#facc15', fontWeight: 800 }}>READY</span>
                </div>
              </div>

              {exportedUrl ? (
                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                  <a
                    href={exportedUrl}
                    download={`Utkarsh_AI_${settings.scale}x_${videoName.replace(/\.[^.]+$/, '')}.mp4`}
                    className="btn-primary"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1rem' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d={ICO.download}/></svg>
                    DOWNLOAD RENDERED VIDEO (.MP4)
                  </a>
                  <button className="btn-ghost" onClick={handleExport} disabled={isExporting} style={{ fontSize: '0.68rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={ICO.flame}/></svg>
                    Re-run AI Upscale Engine
                  </button>
                </div>
              ) : (
                <button className="btn-primary" onClick={handleExport} disabled={isExporting} style={{ padding: '0.75rem 1rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d={ICO.flame}/></svg>
                  {isExporting ? `AI UPSCALE RUNNING… ${exportProgress}%` : `START AI UPSCALE PROCESS (${settings.targetHeight ? settings.targetHeight+'p' : settings.scale+'×'})`}
                </button>
              )}
              
              {isExporting && (
                <div style={{ marginTop: '0.8rem', background: '#0f172a', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(var(--primary-rgb),0.4)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div className="spinner-ring" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                    AI UPSCALING PROCESS IN PROGRESS...
                  </div>
                  
                  {/* Large Prominent Estimated Time Remaining Banner */}
                  <div className="eta-banner-large" style={{ margin: '0.6rem 0', fontSize: '1.25rem', padding: '0.7rem 1rem' }}>
                    ⏱️ ESTIMATED TIME: {exportStatus.match(/\[ETA:\s*([^\]]+)\]/)?.[1] || 'Calculating...'}
                  </div>

                  <div className="progress-bar-track" style={{ width: '100%', marginBottom: '0.4rem' }}>
                    <div className="progress-bar-fill" style={{ width: `${exportProgress}%` }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                    <span>{exportStatus.replace(/\[ETA:\s*[^\]]+\]/, '')}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '0.95rem' }}>{exportProgress}%</span>
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
              → {settings.targetHeight ? settings.targetHeight+'p' : settings.scale+'×'} AI SUPER-RESOLUTION ({settings.fps === 'original' ? '60 FPS' : `${settings.fps} FPS`})
            </span>
          </div>
          <div className="viewport-toolbar-right">
            <span style={{ display: 'flex', gap: '0.4rem', marginRight: '0.5rem' }}>
              <button 
                className={`btn-secondary ${viewMode === 'side-by-side' ? 'active' : ''}`} 
                style={{ fontSize: '0.68rem', padding: '0.35rem 0.75rem', background: viewMode === 'side-by-side' ? 'rgba(var(--primary-rgb),0.12)' : '', border: viewMode === 'side-by-side' ? '1px solid rgba(var(--primary-rgb),0.3)' : '' }} 
                onClick={() => setViewMode('side-by-side')}
              >
                🔳 DUAL SIDE-BY-SIDE
              </button>
              <button 
                className={`btn-secondary ${viewMode === 'split' ? 'active' : ''}`} 
                style={{ fontSize: '0.68rem', padding: '0.35rem 0.75rem', background: viewMode === 'split' ? 'rgba(var(--primary-rgb),0.12)' : '', border: viewMode === 'split' ? '1px solid rgba(var(--primary-rgb),0.3)' : '' }} 
                onClick={() => setViewMode('split')}
              >
                ◧ SPLIT SLIDER
              </button>
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
          {!isSample && videoSrc && videoSrc !== 'sample' && (
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

          {/* ── Viewport Stage ── */}
          {viewMode === 'side-by-side' ? (
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

              {/* Right Viewport: Rendered / Upscaled / Enhanced Output */}
              <div style={{ background: '#090d16', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(var(--primary-rgb),0.35)', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 0 25px rgba(var(--primary-rgb),0.12)' }}>
                <div style={{ padding: '0.5rem 0.8rem', background: 'rgba(var(--primary-rgb),0.15)', borderBottom: '1px solid rgba(var(--primary-rgb),0.3)', fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: '#fbbf24' }}>★</span>
                    {exportedUrl ? `RENDERED & EXPORTED ${settings.targetHeight ? settings.targetHeight+'p' : settings.scale+'×'} 4K VIDEO` : `UTKARSH AI ${settings.targetHeight ? settings.targetHeight+'p' : settings.scale+'×'} 60-120 FPS ULTRA ENHANCED`}
                  </div>
                  {exportedUrl && (
                    <a
                      href={exportedUrl}
                      download={`Utkarsh_AI_${settings.scale}x_${videoName.replace(/\.[^.]+$/, '')}.mp4`}
                      style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.6rem', fontWeight: 800 }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d={ICO.download}/></svg>
                      DOWNLOAD .MP4
                    </a>
                  )}
                </div>
                <div style={{ flex: 1, position: 'relative', minHeight: '340px' }}>
                  {exportedUrl ? (
                    <video
                      src={exportedUrl}
                      controls
                      loop={isLooping}
                      autoPlay={isPlaying}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div 
              style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px', background: '#090d16', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(var(--primary-rgb),0.35)' }}
              onMouseMove={onContainerMouseMove}
              onMouseUp={onContainerMouseUp}
              onMouseLeave={onContainerMouseUp}
            >
              {/* Background: Upscaled */}
              <div style={{ position: 'absolute', inset: 0 }}>
                {exportedUrl ? (
                  <video src={exportedUrl} controls loop={isLooping} autoPlay={isPlaying} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                )}
                <div style={{ position: 'absolute', top: '0.5rem', right: '0.8rem', background: 'rgba(var(--primary-rgb),0.6)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, color: '#fff', zIndex: 10 }}>
                  AI UPSCALED
                </div>
              </div>

              {/* Foreground: RAW (Clipped) */}
              <div style={{ position: 'absolute', inset: 0, clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`, pointerEvents: 'none' }}>
                <canvas ref={rawCanvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                <div style={{ position: 'absolute', top: '0.5rem', left: '0.8rem', background: 'rgba(0,0,0,0.6)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', zIndex: 10 }}>
                  RAW SOURCE
                </div>
              </div>

              {/* Slider Line & Handle */}
              <div 
                style={{ position: 'absolute', top: 0, bottom: 0, left: `${sliderPos}%`, width: '3px', background: 'var(--primary)', cursor: 'ew-resize', transform: 'translateX(-50%)', zIndex: 20 }}
                onMouseDown={onSliderMouseDown}
              >
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '32px', height: '32px', background: '#090d16', border: '3px solid var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(0,0,0,0.8)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l6-6-6-6M9 18l-6-6 6-6"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
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
    </div>
  );
}
import React, { useState } from 'react';
import { MASTER_PROMPTS, autoAnalyzeScene } from '../engine/aiUpscalerEngine';

const D = {
  sliders: 'M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z',
  wand:    'M7.5 5.6L5 7l1.4-2.5L5 2l2.5 1.4L10 2 8.6 4.5 10 7 7.5 5.6zm12 9.8L22 14l-1.4 2.5L22 19l-2.5-1.4L17 19l1.4-2.5L17 14l2.5 1.6z',
  reset:   'M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
  sparkle: 'M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 1z',
};

const RESOLUTIONS = [
  { id: 'hd',  name: 'HD 720p',   w: 1280, h: 720  },
  { id: 'fhd', name: 'FHD 1080p', w: 1920, h: 1080 },
  { id: '2k',  name: '2K 1440p',  w: 2560, h: 1440 },
  { id: '4k',  name: '4K 2160p',  w: 3840, h: 2160 },
  { id: '8k',  name: '8K 4320p',  w: 7680, h: 4320 },
];

const MODELS = [
  { v: 'utkarsh_omni', l: '★ UTKARSH AI OMNI-FUSION ENGINE (Master SOTA Unified Fusion)' },
  { v: 'proteus',      l: 'Utkarsh Proteus Profile (Photos & Faces)' },
  { v: 'cugan',        l: 'Utkarsh CUGAN Profile (Anime & 2D Art)' },
  { v: 'dione',        l: 'Utkarsh Dione Profile (Video & Interlaced Tapes)' },
  { v: 'realesrgan',   l: 'Utkarsh ESRGAN Profile (Landscapes & Graphics)' },
];

export default function ControlsPanel({
  settings, setSettings, onUpscale, isProcessing,
  originalDimensions, currentImageElement,
}) {
  const [tab, setTab]         = useState('enhance');
  const [prompt, setPrompt]   = useState('photo');
  const [posPr, setPosPr]     = useState(MASTER_PROMPTS.photo.positive);
  const [negPr, setNegPr]     = useState(MASTER_PROMPTS.photo.negative);
  const [creativity, setCr]   = useState(20);
  const [resemblance, setRe]  = useState(80);
  const [analysisTxt, setAn]  = useState('');

  const set = (k, v) => setSettings(p => ({ ...p, [k]: v }));

  const autoOptimize = () => {
    if (!currentImageElement) return alert('Upload an image first!');
    const a = autoAnalyzeScene(currentImageElement);
    setSettings(p => ({
      ...p, sharpness: 50, denoise: 30, hdr: 25,
      clarity: 40, faceRestore: 50, grain: 2,
    }));
    setAn(`AI Scene Analysis: Avg Lum=${a.avgLum}, Edge Density=${a.edgeRatio} → Model: ${a.recommendedModel.toUpperCase()}`);
    setTimeout(() => setAn(''), 6000);
  };

  const resetSliders = () => setSettings(p => ({
    ...p, sharpness: 45, denoise: 30, hdr: 25, clarity: 40, faceRestore: 55, clahe: 30, grain: 2,
  }));

  const applyPrompt = (type) => {
    setPrompt(type);
    setPosPr(MASTER_PROMPTS[type]?.positive || '');
    setNegPr(MASTER_PROMPTS[type]?.negative || '');
    if (type === 'portrait') set('faceRestore', 70);
  };

  const selectRes = (r) => {
    const aspect = originalDimensions ? originalDimensions.width / originalDimensions.height : 16/9;
    setSettings(p => ({
      ...p,
      targetWidth: r.w,
      targetHeight: Math.round(r.w / aspect),
    }));
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div className="card-header">
        <svg className="card-header-icon" viewBox="0 0 24 24"><path d={D.sliders}/></svg>
        <span className="card-header-title">AI TUNING DECK</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.35rem' }}>
          <button className="btn-ghost" style={{ fontSize: '0.62rem', padding: '0.25rem 0.55rem' }}
            onClick={autoOptimize} title="AI Auto-Detect & Optimize">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d={D.wand}/></svg>
            AUTO
          </button>
          <button className="btn-ghost" style={{ fontSize: '0.62rem', padding: '0.25rem 0.55rem' }}
            onClick={resetSliders} title="Reset to defaults">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d={D.reset}/></svg>
            RESET
          </button>
        </div>
      </div>

      {analysisTxt && (
        <div style={{ margin: '0.5rem', padding: '0.4rem 0.6rem', borderRadius: '8px', background: 'rgba(var(--secondary-rgb), 0.15)', border: '1px solid rgba(var(--secondary-rgb), 0.3)', color: 'var(--secondary)', fontSize: '0.65rem', fontWeight: 600 }}>
          ✨ {analysisTxt}
        </div>
      )}

      {/* Tabs */}
      <div className="tab-bar">
        {['enhance','resolution','prompts','export'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab: ENHANCE */}
      {tab === 'enhance' && (
        <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div className="section-title">NEURAL AI ENGINE</div>
          <select
            className="ctrl-select"
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

          <div className="divider" />
          <div className="section-title">SUPER-RESOLUTION SLIDERS</div>

          {[
            { k: 'sharpness',   l: 'Unsharp Mask Strength',  c: 'var(--primary)' },
            { k: 'denoise',     l: 'Bilateral Edge Denoise', c: '#10b981' },
            { k: 'hdr',         l: 'HDR Tone Mapping',       c: '#a855f7' },
            { k: 'clarity',     l: 'Neural Clarity / Dehaze',c: '#38bdf8' },
            { k: 'faceRestore', l: 'SwinIR Face Restore',    c: '#ec4899' },
            { k: 'clahe',       l: 'CLAHE Local Contrast',   c: '#f59e0b' },
          ].map(({ k, l, c }) => (
            <div className="ctrl-group" key={k}>
              <div className="ctrl-label-row">
                <span className="ctrl-name">{l}</span>
                <span className="ctrl-val" style={{ color: c }}>{settings[k] ?? 0}%</span>
              </div>
              <input
                type="range" className="ctrl-slider" min="0" max="100"
                value={settings[k] ?? 0}
                onChange={e => set(k, Number(e.target.value))}
              />
            </div>
          ))}

          <div className="ctrl-group">
            <div className="ctrl-label-row">
              <span className="ctrl-name">Organic Film Grain</span>
              <span className="ctrl-val" style={{ color: '#d4b483' }}>{settings.grain ?? 2}</span>
            </div>
            <input
              type="range" className="ctrl-slider" min="0" max="10" step="0.5"
              value={settings.grain ?? 2}
              onChange={e => set('grain', Number(e.target.value))}
            />
          </div>

          <div className="divider" />
          <div className="section-title">QUICK FIX PRESETS</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            <button className="btn-ghost" style={{ fontSize: '0.62rem' }}
              onClick={() => setSettings(p => ({ ...p, denoise: 25, faceRestore: 50, grain: 2.5 }))}>
              🎭 Plastic Skin Fix
            </button>
            <button className="btn-ghost" style={{ fontSize: '0.62rem' }}
              onClick={() => setSettings(p => ({ ...p, denoise: 50, sharpness: 38, grain: 0.5 }))}>
              ✨ Grainy Fix
            </button>
            <button className="btn-ghost" style={{ fontSize: '0.62rem' }}
              onClick={() => setSettings(p => ({ ...p, hdr: 60, clahe: 50, sharpness: 55 }))}>
              🌟 Max HDR Boost
            </button>
            <button className="btn-ghost" style={{ fontSize: '0.62rem' }}
              onClick={() => setSettings(p => ({ ...p, sharpness: 85, clarity: 80, denoise: 10 }))}>
              🔪 Ultra Sharp 4K
            </button>
          </div>
        </div>
      )}

      {/* Tab: RESOLUTION */}
      {tab === 'resolution' && (
        <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div className="section-title">TARGET OUTPUT RESOLUTION</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {RESOLUTIONS.map(r => {
              const isActive = settings.targetWidth === r.w;
              return (
                <button
                  key={r.id}
                  onClick={() => selectRes(r)}
                  style={{
                    padding: '0.6rem 0.9rem', borderRadius: '10px',
                    border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                    background: isActive ? 'rgba(var(--primary-rgb),0.12)' : 'rgba(255,255,255,0.03)',
                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontWeight: 700, fontSize: '0.78rem'
                  }}
                >
                  <span>{r.name}</span>
                  <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', opacity: 0.8 }}>
                    {r.w} × {r.h}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="divider" />
          <div className="section-title">OR SCALE MULTIPLIER</div>
          <div className="pill-row">
            {[1.5, 2, 4, 8].map(s => (
              <button
                key={s}
                className={`res-pill ${!settings.targetWidth && settings.scale === s ? 'active' : ''}`}
                onClick={() => setSettings(p => ({ ...p, scale: s, targetWidth: null, targetHeight: null }))}
              >
                {s}× Scale
              </button>
            ))}
          </div>

          <div className="divider" />
          <div className="section-title">OUTPUT FORMAT</div>
          <div className="pill-row">
            {['png','webp','jpeg'].map(f => (
              <button
                key={f}
                className={`res-pill ${settings.format === f ? 'active' : ''}`}
                onClick={() => set('format', f)}
              >
                .{f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab: PROMPTS */}
      {tab === 'prompts' && (
        <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div className="section-title">MASTER PROMPT PRESETS</div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['photo','portrait','anime'].map(t => (
              <button
                key={t}
                className={`res-pill ${prompt === t ? 'active' : ''}`}
                onClick={() => applyPrompt(t)}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="ctrl-group">
            <span className="ctrl-name" style={{ color: 'var(--primary)', fontWeight: 700 }}>✅ Positive Enhancers</span>
            <textarea
              className="ctrl-input"
              rows="4"
              value={posPr}
              onChange={e => setPosPr(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', minHeight: '70px' }}
            />
          </div>

          <div className="ctrl-group">
            <span className="ctrl-name" style={{ color: '#ef4444', fontWeight: 700 }}>❌ Negative Filters</span>
            <textarea
              className="ctrl-input"
              rows="3"
              value={negPr}
              onChange={e => setNegPr(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', minHeight: '60px' }}
            />
          </div>

          <div className="ctrl-group">
            <div className="ctrl-label-row">
              <span className="ctrl-name">Creativity / Sub-pixel Synthesis</span>
              <span className="ctrl-val">{creativity}%</span>
            </div>
            <input type="range" className="ctrl-slider" min="0" max="100" value={creativity} onChange={e => setCr(+e.target.value)} />
          </div>

          <div className="ctrl-group">
            <div className="ctrl-label-row">
              <span className="ctrl-name">Fidelity Resemblance</span>
              <span className="ctrl-val">{resemblance}%</span>
            </div>
            <input type="range" className="ctrl-slider" min="0" max="100" value={resemblance} onChange={e => setRe(+e.target.value)} />
          </div>
        </div>
      )}

      {/* Tab: EXPORT */}
      {tab === 'export' && (
        <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div className="section-title">OUTPUT FORMAT SELECTION</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
            {['png','webp','jpeg'].map(f => (
              <button
                key={f}
                onClick={() => set('format', f)}
                style={{
                  padding: '0.65rem', borderRadius: '8px', textAlign: 'center',
                  border: `1px solid ${settings.format === f ? 'var(--primary)' : 'var(--border)'}`,
                  background: settings.format === f ? 'rgba(var(--primary-rgb),0.12)' : 'rgba(255,255,255,0.03)',
                  color: settings.format === f ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: 800, fontSize: '0.72rem', cursor: 'pointer',
                }}
              >
                .{f.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="divider" />
          <div className="section-title">3D LUT COLOR GRADING</div>
          <select className="ctrl-select" value={settings.lut || 'none'} onChange={e => set('lut', e.target.value)}>
            <option value="none">None (Rec.709 Standard)</option>
            <option value="cinematic">Cinematic Teal & Orange</option>
            <option value="filmic">Filmic Pro (Log→Rec.709)</option>
            <option value="vintage">Vintage 35mm Film</option>
            <option value="cool">Cool Blue Noir</option>
            <option value="cyber">Cyber Neon Glow</option>
            <option value="golden">Golden Hour Warmth</option>
          </select>
        </div>
      )}

      {/* Sticky CTA */}
      <div style={{ padding: '0.85rem', marginTop: 'auto', borderTop: '1px solid var(--border)' }}>
        <button className="btn-primary" onClick={onUpscale} disabled={isProcessing}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#030712"><path d={D.sparkle}/></svg>
          {isProcessing ? 'AI PROCESSING…' : 'GENERATE AI UPSCALE'}
        </button>
      </div>
    </div>
  );
}

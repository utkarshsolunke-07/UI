import React from 'react';

const THEMES = [
  { value: 'obsidian',  label: '🌊 Obsidian Cyan' },
  { value: 'cyberpunk', label: '⚡ Cyberpunk Amber' },
  { value: 'emerald',   label: '💚 Emerald Mint' },
  { value: 'synthwave', label: '🌸 Neon Synthwave' },
];

const NAV_ITEMS = [
  { id: 'video', label: '🎥 VIDEO AI STUDIO' },
  { id: 'image', label: '🖼️ IMAGE AI STUDIO' },
];

export default function Header({ activeTab, setActiveTab, activeTheme, setActiveTheme }) {
  return (
    <header className="app-header" role="banner">
      <div className="hdr-inner">

        {/* ── Brand with 3D Quantum Logo ── */}
        <div className="brand">
          <div className="logo-3d-container" title="UTKARSH AI 3D ENGINE CORE">
            <div className="cube-3d">
              <div className="cube-face front">AI</div>
              <div className="cube-face back">8K</div>
              <div className="cube-face right">4K</div>
              <div className="cube-face left">⚡</div>
              <div className="cube-face top">★</div>
              <div className="cube-face bottom">U</div>
            </div>
          </div>
          <div>
            <div className="brand-name">UTKARSH AI UPSCALER</div>
            <div className="brand-ver">SOTA SUPER-RESOLUTION ENGINE v30.0</div>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="nav-pills" aria-label="Studio navigation">
          {NAV_ITEMS.map(({ id, label }) => (
            <button
              key={id}
              className={`nav-pill ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* ── Right Status & Controls ── */}
        <div className="hdr-right">
          <div className="status-badge" title="WebGPU Acceleration">
            <span className="s-dot" />
            <span>⚡ WEBGPU CORE ACTIVE</span>
            <div className="gpu-visualizer">
              <span className="v-bar v-bar-1" />
              <span className="v-bar v-bar-2" />
              <span className="v-bar v-bar-3" />
              <span className="v-bar v-bar-4" />
              <span className="v-bar v-bar-5" />
            </div>
          </div>

          <select
            className="theme-sel"
            value={activeTheme}
            onChange={e => setActiveTheme(e.target.value)}
            aria-label="Select theme"
          >
            {THEMES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

      </div>
    </header>
  );
}

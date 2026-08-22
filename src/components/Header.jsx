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
          <div className="logo-svg-container" title="UTKARSH AI NEURAL CORE">
            <svg viewBox="0 0 100 100" className="utkarsh-logo-svg" style={{ width: '44px', height: '44px', overflow: 'visible' }}>
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="50%" stopColor="var(--secondary)" />
                  <stop offset="100%" stopColor="#ff00ea" />
                </linearGradient>
                <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <circle cx="50" cy="50" r="42" fill="none" stroke="url(#logoGrad)" strokeWidth="1.5" strokeDasharray="8 6" className="ring-spin-slow" />
              <circle cx="50" cy="50" r="46" fill="none" stroke="url(#logoGrad)" strokeWidth="0.5" strokeDasharray="3 12" className="ring-spin-fast" opacity="0.6" />
              <polygon points="50,16 79,33 79,67 50,84 21,67 21,33" fill="rgba(var(--primary-rgb), 0.12)" stroke="url(#logoGrad)" strokeWidth="2.5" filter="url(#logoGlow)" className="hex-pulse" />
              <path d="M 36 38 L 36 54 C 36 62, 42 66, 50 66 C 58 66, 64 62, 64 54 L 64 38" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" filter="url(#logoGlow)" />
              <circle cx="50" cy="50" r="3.5" fill="#fbbf24" filter="url(#logoGlow)" className="core-blink" />
            </svg>
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

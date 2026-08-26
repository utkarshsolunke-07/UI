import React, { useState } from 'react';
import { getGeminiApiKey, setGeminiApiKey } from '../engine/geminiAiEngine';

const THEMES = [
  { value: 'obsidian',  label: '🌊 Obsidian Cyan' },
  { value: 'cyberpunk', label: '⚡ Cyberpunk Amber' },
  { value: 'aurora',    label: '🌌 Aurora Borealis' },
  { value: 'emerald',   label: '💚 Emerald Mint' },
  { value: 'synthwave', label: '🌸 Neon Synthwave' },
  { value: 'quantum',   label: '💠 Quantum Core (Ultra)' },
];


const NAV_ITEMS = [
  { id: 'video', label: '🎥 VIDEO AI STUDIO' },
  { id: 'image', label: '🖼️ IMAGE AI STUDIO' },
];

export default function Header({ activeTab, setActiveTab, activeTheme, setActiveTheme }) {
  const [geminiKey, setKey] = useState(getGeminiApiKey());
  const [showModal, setShowModal] = useState(false);

  const saveKey = () => {
    setGeminiApiKey(geminiKey);
    setShowModal(false);
  };

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
            <div className="brand-name glitch-text" data-text="UTKARSH AI UPSCALER">UTKARSH AI UPSCALER</div>
            <div className="brand-ver">SOTA SUPER-RESOLUTION ENGINE v32.0</div>
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
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '0.35rem 0.65rem', borderRadius: '8px',
              border: '1px solid rgba(66, 133, 244, 0.5)',
              background: 'rgba(66, 133, 244, 0.12)',
              color: '#4285f4', fontWeight: 800, fontSize: '0.68rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem'
            }}
          >
            ✨ GEMINI VISION AI
          </button>

          <div className="status-badge" title="WebGPU Acceleration">
            <span className="s-dot" />
            <span>⚡ WEBGPU CORE</span>
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

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: '420px', textAlign: 'left' }}>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>
              ✨ Google Gemini 1.5/2.0 Vision AI Key
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Enter your Google Gemini API key to enable real-time generative scene analysis & vision-guided AI super-resolution parameter auto-tuning.
            </div>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={e => setKey(e.target.value)}
              style={{
                width: '100%', padding: '0.65rem', borderRadius: '8px',
                background: '#090d16', border: '1px solid var(--border)',
                color: 'var(--text)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)',
                marginBottom: '1rem'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveKey}>Save API Key</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}


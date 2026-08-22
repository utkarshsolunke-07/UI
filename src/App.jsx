import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import VideoStudio from './components/VideoStudio';
import ImageStudio from './components/ImageStudio';
import { upscaleImage } from './engine/aiUpscalerEngine';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab]     = useState('video');
  const [activeTheme, setActiveTheme] = useState('cyberpunk');

  /* Image upscaling state */
  const [currentImage, setCurrentImage]     = useState(null);
  const [currentImgElem, setCurrentImgElem] = useState(null);
  const [upscaledResult, setUpscaledResult] = useState(null);
  const [isProcessing, setIsProcessing]     = useState(false);
  const [progress, setProgress]             = useState(0);
  const [statusMsg, setStatusMsg]           = useState('');

  const [settings, setSettings] = useState({
    scale: 4, model: 'utkarsh_omni_absolute', aiUpscale: true,
    sharpness: 70, denoise: 30, hdr: 40,
    clarity: 65, faceRestore: 65, clahe: 40,
    grain: 0, format: 'png', fps: 'original', lut: 'none', temp: 0,
    targetWidth: null, targetHeight: null,
  });

  /* Apply theme to body data-theme attribute */
  useEffect(() => {
    document.body.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  /* Interactive Mouse Spotlight Tracking */
  useEffect(() => {
    const handlePointerMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  /* ---- Image upload handler ---- */
  const handleImageSelected = (imageData) => {
    setCurrentImage(imageData);
    setUpscaledResult(null);

    const img = new Image();
    img.src = imageData.src;
    img.onload = () => {
      setCurrentImgElem(img);
      // Kick off auto-upscale once element is loaded
      setTimeout(() => runUpscale(imageData, settings, img), 100);
    };
  };

  /* ---- Core upscale runner ---- */
  const runUpscale = async (imgObj, cfg, imgEl) => {
    if (!imgObj || !imgEl || isProcessing) return;

    setIsProcessing(true);
    setProgress(5);
    setStatusMsg('Initialising UTKARSH MASTER ENGINE pipeline…');

    try {
      const result = await upscaleImage(imgEl, cfg, (p, msg) => {
        setProgress(p);
        setStatusMsg(msg);
      });
      setUpscaledResult(result);

      confetti({
        particleCount: 80, spread: 80, origin: { y: 0.75 },
        colors: ['#00f2fe', '#a855f7', '#4facfe', '#00e676', '#ff00ea'],
      });
    } catch (err) {
      console.error('Upscale failed:', err);
      alert(`⚠️ Upscale failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  /* Called from ImageStudio "Upscale" button */
  const triggerUpscale = () => {
    if (currentImage && currentImgElem) {
      runUpscale(currentImage, settings, currentImgElem);
    }
  };

  /* Download handler */
  const handleDownload = () => {
    const url  = upscaledResult?.dataUrl ?? currentImage?.src;
    const base = currentImage?.name?.replace(/\.[^.]+$/, '') || 'image';
    if (!url) return;
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: `Utkarsh_AI_${settings.scale}x_${base}.${settings.format}`,
    });
    a.click();
  };

  const handleResetImage = () => {
    setCurrentImage(null);
    setCurrentImgElem(null);
    setUpscaledResult(null);
  };

  return (
    <>
      {/* Interactive Mouse Spotlight Radial Glow */}
      <div className="mouse-spotlight" aria-hidden="true" />

      {/* Cyber CRT Scanline Shader Overlay */}
      <div className="cyber-scanlines" aria-hidden="true" />

      {/* Background Ambient Glow Orbs */}
      <div className="bg-deco" aria-hidden="true">
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
      </div>

      <div className="app-shell">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeTheme={activeTheme}
          setActiveTheme={setActiveTheme}
        />

        <main className="main-content">
          {activeTab === 'video' && (
            <VideoStudio settings={settings} setSettings={setSettings} />
          )}
          {activeTab === 'image' && (
            <ImageStudio
              currentImage={currentImage}
              handleImageSelected={handleImageSelected}
              settings={settings}
              setSettings={setSettings}
              triggerUpscale={triggerUpscale}
              isProcessing={isProcessing}
              currentImgElem={currentImgElem}
              upscaledResult={upscaledResult}
              progress={progress}
              statusMessage={statusMsg}
              handleResetImage={handleResetImage}
              handleDownload={handleDownload}
            />
          )}
        </main>

        {/* Processing Modal */}
        {isProcessing && (
          <div className="modal-backdrop" role="dialog" aria-modal="true">
            <div className="modal-box">
              <div className="modal-ring-wrap">
                <div className="modal-ring" />
                <div className="modal-pct">{progress}%</div>
              </div>
              <div className="modal-title">Upscaling 4K Sub-Pixels</div>
              <div className="modal-sub">{statusMsg}</div>
              <div className="prog-track" style={{ width: 280 }}>
                <div className="prog-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="modal-stats">
                {[
                  { l: 'ENGINE', v: 'UTKARSH MASTER' },
                  { l: 'SCALE', v: `${settings.scale}×` },
                  { l: 'STAGE', v: `${progress}%` },
                ].map(({ l, v }) => (
                  <div className="mstat" key={l}>
                    <div className="mstat-label">{l}</div>
                    <div className="mstat-val">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

import React, { useState, useRef } from 'react';

const ICO = {
  play: 'M8 5v14l11-7z',
  pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
  close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  download: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
  fullscreen: 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z'
};

export default function PostRenderPlayer({ url, fps, resolutionLabel, videoName, onClose }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) videoRef.current.currentTime = time;
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) videoRef.current.requestFullscreen();
      else if (videoRef.current.webkitRequestFullscreen) videoRef.current.webkitRequestFullscreen();
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#090d16', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(var(--primary-rgb),0.4)', width: '90%', maxWidth: '1000px', boxShadow: '0 0 40px rgba(var(--primary-rgb), 0.2)', position: 'relative' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)', fontWeight: 800 }}>UTKARSH AI FINAL OUTPUT</h2>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{videoName}</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.5rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d={ICO.close}/></svg>
          </button>
        </div>

        {/* Video Stage */}
        <div style={{ position: 'relative', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
          
          {/* Overlaid Badges */}
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
            <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(var(--primary-rgb), 0.5)', color: 'var(--primary)', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: '#fbbf24' }}>★</span> {resolutionLabel}
            </div>
            <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(168, 85, 247, 0.5)', color: '#a855f7', fontWeight: 800, fontSize: '0.75rem' }}>
              {fps} FPS
            </div>
          </div>

          <video
            ref={videoRef}
            src={url}
            autoPlay
            controls={false}
            style={{ width: '100%', maxHeight: '60vh', display: 'block' }}
            onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
          />

          {/* Controls Overlay */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '2rem 1rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: 1, transition: 'opacity 0.3s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button onClick={togglePlay} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d={isPlaying ? ICO.pause : ICO.play}/></svg>
              </button>
              
              <input 
                type="range" 
                min="0" 
                max={duration || 100} 
                step="0.01" 
                value={currentTime} 
                onChange={handleSeek} 
                className="ctrl-slider"
                style={{ flex: 1, accentColor: 'var(--primary)' }} 
              />
              
              <span style={{ color: 'white', fontSize: '0.8rem', fontFamily: 'monospace', minWidth: '80px', textAlign: 'right' }}>
                {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
              </span>

              <button onClick={toggleFullscreen} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d={ICO.fullscreen}/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '1rem' }}>
          <a href={url} download={videoName} className="btn-primary" style={{ textDecoration: 'none', padding: '0.8rem 1.5rem', fontSize: '0.9rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '0.5rem' }}><path d={ICO.download}/></svg>
            DOWNLOAD FULL VIDEO
          </a>
        </div>

      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { SAMPLE_IMAGES } from '../utils/sampleImages';

export default function ImageDropzone({ onImageSelected }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const src = evt.target.result;
      const img = new Image();
      img.onload = () => {
        onImageSelected({
          src,
          name: file.name,
          size: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
          type: file.type,
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleSampleClick = (sample) => {
    const img = new Image();
    img.onload = () => {
      onImageSelected({
        src: sample.src,
        name: sample.name,
        size: 512000,
        width: img.naturalWidth,
        height: img.naturalHeight,
        type: 'image/png',
      });
    };
    img.src = sample.src;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 180px)', padding: '2rem' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div
        className={`dz-full ${isDragOver ? 'dz-over' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
        }}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          maxWidth: '820px', width: '100%', minHeight: '440px', borderRadius: '24px',
          border: '2px dashed rgba(var(--primary-rgb), 0.3)', background: 'rgba(var(--primary-rgb), 0.03)',
          cursor: 'pointer', textAlign: 'center', padding: '3rem 2rem', gap: '1.2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', transition: 'all 0.25s ease'
        }}
      >
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(var(--primary-rgb), 0.15)', border: '2px solid rgba(var(--primary-rgb), 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--primary)' }}>
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
          </svg>
        </div>

        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.4rem', color: 'var(--text)' }}>
            Drag & Drop Image to Upscale
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto', lineHeight: 1.6 }}>
            Supports PNG, JPG, WebP. Utkarsh AI multi-pass super-resolution will automatically enhance micro-details & resolution.
          </p>
        </div>

        <div style={{ marginTop: '0.5rem' }}>
          <button className="btn-primary" style={{ padding: '0.75rem 2rem', width: 'auto' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#030712">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            BROWSE LOCAL FILES
          </button>
        </div>

        {/* Demo Samples */}
        <div style={{ marginTop: '1rem', width: '100%' }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.6rem', letterSpacing: '0.08em' }}>
            OR TEST WITH HIGH-RES SAMPLE DEMOS:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
            {SAMPLE_IMAGES.map((sample) => (
              <button
                key={sample.id}
                className="dz-chip"
                onClick={() => handleSampleClick(sample)}
                style={{
                  padding: '0.4rem 0.85rem', borderRadius: '99px',
                  border: '1px solid rgba(var(--primary-rgb), 0.3)',
                  background: 'rgba(var(--primary-rgb), 0.08)', color: 'var(--primary)',
                  fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                {sample.name} ({sample.tag})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

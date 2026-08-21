import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Video, Sparkles, Clipboard, CheckCircle2 } from 'lucide-react';
import { SAMPLE_ASSETS } from '../engine/samples';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  onSampleSelect: (sampleUrl: string, title: string) => void;
  onBatchFilesSelect?: (files: File[]) => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileSelect,
  onSampleSelect,
  onBatchFilesSelect,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Paste from clipboard handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
          onFileSelect(file);
          setCopiedNotification(true);
          setTimeout(() => setCopiedNotification(false), 3000);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files.length > 1 && onBatchFilesSelect) {
        const validFiles = Array.from(e.dataTransfer.files).filter(
          (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
        );
        onBatchFilesSelect(validFiles);
      } else {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
          onFileSelect(file);
        }
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (e.target.files.length > 1 && onBatchFilesSelect) {
        const validFiles = Array.from(e.target.files).filter(
          (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
        );
        onBatchFilesSelect(validFiles);
      } else {
        onFileSelect(e.target.files[0]);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Clipboard paste Toast notification */}
      {copiedNotification && (
        <div className="flex items-center justify-center space-x-2 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>Image pasted directly from clipboard! Processing...</span>
        </div>
      )}

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 lg:p-12 glass-panel border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 group ${
          isDragging
            ? 'border-violet-500 bg-violet-500/10 scale-[1.01] shadow-2xl'
            : 'border-slate-700/80 hover:border-violet-500/60 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/gif, video/mp4, video/webm"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />

        {/* Central Icon */}
        <div className="relative mb-5 p-5 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-cyan-500/20 border border-violet-500/30 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-10 h-10 text-violet-400 group-hover:text-cyan-300 transition-colors" />
          <div className="absolute -top-1 -right-1 p-1 bg-cyan-500 rounded-full text-slate-950">
            <Sparkles className="w-3 h-3" />
          </div>
        </div>

        {/* Text */}
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 text-center">
          Drop image or video here, or <span className="text-cyan-400 underline decoration-cyan-500/40">Browse Files</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 text-center max-w-md mb-6">
          Supports PNG, JPG, WebP, GIF, MP4, WebM up to 4K resolution. Preserves privacy with 100% client-side AI processing.
        </p>

        {/* Shortcuts pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700">
            <ImageIcon className="w-3.5 h-3.5 text-violet-400" />
            <span>Image Upscaling (2x, 4x, 8x)</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700">
            <Video className="w-3.5 h-3.5 text-cyan-400" />
            <span>Video AI Super-Res</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700">
            <Clipboard className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paste Ctrl+V</span>
          </div>
        </div>
      </div>

      {/* Quick Sample Selector Section */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Test Samples</span>
          </span>
          <span className="text-[11px] text-slate-500">Click any image to test upscaling</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SAMPLE_ASSETS.map((sample) => (
            <div
              key={sample.id}
              onClick={(e) => {
                e.stopPropagation();
                onSampleSelect(sample.url, sample.title);
              }}
              className="group relative overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900 cursor-pointer hover:border-violet-500/70 transition-all hover:scale-[1.02]"
            >
              <img
                src={sample.url}
                alt={sample.title}
                className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-white truncate">{sample.title}</span>
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-violet-500/30 text-violet-200 border border-violet-500/40">
                  {sample.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

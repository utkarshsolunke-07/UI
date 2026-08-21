import React from 'react';
import { Sparkles, Layers, History, Image as ImageIcon, Cpu, Video } from 'lucide-react';

interface NavbarProps {
  onOpenSamples: () => void;
  onOpenBatch: () => void;
  onToggleHistory: () => void;
  historyCount: number;
  batchCount: number;
  activeMode: 'single' | 'video' | 'batch';
  setActiveMode: (mode: 'single' | 'video' | 'batch') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSamples,
  onOpenBatch,
  onToggleHistory,
  historyCount,
  batchCount,
  activeMode,
  setActiveMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveMode('single')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl gradient-button shadow-lg">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-white">AuraScale</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                AI v4.2
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Neural Super-Resolution & Video Upscaler</p>
          </div>
        </div>

        {/* Mode Selector Navigation */}
        <nav className="hidden md:flex items-center p-1 bg-slate-900/80 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveMode('single')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'single'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Image Upscaler</span>
          </button>

          <button
            onClick={() => setActiveMode('video')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'video'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video AI 4K</span>
            <span className="text-[10px] bg-cyan-500/30 text-cyan-200 px-1.5 py-0.2 rounded font-mono">NEW</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('batch');
              onOpenBatch();
            }}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'batch'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Batch Queue</span>
            {batchCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                {batchCount}
              </span>
            )}
          </button>
        </nav>

        {/* Header Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSamples}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Try Samples</span>
          </button>

          <button
            onClick={onToggleHistory}
            className="relative flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
          >
            <History className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-violet-500 text-white font-bold text-[10px] flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          <div className="hidden xl:flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-mono">
            <Cpu className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
            <span>WebGL GPU Accelerated</span>
          </div>
        </div>
      </div>
    </header>
  );
};

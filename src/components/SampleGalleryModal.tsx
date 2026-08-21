import React from 'react';
import { SAMPLE_ASSETS } from '../engine/samples';
import { Sparkles, X, ArrowRight } from 'lucide-react';

interface SampleGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (url: string, title: string) => void;
}

export const SampleGalleryModal: React.FC<SampleGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl glass-panel border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Interactive Sample Asset Gallery</h3>
              <p className="text-xs text-slate-400">
                Select a low-resolution sample image to test AI super-resolution algorithms
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SAMPLE_ASSETS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => {
                onSelectSample(sample.url, sample.title);
                onClose();
              }}
              className="group relative flex flex-col p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-violet-500/70 transition-all cursor-pointer hover:scale-[1.01]"
            >
              <div className="relative h-40 w-full rounded-xl overflow-hidden mb-3 bg-slate-950">
                <img
                  src={sample.url}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-slate-950/80 text-[10px] font-bold text-violet-300 border border-violet-500/30">
                  {sample.category}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {sample.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1">{sample.description}</p>
                </div>

                <div className="p-2 rounded-xl bg-violet-600/20 text-violet-300 group-hover:bg-violet-600 group-hover:text-white transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

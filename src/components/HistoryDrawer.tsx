import React from 'react';
import type { HistoryItem } from '../types';
import { History, Download, Trash2, X, Calendar } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onClearHistory: () => void;
  onSelectHistory: (item: HistoryItem) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onSelectHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md h-full glass-panel border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Upscale Session History</h3>
                <p className="text-xs text-slate-400">{history.length} saved results</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] pr-1">
            {history.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs font-mono">
                No upscaling history yet. Upscale an image to save results.
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectHistory(item);
                    onClose();
                  }}
                  className="group relative flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-violet-500/60 transition cursor-pointer"
                >
                  <img
                    src={item.upscaledUrl}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-700 bg-slate-950"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {item.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono mt-0.5">
                      <span className="text-violet-400 font-bold">{item.settings.scale}x Upscaled</span>
                      <span>•</span>
                      <span>{item.metadata.upscaledWidth} × {item.metadata.upscaledHeight}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[10px] text-slate-500 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <a
                    href={item.upscaledUrl}
                    download={`AuraScale_${item.settings.scale}x_${item.name}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-slate-800 hover:bg-violet-600 text-slate-300 hover:text-white rounded-xl transition"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={onClearHistory}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

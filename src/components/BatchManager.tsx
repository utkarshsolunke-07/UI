import React, { useState } from 'react';
import type { BatchItem, UpscaleSettings } from '../types';
import { upscaleImage, canvasToBlob } from '../engine/upscaler';
import { Layers, Play, CheckCircle2, AlertCircle, Download, Trash2, X } from 'lucide-react';

interface BatchManagerProps {
  isOpen: boolean;
  onClose: () => void;
  items: BatchItem[];
  setItems: React.Dispatch<React.SetStateAction<BatchItem[]>>;
  settings: UpscaleSettings;
}

export const BatchManager: React.FC<BatchManagerProps> = ({
  isOpen,
  onClose,
  items,
  setItems,
  settings,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const startBatchProcess = async () => {
    setIsProcessing(true);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.status === 'completed') continue;

      // Update status to processing
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'processing', progress: 20 } : it))
      );

      try {
        const img = new Image();
        img.src = item.previewUrl;
        await new Promise((res) => (img.onload = res));

        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, progress: 60 } : it))
        );

        const { upscaledCanvas } = await upscaleImage(img, settings);

        const blob = await canvasToBlob(upscaledCanvas, settings.outputFormat, settings.outputQuality);
        const upscaledUrl = URL.createObjectURL(blob);

        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? { ...it, status: 'completed', progress: 100, upscaledUrl }
              : it
          )
        );
      } catch (err: any) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? { ...it, status: 'error', error: err.message || 'Processing failed' }
              : it
          )
        );
      }
    }

    setIsProcessing(false);
  };

  const completedCount = items.filter((i) => i.status === 'completed').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl glass-panel border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Batch Image Queue</h3>
              <p className="text-xs text-slate-400">
                {items.length} items queued • {completedCount} completed
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

        {/* Item List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 my-2">
          {items.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono">
              No files in batch queue. Drag multiple files to add.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-950"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white truncate max-w-xs">{item.file.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {(item.file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Status Indicator */}
                  {item.status === 'pending' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      Pending
                    </span>
                  )}
                  {item.status === 'processing' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                      Processing... {item.progress}%
                    </span>
                  )}
                  {item.status === 'completed' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Ready</span>
                    </span>
                  )}
                  {item.status === 'error' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Failed</span>
                    </span>
                  )}

                  {/* Individual Download */}
                  {item.upscaledUrl && (
                    <a
                      href={item.upscaledUrl}
                      download={`AuraScale_${item.file.name}`}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                      title="Download Upscaled Image"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-2">
          <button
            onClick={() => setItems([])}
            className="text-xs text-slate-400 hover:text-rose-400 transition font-medium"
          >
            Clear Queue
          </button>

          <button
            onClick={startBatchProcess}
            disabled={isProcessing || items.length === 0}
            className="flex items-center space-x-2 px-6 py-2.5 gradient-button rounded-xl font-bold text-white text-xs shadow-lg disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isProcessing ? 'Processing Queue...' : 'Start Batch Upscale'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

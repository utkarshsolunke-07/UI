import React from 'react';
import type { UpscaleSettings, ModelPreset, ScaleFactor, ImageMetadata } from '../types';
import { Sliders, Sparkles, Image as ImageIcon, Zap, FileText, Film, Info } from 'lucide-react';

interface ControlPanelProps {
  settings: UpscaleSettings;
  onChange: (newSettings: UpscaleSettings) => void;
  metadata: ImageMetadata | null;
  isProcessing: boolean;
  onApplyUpscale: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  onChange,
  metadata,
  isProcessing,
  onApplyUpscale,
}) => {
  const updateSetting = <K extends keyof UpscaleSettings>(key: K, value: UpscaleSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const handlePresetSelect = (preset: ModelPreset) => {
    let presetDefaults: Partial<UpscaleSettings> = { preset };
    if (preset === 'photo') {
      presetDefaults = { preset, sharpening: 45, denoise: 25, clarity: 35, hdrEnhance: 20 };
    } else if (preset === 'anime') {
      presetDefaults = { preset, sharpening: 60, denoise: 65, clarity: 15, hdrEnhance: 10 };
    } else if (preset === 'text') {
      presetDefaults = { preset, sharpening: 85, denoise: 40, clarity: 60, hdrEnhance: 0 };
    } else if (preset === 'cinematic') {
      presetDefaults = { preset, sharpening: 35, denoise: 30, clarity: 40, hdrEnhance: 35 };
    } else if (preset === 'fast') {
      presetDefaults = { preset, sharpening: 20, denoise: 10, clarity: 10, hdrEnhance: 0 };
    }
    onChange({ ...settings, ...presetDefaults });
  };

  return (
    <div className="w-full glass-panel p-5 rounded-3xl border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">AI Super-Resolution Engine</h3>
            <p className="text-[11px] text-slate-400">Fine-tune model parameters and scale factors</p>
          </div>
        </div>

        <button
          onClick={onApplyUpscale}
          disabled={isProcessing}
          className="flex items-center space-x-2 px-5 py-2 gradient-button rounded-xl text-xs font-bold text-white shadow-lg disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isProcessing ? 'Processing...' : 'Apply AI Upscale'}</span>
        </button>
      </div>

      {/* 1. Scale Factor Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span>Upscale Scale Factor</span>
          <span className="text-[11px] font-mono text-cyan-400">{settings.scale}x Magnification</span>
        </label>

        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
          {([2, 4, 8] as ScaleFactor[]).map((scale) => (
            <button
              key={scale}
              onClick={() => updateSetting('scale', scale)}
              className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
                settings.scale === scale
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {scale}x Scale
            </button>
          ))}
        </div>
      </div>

      {/* 2. Model Presets Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Select AI Model Preset
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { id: 'photo', name: 'Photo Realism', icon: ImageIcon, desc: 'Skin & natural details' },
            { id: 'anime', name: 'Anime & Art', icon: Sparkles, desc: 'Vector line anti-aliasing' },
            { id: 'text', name: 'Text & Document', icon: FileText, desc: 'OCR & edge crisping' },
            { id: 'cinematic', name: 'Cinematic HDR', icon: Film, desc: 'Color depth & highlights' },
            { id: 'fast', name: 'Fast WebGL', icon: Zap, desc: 'Real-time GPU shader' },
          ].map((preset) => {
            const IconComponent = preset.icon;
            const isSelected = settings.preset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id as ModelPreset)}
                className={`flex flex-col items-start p-3 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? 'bg-violet-600/20 border-violet-500/60 text-white shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">{preset.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 line-clamp-1">{preset.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Parameter Sliders */}
      <div className="space-y-4 pt-2 border-t border-slate-800/80">
        {/* Sharpening */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">CAS Sharpening Intensity</span>
            <span className="font-mono text-violet-400 font-bold">{settings.sharpening}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.sharpening}
            onChange={(e) => updateSetting('sharpening', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Denoise */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Bilateral Edge Denoise</span>
            <span className="font-mono text-cyan-400 font-bold">{settings.denoise}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.denoise}
            onChange={(e) => updateSetting('denoise', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* High Frequency Clarity */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Micro-Texture Synthesis (Clarity)</span>
            <span className="font-mono text-emerald-400 font-bold">{settings.clarity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.clarity}
            onChange={(e) => updateSetting('clarity', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* HDR Enhancements */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">HDR Dynamic Range Boost</span>
            <span className="font-mono text-amber-400 font-bold">{settings.hdrEnhance}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.hdrEnhance}
            onChange={(e) => updateSetting('hdrEnhance', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* 4. Output Settings */}
      <div className="pt-2 border-t border-slate-800/80 space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span>Export Format & Quality</span>
        </label>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {(['image/png', 'image/webp', 'image/jpeg'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => updateSetting('outputFormat', fmt)}
                className={`px-3 py-1 rounded-lg font-mono font-semibold uppercase transition ${
                  settings.outputFormat === fmt
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {fmt.split('/')[1]}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
            <span>Quality:</span>
            <select
              value={settings.outputQuality}
              onChange={(e) => updateSetting('outputQuality', Number(e.target.value))}
              className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl px-2 py-1"
            >
              <option value={1.0}>100% (Lossless)</option>
              <option value={0.9}>90% (High)</option>
              <option value={0.8}>80% (Medium)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Real-time Metadata Inspector Card */}
      {metadata && (
        <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/90 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400 font-semibold border-b border-slate-800/60 pb-2">
            <span className="flex items-center space-x-1 text-slate-300">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upscale Metadata</span>
            </span>
            <span className="font-mono text-emerald-400">{metadata.megapixels} Megapixels</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div>
              <span className="text-slate-500 block">Input Resolution:</span>
              <span className="font-mono text-slate-300">{metadata.originalWidth} × {metadata.originalHeight}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Output Resolution:</span>
              <span className="font-mono text-cyan-300 font-bold">{metadata.upscaledWidth} × {metadata.upscaledHeight}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Original Size:</span>
              <span className="font-mono text-slate-300">{metadata.originalSizeFormatted}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Processing Time:</span>
              <span className="font-mono text-violet-300">{metadata.processingTimeMs ? `${metadata.processingTimeMs} ms` : 'Instant'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

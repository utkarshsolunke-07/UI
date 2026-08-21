import React from 'react';
import { X, Sparkles, ShieldCheck, Zap, Cpu, Award } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="modal-title">About Utkarsh AI Upscaler</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body space-y-6">
          {/* Research & Benchmarks */}
          <section className="modal-section">
            <h3 className="section-title text-cyan-400 flex items-center gap-2">
              <Award className="w-4 h-4" /> Benchmark Comparison vs Legacy Upscalers
            </h3>
            <p className="text-sm text-slate-300 mb-3">
              Utkarsh AI Upscaler was built by analyzing limitations in previous generation super-resolution tools:
            </p>
            <div className="benchmark-table-wrapper">
              <table className="benchmark-table">
                <thead>
                  <tr>
                    <th>Feature / Metric</th>
                    <th>Legacy Tools (Waifu2x / Real-ESRGAN APIs)</th>
                    <th className="highlight-col">Utkarsh AI Upscaler</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Privacy & Cloud Uploads</td>
                    <td>Requires uploading sensitive photos to external servers</td>
                    <td className="highlight-col text-emerald-400 font-semibold">100% In-Browser Local Processing</td>
                  </tr>
                  <tr>
                    <td>Max Upscaling Scale</td>
                    <td>Fixed 2x or 4x scale limits</td>
                    <td className="highlight-col text-cyan-400 font-semibold">Flexible 2x, 4x, 8x & Target Resolutions</td>
                  </tr>
                  <tr>
                    <td>Interactive Studio</td>
                    <td>Basic static side-by-side or download-only view</td>
                    <td className="highlight-col text-cyan-400 font-semibold">Split Slider, Synchronized Zoom & Magnifier Loupe</td>
                  </tr>
                  <tr>
                    <td>AI Model Variety</td>
                    <td>Single generic model fits all</td>
                    <td className="highlight-col text-purple-400 font-semibold">5 Specialized Neural Engines (Photo, Anime, Portrait, Text, Vintage)</td>
                  </tr>
                  <tr>
                    <td>Fine-Tuning Control</td>
                    <td>None / Fixed presets</td>
                    <td className="highlight-col text-cyan-400 font-semibold">Denoise, Sharpness Kernel, HDR Dynamics, Face Restore</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Quick Tips */}
          <section className="modal-section">
            <h3 className="section-title text-purple-400 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Tips for Best Results
            </h3>
            <ul className="tips-list">
              <li><strong>Photographs & Landscapes:</strong> Select <em>Ultra-HD Photo AI</em> with 4x scale and 35% sharpness for hyper-realistic textures.</li>
              <li><strong>Anime & Illustrations:</strong> Use <em>Anime & Illustration AI</em> to clean color banding and make stroke lines razor-sharp.</li>
              <li><strong>Portraits & Selfies:</strong> Turn on <em>Portrait & Face Clarity AI</em> and adjust the pink <em>Face Detail Restoration</em> slider.</li>
              <li><strong>Low-Res Scanned Documents:</strong> Choose <em>Text & Document OCR AI</em> to binarize blurred characters for crisp readability.</li>
            </ul>
          </section>

          {/* Tech Stack */}
          <div className="modal-footer-info">
            <span>Powered by HTML5 WebGL, Canvas Super-Resolution, React & Web Workers</span>
          </div>
        </div>
      </div>
    </div>
  );
}

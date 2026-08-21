import { useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Dropzone } from './components/Dropzone';
import { SplitViewer } from './components/SplitViewer';
import { ControlPanel } from './components/ControlPanel';
import { VideoPreview } from './components/VideoPreview';
import { BatchManager } from './components/BatchManager';
import { SampleGalleryModal } from './components/SampleGalleryModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import type { UpscaleSettings, ImageMetadata, BatchItem, HistoryItem } from './types';
import { upscaleImage, canvasToBlob, getImageMetadata } from './engine/upscaler';
import { Sparkles, ArrowLeft, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

const DEFAULT_SETTINGS: UpscaleSettings = {
  scale: 4,
  preset: 'photo',
  sharpening: 45,
  denoise: 25,
  clarity: 35,
  faceRefine: true,
  hdrEnhance: 20,
  saturation: 10,
  outputFormat: 'image/png',
  outputQuality: 0.9,
};

export function App() {
  const [activeMode, setActiveMode] = useState<'single' | 'video' | 'batch'>('single');
  const [settings, setSettings] = useState<UpscaleSettings>(DEFAULT_SETTINGS);

  // Loaded Single Media File State
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalCanvas, setOriginalCanvas] = useState<HTMLCanvasElement | null>(null);
  const [upscaledCanvas, setUpscaledCanvas] = useState<HTMLCanvasElement | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Drawers State
  const [isSampleOpen, setIsSampleOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Run AI Upscale on current loaded image
  const runUpscale = useCallback(
    async (imgToProcess?: HTMLImageElement, currentSet?: UpscaleSettings) => {
      const targetImg = imgToProcess || originalImage;
      const targetSettings = currentSet || settings;

      if (!targetImg) return;

      setIsProcessing(true);
      try {
        const { upscaledCanvas: resultCanvas, processingTimeMs } = await upscaleImage(targetImg, targetSettings);

        setUpscaledCanvas(resultCanvas);

        // Update metadata stats
        const meta = getImageMetadata(
          currentFile || { name: 'Sample Image', width: targetImg.naturalWidth, height: targetImg.naturalHeight },
          targetSettings,
          processingTimeMs
        );
        setMetadata(meta);

        // Convert result to blob URL for history saving
        const blob = await canvasToBlob(resultCanvas, targetSettings.outputFormat, targetSettings.outputQuality);
        const upscaledUrl = URL.createObjectURL(blob);

        // Save to History
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          name: meta.name,
          originalUrl: targetImg.src,
          upscaledUrl,
          metadata: meta,
          settings: targetSettings,
          timestamp: Date.now(),
        };

        setHistory((prev) => [newHistoryItem, ...prev.slice(0, 19)]); // Store up to 20 recent items
      } catch (err: any) {
        showToast('Upscaling failed: ' + (err.message || 'Unknown error'));
      } finally {
        setIsProcessing(false);
      }
    },
    [originalImage, settings, currentFile]
  );

  // Load File Handler
  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('video/')) {
      setCurrentFile(file);
      setActiveMode('video');
      return;
    }

    setCurrentFile(file);
    setActiveMode('single');

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);

        // Create original canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        setOriginalCanvas(canvas);

        // Automatically trigger upscale on initial load
        runUpscale(img, settings);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Load Sample Image Handler
  const handleSampleSelect = (sampleUrl: string, title: string) => {
    setCurrentFile(null);
    setActiveMode('single');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOriginalImage(img);

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      setOriginalCanvas(canvas);

      runUpscale(img, settings);
      showToast(`Loaded ${title} sample image!`);
    };
    img.src = sampleUrl;
  };

  // Multiple Batch Files Handler
  const handleBatchFilesSelect = (files: File[]) => {
    const newItems: BatchItem[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
    }));

    setBatchItems((prev) => [...prev, ...newItems]);
    setActiveMode('batch');
    setIsBatchOpen(true);
    showToast(`Added ${files.length} images to batch queue.`);
  };

  // Download upscaled file
  const handleDownload = async () => {
    if (!upscaledCanvas) return;
    const blob = await canvasToBlob(upscaledCanvas, settings.outputFormat, settings.outputQuality);
    const url = URL.createObjectURL(blob);
    const ext = settings.outputFormat.split('/')[1];

    const link = document.createElement('a');
    link.href = url;
    link.download = `AuraScale_${settings.scale}x_${metadata?.name.split('.')[0] || 'upscaled'}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Upscaled image saved successfully!');
  };

  const handleReset = () => {
    setOriginalImage(null);
    setOriginalCanvas(null);
    setUpscaledCanvas(null);
    setMetadata(null);
    setCurrentFile(null);
  };

  return (
    <div className="min-h-screen flex flex-col pb-12">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-2 px-4 py-3 bg-violet-900/90 text-violet-100 border border-violet-500/50 rounded-2xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Navbar Header */}
      <Navbar
        onOpenSamples={() => setIsSampleOpen(true)}
        onOpenBatch={() => setIsBatchOpen(true)}
        onToggleHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        batchCount={batchItems.length}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 space-y-8">
        {/* Section 1: Dropzone (No media loaded) */}
        {!originalImage && activeMode !== 'video' && (
          <Dropzone
            onFileSelect={handleFileSelect}
            onSampleSelect={handleSampleSelect}
            onBatchFilesSelect={handleBatchFilesSelect}
          />
        )}

        {/* Section 2: Image Upscaler Workspace */}
        {originalImage && activeMode === 'single' && (
          <div className="space-y-6">
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Upload Dropzone</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Interactive Split Viewer */}
              <div className="lg:col-span-2">
                <SplitViewer
                  originalCanvas={originalCanvas}
                  upscaledCanvas={upscaledCanvas}
                  isProcessing={isProcessing}
                  onDownload={handleDownload}
                  onReset={handleReset}
                  scale={settings.scale}
                />
              </div>

              {/* Right Col: AI Tuning Controls */}
              <div className="lg:col-span-1">
                <ControlPanel
                  settings={settings}
                  onChange={(newSet) => {
                    setSettings(newSet);
                    runUpscale(originalImage, newSet);
                  }}
                  metadata={metadata}
                  isProcessing={isProcessing}
                  onApplyUpscale={() => runUpscale(originalImage, settings)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Video AI Super-Resolution Mode */}
        {activeMode === 'video' && currentFile && (
          <VideoPreview
            videoFile={currentFile}
            settings={settings}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Feature Badges Footer */}
      <footer className="mt-16 border-t border-slate-800/80 pt-8 text-center text-xs text-slate-500 max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-6 mb-4 font-mono text-slate-400">
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Client-Side Private Processing</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>WebGL & Hardware Accelerated CAS</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>2x, 4x, 8x Super-Resolution</span>
          </span>
        </div>
        <p>AuraScale AI • Neural Image & Video Super Resolution Web Application</p>
      </footer>

      {/* Modals & Drawers */}
      <SampleGalleryModal
        isOpen={isSampleOpen}
        onClose={() => setIsSampleOpen(false)}
        onSelectSample={handleSampleSelect}
      />

      <BatchManager
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        items={batchItems}
        setItems={setBatchItems}
        settings={settings}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={() => setHistory([])}
        onSelectHistory={(item) => {
          handleSampleSelect(item.upscaledUrl, item.name);
        }}
      />
    </div>
  );
}

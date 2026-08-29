import React, { useState, useRef } from 'react';
import { Film, UploadCloud, Play, Download, Trash2, CheckCircle2, RefreshCw, Sparkles, Layers, Zap } from 'lucide-react';
import { exportOfflineVideo } from '../engine/offlineExportEngine';

export default function VideoBatchQueue({ globalSettings }) {
  const [videoQueue, setVideoQueue] = useState([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const addFilesToQueue = (files) => {
    const validFiles = Array.from(files || []).filter((file) => file.type.startsWith('video/'));
    if (!validFiles.length) return;

    const newItems = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      name: file.name,
      size: file.size,
      status: 'pending', // 'pending' | 'processing' | 'completed' | 'failed'
      progress: 0,
      statusMsg: 'Queued',
      exportedUrl: null,
      srcUrl: URL.createObjectURL(file),
    }));

    setVideoQueue((prev) => [...prev, ...newItems]);
  };

  const handleVideoFilesSelected = (e) => {
    addFilesToQueue(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      addFilesToQueue(e.dataTransfer.files);
    }
  };

  const handleRemoveItem = (id) => {
    setVideoQueue((prev) => {
      const item = prev.find(i => i.id === id);
      if (item) {
        if (item.srcUrl) URL.revokeObjectURL(item.srcUrl);
        if (item.exportedUrl) URL.revokeObjectURL(item.exportedUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleClearAll = () => {
    videoQueue.forEach(item => {
      if (item.srcUrl) URL.revokeObjectURL(item.srcUrl);
      if (item.exportedUrl) URL.revokeObjectURL(item.exportedUrl);
    });
    setVideoQueue([]);
  };

  const handleProcessBatch = async () => {
    if (!videoQueue.length || isProcessingBatch) return;

    setIsProcessingBatch(true);
    const scale = globalSettings.scale || 2;

    for (let i = 0; i < videoQueue.length; i++) {
      const item = videoQueue[i];
      if (item.status === 'completed') continue;

      setVideoQueue((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'processing', progress: 5, statusMsg: 'Initializing Video...' } : it))
      );

      try {
        const video = document.createElement('video');
        video.muted = true;
        video.preload = 'auto';
        video.src = item.srcUrl;
        video.load();

        if (video.readyState < 2) {
          await new Promise((resolve, reject) => {
            const t = setTimeout(() => resolve(), 3000);
            video.onloadeddata = () => { clearTimeout(t); resolve(); };
            video.oncanplay = () => { clearTimeout(t); resolve(); };
            video.onerror = () => { clearTimeout(t); reject(new Error('Failed to load video data')); };
          });
        }

        const canvas = document.createElement('canvas');
        canvas.width = (video.videoWidth || 480) * scale;
        canvas.height = (video.videoHeight || 270) * scale;

        const { videoUrl } = await exportOfflineVideo(
          video,
          canvas,
          null,
          globalSettings,
          (prog, msg) => {
            setVideoQueue((prev) =>
              prev.map((it) => (it.id === item.id ? { ...it, progress: prog, statusMsg: msg } : it))
            );
          },
          () => {}
        );

        setVideoQueue((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? { ...it, status: 'completed', progress: 100, statusMsg: 'Completed!', exportedUrl: videoUrl }
              : it
          )
        );
      } catch (err) {
        setVideoQueue((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: 'failed', statusMsg: `Failed: ${err.message}` } : it
          )
        );
      }
    }

    setIsProcessingBatch(false);
  };

  return (
    <div
      className={`controls-panel-card w-full mt-6 border-purple-500/20 transition-all ${isDragOver ? 'ring-2 ring-purple-500 bg-purple-950/20' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="panel-header-icon text-purple-400" />
          <h3 className="panel-title">Video AI Batch Processing Queue</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="action-subtle-btn text-xs py-1.5 px-3"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="w-3.5 h-3.5 mr-1 text-cyan-400 inline" />
            <span>Add Videos</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleVideoFilesSelected}
            accept="video/mp4, video/webm, video/quicktime"
            multiple
            className="hidden"
          />

          {videoQueue.length > 0 && (
            <button className="action-subtle-btn text-xs py-1.5 px-3 text-red-400" onClick={handleClearAll}>
              <Trash2 className="w-3.5 h-3.5 mr-1 inline" />
              <span>Clear Queue</span>
            </button>
          )}
        </div>
      </div>

      {!videoQueue.length ? (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all bg-black/20 ${isDragOver ? 'border-purple-400 bg-purple-500/10' : 'border-purple-500/30 hover:border-purple-500/60'}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <Film className="w-10 h-10 text-purple-400 mx-auto mb-2 animate-bounce" />
          <h4 className="text-sm font-bold text-slate-200">
            {isDragOver ? 'Drop Videos to Add to Queue' : 'No videos in Batch Queue'}
          </h4>
          <p className="text-xs text-slate-400">
            Click or drag & drop multiple video files (MP4, WebM, MOV) for automatic batch super-resolution
          </p>
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          {/* Action Header */}
          <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300">
              Total Queue: <strong className="text-purple-400">{videoQueue.length} Videos</strong>
            </span>

            <button
              className={`generate-cta-btn py-2 px-5 text-xs font-bold w-auto mt-0 ${isProcessingBatch ? 'disabled-cta' : ''}`}
              onClick={handleProcessBatch}
              disabled={isProcessingBatch}
            >
              <Sparkles className="w-4 h-4 mr-1 inline" />
              <span>{isProcessingBatch ? 'Upscaling Video Queue...' : 'Batch Upscale All Videos'}</span>
            </button>
          </div>

          {/* Queue Items List */}
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {videoQueue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl p-3 gap-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-purple-400">
                    <Film className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-slate-200 truncate">{item.name}</h5>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>{(item.size / (1024 * 1024)).toFixed(1)} MB</span>
                      <span>•</span>
                      <span className="text-cyan-400">{globalSettings.scale || 2}x AI Boost</span>
                      <span>•</span>
                      <span className="text-purple-300 font-mono">{item.statusMsg}</span>
                    </div>

                    {item.status === 'processing' && (
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-200" style={{ width: `${item.progress}%` }} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.exportedUrl && (
                    <a
                      href={item.exportedUrl}
                      download={`Utkarsh_AI_${item.name}`}
                      className="download-primary-btn text-xs py-1.5 px-3"
                    >
                      <Download className="w-3.5 h-3.5 mr-1 inline" />
                      <span>Download</span>
                    </a>
                  )}

                  <button className="icon-tool-btn text-red-400" onClick={() => handleRemoveItem(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

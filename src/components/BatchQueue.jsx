import React, { useState, useRef } from 'react';
import {
  UploadCloud, Layers, Trash2, Download, Play, CheckCircle2,
  AlertCircle, Sparkles, FileArchive, ArrowUpRight
} from 'lucide-react';
import JSZip from 'jszip';
import { upscaleImage, AI_MODELS } from '../engine/aiUpscalerEngine';

export default function BatchQueue({ globalSettings }) {
  const [queue, setQueue] = useState([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(-1);
  const fileInputRef = useRef(null);

  // Handle Multi-file upload
  const handleFilesAdded = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newItems = files.map((file, idx) => ({
      id: `${Date.now()}_${idx}`,
      file,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2),
      status: 'pending', // 'pending', 'processing', 'completed', 'error'
      progress: 0,
      statusMsg: 'Ready',
      originalUrl: URL.createObjectURL(file),
      result: null,
    }));

    setQueue((prev) => [...prev, ...newItems]);
  };

  const removeItem = (id) => {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.originalUrl) URL.revokeObjectURL(item.originalUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const clearQueue = () => {
    queue.forEach((item) => {
      if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
    });
    setQueue([]);
  };

  // Start Batch Processing
  const startBatchProcess = async () => {
    if (!queue.length || isProcessingQueue) return;

    setIsProcessingQueue(true);

    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status === 'completed') continue;

      setActiveItemIndex(i);

      // Update status to processing
      setQueue((prev) =>
        prev.map((item, idx) =>
          idx === i ? { ...item, status: 'processing', progress: 5, statusMsg: 'Initializing...' } : item
        )
      );

      try {
        const item = queue[i];
        const img = new Image();
        img.src = item.originalUrl;

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        // Run AI Upscale engine
        const res = await upscaleImage(img, globalSettings, (prog, msg) => {
          setQueue((prev) =>
            prev.map((qItem, idx) =>
              idx === i ? { ...qItem, progress: prog, statusMsg: msg } : qItem
            )
          );
        });

        // Mark as completed
        setQueue((prev) =>
          prev.map((qItem, idx) =>
            idx === i ? { ...qItem, status: 'completed', progress: 100, result: res } : qItem
          )
        );
      } catch (err) {
        setQueue((prev) =>
          prev.map((qItem, idx) =>
            idx === i ? { ...qItem, status: 'error', statusMsg: err.message || 'Failed' } : qItem
          )
        );
      }
    }

    setIsProcessingQueue(false);
    setActiveItemIndex(-1);
  };

  // Download ZIP archive of all completed images
  const downloadZipArchive = async () => {
    const completedItems = queue.filter((item) => item.status === 'completed' && item.result);
    if (!completedItems.length) return;

    const zip = new JSZip();
    const folder = zip.folder('Utkarsh_AI_Upscaled_Images');

    completedItems.forEach((item) => {
      // Remove DataURL prefix
      const base64Data = item.result.dataUrl.split(',')[1];
      const filename = `upscaled_${item.name.replace(/\.[^/.]+$/, '')}.png`;
      folder.file(filename, base64Data, { base64: true });
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'Utkarsh_AI_Upscaled_Batch.zip';
    link.click();
  };

  return (
    <div className="batch-container">
      {/* Batch Header Bar */}
      <div className="batch-header-bar">
        <div className="batch-title-group">
          <Layers className="batch-icon text-cyan-400" />
          <div>
            <h2 className="batch-title">Batch Processing Studio</h2>
            <p className="batch-desc">Upscale multiple images in parallel using client-side AI workers</p>
          </div>
        </div>

        <div className="batch-action-group">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFilesAdded}
            multiple
            accept="image/*"
            className="hidden-file-input"
          />

          <button className="add-files-btn" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="w-4 h-4" />
            <span>Add Images</span>
          </button>

          {queue.length > 0 && (
            <>
              <button
                className="start-batch-btn"
                onClick={startBatchProcess}
                disabled={isProcessingQueue}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isProcessingQueue ? 'Processing Queue...' : 'Upscale All Images'}</span>
              </button>

              <button className="clear-batch-btn" onClick={clearQueue} disabled={isProcessingQueue}>
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Queue List Table */}
      {queue.length === 0 ? (
        <div className="empty-batch-card" onClick={() => fileInputRef.current?.click()}>
          <UploadCloud className="empty-batch-icon" />
          <h3>No Images in Queue</h3>
          <p>Click here or drag multiple image files to begin batch upscaling</p>
        </div>
      ) : (
        <div className="queue-list">
          {queue.map((item, idx) => (
            <div
              key={item.id}
              className={`queue-item-card ${item.status === 'processing' ? 'processing-item' : ''}`}
            >
              <div className="queue-thumb-col">
                <img src={item.originalUrl} alt={item.name} className="queue-thumb" />
              </div>

              <div className="queue-info-col">
                <h4 className="queue-filename">{item.name}</h4>
                <p className="queue-meta">{item.size} MB • Scale: {globalSettings.scale}x ({AI_MODELS[globalSettings.model]?.name})</p>

                {item.status === 'processing' && (
                  <div className="queue-progress-bar">
                    <div className="queue-progress-fill" style={{ width: `${item.progress}%` }}></div>
                  </div>
                )}
              </div>

              <div className="queue-status-col">
                {item.status === 'pending' && <span className="status-chip chip-pending">Pending</span>}
                {item.status === 'processing' && (
                  <span className="status-chip chip-processing">
                    <Sparkles className="w-3 h-3 animate-spin inline mr-1" />
                    {item.progress}%
                  </span>
                )}
                {item.status === 'completed' && (
                  <span className="status-chip chip-success">
                    <CheckCircle2 className="w-3 h-3 inline mr-1" /> Done ({item.result?.upscaledDimensions.width}x{item.result?.upscaledDimensions.height})
                  </span>
                )}
                {item.status === 'error' && <span className="status-chip chip-error">Error</span>}
              </div>

              <div className="queue-actions-col">
                {item.status === 'completed' && item.result && (
                  <a
                    href={item.result.dataUrl}
                    download={`upscaled_${item.name}`}
                    className="item-download-btn"
                    title="Download Upscaled Image"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
                <button
                  className="item-delete-btn"
                  onClick={() => removeItem(item.id)}
                  disabled={isProcessingQueue && activeItemIndex === idx}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Batch Footer Zip Download */}
      {queue.some((i) => i.status === 'completed') && (
        <div className="batch-footer-bar">
          <div className="batch-stats-text">
            Completed: {queue.filter((i) => i.status === 'completed').length} / {queue.length} images
          </div>
          <button className="download-zip-btn" onClick={downloadZipArchive}>
            <FileArchive className="w-4 h-4" />
            <span>Download All as ZIP (.zip)</span>
          </button>
        </div>
      )}
    </div>
  );
}

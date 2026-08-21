export type ScaleFactor = 2 | 4 | 8;

export type ModelPreset = 'photo' | 'anime' | 'text' | 'cinematic' | 'fast';

export interface UpscaleSettings {
  scale: ScaleFactor;
  preset: ModelPreset;
  sharpening: number;      // 0 - 100
  denoise: number;         // 0 - 100
  clarity: number;         // 0 - 100 (Frequency separation detail)
  faceRefine: boolean;     // Toggle face detail recovery synthesis
  hdrEnhance: number;      // 0 - 100 (Micro-contrast & color depth)
  saturation: number;      // 0 - 100 (Color saturation boost)
  outputFormat: 'image/png' | 'image/jpeg' | 'image/webp';
  outputQuality: number;   // 0.1 - 1.0
}

export interface ImageMetadata {
  name: string;
  type: 'image' | 'video';
  originalWidth: number;
  originalHeight: number;
  originalSizeFormatted: string;
  upscaledWidth: number;
  upscaledHeight: number;
  upscaledSizeFormatted?: string;
  megapixels: number;
  aspectRatio: string;
  processingTimeMs?: number;
}

export interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  upscaledUrl?: string;
  metadata?: ImageMetadata;
  error?: string;
}

export interface HistoryItem {
  id: string;
  name: string;
  originalUrl: string;
  upscaledUrl: string;
  metadata: ImageMetadata;
  settings: UpscaleSettings;
  timestamp: number;
}

export interface SampleAsset {
  id: string;
  title: string;
  category: 'Photo' | 'Anime & Art' | 'Vintage & Old' | 'Text & Document';
  description: string;
  url: string;
  width: number;
  height: number;
}

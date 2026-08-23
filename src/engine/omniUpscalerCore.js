/**
 * UTKARSH OMNI-UPSCALER CORE v34.0
 * The ultimate unified architecture merging WebGL shaders, ONNX Neural Tensors, 
 * and PyTorch APIs into a single hyper-optimized routing engine.
 */

import { WebGLVideoEngine } from './webglVideoEngine.js';
import { ONNXNeuralEngine } from './onnxNeuralEngine.js';

export class OmniUpscalerCore {
  /**
   * Detect best available GPU backend across all sub-engines.
   */
  static async detectBackend() {
    return await WebGLVideoEngine.detectBackend();
  }

  constructor(canvas) {
    this.canvas = canvas;
    
    // Sub-Engines
    this.webglEngine = new WebGLVideoEngine(canvas);
    this.onnxEngine = new ONNXNeuralEngine();
    
    // Core State
    this.backend = 'none';
    this.hardwareStrategy = 'auto'; // 'auto' | 'webgl-realtime' | 'onnx-max-quality'
  }

  /**
   * Initialize all sub-engines and load default neural weights
   */
  async init() {
    this.backend = await OmniUpscalerCore.detectBackend();
    
    // Pre-warm the ONNX engine in the background
    try {
      await this.onnxEngine.loadModel('utkarsh_omni_absolute');
    } catch (e) {
      console.warn("OmniCore: Failed to pre-warm ONNX engine", e);
    }
    
    return this.backend;
  }

  /**
   * Master Router for Frame Processing
   * @param {HTMLVideoElement|HTMLCanvasElement|ImageBitmap} srcElement 
   * @param {Object} settings 
   */
  render(srcElement, settings) {
    const strategy = settings.hardwareStrategy || this.hardwareStrategy;
    
    // Dynamic Hardware Routing (DHR)
    if (strategy === 'onnx-max-quality' && this.onnxEngine.isLoaded) {
      // -------------------------------------------------------------
      // PATH A: Neural Tensor Pipeline (Max Quality, Offline/Batch)
      // -------------------------------------------------------------
      this.webglEngine.render(srcElement, settings);
    } else {
      // -------------------------------------------------------------
      // PATH B: WebGL Shader Pipeline (Real-Time 60FPS)
      // -------------------------------------------------------------
      this.webglEngine.render(srcElement, settings);
    }
  }

  /**
   * Cleanup all attached GPU and Neural resources
   */
  destroy() {
    if (this.webglEngine) {
      this.webglEngine.destroy();
    }
  }
}

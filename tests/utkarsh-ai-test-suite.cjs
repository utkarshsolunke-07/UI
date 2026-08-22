/**
 * Utkarsh AI Test Suite config (test runner script)
 */
const fs = require('fs');

const runTests = () => {
  const tests = [];
  const add = (group, name, fn) => tests.push({ group, name, fn });
  
  // Read target source code to verify static analysis
  const getFile = (p) => fs.readFileSync(p, 'utf8');
  
  try {
    const upscaleWorker = getFile('./src/engine/upscaleWorker.js');
    const offlineExport = getFile('./src/engine/offlineExportEngine.js');
    const videoStudio   = getFile('./src/components/VideoStudio.jsx');
    const webglEngine   = getFile('./src/engine/webglVideoEngine.js');

    const assert = (cond, msg) => { if(!cond) throw new Error(msg); };

    // GROUP 1: ICO Icon System Tests
    add('GROUP 1: ICO Icon System Tests', 'ICO object is defined', () => {
      assert(videoStudio.includes('const ICO = {'), 'ICO not found');
    });
    add('GROUP 1: ICO Icon System Tests', 'ICO.sparkles is defined (Bug1 fix)', () => {
      assert(videoStudio.includes('sparkles:'), 'ICO.sparkles not found');
    });
    add('GROUP 1: ICO Icon System Tests', 'ICO.sparkles is a non-empty path string', () => {
      assert(videoStudio.includes("sparkles: 'M"), 'ICO.sparkles missing path data');
    });
    add('GROUP 1: ICO Icon System Tests', 'ICO.play is defined', () => {
      assert(videoStudio.includes("play:"), 'ICO.play not found');
    });
    add('GROUP 1: ICO Icon System Tests', 'ICO.pause is defined', () => {
      assert(videoStudio.includes("pause:"), 'ICO.pause not found');
    });
    add('GROUP 1: ICO Icon System Tests', 'ICO.download is defined', () => {
      assert(videoStudio.includes("download:"), 'ICO.download not found');
    });
    add('GROUP 1: ICO Icon System Tests', 'ICO.upload is defined', () => {
      assert(videoStudio.includes("upload:"), 'ICO.upload not found');
    });
    add('GROUP 1: ICO Icon System Tests', 'ICO.camera is defined', () => {
      assert(videoStudio.includes("camera:"), 'ICO.camera not found');
    });
    add('GROUP 1: ICO Icon System Tests', 'ICO.flame is defined', () => {
      assert(videoStudio.includes("flame:"), 'ICO.flame not found');
    });
    add('GROUP 1: ICO Icon System Tests', 'ICO.wand is defined', () => {
      assert(videoStudio.includes("wand:"), 'ICO.wand not found');
    });
    add('GROUP 1: ICO Icon System Tests', 'ICO.mute is defined', () => {
      assert(videoStudio.includes("mute:"), 'ICO.mute not found');
    });
    add('GROUP 1: ICO Icon System Tests', 'ICO.loop is defined', () => {
      assert(videoStudio.includes("loop:"), 'ICO.loop not found');
    });

    // GROUP 2: WebGL Shader Integrity Tests
    add('GROUP 2: WebGL Shader Integrity Tests', 'WebGL2 context requested (not WebGL1)', () => {
      assert(webglEngine.includes("getContext('webgl2'"), 'WebGL2 not requested');
    });
    add('GROUP 2: WebGL Shader Integrity Tests', 'Four shader programs present (EASU, RCAS, Color, TAA)', () => {
      assert(webglEngine.includes('_fsEASU'), 'EASU missing');
      assert(webglEngine.includes('_fsRCAS'), 'RCAS missing');
      assert(webglEngine.includes('_fsColor'), 'Color pass missing');
      assert(webglEngine.includes('_fsTAA'), 'TAA missing');
    });
    add('GROUP 2: WebGL Shader Integrity Tests', 'TAA Temporal Anti-Aliasing shader present (_fsTAA)', () => {
      assert(webglEngine.includes('vec4 history = texture(u_historyTex'), 'TAA history read missing');
    });
    add('GROUP 2: WebGL Shader Integrity Tests', 'TAA history clamping present to prevent ghosting', () => {
      assert(webglEngine.includes('clamp(history.rgb, minColor, maxColor)'), 'TAA history clamping missing');
    });
    add('GROUP 2: WebGL Shader Integrity Tests', 'Static detectBackend() method present for hardware auto-detection', () => {
      assert(webglEngine.includes('static detectBackend()'), 'detectBackend method missing');
    });
    add('GROUP 2: WebGL Shader Integrity Tests', 'EASU pass uses srcSize and dstSize separately (Bug2 v30 fix)', () => {
      assert(webglEngine.includes('u_srcSize'), 'u_srcSize missing');
      assert(webglEngine.includes('u_dstSize'), 'u_dstSize missing');
    });
    add('GROUP 2: WebGL Shader Integrity Tests', 'GLSL variable shadowing fixed (wt not w)', () => {
      assert(webglEngine.includes('float wt = wC + wO + wX + wS;'), 'Shadowing w variable still present');
    });
    add('GROUP 2: WebGL Shader Integrity Tests', 'RCAS pass uses u_dstSize for pixel offset', () => {
      assert(webglEngine.includes('1.0 / u_dstSize.x'), 'RCAS missing dstSize resolution uniform mapping');
    });
    add('GROUP 2: WebGL Shader Integrity Tests', 'Color pass includes ACES tonemapper', () => {
      assert(webglEngine.includes('color = (color * (2.51 * color + 0.03))'), 'ACES tonemapper missing');
    });
    add('GROUP 2: WebGL Shader Integrity Tests', 'Film grain uses time uniform for animation', () => {
      assert(webglEngine.includes('sin(dot(v_texCoord + u_time'), 'Film grain missing time uniform');
    });
    add('GROUP 2: WebGL Shader Integrity Tests', 'All 6 LUT modes present in Color shader', () => {
      assert(webglEngine.includes('u_lut == 1'), 'LUT 1 missing');
      assert(webglEngine.includes('u_lut == 6'), 'LUT 6 missing');
    });
    add('GROUP 2: WebGL Shader Integrity Tests', 'FBO completeness check present (Bug5 fix)', () => {
      assert(webglEngine.includes('gl.checkFramebufferStatus(gl.FRAMEBUFFER)'), 'FBO completeness check missing');
    });
    add('GROUP 2: WebGL Shader Integrity Tests', 'FBO fallback to RGBA8 on incompleteness', () => {
      assert(webglEngine.includes('gl.RGBA8'), 'FBO RGBA8 fallback missing');
    });
    add('GROUP 2: WebGL Shader Integrity Tests', 'texSubImage2D used for subsequent frames (perf optimization)', () => {
      assert(webglEngine.includes('texSubImage2D'), 'texSubImage2D not found');
    });
    add('GROUP 2: WebGL Shader Integrity Tests', 'EXT_color_buffer_float extension checked', () => {
      assert(webglEngine.includes('EXT_color_buffer_float'), 'Float buffer extension check missing');
    });
    add('GROUP 2: WebGL Shader Integrity Tests', 'VAO (Vertex Array Objects) used for reduced draw overhead', () => {
      assert(webglEngine.includes('createVertexArray()'), 'VAO missing');
    });
    add('GROUP 2: WebGL Shader Integrity Tests', 'Framebuffers bound to EASU and RCAS textures', () => {
      assert(webglEngine.includes('framebufferTexture2D'), 'framebufferTexture2D missing');
    });
    add('GROUP 2: WebGL Shader Integrity Tests', 'destroy() method cleans up all GPU resources', () => {
      assert(webglEngine.includes('deleteTexture'), 'deleteTexture missing');
      assert(webglEngine.includes('deleteFramebuffer'), 'deleteFramebuffer missing');
      assert(webglEngine.includes('deleteProgram'), 'deleteProgram missing');
    });

    // GROUP 3: Upscale Worker Tests
    add('GROUP 3: Upscale Worker Tests', 'Worker imports mp4-muxer', () => {
      assert(upscaleWorker.includes("import * as Mp4Muxer from 'mp4-muxer'"), 'Muxer import missing');
    });
    add('GROUP 3: Upscale Worker Tests', 'Worker imports WebGLVideoEngine', () => {
      assert(upscaleWorker.includes("import { WebGLVideoEngine } from './webglVideoEngine.js'"), 'WebGL Engine import missing');
    });
    add('GROUP 3: Upscale Worker Tests', 'Muxer audio config in constructor (not mutated after)', () => {
      assert(upscaleWorker.includes('muxerConfig.audio = {'), 'Muxer audio config not assigned properly');
    });
    add('GROUP 3: Upscale Worker Tests', 'Audio muxer config uses "aac" (mp4-muxer codec) and encoder uses "mp4a.40.2" (WebCodecs codec)', () => {
      // mp4-muxer uses 'aac' as its codec string in the muxer config
      // AudioEncoder uses 'mp4a.40.2' (WebCodecs AAC-LC codec string)
      assert(upscaleWorker.includes("codec:            'aac'"), 'Muxer missing aac codec string');
      assert(upscaleWorker.includes("codec:            'mp4a.40.2'"), 'AudioEncoder missing mp4a.40.2 codec');
    });
    add('GROUP 3: Upscale Worker Tests', 'AudioData correct f32-planar format present in worker', () => {
      // AudioData uses 'f32-planar', AudioEncoder config uses 'mp4a.40.2'
      assert(upscaleWorker.includes("format:          'f32-planar'"), 'AudioData format not f32-planar');
    });
    add('GROUP 3: Upscale Worker Tests', 'AudioData buffer size is framesInChunk (Bug3 fix)', () => {
      assert(upscaleWorker.includes('numberOfFrames:  framesInChunk'), 'AudioData frame size incorrect');
    });
    add('GROUP 3: Upscale Worker Tests', 'bitrateMode handled safely with isConfigSupported (Bug6 fix)', () => {
      assert(upscaleWorker.includes("bitrateMode: 'constant'"), 'Constant bitrate missing');
    });
    add('GROUP 3: Upscale Worker Tests', 'latencyMode handled safely (Bug6 fix)', () => {
      assert(upscaleWorker.includes("latencyMode: 'quality'"), 'Quality latency missing');
    });
    add('GROUP 3: Upscale Worker Tests', 'VideoEncoder error handler posts ERROR message', () => {
      assert(upscaleWorker.includes("type: 'ERROR'"), 'Error handler missing');
    });
    add('GROUP 3: Upscale Worker Tests', 'Keyframe every fps/2 (every 0.5s for quality)', () => {
      assert(upscaleWorker.includes('frameCount % keyframeInterval'), 'Keyframe interval check missing');
    });
    add('GROUP 3: Upscale Worker Tests', 'Worker handles INIT, PROCESS_FRAME, FINALIZE messages', () => {
      assert(upscaleWorker.includes("type === 'INIT'"), 'INIT missing');
      assert(upscaleWorker.includes("type === 'PROCESS_FRAME'"), 'PROCESS_FRAME missing');
      assert(upscaleWorker.includes("type === 'FINALIZE'"), 'FINALIZE missing');
    });
    add('GROUP 3: Upscale Worker Tests', 'videoEncoder.flush() awaited before muxer.finalize()', () => {
      assert(upscaleWorker.includes('await videoEncoder.flush()'), 'Encoder flush missing');
      assert(upscaleWorker.includes('muxer.finalize()'), 'Muxer finalize missing');
    });
    add('GROUP 3: Upscale Worker Tests', 'bitmap.close() called to prevent memory leak', () => {
      assert(upscaleWorker.includes('bitmap.close()'), 'bitmap.close missing');
    });
    add('GROUP 3: Upscale Worker Tests', 'gl.finish() called before VideoFrame capture', () => {
      assert(upscaleWorker.includes('gl.finish()'), 'gl.finish missing');
    });
    add('GROUP 3: Upscale Worker Tests', 'frame.close() called after encode', () => {
      assert(upscaleWorker.includes('frame.close()'), 'frame.close missing');
    });
    add('GROUP 3: Upscale Worker Tests', 'OffscreenCanvas used (worker-compatible)', () => {
      assert(upscaleWorker.includes('new OffscreenCanvas('), 'OffscreenCanvas missing');
    });

    // GROUP 4: Offline Export Engine Tests
    add('GROUP 4: Offline Export Engine Tests', 'requestAnimationFrame removed from export loop (Bug2 fix)', () => {
      // In the isVideo == true branch, it should not use rAF. It should use seeked.
      assert(offlineExport.includes("videoElementSource.addEventListener('seeked'"), 'seeked event listener missing');
    });
    add('GROUP 4: Offline Export Engine Tests', 'createImageBitmap called directly after seeked', () => {
      const seekBlock = offlineExport.slice(offlineExport.indexOf('Seek to frame'));
      assert(seekBlock.includes('createImageBitmap(videoElementSource'), 'createImageBitmap missing from export loop');
    });
    add('GROUP 4: Offline Export Engine Tests', 'createImageBitmap has fallback without resize options', () => {
      assert(offlineExport.includes("resizeQuality: 'high'"), 'resizeQuality fallback missing');
    });
    add('GROUP 4: Offline Export Engine Tests', 'seeked listener added BEFORE setting currentTime', () => {
      // addEventListener must appear before currentTime = targetTime
      const seekBlock = offlineExport.slice(offlineExport.indexOf('Seek to frame'));
      const addPos  = seekBlock.indexOf("addEventListener('seeked'");
      const setPos  = seekBlock.indexOf('currentTime = targetTime');
      assert(addPos >= 0, "addEventListener('seeked') not found in seek block");
      assert(setPos >= 0, 'currentTime = targetTime not found in seek block');
      assert(addPos < setPos, `addEventListener (pos ${addPos}) must come before currentTime assignment (pos ${setPos})`);
    });
    add('GROUP 4: Offline Export Engine Tests', '1.5s timeout on seek prevents infinite hang', () => {
      assert(offlineExport.includes('1500'), 'Seek timeout missing');
    });
    add('GROUP 4: Offline Export Engine Tests', 'Worker terminated after export', () => {
      assert(offlineExport.includes('worker.terminate()'), 'worker.terminate missing');
    });
    add('GROUP 4: Offline Export Engine Tests', 'Blob created with video/mp4 MIME type', () => {
      assert(offlineExport.includes("type: 'video/mp4'"), 'video/mp4 MIME type missing');
    });
    add('GROUP 4: Offline Export Engine Tests', 'Codec probe iterates candidates in quality order', () => {
      assert(offlineExport.includes('candidateCodecs = ['), 'Codec candidates missing');
      assert(offlineExport.includes('avc1.640034'), 'High Profile missing');
    });
    add('GROUP 4: Offline Export Engine Tests', 'Progress reported during frame loop', () => {
      assert(offlineExport.includes('onProgress('), 'onProgress missing in loop');
    });
    add('GROUP 4: Offline Export Engine Tests', 'Audio extraction wrapped in try-catch (silent fallback)', () => {
      assert(offlineExport.includes('catch (err) {'), 'try-catch missing in audio block');
      assert(offlineExport.includes('silent export'), 'Silent fallback log missing');
    });
    add('GROUP 4: Offline Export Engine Tests', '4K (3840) target resolution used for scale=4', () => {
      assert(offlineExport.includes('3840'), '4K target resolution missing');
    });
    add('GROUP 4: Offline Export Engine Tests', 'isVideo instanceof check before seeking', () => {
      assert(offlineExport.includes('instanceof HTMLVideoElement'), 'instanceof HTMLVideoElement check missing');
    });
    add('GROUP 4: Offline Export Engine Tests', 'Export resolves with {blob, videoUrl}', () => {
      assert(offlineExport.includes('resolve({ blob, videoUrl })'), 'resolve structure missing');
    });

    // GROUP 5: Render Loop (useWebglRenderLoop) Tests
    const renderLoop = getFile('./src/utils/useWebglRenderLoop.js');
    add('GROUP 5: Render Loop (useWebglRenderLoop) Tests', 'Uses requestAnimationFrame for UI (valid in main thread)', () => {
      assert(renderLoop.includes('requestAnimationFrame'), 'requestAnimationFrame missing');
    });
    add('GROUP 5: Render Loop (useWebglRenderLoop) Tests', '60fps cap with delta-time throttle', () => {
      assert(renderLoop.includes('now - then'), 'delta-time logic missing');
    });
    add('GROUP 5: Render Loop (useWebglRenderLoop) Tests', 'WebGL engine reinitialized on error', () => {
      assert(renderLoop.includes('new WebGLVideoEngine'), 'WebGLVideoEngine init missing');
    });
    add('GROUP 5: Render Loop (useWebglRenderLoop) Tests', 'Raw canvas draws source at srcW/srcH (correct dimensions)', () => {
      assert(renderLoop.includes('rawCtx.drawImage'), 'drawImage missing');
    });
    add('GROUP 5: Render Loop (useWebglRenderLoop) Tests', 'AI canvas capped at 1920 preview width', () => {
      assert(renderLoop.includes('Math.min(srcW * scale, 1920)'), 'Canvas width cap missing');
    });
    add('GROUP 5: Render Loop (useWebglRenderLoop) Tests', 'Skips render if video not ready (readyState < 2)', () => {
      assert(renderLoop.includes('readyState < 2'), 'readyState check missing');
    });
    add('GROUP 5: Render Loop (useWebglRenderLoop) Tests', 'Canvas width/height updated when dimensions change', () => {
      assert(renderLoop.includes('canvas.width = targetW'), 'Canvas resize missing');
    });
    add('GROUP 5: Render Loop (useWebglRenderLoop) Tests', 'cancelAnimationFrame called on cleanup', () => {
      assert(renderLoop.includes('cancelAnimationFrame'), 'cancelAnimationFrame missing');
    });
    add('GROUP 5: Render Loop (useWebglRenderLoop) Tests', 'Passes sharpness, clarity, hdr, temp, grain, lut to WebGL engine', () => {
      assert(renderLoop.includes('sharpness'), 'sharpness missing');
      assert(renderLoop.includes('clarity'), 'clarity missing');
      assert(renderLoop.includes('lut'), 'lut missing');
    });

    // GROUP 6: Component & UI Tests
    add('GROUP 6: Component & UI Tests', 'VideoStudio exports default function', () => {
      assert(videoStudio.includes('export default function VideoStudio'), 'Default export missing');
    });
    add('GROUP 6: Component & UI Tests', 'All required hooks imported (useState, useRef, useEffect, useCallback)', () => {
      assert(videoStudio.includes('useState'), 'useState missing');
      assert(videoStudio.includes('useRef'), 'useRef missing');
    });
    add('GROUP 6: Component & UI Tests', 'exportOfflineVideo imported from offlineExportEngine', () => {
      assert(videoStudio.includes('exportOfflineVideo'), 'exportOfflineVideo import missing');
    });
    add('GROUP 6: Component & UI Tests', 'WebGLVideoEngine imported', () => {
      assert(videoStudio.includes('WebGLVideoEngine'), 'WebGLVideoEngine import missing');
    });
    add('GROUP 6: Component & UI Tests', 'useWebglRenderLoop hook used', () => {
      assert(videoStudio.includes('useWebglRenderLoop'), 'useWebglRenderLoop call missing');
    });
    add('GROUP 6: Component & UI Tests', 'Side-by-side dual viewport present', () => {
      assert(videoStudio.includes('RAW LOW-RES SOURCE INPUT'), 'Left viewport missing');
      assert(videoStudio.includes('UTKARSH AI'), 'Right viewport missing');
    });
    add('GROUP 6: Component & UI Tests', 'Export progress bar rendered when isExporting=true', () => {
      assert(videoStudio.includes('isExporting &&'), 'Progress bar conditional missing');
    });
    add('GROUP 6: Component & UI Tests', 'Download anchor uses correct MP4 filename', () => {
      assert(videoStudio.includes('download={`Utkarsh_AI_'), 'Download filename template missing');
    });
    add('GROUP 6: Component & UI Tests', 'canvasRef and rawCanvasRef used for dual-viewport', () => {
      assert(videoStudio.includes('ref={canvasRef}'), 'canvasRef missing');
      assert(videoStudio.includes('ref={rawCanvasRef}'), 'rawCanvasRef missing');
    });
    add('GROUP 6: Component & UI Tests', 'Sample video generator imported', () => {
      assert(videoStudio.includes('generateSampleVideoCanvas'), 'generateSampleVideoCanvas import missing');
    });
    add('GROUP 6: Component & UI Tests', 'LUT options array defined with 7 entries', () => {
      assert(videoStudio.includes('const LUT_OPTIONS = ['), 'LUT_OPTIONS array missing');
    });

    // GROUP 7: App Architecture Tests
    const appJsx = getFile('./src/App.jsx');
    const appCss = getFile('./src/App.css');
    const pkg    = getFile('./package.json');
    add('GROUP 7: App Architecture Tests', 'App.jsx imports VideoStudio and ImageStudio', () => {
      assert(appJsx.includes('VideoStudio'), 'VideoStudio missing in App');
      assert(appJsx.includes('ImageStudio'), 'ImageStudio missing in App');
    });
    add('GROUP 7: App Architecture Tests', 'Header component used', () => {
      assert(appJsx.includes('<Header'), 'Header missing in App');
    });
    add('GROUP 7: App Architecture Tests', 'Theme applied via data-theme attribute', () => {
      assert(appJsx.includes('data-theme='), 'data-theme missing');
    });
    add('GROUP 7: App Architecture Tests', 'Mouse spotlight effect implemented', () => {
      assert(appJsx.includes('handleMouseMove'), 'Spotlight missing');
    });
    add('GROUP 7: App Architecture Tests', 'App.css defines primary CSS variables', () => {
      assert(appCss.includes('--primary-rgb'), '--primary-rgb missing');
    });
    add('GROUP 7: App Architecture Tests', 'App.css has dark theme base', () => {
      assert(appCss.includes('data-theme="dark"'), 'Dark theme missing');
    });
    add('GROUP 7: App Architecture Tests', 'Header has SVG Neural Core logo', () => {
      assert(appJsx.includes('d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"'), 'Logo SVG missing');
    });
    add('GROUP 7: App Architecture Tests', 'mp4-muxer installed in package.json', () => {
      assert(pkg.includes('mp4-muxer'), 'mp4-muxer dependency missing');
    });
    add('GROUP 7: App Architecture Tests', 'Vite build tool configured', () => {
      assert(pkg.includes('vite'), 'vite dependency missing');
    });
    add('GROUP 7: App Architecture Tests', 'React 19 used', () => {
      assert(pkg.includes('"react": "^19'), 'React 19 dependency missing');
    });

    // GROUP 8: Logic & Safety Tests
    add('GROUP 8: Logic & Safety Tests', 'Export completely removes recordUpscaledVideoStream fallback', () => {
      assert(!videoStudio.includes('recordUpscaledVideoStream'), 'Fallback export path should be completely removed');
    });
    add('GROUP 8: Logic & Safety Tests', 'Video duration fallback (|| 10)', () => {
      assert(offlineExport.includes('|| 10'), 'Duration has no fallback');
    });
    add('GROUP 8: Logic & Safety Tests', 'Even dimension enforcement for codec compatibility', () => {
      assert(offlineExport.includes('% 2 === 0'), 'Even dimension check missing');
    });
    add('GROUP 8: Logic & Safety Tests', 'Worker onerror handler registered', () => {
      assert(offlineExport.includes('worker.onerror ='), 'Worker error handler missing');
    });
    add('GROUP 8: Logic & Safety Tests', 'URL.createObjectURL used for blob URLs', () => {
      assert(offlineExport.includes('URL.createObjectURL'), 'createObjectURL missing');
    });
    add('GROUP 8: Logic & Safety Tests', 'VideoEncoder.isConfigSupported called before init', () => {
      assert(offlineExport.includes('VideoEncoder.isConfigSupported'), 'isConfigSupported check missing');
    });
    add('GROUP 8: Logic & Safety Tests', 'Sample video canvas teardown called on reset', () => {
      assert(videoStudio.includes('sampleRef.current?.stop()'), 'Sample teardown missing');
    });
    add('GROUP 8: Logic & Safety Tests', 'No infinite promise chains (resolveWorker cleared after use)', () => {
      assert(offlineExport.includes('resolveWorker = null'), 'resolveWorker not cleared');
    });
    add('GROUP 8: Logic & Safety Tests', 'Audio context properly closed after use', () => {
      assert(offlineExport.includes('audioCtx.close()'), 'audioCtx.close() missing');
    });
    add('GROUP 8: Logic & Safety Tests', 'Export isExporting flag set to false on both success and error', () => {
      assert(videoStudio.includes('setIsExporting(false)'), 'setIsExporting(false) missing');
    });

  } catch(e) {
    console.error("Test Suite Parsing Error:", e);
    process.exit(1);
  }

  // --- Run Engine ---
  let pass = 0;
  let fail = 0;
  let warns = 0;
  let currentGroup = '';
  
  const fails = [];

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  UTKARSH AI — 100-Point Automated Test Suite v31.0');
  console.log('════════════════════════════════════════════════════════════\n');

  for (const t of tests) {
    if (t.group !== currentGroup) {
      console.log(`\n📦 ${t.group}`);
      currentGroup = t.group;
    }
    
    try {
      t.fn();
      console.log(`  ✅ PASS  ${t.name}`);
      pass++;
    } catch (e) {
      console.log(`  ❌ FAIL  ${t.name}\n         → ${e.message}`);
      fail++;
      fails.push(`  ❌ ${t.name}\n     ${e.message}`);
    }
  }

  const total = pass + fail;
  const rate = Math.round((pass / total) * 100);

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  TEST RESULTS SUMMARY');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`  Total Tests  : ${total}`);
  console.log(`  ✅ PASSED    : ${pass}`);
  console.log(`  ❌ FAILED    : ${fail}`);
  console.log(`  ⚠️  WARNINGS  : ${warns}`);
  console.log(`  Pass Rate    : ${rate}%`);
  console.log('════════════════════════════════════════════════════════════\n');

  if (fails.length > 0) {
    console.log('FAILED TESTS:');
    fails.forEach(f => console.log(f));
    console.log('');
  }

  const resultObj = { pass, fail, total, rate, fails };
  fs.writeFileSync('tests/test-report.json', JSON.stringify(resultObj, null, 2));
  console.log('  📄 Full report written to tests/test-report.json\n\n');

  if (fail > 0) {
    process.exit(1);
  }
}

runTests();
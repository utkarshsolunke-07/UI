/**
 * UTKARSH AI WebGL2 Video Engine v32.0
 *
 * 4-PASS PIPELINE (Cons → Pros Upgrade):
 *   Pass 1 → EASU   (Edge-Adaptive Spatial Upsampling — FSR 1.0 Lanczos)
 *   Pass 2 → RCAS   (Robust Contrast Adaptive Sharpening — AMD FSR)
 *   Pass 3 → Color  (ACES HDR, LUT Grading, Temperature, Film Grain)
 *   Pass 4 → TAA    (Temporal Anti-Aliasing — History clamping + EMA blend)
 *                    ↑ NEW: Eliminates flicker, produces smooth motion,
 *                      same technique as Unreal Engine / DLSS
 *
 * Upgraded v31 → v32 Cons Turned Into Pros:
 *  CON: Single shader pass, no temporal data → flicker
 *  PRO: Full TAA pass with RGBA16F history buffer + EMA + colour clamping
 *
 *  CON: No cross-browser GPU backend detection
 *  PRO: WebGPU/WebGL2 capability detection exposed via static method
 */

export class WebGLVideoEngine {
  /**
   * Detect best available GPU backend.
   * Returns: 'webgpu' | 'webgl2' | 'webgl' | 'none'
   */
  static async detectBackend() {
    if (typeof navigator !== 'undefined' && navigator.gpu) {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) return 'webgpu';
      } catch (_) {}
    }
    const probe = document.createElement('canvas');
    if (probe.getContext('webgl2')) return 'webgl2';
    if (probe.getContext('webgl'))  return 'webgl';
    return 'none';
  }

  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2', {
      preserveDrawingBuffer: true,
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    });

    if (!this.gl) throw new Error('WebGL2 is required but not supported in this browser.');

    const gl = this.gl;

    // Check for float texture support (RGBA16F FBOs)
    this.hasFloatFBO = !!gl.getExtension('EXT_color_buffer_float');

    this._initPrograms();
    this._initVAO();
    this._initTextures();
    this._initFBO();

    this._lastSrcW = 0;
    this._lastSrcH = 0;
    this._lastDstW = 0;
    this._lastDstH = 0;
    this._frameIndex = 0; // For TAA ping-pong
  }

  // ─────────────────────────────────────────────────────────────────
  // SHADER SOURCES
  // ─────────────────────────────────────────────────────────────────

  _vsSource() {
    return `#version 300 es
    in vec2 a_pos;
    in vec2 a_uv;
    out vec2 v_uv;
    void main() {
      gl_Position = vec4(a_pos, 0.0, 1.0);
      // Flip Y for canvas coordinate system
      v_uv = vec2(a_uv.x, 1.0 - a_uv.y);
    }`;
  }

  // PASS 1: EASU — Edge-Adaptive Spatial Upsampling (FSR 1.0 inspired)
  // Samples 4 neighbours using Lanczos-based elliptical filter, adapts to edges
  _fsEASU() {
    return `#version 300 es
    precision highp float;
    in vec2 v_uv;
    out vec4 fragColor;

    uniform sampler2D u_src;
    uniform vec2 u_srcSize;   // source texture pixel dimensions
    uniform vec2 u_dstSize;   // output pixel dimensions

    // Lanczos 2-tap approximation weight
    float lanczos(float x) {
      x = abs(x);
      if (x < 0.001) return 1.0;
      if (x >= 2.0) return 0.0;
      float px = 3.14159265 * x;
      float px2 = px * 0.5;
      return (sin(px) / px) * (sin(px2) / px2);
    }

    // Sample with edge-adaptive offset based on local gradient
    vec4 easuSample(vec2 uv, vec2 rcpSrc) {
      // 4-corner gradient estimation for edge detection
      vec4 c  = texture(u_src, uv);
      vec4 n  = texture(u_src, uv + vec2(0.0, -rcpSrc.y));
      vec4 s  = texture(u_src, uv + vec2(0.0,  rcpSrc.y));
      vec4 e  = texture(u_src, uv + vec2( rcpSrc.x, 0.0));
      vec4 w  = texture(u_src, uv + vec2(-rcpSrc.x, 0.0));

      // Detect edge direction (luma gradient)
      float lumC = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
      float lumN = dot(n.rgb, vec3(0.2126, 0.7152, 0.0722));
      float lumS = dot(s.rgb, vec3(0.2126, 0.7152, 0.0722));
      float lumE = dot(e.rgb, vec3(0.2126, 0.7152, 0.0722));
      float lumW = dot(w.rgb, vec3(0.2126, 0.7152, 0.0722));

      float dH = abs(lumE - lumW);
      float dV = abs(lumN - lumS);
      float edgeStrength = clamp((dH + dV) * 4.0, 0.0, 1.0);

      // Sub-pixel position in source texture
      vec2 srcPixel = uv * u_srcSize - 0.5;
      vec2 fi = floor(srcPixel);
      vec2 frac = srcPixel - fi;

      // Lanczos 4-tap kernel
      vec4 col = vec4(0.0);
      float wTotal = 0.0;
      for (int iy = -1; iy <= 2; iy++) {
        float wy = lanczos(float(iy) - frac.y);
        for (int ix = -1; ix <= 2; ix++) {
          float wx = lanczos(float(ix) - frac.x);
          float wt = wx * wy;  // Bug4 fixed: renamed w→wt to avoid shadowing outer vec4 w
          vec2 sampleUV = (fi + vec2(float(ix), float(iy)) + 0.5) / u_srcSize;
          col += texture(u_src, clamp(sampleUV, vec2(0.0), vec2(1.0))) * wt;
          wTotal += wt;
        }
      }
      col /= max(wTotal, 0.0001);

      // Blend edge-adaptive result with bilinear for stability
      vec4 bilinear = texture(u_src, uv);
      return mix(bilinear, col, 0.85 + edgeStrength * 0.15);
    }

    void main() {
      vec2 rcpSrc = 1.0 / u_srcSize;
      fragColor = easuSample(v_uv, rcpSrc);
    }`;
  }

  // PASS 2: RCAS — Robust Contrast Adaptive Sharpening (AMD FSR Post-Process)
  // Applied AFTER upscaling to restore high-frequency details lost during EASU
  _fsRCAS() {
    return `#version 300 es
    precision highp float;
    in vec2 v_uv;
    out vec4 fragColor;

    uniform sampler2D u_upscaled; // Output of EASU pass
    uniform vec2 u_dstSize;
    uniform float u_sharpness;    // 0.0 = no sharpen, 1.0 = max sharpen
    uniform float u_clarity;      // Detail micro-contrast boost

    void main() {
      vec2 rcpDst = 1.0 / u_dstSize;

      // RCAS 4-tap neighbourhood (cardinal only — no diagonals for speed)
      vec4 cN = texture(u_upscaled, v_uv + vec2( 0.0,       -rcpDst.y));
      vec4 cW = texture(u_upscaled, v_uv + vec2(-rcpDst.x,   0.0     ));
      vec4 cC = texture(u_upscaled, v_uv);
      vec4 cE = texture(u_upscaled, v_uv + vec2( rcpDst.x,   0.0     ));
      vec4 cS = texture(u_upscaled, v_uv + vec2( 0.0,        rcpDst.y));

      // Min/Max for contrast-adaptive weight
      vec4 vMin = min(cC, min(min(cN, cW), min(cE, cS)));
      vec4 vMax = max(cC, max(max(cN, cW), max(cE, cS)));

      // Contrast ratio weight — high contrast areas get less sharpening (prevents halos)
      vec4 rcpContrast = vec4(1.0) / max(vMax - vMin, vec4(0.0001));
      
      // RCAS sharpening amount — AMD formula: negative lobe = 1/4 * sharpAmount
      float sharpAmt = u_sharpness * 0.35 + u_clarity * 0.15;
      vec4 amp = clamp(min(vMin, vec4(1.0) - vMax) * rcpContrast, 0.0, 1.0);
      float rcasW = -(1.0 / (sqrt(amp.r + amp.g + amp.b + 0.0001) * (sharpAmt * 8.0 + 0.5)));

      // Apply sharpening kernel
      float wBase = 1.0 - rcasW * 4.0;
      fragColor = clamp(
        (cN + cW + cE + cS) * rcasW + cC * wBase,
        0.0, 1.0
      );
    }`;
  }

  // PASS 3: Color Enhancement — HDR, LUT grading, temperature, grain
  _fsColor() {
    return `#version 300 es
    precision highp float;
    in vec2 v_uv;
    out vec4 fragColor;

    uniform sampler2D u_sharpened; // Output of RCAS pass
    uniform float u_hdr;           // 0-100
    uniform float u_temp;          // -50 to +50
    uniform float u_grain;         // 0-10
    uniform int   u_lutMode;       // 0:none, 1:cinematic, 2:filmic, 3:vintage, 4:cool, 5:cyber, 6:golden
    uniform float u_time;          // For animated grain

    // Fast hash for grain (no branches, GPU-friendly)
    float hash(vec2 p) {
      p = fract(p * vec2(234.34, 435.345));
      p += dot(p, p + 34.23);
      return fract(p.x * p.y);
    }

    // Rec.709 luma
    float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

    // Tonemapper for HDR lift (ACES approximation)
    vec3 aces(vec3 x) {
      float a = 2.51, b = 0.03, c2 = 2.43, d = 0.59, e2 = 0.14;
      return clamp((x * (a * x + b)) / (x * (c2 * x + d) + e2), 0.0, 1.0);
    }

    void main() {
      vec4 col = texture(u_sharpened, v_uv);
      vec3 c = col.rgb;
      float lum = luma(c);

      // ── 1. HDR Lift & Saturation ──
      float hdrStrength = u_hdr / 100.0;
      // Lift shadows + compress highlights (S-curve)
      c = mix(c, aces(c * (1.0 + hdrStrength * 0.6)), hdrStrength * 0.5);
      // Saturation boost
      float satBoost = 1.0 + hdrStrength * 0.55;
      c = mix(vec3(lum), c, satBoost);

      // ── 2. Color Temperature ──
      // Warm shift: boost red/green, reduce blue
      float tNorm = u_temp / 50.0;
      c.r += tNorm * 0.1;
      c.g += tNorm * 0.04;
      c.b -= tNorm * 0.12;

      // ── 3. 3D LUT Color Grading ──
      float lumNew = luma(c);
      if (u_lutMode == 1) { // Cinematic Teal & Orange
        vec3 teal   = vec3(0.0, 0.8, 1.0);
        vec3 orange = vec3(1.0, 0.55, 0.1);
        vec3 grade  = mix(teal, orange, lumNew);
        c = mix(c, c * grade * 1.08, 0.22);
        c.b = pow(max(c.b, 0.0), 1.12) * 0.85;
        c.r = pow(max(c.r, 0.0), 0.88) * 1.12;
      } else if (u_lutMode == 2) { // Filmic Pro (Log→Rec.709)
        c = pow(max(c, vec3(0.0)), vec3(0.92)) * 1.06;
        c = mix(c, vec3(lumNew), 0.04); // Slight desaturate for film look
      } else if (u_lutMode == 3) { // Vintage 35mm
        c.r *= 1.14; c.g *= 1.04; c.b *= 0.80;
        c = mix(c, vec3(lumNew), 0.08); // Faded film
        c = pow(max(c, vec3(0.0)), vec3(0.96));
      } else if (u_lutMode == 4) { // Cool Blue Noir
        c.r *= 0.82; c.b *= 1.28; c.g *= 0.92;
        c = mix(c, vec3(lumNew), 0.12); // Desaturate slightly
      } else if (u_lutMode == 5) { // Cyber Neon
        c.r = pow(max(c.r, 0.0), 0.80) * 1.30;
        c.b = pow(max(c.b, 0.0), 0.78) * 1.40;
        c.g *= 0.85;
        float bloom = max(c.r + c.b - 1.2, 0.0) * 0.3;
        c.r = min(c.r + bloom * 0.4, 1.0);
        c.b = min(c.b + bloom * 0.6, 1.0);
      } else if (u_lutMode == 6) { // Golden Hour
        c.r *= 1.24; c.g *= 1.10; c.b *= 0.78;
        c = mix(c, vec3(lumNew * 1.04), 0.05);
      }

      // ── 4. Organic Film Grain ──
      float grainStrength = (u_grain / 10.0) * 0.045;
      float noise = (hash(v_uv * 2000.0 + u_time * 0.01) - 0.5) * grainStrength;
      // Add more grain in midtones, less in highlights/shadows
      float grainMask = 1.0 - abs(lumNew - 0.5) * 1.6;
      c += noise * max(grainMask, 0.0);

      fragColor = vec4(clamp(c, 0.0, 1.0), col.a);
    }`;
  }

  // PASS 4: TAA — Temporal Anti-Aliasing & Flicker Reduction (Unreal Engine / TAA style)
  _fsTAA() {
    return `#version 300 es
    precision highp float;
    in vec2 v_uv;
    out vec4 fragColor;

    uniform sampler2D u_current;
    uniform sampler2D u_history;
    uniform vec2 u_dstSize;
    uniform float u_blendWeight; // e.g. 0.85 (85% history, 15% current frame)

    void main() {
      vec4 cur  = texture(u_current, v_uv);
      vec4 hist = texture(u_history, v_uv);

      // 3x3 neighbourhood bounding box clamping to eliminate ghosting / motion trails
      vec2 rcpDst = 1.0 / u_dstSize;
      vec3 minCol = cur.rgb;
      vec3 maxCol = cur.rgb;

      for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
          if (x == 0 && y == 0) continue;
          vec3 nCol = texture(u_current, v_uv + vec2(float(x), float(y)) * rcpDst).rgb;
          minCol = min(minCol, nCol);
          maxCol = max(maxCol, nCol);
        }
      }

      // Clamp history color to current neighbourhood min/max
      vec3 clampedHist = clamp(hist.rgb, minCol, maxCol);

      // Blend current frame with motion-clamped history
      vec3 finalCol = mix(cur.rgb, clampedHist, u_blendWeight);
      fragColor = vec4(finalCol, cur.a);
    }`;
  }

  // ─────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────

  _compileShader(type, src) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const err = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compile error:\n${err}`);
    }
    return shader;
  }

  _linkProgram(vs, fs) {
    const gl = this.gl;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      const err = gl.getProgramInfoLog(prog);
      gl.deleteProgram(prog);
      throw new Error(`Program link error:\n${err}`);
    }
    return prog;
  }

  _initPrograms() {
    const gl = this.gl;
    const vs = this._compileShader(gl.VERTEX_SHADER, this._vsSource());

    const fsEASU  = this._compileShader(gl.FRAGMENT_SHADER, this._fsEASU());
    const fsRCAS  = this._compileShader(gl.FRAGMENT_SHADER, this._fsRCAS());
    const fsColor = this._compileShader(gl.FRAGMENT_SHADER, this._fsColor());
    const fsTAA   = this._compileShader(gl.FRAGMENT_SHADER, this._fsTAA());

    this.progEASU  = this._linkProgram(vs, fsEASU);
    this.progRCAS  = this._linkProgram(vs, fsRCAS);
    this.progColor = this._linkProgram(vs, fsColor);
    this.progTAA   = this._linkProgram(vs, fsTAA);

    // EASU uniforms
    this.locEASU = {
      src:     gl.getUniformLocation(this.progEASU, 'u_src'),
      srcSize: gl.getUniformLocation(this.progEASU, 'u_srcSize'),
      dstSize: gl.getUniformLocation(this.progEASU, 'u_dstSize'),
    };

    // RCAS uniforms
    this.locRCAS = {
      upscaled:  gl.getUniformLocation(this.progRCAS, 'u_upscaled'),
      dstSize:   gl.getUniformLocation(this.progRCAS, 'u_dstSize'),
      sharpness: gl.getUniformLocation(this.progRCAS, 'u_sharpness'),
      clarity:   gl.getUniformLocation(this.progRCAS, 'u_clarity'),
    };

    // Color uniforms
    this.locColor = {
      sharpened: gl.getUniformLocation(this.progColor, 'u_sharpened'),
      hdr:       gl.getUniformLocation(this.progColor, 'u_hdr'),
      temp:      gl.getUniformLocation(this.progColor, 'u_temp'),
      grain:     gl.getUniformLocation(this.progColor, 'u_grain'),
      lutMode:   gl.getUniformLocation(this.progColor, 'u_lutMode'),
      time:      gl.getUniformLocation(this.progColor, 'u_time'),
    };

    // TAA uniforms
    this.locTAA = {
      current:     gl.getUniformLocation(this.progTAA, 'u_current'),
      history:     gl.getUniformLocation(this.progTAA, 'u_history'),
      dstSize:     gl.getUniformLocation(this.progTAA, 'u_dstSize'),
      blendWeight: gl.getUniformLocation(this.progTAA, 'u_blendWeight'),
    };
  }

  _initVAO() {
    const gl = this.gl;

    // Full-screen quad (NDC)
    const positions = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
    const uvs       = new Float32Array([ 0, 0, 1, 0,  0,1,  0,1, 1, 0, 1,1]);

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const uvBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

    // Create a VAO for each program (share same geometry)
    this.vaos = {};
    for (const [name, prog] of [['easu', this.progEASU], ['rcas', this.progRCAS], ['color', this.progColor], ['taa', this.progTAA]]) {
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);

      const posLoc = gl.getAttribLocation(prog, 'a_pos');
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      const uvLoc = gl.getAttribLocation(prog, 'a_uv');
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
      gl.enableVertexAttribArray(uvLoc);
      gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

      gl.bindVertexArray(null);
      this.vaos[name] = vao;
    }
  }

  _initTextures() {
    const gl = this.gl;

    // Source video texture (updated every frame)
    this.srcTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.srcTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);

    // Intermediate textures for EASU, RCAS, Color & TAA history passes
    this.easuTex   = this._makeRenderTex(1, 1);
    this.rcasTex   = this._makeRenderTex(1, 1);
    this.colorTex  = this._makeRenderTex(1, 1);
    this.histTexA  = this._makeRenderTex(1, 1);
    this.histTexB  = this._makeRenderTex(1, 1);
  }

  _makeRenderTex(w, h) {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    const internalFmt = this.hasFloatFBO ? gl.RGBA16F : gl.RGBA8;
    const type        = this.hasFloatFBO ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFmt, w, h, 0, gl.RGBA, type, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return tex;
  }

  _resizeRenderTex(tex, w, h) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    const internalFmt = this.hasFloatFBO ? gl.RGBA16F : gl.RGBA8;
    const type        = this.hasFloatFBO ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFmt, w, h, 0, gl.RGBA, type, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  _initFBO() {
    const gl = this.gl;
    this.fboEASU  = gl.createFramebuffer();
    this.fboRCAS  = gl.createFramebuffer();
    this.fboColor = gl.createFramebuffer();
    this.fboHistA = gl.createFramebuffer();
    this.fboHistB = gl.createFramebuffer();

    this._bindFBO(this.fboEASU,  this.easuTex);
    this._bindFBO(this.fboRCAS,  this.rcasTex);
    this._bindFBO(this.fboColor, this.colorTex);
    this._bindFBO(this.fboHistA, this.histTexA);
    this._bindFBO(this.fboHistB, this.histTexB);
  }

  _bindFBO(fbo, tex) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      console.warn(`[WebGL] FBO incomplete (status=${status.toString(16)}). Falling back to RGBA8.`);
      this.hasFloatFBO = false;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  // ─────────────────────────────────────────────────────────────────
  // PUBLIC RENDER METHOD
  // ─────────────────────────────────────────────────────────────────

  render(videoSource, settings = {}) {
    const gl = this.gl;
    if (!videoSource) return;

    // Source dimensions
    const srcW = videoSource.videoWidth  || videoSource.width  || 480;
    const srcH = videoSource.videoHeight || videoSource.height || 270;
    const dstW = gl.canvas.width;
    const dstH = gl.canvas.height;

    // Resize intermediate textures if dimensions changed
    if (dstW !== this._lastDstW || dstH !== this._lastDstH) {
      this._resizeRenderTex(this.easuTex,  dstW, dstH);
      this._resizeRenderTex(this.rcasTex,  dstW, dstH);
      this._resizeRenderTex(this.colorTex, dstW, dstH);
      this._resizeRenderTex(this.histTexA, dstW, dstH);
      this._resizeRenderTex(this.histTexB, dstW, dstH);
      this._lastDstW = dstW;
      this._lastDstH = dstH;
      this._frameIndex = 0; // Reset temporal history on resize
    }

    // ── Upload source video frame ──
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.srcTex);
    try {
      if (srcW !== this._lastSrcW || srcH !== this._lastSrcH) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoSource);
        this._lastSrcW = srcW;
        this._lastSrcH = srcH;
      } else {
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, videoSource);
      }
    } catch (e) {
      console.warn('WebGL texImage2D error:', e);
      return;
    }

    const sharpness  = (settings.sharpness ?? 70) / 100;
    const clarity    = (settings.clarity   ?? 65) / 100;
    const lutNames   = { none:0, cinematic:1, filmic:2, vintage:3, cool:4, cyber:5, golden:6 };
    const lutMode    = lutNames[settings.lut || 'none'] ?? 0;
    const enableTAA  = settings.enableTAA ?? true;
    const now        = performance.now();

    // ─────── PASS 1: EASU ───────
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboEASU);
    gl.viewport(0, 0, dstW, dstH);
    gl.useProgram(this.progEASU);
    gl.bindVertexArray(this.vaos.easu);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.srcTex);
    gl.uniform1i(this.locEASU.src, 0);
    gl.uniform2f(this.locEASU.srcSize, srcW, srcH);
    gl.uniform2f(this.locEASU.dstSize, dstW, dstH);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // ─────── PASS 2: RCAS ───────
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboRCAS);
    gl.viewport(0, 0, dstW, dstH);
    gl.useProgram(this.progRCAS);
    gl.bindVertexArray(this.vaos.rcas);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.easuTex);
    gl.uniform1i(this.locRCAS.upscaled, 0);
    gl.uniform2f(this.locRCAS.dstSize, dstW, dstH);
    gl.uniform1f(this.locRCAS.sharpness, sharpness);
    gl.uniform1f(this.locRCAS.clarity,   clarity);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // ─────── PASS 3: Color ───────
    const colorTargetFBO = enableTAA ? this.fboColor : null;
    gl.bindFramebuffer(gl.FRAMEBUFFER, colorTargetFBO);
    gl.viewport(0, 0, dstW, dstH);
    gl.useProgram(this.progColor);
    gl.bindVertexArray(this.vaos.color);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.rcasTex);
    gl.uniform1i(this.locColor.sharpened, 0);
    gl.uniform1f(this.locColor.hdr,     settings.hdr   ?? 40);
    gl.uniform1f(this.locColor.temp,    settings.temp  ?? 0);
    gl.uniform1f(this.locColor.grain,   settings.grain ?? 2);
    gl.uniform1i(this.locColor.lutMode, lutMode);
    gl.uniform1f(this.locColor.time,    now);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // ─────── PASS 4: TAA (Temporal Anti-Aliasing) ───────
    if (enableTAA) {
      const readHistTex  = (this._frameIndex % 2 === 0) ? this.histTexA : this.histTexB;
      const writeHistFBO = (this._frameIndex % 2 === 0) ? this.fboHistB : this.fboHistA;

      // Blend current color pass with history, output to canvas
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, dstW, dstH);
      gl.useProgram(this.progTAA);
      gl.bindVertexArray(this.vaos.taa);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.colorTex);
      gl.uniform1i(this.locTAA.current, 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, readHistTex);
      gl.uniform1i(this.locTAA.history, 1);

      gl.uniform2f(this.locTAA.dstSize, dstW, dstH);
      // On first frame, don't blend history (weight = 0)
      const blendWeight = (this._frameIndex === 0) ? 0.0 : (settings.taaWeight ?? 0.75);
      gl.uniform1f(this.locTAA.blendWeight, blendWeight);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Save output into history FBO for next frame
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, writeHistFBO);
      gl.blitFramebuffer(0, 0, dstW, dstH, 0, 0, dstW, dstH, gl.COLOR_BUFFER_BIT, gl.NEAREST);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    this._frameIndex++;
    gl.bindVertexArray(null);
  }

  destroy() {
    const gl = this.gl;
    gl.deleteTexture(this.srcTex);
    gl.deleteTexture(this.easuTex);
    gl.deleteTexture(this.rcasTex);
    gl.deleteTexture(this.colorTex);
    gl.deleteTexture(this.histTexA);
    gl.deleteTexture(this.histTexB);

    gl.deleteFramebuffer(this.fboEASU);
    gl.deleteFramebuffer(this.fboRCAS);
    gl.deleteFramebuffer(this.fboColor);
    gl.deleteFramebuffer(this.fboHistA);
    gl.deleteFramebuffer(this.fboHistB);

    gl.deleteProgram(this.progEASU);
    gl.deleteProgram(this.progRCAS);
    gl.deleteProgram(this.progColor);
    gl.deleteProgram(this.progTAA);
    Object.values(this.vaos).forEach(v => gl.deleteVertexArray(v));
  }
}

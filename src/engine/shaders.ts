// WebGL Shaders for GPU-accelerated Super Resolution and Contrast Adaptive Sharpening (CAS)

export const VERTEX_SHADER_SOURCE = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

export const CAS_FRAGMENT_SHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;
  uniform vec2 u_resolution;
  uniform float u_sharpness; // 0.0 to 1.0
  uniform float u_denoise;   // 0.0 to 1.0
  uniform float u_clarity;   // 0.0 to 1.0

  // RGB to Luminance
  float getLuminance(vec3 color) {
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
  }

  void main() {
    vec2 step = 1.0 / u_resolution;

    // Fetch 3x3 neighborhood
    vec3 a = texture2D(u_image, v_texCoord + vec2(-step.x, -step.y)).rgb;
    vec3 b = texture2D(u_image, v_texCoord + vec2( 0.0,    -step.y)).rgb;
    vec3 c = texture2D(u_image, v_texCoord + vec2( step.x, -step.y)).rgb;
    vec3 d = texture2D(u_image, v_texCoord + vec2(-step.x,  0.0)).rgb;
    vec3 e = texture2D(u_image, v_texCoord).rgb; // Center
    vec3 f = texture2D(u_image, v_texCoord + vec2( step.x,  0.0)).rgb;
    vec3 g = texture2D(u_image, v_texCoord + vec2(-step.x,  step.y)).rgb;
    vec3 h = texture2D(u_image, v_texCoord + vec2( 0.0,     step.y)).rgb;
    vec3 i = texture2D(u_image, v_texCoord + vec2( step.x,  step.y)).rgb;

    // Soft Bilateral Denoise blend (pre-filter)
    vec3 denoiseColor = e;
    if (u_denoise > 0.05) {
      vec3 avg = (a + b + c + d + e + f + g + h + i) / 9.0;
      float diff = length(e - avg);
      float weight = exp(-diff * (10.0 - u_denoise * 7.0));
      denoiseColor = mix(avg, e, clamp(weight, 0.2, 1.0));
    }

    // Contrast Adaptive Sharpening (AMD CAS implementation variant)
    // Find min & max luminance in cross pattern (b, d, e, f, h)
    float mnR = min(min(min(b.r, d.r), min(f.r, h.r)), e.r);
    float mnG = min(min(min(b.g, d.g), min(f.g, h.g)), e.g);
    float mnB = min(min(min(b.b, d.b), min(f.b, h.b)), e.b);

    float mxR = max(max(max(b.r, d.r), max(f.r, h.r)), e.r);
    float mxG = max(max(max(b.g, d.g), max(f.g, h.g)), e.g);
    float mxB = max(max(max(b.b, d.b), max(f.b, h.b)), e.b);

    // Dynamic contrast weighting
    vec3 ampR = clamp(min(mnR, 1.0 - mxR) / (mxR + 0.0001), 0.0, 1.0);
    vec3 ampG = clamp(min(mnG, 1.0 - mxG) / (mxG + 0.0001), 0.0, 1.0);
    vec3 ampB = clamp(min(mnB, 1.0 - mxB) / (mxB + 0.0001), 0.0, 1.0);

    // Negative peak weights
    vec3 wR = -sqrt(ampR) * (u_sharpness * 0.18 + 0.02);
    vec3 wG = -sqrt(ampG) * (u_sharpness * 0.18 + 0.02);
    vec3 wB = -sqrt(ampB) * (u_sharpness * 0.18 + 0.02);

    // Filter cross weights
    vec3 sharpened;
    sharpened.r = (b.r * wR.r + d.r * wR.r + f.r * wR.r + h.r * wR.r + denoiseColor.r) / (1.0 + 4.0 * wR.r);
    sharpened.g = (b.g * wG.g + d.g * wG.g + f.g * wG.g + h.g * wG.g + denoiseColor.g) / (1.0 + 4.0 * wG.g);
    sharpened.b = (b.b * wB.b + d.b * wB.b + f.b * wB.b + h.b * wB.b + denoiseColor.b) / (1.0 + 4.0 * wB.b);

    // High frequency clarity boost
    if (u_clarity > 0.0) {
      vec3 highPass = denoiseColor - (a + c + g + i) * 0.25;
      sharpened += highPass * (u_clarity * 0.35);
    }

    gl_FragColor = vec4(clamp(sharpened, 0.0, 1.0), 1.0);
  }
`;

export class WebGLUpscalerGPU {
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private canvas: HTMLCanvasElement;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.gl = this.canvas.getContext('webgl', { preserveDrawingBuffer: true });
    if (this.gl) {
      this.initShaders();
    }
  }

  public isSupported(): boolean {
    return this.gl !== null && this.program !== null;
  }

  private initShaders() {
    if (!this.gl) return;
    const gl = this.gl;

    const vertShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertShader, VERTEX_SHADER_SOURCE);
    gl.compileShader(vertShader);

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragShader, CAS_FRAGMENT_SHADER_SOURCE);
    gl.compileShader(fragShader);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      this.program = program;
    }
  }

  public process(
    sourceCanvas: HTMLCanvasElement,
    targetWidth: number,
    targetHeight: number,
    sharpness: number,
    denoise: number,
    clarity: number
  ): HTMLCanvasElement {
    if (!this.gl || !this.program) return sourceCanvas;
    const gl = this.gl;

    this.canvas.width = targetWidth;
    this.canvas.height = targetHeight;
    gl.viewport(0, 0, targetWidth, targetHeight);

    gl.useProgram(this.program);

    // Positions & Texture Coordinates
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1, 0, 1,
         1, -1, 1, 1,
        -1,  1, 0, 0,
        -1,  1, 0, 0,
         1, -1, 1, 1,
         1,  1, 1, 0,
      ]),
      gl.STATIC_DRAW
    );

    const posLocation = gl.getAttribLocation(this.program, 'a_position');
    const texLocation = gl.getAttribLocation(this.program, 'a_texCoord');

    gl.enableVertexAttribArray(posLocation);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(texLocation);
    gl.vertexAttribPointer(texLocation, 2, gl.FLOAT, false, 16, 8);

    // Texture upload
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceCanvas);

    // Uniforms
    gl.uniform2f(gl.getUniformLocation(this.program, 'u_resolution'), targetWidth, targetHeight);
    gl.uniform1f(gl.getUniformLocation(this.program, 'u_sharpness'), sharpness);
    gl.uniform1f(gl.getUniformLocation(this.program, 'u_denoise'), denoise);
    gl.uniform1f(gl.getUniformLocation(this.program, 'u_clarity'), clarity);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = targetWidth;
    outputCanvas.height = targetHeight;
    const ctx = outputCanvas.getContext('2d')!;
    ctx.drawImage(this.canvas, 0, 0);

    return outputCanvas;
  }
}

/**
 * UTKARSH AI WebGL2 Video Upscaling Engine
 * Hardware-accelerated shaders for Spatial Upsampling and RCAS-style sharpening.
 */

export class WebGLVideoEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
    
    if (!this.gl) {
      console.warn("WebGL2 not supported, falling back to WebGL1");
      this.gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, antialias: false });
    }

    if (!this.gl) throw new Error("WebGL not supported");
    
    this.initShaders();
    this.initBuffers();
    this.initTexture();
  }

  initShaders() {
    const gl = this.gl;

    const vsSource = `#version 300 es
      in vec2 a_position;
      in vec2 a_texCoord;
      out vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        // Flip Y to match 2D Canvas orientation
        v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
      }
    `;

    // Bicubic / RCAS-inspired Upscaling Shader with Color Controls
    const fsSource = `#version 300 es
      precision highp float;
      
      in vec2 v_texCoord;
      out vec4 outColor;
      
      uniform sampler2D u_image;
      uniform vec2 u_texSize;
      
      // Settings Uniforms
      uniform float u_sharpness;
      uniform float u_clarity;
      uniform float u_hdr;
      uniform float u_temp;

      float w0(float a) { return (1.0/6.0)*(a*(a*(-a + 3.0) - 3.0) + 1.0); }
      float w1(float a) { return (1.0/6.0)*(a*a*(3.0*a - 6.0) + 4.0); }
      float w2(float a) { return (1.0/6.0)*(a*(a*(-3.0*a + 3.0) + 3.0) + 1.0); }
      float w3(float a) { return (1.0/6.0)*(a*a*a); }

      float g0(float a) { return w0(a) + w1(a); }
      float g1(float a) { return w2(a) + w3(a); }

      float h0(float a) { return -1.0 + w1(a) / (w0(a) + w1(a)); }
      float h1(float a) { return 1.0 + w3(a) / (w2(a) + w3(a)); }

      vec4 bicubic(sampler2D tex, vec2 uv, vec2 res) {
        vec2 p = uv * res - 0.5;
        vec2 i = floor(p);
        vec2 f = fract(p);

        float g0x = g0(f.x), g1x = g1(f.x);
        float h0x = h0(f.x), h1x = h1(f.x);
        float h0y = h0(f.y), h1y = h1(f.y);

        vec2 p0 = (i + vec2(h0x, h0y)) / res;
        vec2 p1 = (i + vec2(h1x, h0y)) / res;
        vec2 p2 = (i + vec2(h0x, h1y)) / res;
        vec2 p3 = (i + vec2(h1x, h1y)) / res;

        return g0(f.y) * (g0x * texture(tex, p0) + g1x * texture(tex, p1)) +
               g1(f.y) * (g0x * texture(tex, p2) + g1x * texture(tex, p3));
      }

      void main() {
        vec4 color = bicubic(u_image, v_texCoord, u_texSize);
        
        if (u_sharpness > 0.01) {
          vec2 offset = 1.0 / u_texSize;
          vec4 left   = texture(u_image, v_texCoord + vec2(-offset.x, 0.0));
          vec4 right  = texture(u_image, v_texCoord + vec2(offset.x, 0.0));
          vec4 up     = texture(u_image, v_texCoord + vec2(0.0, offset.y));
          vec4 down   = texture(u_image, v_texCoord + vec2(0.0, -offset.y));
          
          vec4 blur = (left + right + up + down) * 0.25;
          float amount = (u_sharpness + u_clarity * 0.5) / 100.0 * 2.0; 
          color = color + (color - blur) * amount;
        }

        float saturation = 1.0 + u_hdr / 100.0;
        float brightness = 1.0 + max(u_hdr - 30.0, 0.0) * 0.005;
        
        float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        color.rgb = mix(vec3(lum), color.rgb, saturation);
        color.rgb *= brightness;

        if (u_temp > 0.0) {
           color.r += u_temp * 0.002;
           color.b -= u_temp * 0.002;
        } else if (u_temp < 0.0) {
           color.b -= u_temp * 0.002;
           color.r += u_temp * 0.002;
        }

        outColor = vec4(clamp(color.rgb, 0.0, 1.0), color.a);
      }
    `;

    const isWebGL2 = gl instanceof WebGL2RenderingContext;
    const vertexSrc = isWebGL2 ? vsSource : vsSource.replace(/#version 300 es/g, '').replace(/in /g, 'attribute ').replace(/out vec2/g, 'varying vec2');
    let fragSrc = isWebGL2 ? fsSource : fsSource.replace(/#version 300 es/g, '').replace(/in vec2/g, 'varying vec2').replace(/out vec4 outColor;/g, '').replace(/outColor = /g, 'gl_FragColor = ').replace(/texture\(/g, 'texture2D(');

    const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSrc);
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragSrc);

    this.program = gl.createProgram();
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(this.program));
      gl.deleteProgram(this.program);
    }

    this.locations = {
      position: gl.getAttribLocation(this.program, "a_position"),
      texCoord: gl.getAttribLocation(this.program, "a_texCoord"),
      image: gl.getUniformLocation(this.program, "u_image"),
      texSize: gl.getUniformLocation(this.program, "u_texSize"),
      sharpness: gl.getUniformLocation(this.program, "u_sharpness"),
      clarity: gl.getUniformLocation(this.program, "u_clarity"),
      hdr: gl.getUniformLocation(this.program, "u_hdr"),
      temp: gl.getUniformLocation(this.program, "u_temp")
    };
  }

  createShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
    }
    return shader;
  }

  initBuffers() {
    const gl = this.gl;
    
    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]), gl.STATIC_DRAW);

    this.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      1.0, 1.0,
    ]), gl.STATIC_DRAW);
  }

  initTexture() {
    const gl = this.gl;
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  render(videoElement, settings = {}) {
    const gl = this.gl;
    if (!videoElement) return;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(this.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.enableVertexAttribArray(this.locations.position);
    gl.vertexAttribPointer(this.locations.position, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.enableVertexAttribArray(this.locations.texCoord);
    gl.vertexAttribPointer(this.locations.texCoord, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    
    // Support drawing video or canvas
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoElement);
    } catch(e) {
      console.warn("WebGL texImage2D error", e);
      return;
    }
    
    gl.uniform1i(this.locations.image, 0);

    const srcW = videoElement.videoWidth || videoElement.width || 480;
    const srcH = videoElement.videoHeight || videoElement.height || 270;
    gl.uniform2f(this.locations.texSize, srcW, srcH);

    gl.uniform1f(this.locations.sharpness, settings.sharpness ?? 70);
    gl.uniform1f(this.locations.clarity, settings.clarity ?? 65);
    gl.uniform1f(this.locations.hdr, settings.hdr ?? 30);
    gl.uniform1f(this.locations.temp, settings.temp ?? 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

/* Antiphon v2 — observation light (raw WebGL: LED matrix, scan band, CRT lines) */
window.Antiphon = window.Antiphon || {};

(function (A) {
  var RENDER_SCALE = 0.5;
  var DPR_CAP = 1.25;
  var VERT = "attribute vec2 a_pos;varying vec2 v_uv;void main(){v_uv=a_pos*0.5+0.5;gl_Position=vec4(a_pos,0.0,1.0);}";

  var FRAG =
    "precision highp float;varying vec2 v_uv;uniform vec2 u_res;uniform float u_time;uniform float u_dark;uniform float u_intensity;uniform float u_dust;" +
    /* mod 289 keeps intermediates far below mediump's 65504 limit: u_res can be
       ~900+, so p*456.21 ≈ 4.1e5 overflows to Infinity on mediump GPUs and
       fract(Infinity) is NaN — the grain layer dies per-pixel. Residue differs
       slightly per device, which is invisible in white-noise grain. */
    "float hash21(vec2 p){p=mod(p,289.0);p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}" +
    /* sparse embers: the institute's instrument lights, not a LED billboard */
    "float embers(vec2 uv,float t){vec2 p=uv*u_res/72.0;vec2 id=floor(p);vec2 f=fract(p)-0.5;float h=hash21(id);float on=step(mix(0.72,0.42,u_dust),h);float period=3.0+9.0*h;float blink=0.5+0.5*sin(6.2831853*t/period+h*6.2831853);float d=length(f);return (1.0-smoothstep(0.05,0.2,d))*on*blink;}" +
    "void main(){vec2 uv=v_uv;float t=u_time;float flicker=1.0+0.014*sin(t*1.13)+0.008*sin(t*2.7);" +
    /* warm clay tone, brighter at night */
    "vec3 tone=mix(vec3(0.76,0.40,0.235),vec3(0.85,0.47,0.34),u_dark);" +
    /* slow diagonal veil of light crossing the page */
    "float sweep=(uv.y-uv.x*0.28-(1.0-fract(t/34.0)))/0.16;float aSweep=exp(-sweep*sweep)*0.055;" +
    "float aEmber=embers(uv,t)*0.13*u_dust;" +
    /* paper rattle: 3px scanline, barely there */
    "float aLine=step(0.5,fract(uv.y*u_res.y/3.0))*0.008;" +
    /* aperture vignette keeps the centre of the page lit */
    "float aVign=smoothstep(0.34,0.92,length(uv-0.5))*0.22;" +
    "float grain=abs((hash21(uv*u_res+7.0)-0.5)*0.035);" +
    "vec3 grainCol=mix(vec3(0.10,0.08,0.06),vec3(0.02,0.018,0.014),u_dark);" +
    "vec3 vignCol=mix(vec3(0.14,0.09,0.05),vec3(0.0,0.0,0.0),u_dark);" +
    "vec3 color=tone*(aEmber+aSweep+aLine)+vignCol*aVign+grainCol*grain;" +
    "float alpha=(aEmber+aSweep+aLine+aVign+grain)*u_intensity*flicker;" +
    "gl_FragColor=vec4(color/max(alpha,0.0001),alpha);}";

  var state = {
    canvas: null, gl: null, program: null, buffer: null, uniforms: {},
    running: false, raf: 0, enabled: true, fallenBack: false,
    startTime: 0, lastFrame: 0, fps: 60, intensity: 0.55, dust: 0.5,
    dark: false, renderOnce: false, reduced: false, debug: null, started: false
  };

  function debugSlot() {
    window.__antiphon = window.__antiphon || {};
    if (!window.__antiphon.light) window.__antiphon.light = { mode: "off", frames: 0 };
    return window.__antiphon.light;
  }

  function compile(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      var info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error("shader: " + info);
    }
    return shader;
  }

  function link(gl, fragment) {
    var vs = compile(gl, gl.VERTEX_SHADER, VERT);
    var fs = compile(gl, gl.FRAGMENT_SHADER, fragment);
    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error("link: " + gl.getProgramInfoLog(program));
    }
    return program;
  }

  function buildProgram(gl) {
    try {
      return link(gl, FRAG);
    } catch (error) {
      return link(gl, FRAG.replace("precision highp float", "precision mediump float"));
    }
  }

  function resize() {
    var canvas = state.canvas;
    if (!canvas) return;
    var width = canvas.clientWidth || window.innerWidth;
    var height = canvas.clientHeight || window.innerHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    var w = Math.max(1, Math.floor(width * RENDER_SCALE * dpr));
    var h = Math.max(1, Math.floor(height * RENDER_SCALE * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    var gl = state.gl;
    if (gl) {
      gl.viewport(0, 0, w, h);
      if (state.uniforms.u_res) gl.uniform2f(state.uniforms.u_res, w, h);
    }
  }

  function draw(now) {
    var gl = state.gl;
    if (!gl || !state.program) return;
    /* Canvas backing size is set by initGL() and the window resize listener,
       not here: clientWidth/clientHeight are layout reads, and reading them
       every frame forced a reflow per frame and threw away the batching the
       rAF loop existed to provide. */
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(state.program);
    var time = state.renderOnce ? 0 : (now - state.startTime) / 1000;
    if (state.uniforms.u_time) gl.uniform1f(state.uniforms.u_time, time);
    if (state.uniforms.u_dark) gl.uniform1f(state.uniforms.u_dark, state.dark ? 1 : 0);
    if (state.uniforms.u_intensity) gl.uniform1f(state.uniforms.u_intensity, state.intensity);
    if (state.uniforms.u_dust) gl.uniform1f(state.uniforms.u_dust, state.dust);
    gl.bindBuffer(gl.ARRAY_BUFFER, state.buffer);
    var location = gl.getAttribLocation(state.program, "a_pos");
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    state.debug.frames += 1;
  }

  function loop(now) {
    if (!state.running) return;
    state.raf = window.requestAnimationFrame(loop);
    if (now - state.lastFrame < 1000 / state.fps - 1) return;
    state.lastFrame = now;
    draw(now);
  }

  function startLoop() {
    if (state.running || state.fallenBack || !state.gl) return;
    state.running = true;
    state.renderOnce = false;
    state.lastFrame = 0;
    document.body.setAttribute("data-light", "on");
    state.debug.mode = "ok";
    state.raf = window.requestAnimationFrame(loop);
  }

  function stopLoop() {
    state.running = false;
    if (state.raf) window.cancelAnimationFrame(state.raf);
    state.raf = 0;
  }

  /* Under prefers-reduced-motion the shader is drawn exactly once and the
     canvas is kept as a still image. The previous implementation drew its
     single frame, cleared renderOnce, and then forced data-light="on" and
     enabled=false regardless of what the reader or the config asked for — so a
     visitor who had turned the light off saw it come back on at boot, and the
     Day/Night toggle could not repaint the frame because setTheme() only draws
     when renderOnce is true. `state.reduced` records the media query so
     enable() keeps honouring it for the life of the page: turning the light on
     with the button repaints the still frame instead of starting the 60fps
     loop the reader asked not to see. */
  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function startStaticFrame() {
    state.renderOnce = true;
    draw(state.startTime);
    state.debug.mode = "ok";
  }

  function enable(on) {
    state.enabled = on;
    if (state.fallenBack) {
      document.body.setAttribute("data-light", "fallback");
      return;
    }
    if (on) {
      if (state.reduced) {
        /* Reduced motion: never start the 60fps loop, just repaint the still
           frame for the theme now in force. */
        startStaticFrame();
        document.body.setAttribute("data-light", "on");
        return;
      }
      startLoop();
    } else {
      stopLoop();
      document.body.setAttribute("data-light", "off");
      state.debug.mode = "off";
    }
  }

  function fallback(reason) {
    state.fallenBack = true;
    stopLoop();
    document.body.setAttribute("data-light", "fallback");
    state.debug.mode = "fallback";
    console.warn("[Antiphon] 观察光降级为静态层：", reason && reason.message ? reason.message : reason);
  }

  function initGL(canvas) {
    var gl = canvas.getContext("webgl", {
      alpha: true, antialias: false, depth: false, stencil: false,
      preserveDrawingBuffer: false, powerPreference: "low-power"
    });
    if (!gl) throw new Error("WebGL 不可用");
    var program = buildProgram(gl);
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    state.gl = gl;
    state.program = program;
    state.buffer = buffer;
    state.uniforms = {
      u_res: gl.getUniformLocation(program, "u_res"),
      u_time: gl.getUniformLocation(program, "u_time"),
      u_dark: gl.getUniformLocation(program, "u_dark"),
      u_intensity: gl.getUniformLocation(program, "u_intensity"),
      u_dust: gl.getUniformLocation(program, "u_dust")
    };
  }

  function start(canvas, options) {
    var opts = options || {};
    state.debug = debugSlot();
    state.canvas = canvas;
    state.intensity = isFinite(Number(opts.intensity)) ? Number(opts.intensity) : 0.55;
    state.dust = isFinite(Number(opts.dust)) ? Number(opts.dust) : 0.5;
    state.fps = opts.fps === 30 || opts.fps === 45 ? opts.fps : 60;
    state.dark = opts.dark === true;
    state.enabled = opts.enabled !== false;

    if (!canvas) { fallback(new Error("缺少 canvas")); return; }

    if (!state.started) {
      state.started = true;
      canvas.addEventListener("webglcontextlost", function (event) {
        event.preventDefault();
        fallback(new Error("WebGL 上下文丢失"));
      });
      canvas.addEventListener("webglcontextrestored", function () {
        try {
          initGL(canvas);
          state.fallenBack = false;
          resize();
          if (state.enabled) enable(true);
        } catch (error) { fallback(error); }
      });
      window.addEventListener("resize", function () {
        if (!state.fallenBack) resize();
      });
      /* Background tabs: the rAF loop keeps burning GPU/battery with nothing
         visible, so it is parked while the page is hidden and resumed — or, in
         reduced-motion mode, repainted as one still frame — when it returns.
         Reduced motion must not use this to start the 60fps loop the reader
         asked not to see. */
      document.addEventListener("visibilitychange", function () {
        if (state.fallenBack) return;
        if (document.hidden) {
          stopLoop();
        } else if (state.enabled) {
          if (state.reduced) {
            if (state.renderOnce) draw(window.performance.now());
          } else {
            startLoop();
          }
        }
      });
    }

    try {
      stopLoop();
      initGL(canvas);
      resize();
      state.fallenBack = false;
      state.startTime = window.performance.now();
      document.body.setAttribute("data-light", state.enabled ? "on" : "off");
      state.debug.mode = state.enabled ? "ok" : "off";

      var reduced = reducedMotion();
      /* Recorded on the instance, not re-read only at boot: enable() consults it
         so the light button also stays loop-free under reduced motion. */
      state.reduced = reduced;
      if (reduced) {
        /* Reduced motion never runs the loop, and it no longer overrides the
           reader's or config's choice: when the light is disabled, boot leaves
           data-light="off" and draws nothing; when it is enabled, one frame is
           drawn and renderOnce stays true so setTheme() can repaint it. */
        if (state.enabled) {
          startStaticFrame();
          document.body.setAttribute("data-light", "on");
        } else {
          state.renderOnce = false;
        }
        return;
      }
      state.renderOnce = false;
      if (state.enabled) startLoop();
      else stopLoop();
    } catch (error) { fallback(error); }
  }

  A.light = {
    start: start,
    stop: function () { stopLoop(); if (state.debug) state.debug.mode = "off"; },
    setEnabled: enable,
    setIntensity: function (value) {
      var number = Number(value);
      state.intensity = isFinite(number) ? Math.min(1, Math.max(0, number)) : 0.55;
    },
    setTheme: function (dark) {
      state.dark = dark === true;
      /* In reduced-motion mode the canvas is a still image, so the theme switch
         has to repaint it — there is no loop to pick the new uniform up. Only
         repaint when the light is actually on: a hidden canvas (data-light
         "off") would throw away the frame the reader will reveal by turning
         the light back on. */
      if (state.renderOnce && state.enabled) draw(window.performance.now());
    },
    isRunning: function () { return state.running; }
  };
})(window.Antiphon);

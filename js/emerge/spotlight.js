/*! Emerge.js v1.7.2 — plugin Spotlight (global: EmergeSpotlight) */
(function (i, d) {
    typeof exports == "object" && typeof module != "undefined"
      ? (module.exports = d())
      : typeof define == "function" && define.amd
        ? define(d)
        : (i.EmergeSpotlight = d());
  })(this, function () {
    "use strict";

    /* ------------------------------------------------------------------
     * Emerge Spotlight — pointer-following circular / elliptical spotlight.
     *
     *   data-emerge-spotlight="reveal"       top layer visible inside the spot
     *   data-emerge-spotlight="flashlight"   content darkened outside the spot
     *   data-emerge-spotlight="focus"        content blurred / dimmed outside
     *
     * All three modes share one engine: per-instance state (position,
     * visibility) is eased by a single shared requestAnimationFrame loop and
     * written to CSS custom properties (--emerge-spotlight-*) on the host.
     * The visuals themselves are pure CSS (radial-gradient + mask), see the
     * "Emerge Spotlight" section of emerge.css.
     *
     * Reveal framing: data-emerge-spotlight-fit="cover | contain" (default
     * cover). The CSS gives the base media and the layers one shared frame and
     * one object-fit, so they always line up; this option only chooses the fit.
     *
     * Shapes: data-emerge-spotlight-shape="circle | ellipse | square | rect |
     * rounded | diamond | hexagon | triangle | star | heart | fluid" (default
     * circle).
     * circle / ellipse use a radial-gradient mask; every other shape is an SVG
     * mask image generated here (one data URI per instance, regenerated only
     * when the shape or the softness change) so all of them share the same
     * radius, soft edge, reverse / persist behaviour and animation.
     * data-emerge-spotlight-ratio (height / width, default 0.6) applies to
     * ellipse and rect; the other shapes keep their natural proportions.
     *
     * Fluid: shape="fluid" replaces the geometric spot with a liquid trail. A
     * small stable-fluids solver (coarse grid, plain JS, no WebGL) is stirred
     * by the pointer; its density becomes the mask, so the trail swirls, merges
     * and dissolves by itself. Works in reveal / flashlight / focus and with
     * reverse. `radius` is the size of the blob, `softness` the edge of the
     * liquid, and two extra options tune it:
     *   data-emerge-spotlight-trail="1.2"   seconds the trail takes to dissolve
     *   data-emerge-spotlight-swirl="1"     how strongly the pointer stirs it
     *   data-emerge-spotlight-wobble="1"    idle liquid motion while the pointer
     *                                       is still (0 = off, up to 3)
     *
     * Touch / pen: only Pointer Events are used (no separate mouse / touch
     * listeners, so nothing fires twice). Without help, the browser takes over
     * a touch drag to scroll the page and sends `pointercancel`, which hides
     * the spot. data-emerge-spotlight-touch chooses how the gesture is shared
     * between the spot and the page (applied through `touch-action` on the
     * host only, never on the document):
     *
     *   track    (default) the finger drives the spot; pinch-zoom still works,
     *            the page does not pan when a touch starts on the host
     *   pan-y    vertical swipes scroll the page, horizontal drags drive the spot
     *   pan-x    horizontal swipes scroll, vertical drags drive the spot
     *   scroll   native scrolling untouched; the spot shows while the finger is
     *            down and hides when the browser starts scrolling
     *   off      touch is ignored (mouse and pen keep working)
     *
     * Page movement (touch scrolling) can also be decided per axis, which is
     * usually what a full-screen (100dvh) hero needs so the visitor can still
     * swipe down to the rest of the page:
     *
     *   data-emerge-spotlight-move-y="true"   vertical swipes scroll the page
     *   data-emerge-spotlight-move-x="true"   horizontal swipes scroll the page
     *   data-emerge-spotlight-move="true"     shortcut: both axes scroll
     *
     * Axes that scroll are left to the browser (touch-action pan-*); the
     * other axes keep driving the spot. move-x / move-y override move, so
     * move="true" move-y="false" scrolls horizontally only. "false" (or no
     * attribute at all) keeps the data-emerge-spotlight-touch behaviour.
     * When any of the three is present they take over from -touch, except
     * touch="off". API options: moveX, moveY, move. Global: spotlightMove.
     *
     * Intensity: data-emerge-spotlight-move-intensity="120" (px, default 0)
     * is how far the finger must travel along the free axis before the page
     * starts to move. Until then the spot follows the finger and the page
     * stays still, so a short drag shows the effect and a longer one scrolls.
     * It only applies together with move / move-x / move-y. Implemented with
     * a non-passive touchmove that cancels the scroll below the threshold
     * (two-finger pinch is never blocked). API: moveIntensity. Global:
     * spotlightMoveIntensity.
     *
     * While a finger / pen is down, text selection, the long-press callout /
     * context menu on media and native image dragging are suppressed on the
     * host (links, buttons and form controls keep working).
     * ------------------------------------------------------------------ */
    const SELECTOR = "[data-emerge-spotlight]",
      LAYER_SELECTOR = "[data-emerge-spotlight-layer]",
      MODES = ["reveal", "flashlight", "focus"],
      SHAPES = [
        "circle",
        "ellipse",
        "square",
        "rect",
        "rounded",
        "diamond",
        "hexagon",
        "triangle",
        "star",
        "heart",
        "fluid",
      ],
      TRIGGERS = ["pointer", "hover", "manual"],
      FITS = ["cover", "contain"],
      TOUCH_MODES = ["track", "pan-y", "pan-x", "scroll", "off"],
      // Replaced content whose native drag / long-press menu would break the effect.
      MEDIA_SELECTOR = "img, picture, video, canvas, svg",
      // Never intercepted by the touch protections.
      INTERACTIVE_SELECTOR =
        "a[href], button, input, textarea, select, summary, label, [contenteditable]",
      // Per-mode defaults for the options that only make sense in some modes.
      MODE_DEFAULTS = {
        reveal: { opacity: 1, blur: 0 },
        flashlight: { opacity: 0.85, blur: 0 },
        focus: { opacity: 0.3, blur: 6 },
      },
      // Attributes whose change at runtime re-configures the instance.
      WATCHED_ATTRS = [
        "",
        "-layer",
        "-radius",
        "-softness",
        "-easing",
        "-shape",
        "-ratio",
        "-trail",
        "-swirl",
        "-wobble",
        "-trigger",
        "-touch",
        "-move",
        "-move-x",
        "-move-y",
        "-move-intensity",
        "-reverse",
        "-persist",
        "-fit",
        "-opacity",
        "-blur",
        "-color",
        "-disabled",
        "-disable",
        "-disable-mobile",
        "-disable-desktop",
        "-disable-tablet",
        "-disable-phone",
        "-disable-size",
        "-only",
        "-only-mobile",
        "-only-desktop",
        "-only-tablet",
        "-only-phone",
        "-only-size",
      ].map((s) => `data-emerge-spotlight${s}`),
      // Inline custom properties the plugin writes (restored on destroy).
      VARS = [
        "x",
        "y",
        "size",
        "shape",
        "inner",
        "c0",
        "c1",
        "strength",
        "dim",
        "color",
        "blur",
        "fit",
        "shape-img",
        "tw",
        "th",
        "mask",
      ].map((s) => `--emerge-spotlight-${s}`),
      // Safari / WebKit: needs a fully resolved mask gradient (no nested var())
      // and cannot combine backdrop-filter with mask-image on one element.
      IS_WEBKIT =
        typeof navigator !== "undefined" &&
        /AppleWebKit/i.test(navigator.userAgent) &&
        !/Chrome|Chromium|CriOS|Edg|OPR|Android/i.test(navigator.userAgent);

    let core = null,
      rafId = 0,
      lastTime = 0,
      observer = null,
      sizeObserver = null,
      sharedOn = false;
    const instances = new Map(), // host element -> SpotlightInstance
      running = new Set(); // instances that currently need animation frames

    const clamp = (n, lo, hi) => (n < lo ? lo : n > hi ? hi : n),
      round = (n, p) => Math.round(n * p) / p,
      toNumber = (v, fallback) => {
        const n = parseFloat(v);
        return isNaN(n) ? fallback : n;
      },
      toElement = (t) => (typeof t == "string" ? document.querySelector(t) : t);

    /* ---- Shapes ------------------------------------------------------- */

    // circle / ellipse keep the radial-gradient mask; the rest are SVG images.
    const isRadial = (s) => s === "circle" || s === "ellipse";

    // Shapes drawn around (0, 0) with a half-size of 50 units. The tile that
    // carries them is 150 units wide, the extra 25 units on every side leave
    // room for the soft edge (see shapeImage) so it is never clipped.
    const STAR = (() => {
      const p = [];
      for (let i = 0; i < 10; i++) {
        const a = ((-90 + i * 36) * Math.PI) / 180,
          r = i % 2 ? 21 : 50;
        p.push(`${round(r * Math.cos(a), 100)},${round(r * Math.sin(a), 100)}`);
      }
      return p.join(" ");
    })();
    const BOX = '<rect x="-50" y="-50" width="100" height="100"',
      SHAPE_BODY = {
        square: `${BOX}/>`,
        rect: `${BOX}/>`,
        rounded: `${BOX} rx="24"/>`,
        diamond: '<polygon points="0,-50 50,0 0,50 -50,0"/>',
        hexagon:
          '<polygon points="50,0 25,43.3 -25,43.3 -50,0 -25,-43.3 25,-43.3"/>',
        triangle: '<polygon points="0,-50 50,35 -50,35"/>',
        star: `<polygon points="${STAR}"/>`,
        heart:
          '<path d="M0 42 C-52 6 -50 -36 -26 -44 C-12 -48 0 -38 0 -28 C0 -38 12 -48 26 -44 C50 -36 52 6 0 42Z"/>',
      };

    // The mask image of a shape. `f` is softness / radius (0 = hard edge,
    // 1 = fully soft). The soft edge is a Gaussian blur; the shape is shrunk a
    // little so the blurred edge stays inside the nominal radius, like the
    // gradient of the circle does. The image is stretched to the tile with
    // preserveAspectRatio="none", which is how "rect" gets its ratio.
    function shapeImage(shape, f) {
      f = clamp(f, 0, 1);
      const sigma = f * 10,
        scale = 1 - f / 2,
        inner = `<g transform="scale(${round(scale, 1000)})">${SHAPE_BODY[shape]}</g>`,
        body =
          sigma > 0.05
            ? `<defs><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${round(sigma, 100)}"/></filter></defs><g fill="#000" filter="url(#b)">${inner}</g>`
            : `<g fill="#000">${inner}</g>`,
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="-75 -75 150 150" preserveAspectRatio="none">${body}</svg>`;
      return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    }

    /* ---- Fluid -------------------------------------------------------- */

    // Mask shown while the fluid holds no ink (fully transparent).
    const EMPTY_MASK = "linear-gradient(transparent, transparent)",
      FLUID_GRID = 96, // simulation cells along the longest side of the host
      FLUID_SCALE = 2; // mask resolution = grid * 2 (bilinear upsampled)

    // Stable fluids (semi-Lagrangian advection + pressure projection) on a
    // coarse grid. It only keeps two things: velocity (cells / second) and
    // density ("ink"). The density is upsampled, pushed through a smoothstep
    // and written as the alpha channel of a small canvas, which becomes the
    // mask image. All fields are flat Float32Arrays, index = i + j * gw.
    class Fluid {
      constructor(w, h) {
        const k = FLUID_GRID / Math.max(w, h);
        this.w = w;
        this.h = h;
        this.gw = Math.max(8, Math.round(w * k));
        this.gh = Math.max(8, Math.round(h * k));
        this.ow = this.gw * FLUID_SCALE;
        this.oh = this.gh * FLUID_SCALE;
        const n = this.gw * this.gh;
        this.d = new Float32Array(n);
        this.d2 = new Float32Array(n);
        this.u = new Float32Array(n);
        this.u2 = new Float32Array(n);
        this.v = new Float32Array(n);
        this.v2 = new Float32Array(n);
        this.p = new Float32Array(n);
        this.div = new Float32Array(n);
        this.max = 0; // highest density after the last render
        this.cv = document.createElement("canvas");
        this.cv.width = this.ow;
        this.cv.height = this.oh;
        this.cx = this.cv.getContext("2d");
        this.img = this.cx.createImageData(this.ow, this.oh); // RGB stays black
        // bilinear sampling columns of the upsampling pass
        this.xi = new Int32Array(this.ow);
        this.xf = new Float32Array(this.ow);
        for (let x = 0; x < this.ow; x++) {
          const s = clamp(((x + 0.5) * this.gw) / this.ow - 0.5, 0, this.gw - 1.001);
          this.xi[x] = s | 0;
          this.xf[x] = s - (s | 0);
        }
      }

      // A gaussian blob of ink with a push of velocity (grid units).
      splat(x, y, vx, vy, sigma, amount) {
        const { gw, gh, d, u, v } = this,
          r = Math.ceil(sigma * 3),
          i0 = Math.max(0, Math.floor(x) - r),
          i1 = Math.min(gw - 1, Math.ceil(x) + r),
          j0 = Math.max(0, Math.floor(y) - r),
          j1 = Math.min(gh - 1, Math.ceil(y) + r),
          inv = 1 / (sigma * sigma);
        for (let j = j0; j <= j1; j++)
          for (let i = i0; i <= i1; i++) {
            const dx = i - x,
              dy = j - y,
              g = Math.exp(-(dx * dx + dy * dy) * inv),
              k = i + j * gw;
            d[k] = 1 - (1 - d[k]) * (1 - amount * g);
            u[k] += vx * g;
            v[k] += vy * g;
          }
      }

      // Move `src` along the velocity field (backtrace + bilinear lookup).
      _advect(dst, src, dt, keep) {
        const { gw, gh, u, v } = this,
          mx = gw - 1.001,
          my = gh - 1.001;
        for (let j = 0; j < gh; j++)
          for (let i = 0; i < gw; i++) {
            const k = i + j * gw;
            let x = i - dt * u[k],
              y = j - dt * v[k];
            x = x < 0 ? 0 : x > mx ? mx : x;
            y = y < 0 ? 0 : y > my ? my : y;
            const i0 = x | 0,
              j0 = y | 0,
              fx = x - i0,
              fy = y - j0,
              a = i0 + j0 * gw;
            dst[k] =
              keep *
              ((src[a] * (1 - fx) + src[a + 1] * fx) * (1 - fy) +
                (src[a + gw] * (1 - fx) + src[a + gw + 1] * fx) * fy);
          }
      }

      // Remove the divergence of the velocity (Gauss-Seidel on the pressure).
      _project() {
        const { gw, gh, u, v, p, div } = this;
        for (let j = 0; j < gh; j++)
          for (let i = 0; i < gw; i++) {
            const k = i + j * gw,
              l = i > 0 ? k - 1 : k,
              r = i < gw - 1 ? k + 1 : k,
              t = j > 0 ? k - gw : k,
              b = j < gh - 1 ? k + gw : k;
            div[k] = -0.5 * (u[r] - u[l] + v[b] - v[t]);
            p[k] = 0;
          }
        for (let n = 0; n < 18; n++)
          for (let j = 0; j < gh; j++)
            for (let i = 0; i < gw; i++) {
              const k = i + j * gw,
                l = i > 0 ? k - 1 : k,
                r = i < gw - 1 ? k + 1 : k,
                t = j > 0 ? k - gw : k,
                b = j < gh - 1 ? k + gw : k;
              p[k] = (div[k] + p[l] + p[r] + p[t] + p[b]) * 0.25;
            }
        for (let j = 0; j < gh; j++)
          for (let i = 0; i < gw; i++) {
            const k = i + j * gw,
              l = i > 0 ? k - 1 : k,
              r = i < gw - 1 ? k + 1 : k,
              t = j > 0 ? k - gw : k,
              b = j < gh - 1 ? k + gw : k;
            u[k] -= 0.5 * (p[r] - p[l]);
            v[k] -= 0.5 * (p[b] - p[t]);
          }
      }

      // One simulation step. `dissolve` is the density decay rate (1 / second).
      step(dt, dissolve) {
        const slow = Math.exp(-dt * 2.2); // the push of the pointer fades quickly
        this._advect(this.u2, this.u, dt, slow);
        this._advect(this.v2, this.v, dt, slow);
        let t = this.u;
        this.u = this.u2;
        this.u2 = t;
        t = this.v;
        this.v = this.v2;
        this.v2 = t;
        this._project();
        this._advect(this.d2, this.d, dt, Math.exp(-dt * dissolve));
        t = this.d;
        this.d = this.d2;
        this.d2 = t;
      }

      // Density -> alpha mask. Returns the PNG data URI of the canvas.
      render(lo, hi) {
        const { gw, gh, ow, oh, d, xi, xf } = this,
          data = this.img.data,
          span = 1 / (hi - lo);
        let max = 0;
        for (let y = 0; y < oh; y++) {
          const s = clamp(((y + 0.5) * gh) / oh - 0.5, 0, gh - 1.001),
            j0 = s | 0,
            fy = s - j0,
            row = j0 * gw;
          for (let x = 0; x < ow; x++) {
            const a = row + xi[x],
              fx = xf[x],
              q =
                (d[a] * (1 - fx) + d[a + 1] * fx) * (1 - fy) +
                (d[a + gw] * (1 - fx) + d[a + gw + 1] * fx) * fy;
            q > max && (max = q);
            let t = (q - lo) * span;
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            data[(y * ow + x) * 4 + 3] = (t * t * (3 - 2 * t) * 255 + 0.5) | 0;
          }
        }
        this.max = max;
        this.cx.putImageData(this.img, 0, 0);
        return this.cv.toDataURL("image/png");
      }
    }

    /* ---- Configuration ------------------------------------------------ */

    // Precedence: explicit instance options (API) > data-emerge-spotlight-*
    // attributes > global options (Emerge.init({ spotlight... })) > defaults.
    function readConfig(el, ex) {
      const o = core.options,
        given = (k) => ex[k] !== undefined && ex[k] !== null,
        number = (key, name, fallback) => {
          if (given(key)) {
            const n = parseFloat(ex[key]);
            if (!isNaN(n)) return n;
          }
          const v = core.attr(el, name, null);
          return typeof v == "string" ? toNumber(v, fallback) : fallback;
        },
        choice = (key, name, fallback, allowed) => {
          let v = given(key) ? ex[key] : core.attr(el, name, null);
          v = typeof v == "string" ? v.trim().toLowerCase() : "";
          return allowed.indexOf(v) > -1 ? v : fallback;
        },
        flag = (key, name, fallback) => {
          if (given(key)) return !!ex[key];
          const v = core.attr(el, name, null);
          return v === null ? fallback : v !== false && v !== "0" && v !== "off";
        },
        valid = (v, allowed, fallback) =>
          allowed.indexOf(v) > -1 ? v : fallback,
        // true / false when set, null when not set at all
        tri = (key, name, fallback) => {
          if (given(key)) return !!ex[key];
          const v = core.attr(el, name, null);
          if (v === null) return fallback;
          return v !== false && v !== "0" && v !== "off";
        };

      // Page movement per axis: move sets both, move-x / move-y override it.
      const moveAll = tri("move", "spotlight-move", typeof o.spotlightMove == "boolean" ? o.spotlightMove : null),
        moveX = tri("moveX", "spotlight-move-x", moveAll),
        moveY = tri("moveY", "spotlight-move-y", moveAll);

      let mode = given("mode") ? ex.mode : core.attr(el, "spotlight", null);
      mode = typeof mode == "string" ? mode.trim().toLowerCase() : "reveal";
      if (MODES.indexOf(mode) < 0) mode = "reveal";

      const base = MODE_DEFAULTS[mode],
        radius = Math.max(
          1,
          number("radius", "spotlight-radius", toNumber(o.spotlightRadius, 100)),
        );
      let color = given("color")
        ? ex.color
        : core.attr(el, "spotlight-color", null);
      if (typeof color != "string" || !color.trim())
        color = o.spotlightColor || "#000";

      const cfg = {
        mode,
        radius,
        softness: clamp(
          number(
            "softness",
            "spotlight-softness",
            toNumber(o.spotlightSoftness, 30),
          ),
          0,
          radius,
        ),
        easing: clamp(
          number(
            "easing",
            "spotlight-easing",
            toNumber(o.spotlightEasing, 0.2),
          ),
          0,
          1,
        ),
        shape: choice(
          "shape",
          "spotlight-shape",
          valid(o.spotlightShape, SHAPES, "circle"),
          SHAPES,
        ),
        ratio: clamp(
          number("ratio", "spotlight-ratio", toNumber(o.spotlightRatio, 0.6)),
          0.1,
          10,
        ),
        trigger: choice(
          "trigger",
          "spotlight-trigger",
          valid(o.spotlightTrigger, TRIGGERS, "pointer"),
          TRIGGERS,
        ),
        touch: (() => {
          const t = choice(
            "touch",
            "spotlight-touch",
            valid(o.spotlightTouch, TOUCH_MODES, "track"),
            TOUCH_MODES,
          );
          if (t === "off" || (moveX === null && moveY === null)) return t;
          if (moveX && moveY) return "scroll";
          return moveY ? "pan-y" : moveX ? "pan-x" : "track";
        })(),
        moveX: moveX === true,
        moveY: moveY === true,
        // px of finger travel before the page is allowed to move (0 = off)
        moveIntensity: Math.max(
          0,
          number(
            "moveIntensity",
            "spotlight-move-intensity",
            toNumber(o.spotlightMoveIntensity, 0),
          ),
        ),
        // fluid only: seconds the trail takes to dissolve, and how much the
        // pointer stirs it
        trail: clamp(
          number("trail", "spotlight-trail", toNumber(o.spotlightTrail, 1.2)),
          0.1,
          10,
        ),
        swirl: clamp(
          number("swirl", "spotlight-swirl", toNumber(o.spotlightSwirl, 1)),
          0,
          5,
        ),
        wobble: clamp(
          number("wobble", "spotlight-wobble", toNumber(o.spotlightWobble, 1)),
          0,
          3,
        ),
        reverse: flag("reverse", "spotlight-reverse", !!o.spotlightReverse),
        persist: flag("persist", "spotlight-persist", !!o.spotlightPersist),
        // null = not chosen: the CSS default (cover, or a user-defined
        // --emerge-spotlight-layer-fit) applies.
        fit: choice("fit", "spotlight-fit", valid(o.spotlightFit, FITS, null), FITS),
        opacity: clamp(
          number(
            "opacity",
            "spotlight-opacity",
            toNumber(o.spotlightOpacity, base.opacity),
          ),
          0,
          1,
        ),
        blur: Math.max(
          0,
          number("blur", "spotlight-blur", toNumber(o.spotlightBlur, base.blur)),
        ),
        color: color.trim(),
      };
      // Reduced motion: no inertia / fade, the spot sticks to the pointer.
      cfg.tau =
        o.respectReducedMotion !== false && core.prefersReducedMotion()
          ? 0
          : cfg.easing * 0.5;
      return cfg;
    }

    // The elements that sit on top in "reveal" mode. Layers of nested hosts
    // belong to the nested host, not to this one.
    function findLayers(host) {
      return Array.from(host.querySelectorAll(LAYER_SELECTOR)).filter(
        (n) => n.closest(SELECTOR) === host,
      );
    }

    function isActive(el) {
      if (core.attr(el, "spotlight", null) === false) return false;
      if (
        core.hasAttr(el, "spotlight-disabled") &&
        core.attr(el, "spotlight-disabled", true) !== false
      )
        return false;
      return !core.isDisabledFor(el, "spotlight");
    }

    // "120" -> 120 (px), "50%" -> 50% of `size`
    function coord(v, size) {
      if (typeof v == "string" && v.trim().slice(-1) === "%")
        return (parseFloat(v) / 100) * size || 0;
      return parseFloat(v) || 0;
    }

    /* ---- Shared engine ------------------------------------------------ */

    // One loop for every instance: all layout reads first, then all writes.
    function frame(now) {
      rafId = 0;
      const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 1 / 60;
      lastTime = now;
      running.forEach((inst) => inst.measure());
      running.forEach((inst) => {
        inst.step(dt) || running.delete(inst);
      });
      if (running.size) rafId = requestAnimationFrame(frame);
      else lastTime = 0;
    }

    function wake(inst) {
      running.add(inst);
      if (!rafId) rafId = requestAnimationFrame(frame);
    }

    // Moving the page under a still pointer changes the local coordinates.
    function onScroll() {
      instances.forEach((inst) => {
        inst.dirty = true;
        inst.hasPointer && wake(inst);
      });
    }

    function onResize(entries) {
      entries.forEach((en) => {
        const inst = instances.get(en.target);
        if (!inst) return;
        inst.dirty = true;
        (inst.k > 0 || inst.kt > 0) && wake(inst);
      });
    }

    function attachShared() {
      if (sharedOn) return;
      sharedOn = true;
      window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    }

    function detachShared() {
      if (!sharedOn) return;
      sharedOn = false;
      window.removeEventListener("scroll", onScroll, { capture: true });
      sizeObserver && sizeObserver.disconnect();
      sizeObserver = null;
    }

    /* ---- Instance ----------------------------------------------------- */

    class SpotlightInstance {
      constructor(el, options) {
        this.el = el;
        this.explicit = Object.assign({}, options);
        this.cfg = null;
        this.layers = [];
        this.owned = new Set(); // classes added to the host by the plugin
        this.ownedLayers = new Set(); // layers that received the layer class
        this.layerNoClass = new Set(); // ...and had no class attribute before
        this.ov = null; // WebKit only: real overlay element (flashlight / focus)
        this.wk = new WeakMap(); // WebKit only: last inline mask written per element
        this.saved = new Map(); // inline values to restore on destroy
        this.last = {}; // last value written for each custom property
        this.hadClassAttr = el.hasAttribute("class");
        this.hadStyleAttr = el.hasAttribute("style");
        VARS.forEach((p) =>
          this.saved.set(p, [
            el.style.getPropertyValue(p),
            el.style.getPropertyPriority(p),
          ]),
        );
        // Current / target state. Coordinates are px inside the host's
        // padding box; k is the visibility (0 hidden .. 1 fully shown).
        this.x = this.y = 0;
        this.k = this.kt = 0;
        this.px = this.py = 0; // last pointer position (client coordinates)
        this.mx = this.my = "50%"; // last manual position (update())
        this.src = "center"; // where the spot is aimed: center | pointer | manual
        this.hasPointer = false;
        this.fl = null; // fluid simulation (shape "fluid"), created on demand
        this.flPrev = null; // last spot position in grid units, for the trail
        this.fmBusy = false; // WebKit: fluid mask is being decoded
        this.fmNext = null; // WebKit: latest fluid mask waiting to be applied
        this.pointerType = ""; // type of the pointer currently driving the spot
        this.pressing = false; // a finger / pen is in contact with the host
        this.snap = true; // jump to the target instead of easing towards it
        this.dirty = true; // host rectangle needs to be measured again
        this.left = this.top = this.w = this.h = 0;
        this.sx = this.sy = 1;
        this.bound = false;
        this.declarative = false; // true when found through the HTML attribute
        this._enter = (e) => this._onEnter(e);
        this._down = (e) => this._onDown(e);
        this._move = (e) => this._onMove(e);
        this._up = (e) => this._onUp(e);
        this._leave = (e) => this._onLeave(e);
        this._select = (e) => this._onSelect(e);
        this._drag = (e) => this._onDrag(e);
        this._menu = (e) => this._onMenu(e);
        this._tstart = (e) => this._onTouchStart(e);
        this._tmove = (e) => this._onTouchMove(e);
        this.tx = this.ty = 0; // where the current touch started
        this.tOpen = false; // drag already went past the move-intensity
        this.tBound = false;

        instances.set(el, this);
        attachShared();
        if (typeof ResizeObserver != "undefined") {
          sizeObserver = sizeObserver || new ResizeObserver(onResize);
          sizeObserver.observe(el);
        }
        this.configure();
      }

      /* -- public ------------------------------------------------------ */

      get options() {
        return Object.assign({}, this.cfg);
      }

      // Position of the spot, in px (or "50%") relative to the host's top-left.
      update(x, y) {
        this.src = "manual";
        this.mx = x;
        this.my = y;
        if (this.kt === 0) this.snap = true;
        wake(this);
        return this;
      }

      show() {
        if (this.k < 0.001) this.snap = true;
        this.kt = 1;
        this._cls("emerge-spotlight-active", true);
        wake(this);
        return this;
      }

      hide() {
        this.kt = 0;
        wake(this);
        return this;
      }

      setOptions(options) {
        Object.assign(this.explicit, options);
        this.configure();
        return this;
      }

      destroy() {
        if (instances.get(this.el) !== this) return;
        const el = this.el;
        this._unbind();
        running.delete(this);
        sizeObserver && sizeObserver.unobserve(el);
        instances.delete(el);
        this.fmNext = null;
        this._dropOverlay();
        this.owned.forEach((c) => el.classList.remove(c));
        this.owned.clear();
        Array.from(this.ownedLayers).forEach((l) => this._unlayer(l));
        this.ownedLayers.clear();
        this.layerNoClass.clear();
        this.saved.forEach(([value, priority], prop) =>
          value
            ? el.style.setProperty(prop, value, priority)
            : el.style.removeProperty(prop),
        );
        if (!this.hadClassAttr && !el.getAttribute("class"))
          el.removeAttribute("class");
        if (!this.hadStyleAttr && !el.getAttribute("style"))
          el.removeAttribute("style");
        instances.size || detachShared();
      }

      /* -- internals --------------------------------------------------- */

      configure() {
        const el = this.el,
          prev = this.cfg,
          cfg = (this.cfg = readConfig(el, this.explicit));
        this.tau = cfg.tau;

        MODES.forEach((m) => this._cls(`emerge-spotlight-${m}`, m === cfg.mode));
        this._cls("emerge-spotlight", true);
        this._cls("emerge-spotlight-ellipse", cfg.shape === "ellipse");
        this._cls("emerge-spotlight-reverse", cfg.reverse);
        this._cls(
          "emerge-spotlight-blurred",
          cfg.mode !== "reveal" && cfg.blur > 0,
        );
        this._cls("emerge-spotlight-webkit", IS_WEBKIT);
        // touch-action lives in the CSS (one class per touch mode). It is only
        // applied while this instance actually listens to touch pointers, so a
        // "hover" / "manual" / touch="off" host keeps native gestures untouched.
        const touchOn = cfg.trigger === "pointer" && cfg.touch !== "off";
        TOUCH_MODES.forEach((m) =>
          this._cls(`emerge-spotlight-touch-${m}`, touchOn && m === cfg.touch),
        );
        this._syncLayers();
        this._syncOverlay();

        // Reveal shows its layer inside the spot; flashlight / focus put the
        // effect outside of it. "reverse" swaps both.
        const insideOpaque = (cfg.mode === "reveal") !== cfg.reverse;
        // Every shape but circle / ellipse is an SVG mask image: the CSS swaps
        // the radial gradient for it (.emerge-spotlight-shaped) and, when the
        // effect sits outside the spot, punches it out of a solid layer
        // (.emerge-spotlight-outside).
        const shaped = !isRadial(cfg.shape),
          fluid = cfg.shape === "fluid";
        this._cls("emerge-spotlight-shaped", shaped);
        this._cls("emerge-spotlight-fluid", fluid);
        this._cls("emerge-spotlight-outside", shaped && !insideOpaque);
        this._set(
          "--emerge-spotlight-shape",
          cfg.shape === "ellipse" ? "ellipse" : "circle",
        );
        if (fluid) {
          // the mask is rewritten every frame by _flow(); until there is ink
          // it must be an empty mask, never "no mask" (that shows everything)
          this.fl || this._set("--emerge-spotlight-shape-img", EMPTY_MASK);
        } else {
          this.fl = this.flPrev = null;
          this._set(
            "--emerge-spotlight-shape-img",
            shaped ? shapeImage(cfg.shape, cfg.softness / cfg.radius) : null,
          );
        }
        if (!shaped || fluid) {
          this._set("--emerge-spotlight-tw", null);
          this._set("--emerge-spotlight-th", null);
        }
        this._set(
          "--emerge-spotlight-inner",
          `${round(((cfg.radius - cfg.softness) / cfg.radius) * 100, 100)}%`,
        );
        this._set("--emerge-spotlight-c0", insideOpaque ? "#000" : "transparent");
        this._set("--emerge-spotlight-c1", insideOpaque ? "transparent" : "#000");
        this._set("--emerge-spotlight-color", cfg.color);
        this._set("--emerge-spotlight-dim", `${round(cfg.opacity * 100, 100)}%`);
        this._set("--emerge-spotlight-blur", `${cfg.blur}px`);
        this._set("--emerge-spotlight-fit", cfg.mode === "reveal" ? cfg.fit : null);

        if (
          !prev ||
          prev.trigger !== cfg.trigger ||
          prev.touch !== cfg.touch ||
          prev.moveIntensity !== cfg.moveIntensity ||
          prev.moveX !== cfg.moveX ||
          prev.moveY !== cfg.moveY
        )
          this._bind();
        // touch was just switched off / to hover while a finger is down
        if (this.hasPointer && !this._allows(this.pointerType)) this._end();
        this.dirty = true;
        this.paint();
        (this.k > 0 || this.kt > 0) && wake(this);
      }

      // Read phase: one layout read, only when something moved or resized.
      measure() {
        if (!this.dirty) return;
        this.dirty = false;
        const el = this.el,
          r = el.getBoundingClientRect(),
          ow = el.offsetWidth,
          oh = el.offsetHeight;
        this.sx = ow ? r.width / ow : 1;
        this.sy = oh ? r.height / oh : 1;
        this.left = r.left + el.clientLeft * this.sx;
        this.top = r.top + el.clientTop * this.sy;
        this.w = el.clientWidth || r.width / this.sx;
        this.h = el.clientHeight || r.height / this.sy;
      }

      // Write phase. Returns true while it still needs more frames.
      step(dt) {
        let tx, ty;
        if (this.src === "pointer") {
          tx = (this.px - this.left) / this.sx;
          ty = (this.py - this.top) / this.sy;
        } else if (this.src === "manual") {
          tx = coord(this.mx, this.w);
          ty = coord(this.my, this.h);
        } else {
          tx = this.w / 2;
          ty = this.h / 2;
        }
        const a = this.tau > 0 ? 1 - Math.exp(-dt / this.tau) : 1;
        if (this.snap) {
          this.x = tx;
          this.y = ty;
          this.snap = false;
        } else {
          this.x += (tx - this.x) * a;
          this.y += (ty - this.y) * a;
        }
        this.k += (this.kt - this.k) * a;
        const settled =
          Math.abs(tx - this.x) < 0.05 &&
          Math.abs(ty - this.y) < 0.05 &&
          Math.abs(this.kt - this.k) < 0.003;
        if (settled) {
          this.x = tx;
          this.y = ty;
          this.k = this.kt;
        }
        const flowing = this.cfg.shape === "fluid" && this._flow(dt);
        this.paint();
        settled &&
          this.kt === 0 &&
          !flowing &&
          this._cls("emerge-spotlight-active", false);
        return !settled || flowing;
      }

      // Fluid shape: stir the simulation with the spot, advance it and publish
      // its density as the mask. Returns true while there is still something
      // to animate (the spot is shown, or ink is still dissolving).
      _flow(dt) {
        const c = this.cfg;
        if (!this.w || !this.h) return false;
        let f = this.fl;
        if (!f || f.w !== this.w || f.h !== this.h) {
          f = this.fl = new Fluid(this.w, this.h); // new size: start clean
          this.flPrev = null;
        }
        dt = Math.min(dt, 1 / 30);
        const live = this.kt > 0,
          cell = f.gw / this.w, // grid cells per px
          dissolve = 3 / c.trail, // ~5% of the ink left after `trail` seconds
          amount = 0.6,
          // The blob that builds up under a still pointer stops growing when
          // the ink added per frame balances what dissolves; pick sigma so that
          // blob ends up with the requested radius.
          sigma =
            (c.radius * cell) /
            Math.sqrt(Math.max(Math.log(amount / (dt * dissolve)), 1));
        if (live) {
          const gx = this.x * cell,
            gy = this.y * cell,
            prev = this.flPrev;
          if (prev) {
            const dx = gx - prev[0],
              dy = gy - prev[1],
              n = Math.min(24, Math.max(1, Math.ceil(Math.hypot(dx, dy) / (sigma * 0.7)))),
              // cells / second, limited so a jump cannot blow the field up
              s = (c.swirl * 0.5) / Math.max(dt, 1 / 120),
              vx = clamp(dx * s, -60, 60),
              vy = clamp(dy * s, -60, 60);
            for (let i = 1; i <= n; i++)
              f.splat(prev[0] + (dx * i) / n, prev[1] + (dy * i) / n, vx, vy, sigma, amount);
          } else f.splat(gx, gy, 0, 0, sigma, amount);
          // Idle motion: two invisible stirrers orbit inside the blob at
          // different speeds. They add no ink, only velocity, so the edge
          // keeps rippling like a liquid even when the pointer is still.
          if (c.wobble > 0) {
            const t = (this.ft = (this.ft || 0) + dt),
              R = c.radius * cell,
              w = c.wobble;
            for (let k = 0; k < 2; k++) {
              const a = t * (k ? -2.1 : 1.5) + k * 2.4,
                o = R * (k ? 0.3 : 0.38),
                sp = R * w * dt * (k ? 5.6 : 4.4); // tangential push per frame
              f.splat(
                gx + Math.cos(a) * o,
                gy + Math.sin(a) * o,
                -Math.sin(a) * sp * (k ? -1 : 1),
                Math.cos(a) * sp * (k ? -1 : 1),
                sigma * 1.1,
                0,
              );
            }
          }
          this.flPrev = [gx, gy];
        } else this.flPrev = null;
        f.step(dt, dissolve);
        const e = 0.04 + 0.4 * clamp(c.softness / c.radius, 0, 1),
          url = f.render(0.5 - e, 0.5 + e),
          alive = f.max > 0.5 - e;
        if (!live && !alive) f.d.fill(0), f.u.fill(0), f.v.fill(0);
        if (live || alive) this._fluidMask(url);
        else {
          this.fmNext = null;
          this._set("--emerge-spotlight-shape-img", EMPTY_MASK);
          IS_WEBKIT &&
            this._paintWebkit(this.last["--emerge-spotlight-strength"]);
        }
        return live || alive;
      }

      // Fluid mask — FIX: shape "fluid" did not work on Safari / iOS.
      //
      // BEFORE: _flow() rendered a new PNG data URI every frame and wrote it
      // straight into --emerge-spotlight-shape-img:
      //   this._set("--emerge-spotlight-shape-img", `url("${url}")`);
      // On WebKit the mask is written inline (-webkit-mask-image, see
      // _paintWebkit). Safari / iOS decode a changed mask-image URL
      // asynchronously, so with a new URL every ~16 ms each mask was
      // replaced before it finished decoding. The mask stayed empty (or
      // flickered) and the spot never appeared. Chrome / Firefox decode fast
      // enough, so the bug only showed on WebKit.
      //
      // NOW: on WebKit the mask is applied only AFTER it has been decoded
      // (Image + decode()), one at a time. While one is decoding, newer
      // frames only overwrite `fmNext` (frames are dropped, never queued), so
      // the one applied is always the latest. When decoding ends the mask is
      // set and _paintWebkit() repaints right away, because the engine may
      // already be asleep and no further frame would do it. Other browsers
      // keep the original direct path.
      _fluidMask(url) {
        const prop = "--emerge-spotlight-shape-img";
        if (!IS_WEBKIT) return this._set(prop, `url("${url}")`);
        this.fmNext = url;
        if (this.fmBusy) return;
        const run = () => {
          const u = this.fmNext;
          this.fmNext = null;
          if (!u || instances.get(this.el) !== this) return;
          this.fmBusy = true;
          let fired = false;
          const done = () => {
            if (fired) return;
            fired = true;
            this.fmBusy = false;
            if (this.fl && instances.get(this.el) === this) {
              this._set(prop, `url("${u}")`);
              // repaint now: the engine may already be asleep
              this._paintWebkit(this.last["--emerge-spotlight-strength"]);
            }
            this.fmNext && run();
          };
          const img = new Image();
          img.onload = img.onerror = done;
          img.src = u;
          img.decode && img.decode().then(done, done);
        };
        run();
      }

      paint() {
        const c = this.cfg,
          rx = Math.max(c.radius * this.k, 0.01),
          wide = c.shape === "ellipse" || c.shape === "rect",
          ry = Math.max(rx * (wide ? c.ratio : 1), 0.01);
        this._set("--emerge-spotlight-x", this.w ? `${round(this.x, 100)}px` : "50%");
        this._set("--emerge-spotlight-y", this.w ? `${round(this.y, 100)}px` : "50%");
        this._set(
          "--emerge-spotlight-size",
          c.shape === "ellipse"
            ? `${round(rx, 100)}px ${round(ry, 100)}px`
            : `${round(rx, 100)}px`,
        );
        if (!isRadial(c.shape) && c.shape !== "fluid") {
          // size of the SVG mask tile: 1.5x the shape (room for the soft edge)
          this._set("--emerge-spotlight-tw", `${round(rx * 3, 100)}px`);
          this._set("--emerge-spotlight-th", `${round(ry * 3, 100)}px`);
        }
        // Resolved radial mask (Safari does not reliably resolve the nested
        // var() gradient of the CSS fallback). Inline on the host, so it wins.
        {
          const insideOpaque = (c.mode === "reveal") !== c.reverse,
            inner = `${round(((c.radius - c.softness) / c.radius) * 100, 100)}%`,
            c0 = insideOpaque ? "#000" : "transparent",
            c1 = insideOpaque ? "transparent" : "#000",
            sz =
              c.shape === "ellipse"
                ? `${round(rx, 100)}px ${round(ry, 100)}px`
                : `${round(rx, 100)}px`,
            cx = this.w ? `${round(this.x, 100)}px` : "50%",
            cy = this.w ? `${round(this.y, 100)}px` : "50%";
          this._set(
            "--emerge-spotlight-mask",
            `radial-gradient(${c.shape === "ellipse" ? "ellipse" : "circle"} ${sz} at ${cx} ${cy}, ${c0} 0%, ${c0} ${inner}, ${c1} 100%)`,
          );
        }
        // Opacity of the flashlight / focus overlay. "persist" keeps the
        // effect on the content even when the pointer is away.
        const strength = String(
          c.persist && c.mode !== "reveal" ? 1 : round(this.k, 1000),
        );
        this._set("--emerge-spotlight-strength", strength);
        if (IS_WEBKIT) this._paintWebkit(strength);
      }

      // Safari / WebKit: a mask-image that reads a custom property
      // (var(--emerge-spotlight-mask)) is NOT repainted when only that
      // property changes, so the mask stays frozen at its first value (a
      // 0.01px spot: reveal shows nothing, flashlight / focus cut no hole).
      // Workaround: write the resolved mask straight onto the masked
      // elements (the layers, or a real overlay element, since a
      // pseudo-element cannot take inline style). Other browsers keep the
      // pure-CSS path untouched.
      _syncOverlay() {
        if (!IS_WEBKIT) return;
        if (this.cfg.mode !== "reveal") {
          if (!this.ov) {
            const o = document.createElement("span");
            o.className = "emerge-spotlight-overlay";
            o.setAttribute("aria-hidden", "true");
            this.el.appendChild(o);
            this.ov = o;
          }
        } else this._dropOverlay();
      }

      _dropOverlay() {
        if (!this.ov) return;
        this.ov.remove();
        this.ov = null;
      }

      // Inline mask for one element. Mirrors the CSS rules for radial,
      // shaped, shaped + outside and fluid masks.
      _paintWebkit(strength) {
        const c = this.cfg,
          els = c.mode === "reveal" ? this.layers : this.ov ? [this.ov] : [];
        if (!els.length) return;
        let img, size, pos, comp;
        if (isRadial(c.shape)) {
          img = this.last["--emerge-spotlight-mask"];
          size = pos = comp = "";
        } else {
          const shapeImg = this.last["--emerge-spotlight-shape-img"] || "none",
            insideOpaque = (c.mode === "reveal") !== c.reverse,
            outside = !insideOpaque,
            fluid = c.shape === "fluid";
          let tw = 0,
            th = 0;
          if (!fluid) {
            const rx = Math.max(c.radius * this.k, 0.01),
              wide = c.shape === "rect";
            tw = round(rx * 3, 100);
            th = round(Math.max(rx * (wide ? c.ratio : 1), 0.01) * 3, 100);
          }
          const one = fluid
              ? "0 0"
              : `${round(this.x - tw / 2, 100)}px ${round(this.y - th / 2, 100)}px`,
            sz = fluid ? "100% 100%" : `${tw}px ${th}px`;
          img = outside ? `${shapeImg}, linear-gradient(#000, #000)` : shapeImg;
          size = outside ? `${sz}, 100% 100%` : sz;
          pos = outside ? `${one}, 0 0` : one;
          comp = outside ? "xor" : "";
        }
        const key = [img, size, pos, comp, strength].join("|");
        els.forEach((el) => {
          if (this.wk.get(el) === key) return;
          this.wk.set(el, key);
          const s = el.style;
          s.webkitMaskImage = img || "";
          s.webkitMaskSize = size;
          s.webkitMaskPosition = pos;
          s.webkitMaskRepeat = size ? "no-repeat" : "";
          s.webkitMaskComposite = comp;
          if (el === this.ov) s.opacity = strength;
        });
      }

      _clearWebkit(el) {
        const s = el.style;
        s.removeProperty("-webkit-mask-image");
        s.removeProperty("-webkit-mask-size");
        s.removeProperty("-webkit-mask-position");
        s.removeProperty("-webkit-mask-repeat");
        s.removeProperty("-webkit-mask-composite");
        this.wk.delete(el);
      }

      // `null` removes a property this instance wrote earlier; one it never
      // wrote (e.g. set by the author in a style attribute) is left alone.
      _set(prop, value) {
        if (this.last[prop] === value) return;
        const wrote = this.last[prop] !== undefined && this.last[prop] !== null;
        this.last[prop] = value;
        if (value === null) wrote && this.el.style.removeProperty(prop);
        else this.el.style.setProperty(prop, value);
      }

      _cls(name, on) {
        const list = this.el.classList;
        if (on) {
          if (!list.contains(name)) {
            list.add(name);
            this.owned.add(name);
          }
        } else if (this.owned.has(name)) {
          list.remove(name);
          this.owned.delete(name);
        }
      }

      _syncLayers() {
        const want = this.cfg.mode === "reveal" ? findLayers(this.el) : [];
        this.layers.forEach((l) => {
          if (want.indexOf(l) < 0 && this.ownedLayers.has(l)) this._unlayer(l);
        });
        want.forEach((l) => {
          if (!l.classList.contains("emerge-spotlight-layer")) {
            // remember layers that had no class attribute, to leave none behind
            l.hasAttribute("class") || this.layerNoClass.add(l);
            l.classList.add("emerge-spotlight-layer");
            this.ownedLayers.add(l);
          }
        });
        this.layers = want;
      }

      _unlayer(l) {
        IS_WEBKIT && this._clearWebkit(l);
        l.classList.remove("emerge-spotlight-layer");
        this.ownedLayers.delete(l);
        if (this.layerNoClass.delete(l) && !l.getAttribute("class"))
          l.removeAttribute("class");
      }

      _bind() {
        this._unbind();
        if (this.cfg.trigger === "manual") return;
        // Pointer Events only: one set of listeners covers mouse, touch and
        // pen, and the browser never replays them as extra mouse / touch
        // events. Touch pointers are implicitly captured by the element they
        // started on, so no setPointerCapture() is needed (and capturing would
        // retarget `click` away from links and buttons inside the host).
        const el = this.el,
          opts = { passive: true };
        el.addEventListener("pointerenter", this._enter, opts);
        el.addEventListener("pointerdown", this._down, opts);
        el.addEventListener("pointermove", this._move, opts);
        el.addEventListener("pointerup", this._up, opts);
        el.addEventListener("pointerleave", this._leave, opts);
        el.addEventListener("pointercancel", this._leave, opts);
        // These three call preventDefault(), so they are not passive.
        el.addEventListener("selectstart", this._select);
        el.addEventListener("dragstart", this._drag);
        el.addEventListener("contextmenu", this._menu);
        // move-intensity: the page may only scroll after a long enough drag.
        // touchmove has to be non-passive to be able to cancel the scroll.
        const c = this.cfg;
        if (c.moveIntensity > 0 && (c.moveX || c.moveY) && c.touch !== "off") {
          el.addEventListener("touchstart", this._tstart, opts);
          el.addEventListener("touchmove", this._tmove, { passive: false });
          this.tBound = true;
        }
        this.bound = true;
      }

      _unbind() {
        if (this.bound) {
          const el = this.el;
          el.removeEventListener("pointerenter", this._enter);
          el.removeEventListener("pointerdown", this._down);
          el.removeEventListener("pointermove", this._move);
          el.removeEventListener("pointerup", this._up);
          el.removeEventListener("pointerleave", this._leave);
          el.removeEventListener("pointercancel", this._leave);
          el.removeEventListener("selectstart", this._select);
          el.removeEventListener("dragstart", this._drag);
          el.removeEventListener("contextmenu", this._menu);
          if (this.tBound) {
            el.removeEventListener("touchstart", this._tstart);
            el.removeEventListener("touchmove", this._tmove);
            this.tBound = false;
          }
          this.bound = false;
        }
        if (this.hasPointer) {
          this.hasPointer = false;
          this.kt = 0;
        }
        this._press(false);
      }

      // move-intensity: remember where a one-finger touch started.
      _onTouchStart(e) {
        const t = e.touches;
        this.tOpen = false;
        if (t.length !== 1) return (this.tOpen = true); // pinch: never block
        this.tx = t[0].clientX;
        this.ty = t[0].clientY;
      }

      // Below the threshold the scroll is cancelled and only the spot moves;
      // past it the browser takes over and scrolls the page.
      _onTouchMove(e) {
        if (this.tOpen || !e.cancelable) return;
        const t = e.touches;
        if (t.length !== 1) return (this.tOpen = true);
        const c = this.cfg,
          dx = t[0].clientX - this.tx,
          dy = t[0].clientY - this.ty,
          dist =
            c.moveX && c.moveY
              ? Math.hypot(dx, dy)
              : c.moveY
                ? Math.abs(dy)
                : Math.abs(dx);
        if (dist >= c.moveIntensity) this.tOpen = true;
        else e.preventDefault();
      }

      // Touch pointers are ignored by "hover" and by touch="off".
      _allows(type) {
        return (
          type !== "touch" ||
          (this.cfg.trigger !== "hover" && this.cfg.touch !== "off")
        );
      }

      // Only the primary pointer is tracked.
      _accepts(e) {
        return e.isPrimary !== false && this._allows(e.pointerType);
      }

      // A finger / pen is in contact: lock selection through a class (CSS).
      _press(on) {
        if (this.pressing === on) return;
        this.pressing = on;
        this._cls("emerge-spotlight-touching", on);
      }

      // The gesture ended (finger lifted, leave or cancel): hide the spot.
      _end() {
        this.hasPointer = false;
        this.kt = 0;
        this._press(false);
        wake(this);
      }

      _onEnter(e) {
        if (!this._accepts(e)) return;
        this.pointerType = e.pointerType || "mouse";
        this.px = e.clientX;
        this.py = e.clientY;
        this.src = "pointer";
        if (!this.hasPointer && this.k < 0.001) this.snap = true;
        this.hasPointer = true;
        this.dirty = true;
        this.kt = 1;
        this._cls("emerge-spotlight-active", true);
        wake(this);
      }

      _onDown(e) {
        if (!this._accepts(e)) return;
        if (!this.hasPointer) this._onEnter(e);
        else {
          this.pointerType = e.pointerType || "mouse";
          this.px = e.clientX;
          this.py = e.clientY;
          this.dirty = true;
          wake(this);
        }
        // A mouse keeps its normal text selection; touch / pen contact does not.
        e.pointerType !== "mouse" && this._press(true);
      }

      _onMove(e) {
        if (!this._accepts(e)) return;
        if (!this.hasPointer) return this._onEnter(e);
        this.px = e.clientX;
        this.py = e.clientY;
        wake(this);
      }

      _onUp(e) {
        if (e.isPrimary === false || e.pointerType === "mouse") return;
        this._press(false);
        // A lifted finger is gone; a pen may still hover, and pointerleave
        // will hide the spot when it moves away.
        e.pointerType === "touch" && this._end();
      }

      _onLeave(e) {
        if (e.isPrimary === false) return;
        this._end();
      }

      // Blocks the text selection started by a touch / pen press on the host.
      _onSelect(e) {
        this.pressing && e.preventDefault();
      }

      // Native drag of images / media would cancel the pointer stream.
      _onDrag(e) {
        const t = e.target;
        if (!(this.pressing || this.cfg.mode === "reveal")) return;
        t && t.nodeType === 1 && t.closest(MEDIA_SELECTOR) && e.preventDefault();
      }

      // Long-press menu on media (Android) would also cancel the gesture.
      // Links, buttons and form controls keep their menu.
      _onMenu(e) {
        const t = e.target;
        if (!this.pressing || !t || t.nodeType !== 1) return;
        t.closest(MEDIA_SELECTOR) &&
          !t.closest(INTERACTIVE_SELECTOR) &&
          e.preventDefault();
      }
    }

    /* ---- Discovery ---------------------------------------------------- */

    // Declarative discovery: creates the instance for a [data-emerge-spotlight]
    // host unless it is disabled.
    function ensure(el) {
      const existing = instances.get(el);
      if (existing || !isActive(el)) return existing || null;
      const inst = new SpotlightInstance(el, {});
      inst.declarative = true;
      return inst;
    }

    function scan(root) {
      (root || document).querySelectorAll(SELECTOR).forEach((el) => ensure(el));
    }

    // Brings instances in line with the DOM: drops detached / disabled ones,
    // re-reads configuration and picks up new hosts.
    function sync(reason) {
      instances.forEach((inst, el) => {
        if (!el.isConnected || !isActive(el)) return inst.destroy();
        reason !== "resize" && inst.configure();
        inst.dirty = true;
        (inst.k > 0 || inst.kt > 0) && wake(inst);
      });
      scan(document);
    }

    function onAttribute(target) {
      const inst = instances.get(target);
      if (inst) {
        // Instances created through the API do not depend on the attribute.
        if (
          (inst.declarative && !target.hasAttribute("data-emerge-spotlight")) ||
          !isActive(target)
        )
          inst.destroy();
        else inst.configure();
        return;
      }
      if (target.hasAttribute("data-emerge-spotlight")) return ensure(target);
      const host = target.closest(SELECTOR),
        parent = host && instances.get(host);
      parent && parent.configure(); // a layer was (un)marked inside a host
    }

    function onAdded(node) {
      if (node.nodeType !== 1) return;
      // Nodes generated by the Text plugin are never Spotlight hosts.
      const cl = node.classList;
      if (cl && (cl.contains("emerge-word") || cl.contains("emerge-part"))) return;
      node.matches(SELECTOR) && ensure(node);
      node.querySelectorAll(SELECTOR).forEach((el) => ensure(el));
      if (node.matches(LAYER_SELECTOR) || node.querySelector(LAYER_SELECTOR)) {
        const host = node.closest(SELECTOR),
          inst = host && host !== node && instances.get(host);
        inst && inst.configure();
      }
    }

    function onMutations(records) {
      for (const rec of records) {
        if (rec.type === "attributes") onAttribute(rec.target);
        else rec.addedNodes.forEach(onAdded);
      }
      // Hosts that left the document (done after the loop so that a node that
      // was merely moved is not destroyed and recreated).
      instances.forEach((inst, el) => {
        el.isConnected || inst.destroy();
      });
    }

    // The Core only watches [data-emerge] nodes, so Spotlight keeps one
    // observer of its own (shared by every instance), honouring the Core's
    // disableMutationObserver option.
    function watch() {
      if (
        observer ||
        core.options.disableMutationObserver ||
        typeof MutationObserver == "undefined"
      )
        return;
      observer = new MutationObserver(onMutations);
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: WATCHED_ATTRS,
      });
    }

    /* ---- Programmatic API (Emerge.Spotlight) -------------------------- */

    function create(target, options) {
      const el = toElement(target);
      if (!el || el.nodeType !== 1) return null;
      const existing = instances.get(el);
      if (existing) return options ? existing.setOptions(options) : existing;
      return new SpotlightInstance(el, options);
    }

    function destroyOne(target) {
      const inst = instances.get(toElement(target));
      inst && inst.destroy();
      return !!inst;
    }

    function destroyAll() {
      Array.from(instances.values()).forEach((inst) => inst.destroy());
    }

    return {
      name: "Spotlight",
      defaults: {
        spotlightRadius: 100,
        spotlightSoftness: 30,
        spotlightEasing: 0.2,
        spotlightShape: "circle",
        spotlightRatio: 0.6,
        spotlightTrigger: "pointer",
        spotlightTouch: "track",
        spotlightMove: null,
        spotlightMoveIntensity: 0,
        spotlightTrail: 1.2,
        spotlightSwirl: 1,
        spotlightWobble: 1,
        spotlightReverse: false,
        spotlightPersist: false,
        spotlightFit: null,
        spotlightOpacity: null,
        spotlightBlur: null,
        spotlightColor: "#000",
      },
      install: (c) => (
        (core = c),
        {
          create,
          destroy: destroyOne,
          destroyAll,
          get: (target) => instances.get(toElement(target)) || null,
          refresh: (target) => {
            if (target === undefined) return sync("manual");
            const el = toElement(target),
              inst = el && instances.get(el);
            if (inst) inst.configure();
            else el && el.nodeType === 1 && ensure(el);
            return instances.get(el) || null;
          },
          get all() {
            return Array.from(instances.values());
          },
        }
      ),
      hooks: {
        observe({ el }, c) {
          c.hasAttr(el, "spotlight") && ensure(el);
        },
        init() {
          scan(document);
          watch();
        },
        refresh({ reason }) {
          sync(reason);
        },
        unobserve({ el }) {
          const inst = instances.get(el);
          inst && !el.isConnected && inst.destroy();
        },
        teardown() {
          destroyAll();
          running.clear();
          if (observer) {
            observer.disconnect();
            observer = null;
          }
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
          }
          lastTime = 0;
          detachShared();
        },
      },
    };
});
